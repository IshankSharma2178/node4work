import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { telegramSendMessageChannel } from "@/inngest/channels/telegram-send-message";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { isTelegramEntityParseError, telegramRequest } from "@/lib/telegram";
import { markdownToTelegramHtml } from "@/lib/telegram-markdown";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type TelegramSendMessageData = {
  variableName?: string;
  credentialId?: string;
  chatId?: string;
  text?: string;
  parseMode?: "None" | "Markdown" | "HTML";
};

const normalizeChatId = (chatId: string): string | number => {
  return /^-?\d+$/.test(chatId) ? Number(chatId) : chatId;
};

export const telegramSendMessageExecutor: NodeExecutor<
  TelegramSendMessageData
> = async ({ data, nodeId, userId, context, step, publish }) => {
  await publish(
    telegramSendMessageChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      telegramSendMessageChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      telegramSendMessageChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Credential is missing");
  }

  if (!data.chatId) {
    await publish(
      telegramSendMessageChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Chat ID is missing");
  }

  if (!data.text) {
    await publish(
      telegramSendMessageChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Message text is missing");
  }

  const chatId = Handlebars.compile(data.chatId)(context);
  const text = Handlebars.compile(data.text)(context);

  const isMarkdown = data.parseMode === "Markdown";
  const parseMode = isMarkdown
    ? "HTML"
    : data.parseMode && data.parseMode !== "None"
      ? data.parseMode
      : undefined;
  const renderedText = isMarkdown ? markdownToTelegramHtml(text) : text;

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      telegramSendMessageChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Credential not found");
  }

  const token = decrypt(credential.value);

  try {
    const result = await step.run("telegram-send-message", async () => {
      const payload = {
        chat_id: normalizeChatId(chatId),
        text: renderedText,
        ...(parseMode ? { parse_mode: parseMode } : {}),
      };

      try {
        return await telegramRequest<Record<string, unknown>>(
          token,
          "sendMessage",
          payload,
        );
      } catch (error) {
        //Markdown text is rendered to Telegram-compatible HTML before sending.
        //If the HTML is still rejected (e.g. raw HTML tags in AI output), fall
        //back to plain text so the message still gets delivered.
        if (isTelegramEntityParseError(error) && payload.parse_mode) {
          return telegramRequest<Record<string, unknown>>(
            token,
            "sendMessage",
            {
              chat_id: payload.chat_id,
              text: renderedText,
            },
          );
        }
        throw error;
      }
    });

    await publish(
      telegramSendMessageChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        telegramMessage: result,
      },
    };
  } catch (error) {
    await publish(
      telegramSendMessageChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};

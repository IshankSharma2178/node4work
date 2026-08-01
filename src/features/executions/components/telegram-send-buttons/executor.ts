import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { telegramSendButtonsChannel } from "@/inngest/channels/telegram-send-buttons";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { isTelegramEntityParseError, telegramRequest } from "@/lib/telegram";
import { markdownToTelegramHtml } from "@/lib/telegram-markdown";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type TelegramSendButtonsData = {
  variableName?: string;
  credentialId?: string;
  chatId?: string;
  text?: string;
  parseMode?: "None" | "Markdown" | "HTML";
  buttons?: Array<{ label: string; value: string }>;
};

const normalizeChatId = (chatId: string): string | number => {
  return /^-?\d+$/.test(chatId) ? Number(chatId) : chatId;
};

export const telegramSendButtonsExecutor: NodeExecutor<
  TelegramSendButtonsData
> = async ({ data, nodeId, userId, context, step, publish }) => {
  await publish(
    telegramSendButtonsChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      telegramSendButtonsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      telegramSendButtonsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Credential is missing");
  }

  if (!data.chatId) {
    await publish(
      telegramSendButtonsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Chat ID is missing");
  }

  if (!data.text) {
    await publish(
      telegramSendButtonsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Message text is missing");
  }

  if (!data.buttons?.length) {
    await publish(
      telegramSendButtonsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Buttons are missing");
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

  const inlineKeyboard = data.buttons.map((button) => ({
    text: Handlebars.compile(button.label)(context),
    callback_data: Handlebars.compile(button.value)(context),
  }));

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
      telegramSendButtonsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Telegram node: Credential not found");
  }

  const token = decrypt(credential.value);

  try {
    const result = await step.run("telegram-send-buttons", async () => {
      const payload = {
        chat_id: normalizeChatId(chatId),
        text: renderedText,
        ...(parseMode ? { parse_mode: parseMode } : {}),
        reply_markup: {
          inline_keyboard: [inlineKeyboard],
        },
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
              reply_markup: payload.reply_markup,
            },
          );
        }
        throw error;
      }
    });

    await publish(
      telegramSendButtonsChannel().status({
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
      telegramSendButtonsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};

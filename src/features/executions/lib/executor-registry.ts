import { NodeType } from "@prisma/client";
import { cronTriggerExecutor } from "@/features/trigger/components/cron-trigger/executor";
import { googleFormTriggerExecutor } from "@/features/trigger/components/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/features/trigger/components/manual-trigger/executor";
import { stripeTriggerExecutor } from "@/features/trigger/components/stripe-trigger/executor";
import { telegramTriggerExecutor } from "@/features/trigger/components/telegram-trigger/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { discordExecutor } from "../components/discord/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { openAiExecutor } from "../components/openai/executor";
import { slackExecutor } from "../components/slack/executor";
import { telegramSendButtonsExecutor } from "../components/telegram-send-buttons/executor";
import { telegramSendMessageExecutor } from "../components/telegram-send-message/executor";
import type { NodeExecutor } from "../types";

type ExecutorRegistry = {
  [NodeType.MANUAL_TRIGGER]: typeof manualTriggerExecutor;
  [NodeType.CRON_TRIGGER]: typeof cronTriggerExecutor;
  [NodeType.HTTP_REQUEST]: typeof httpRequestExecutor;
  [NodeType.INITIAL]: typeof manualTriggerExecutor;
  [NodeType.GOOGLE_FORM_TRIGGER]: typeof googleFormTriggerExecutor;
  [NodeType.STRIPE_TRIGGER]: typeof stripeTriggerExecutor;
  [NodeType.GEMINI]: typeof geminiExecutor;
  [NodeType.ANTHROPIC]: typeof anthropicExecutor;
  [NodeType.OPENAI]: typeof openAiExecutor;
  [NodeType.DISCORD]: typeof discordExecutor;
  [NodeType.SLACK]: typeof slackExecutor;
  [NodeType.TELEGRAM_TRIGGER]: typeof telegramTriggerExecutor;
  [NodeType.TELEGRAM_SEND_MESSAGE]: typeof telegramSendMessageExecutor;
  [NodeType.TELEGRAM_SEND_BUTTONS]: typeof telegramSendButtonsExecutor;
};

export const executorRegistry: ExecutorRegistry = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.CRON_TRIGGER]: cronTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openAiExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
  [NodeType.TELEGRAM_TRIGGER]: telegramTriggerExecutor,
  [NodeType.TELEGRAM_SEND_MESSAGE]: telegramSendMessageExecutor,
  [NodeType.TELEGRAM_SEND_BUTTONS]: telegramSendButtonsExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[type as keyof ExecutorRegistry];
  if (!executor) {
    throw new Error(`No executor found for type: ${type}`);
  }
  return executor as NodeExecutor<any>;
};

import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/trigger/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/trigger/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/trigger/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { openAiExecutor } from "../components/openai/executor";
import { discordExecutor } from "../components/discord/executor";
import { slackExecutor } from "../components/slack/executor";

type ExecutorRegistry = {
  [NodeType.MANUAL_TRIGGER]: typeof manualTriggerExecutor;
  [NodeType.HTTP_REQUEST]: typeof httpRequestExecutor;
  [NodeType.INITIAL]: typeof manualTriggerExecutor;
  [NodeType.GOOGLE_FORM_TRIGGER]: typeof googleFormTriggerExecutor;
  [NodeType.STRIPE_TRIGGER]: typeof stripeTriggerExecutor;
  [NodeType.GEMINI]: typeof geminiExecutor;
  [NodeType.ANTHROPIC]: typeof anthropicExecutor;
  [NodeType.OPENAI]: typeof openAiExecutor;
  [NodeType.DISCORD]: typeof discordExecutor;
  [NodeType.SLACK]: typeof slackExecutor;
};

export const executorRegistry: ExecutorRegistry = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openAiExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor<any> => {
  const executor = executorRegistry[type as keyof ExecutorRegistry];
  if (!executor) {
    throw new Error(`No executor found for type: ${type}`);
  }
  return executor as NodeExecutor<any>;
};

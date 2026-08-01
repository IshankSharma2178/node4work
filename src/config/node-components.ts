import { NodeType } from "@prisma/client";
import type { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/initial-node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { OpenAiNode } from "@/features/executions/components/openai/node";
import { SlackNode } from "@/features/executions/components/slack/node";
import { TelegramSendButtonsNode } from "@/features/executions/components/telegram-send-buttons/node";
import { TelegramSendMessageNode } from "@/features/executions/components/telegram-send-message/node";
import { GoogleFormTrigger } from "@/features/trigger/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/trigger/components/manual-trigger/node";
import { StripeTriggerNode } from "@/features/trigger/components/stripe-trigger/node";
import { TelegramTriggerNode } from "@/features/trigger/components/telegram-trigger/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
  [NodeType.TELEGRAM_TRIGGER]: TelegramTriggerNode,
  [NodeType.TELEGRAM_SEND_MESSAGE]: TelegramSendMessageNode,
  [NodeType.TELEGRAM_SEND_BUTTONS]: TelegramSendButtonsNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

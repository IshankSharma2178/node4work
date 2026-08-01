import { channel, topic } from "@inngest/realtime";

export const TELEGRAM_SEND_BUTTONS_CHANNEL_NAME =
  "telegram-send-buttons-execution";

export const telegramSendButtonsChannel = channel(
  TELEGRAM_SEND_BUTTONS_CHANNEL_NAME,
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);

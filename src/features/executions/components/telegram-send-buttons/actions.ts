"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { telegramSendButtonsChannel } from "@/inngest/channels/telegram-send-buttons";
import { inngest } from "@/inngest/client";

export type TelegramSendButtonsToken = Realtime.Token<
  typeof telegramSendButtonsChannel,
  ["status"]
>;

export async function fetchTelegramSendButtonsRealtimeToken(): Promise<TelegramSendButtonsToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: telegramSendButtonsChannel(),
    topics: ["status"],
  });

  return token;
}

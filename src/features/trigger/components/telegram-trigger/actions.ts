"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { NodeType } from "@prisma/client";
import { headers } from "next/headers";
import { telegramTriggerChannel } from "@/inngest/channels/telegram-trigger";
import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { buildAppUrl } from "@/lib/utils";
import {
  getBotUsername,
  telegramRequest,
  telegramWebhookSecret,
} from "@/lib/telegram";

export type TelegramTriggerToken = Realtime.Token<
  typeof telegramTriggerChannel,
  ["status"]
>;

export async function fetchTelegramTriggerRealtimeToken(): Promise<TelegramTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: telegramTriggerChannel(),
    topics: ["status"],
  });

  return token;
}

export type RegisterTelegramWebhookResult = {
  ok: boolean;
  description?: string;
  botUsername?: string;
  duplicateWorkflows?: boolean;
};

export async function registerTelegramWebhook(
  workflowId: string,
): Promise<RegisterTelegramWebhookResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { ok: false, description: "Unauthorized" };
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId, userId: session.user.id },
    include: { nodes: true },
  });

  if (!workflow) {
    return { ok: false, description: "Workflow not found" };
  }

  const triggerNode = workflow.nodes.find(
    (node) => node.type === NodeType.TELEGRAM_TRIGGER,
  );

  const credentialId = (
    triggerNode?.data as { credentialId?: string } | undefined
  )?.credentialId;

  if (!triggerNode || !credentialId) {
    return {
      ok: false,
      description:
        "Configure a bot credential on the Telegram Trigger node first",
    };
  }

  const credential = await prisma.credential.findUnique({
    where: { id: credentialId, userId: session.user.id },
  });

  if (!credential) {
    return { ok: false, description: "Credential not found" };
  }

  const token = decrypt(credential.value);
  const secret = telegramWebhookSecret(token, workflowId);
  const webhookUrl = buildAppUrl(`/api/telegram/webhook/${workflowId}`);

  try {
    const duplicateWorkflows = await prisma.workflow.findMany({
      where: {
        userId: session.user.id,
        id: { not: workflowId },
        nodes: { some: { type: NodeType.TELEGRAM_TRIGGER } },
      },
      select: {
        nodes: {
          where: { type: NodeType.TELEGRAM_TRIGGER },
          select: { data: true },
        },
      },
    });

    const hasConflict = duplicateWorkflows.some((w) =>
      w.nodes.some(
        (n) =>
          (n.data as { credentialId?: string } | undefined)?.credentialId ===
          credentialId,
      ),
    );

    await telegramRequest(token, "setWebhook", {
      url: webhookUrl,
      secret_token: secret,
      drop_pending_updates: true,
    });

    let botUsername: string | null = null;
    try {
      botUsername = await getBotUsername(token);
    } catch {
      botUsername = null;
    }

    return {
      ok: true,
      botUsername: botUsername ?? undefined,
      duplicateWorkflows: hasConflict,
    };
  } catch (error) {
    return {
      ok: false,
      description:
        error instanceof Error ? error.message : "Failed to register webhook",
    };
  }
}

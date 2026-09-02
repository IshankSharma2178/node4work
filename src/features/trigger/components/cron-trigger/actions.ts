"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { NodeType } from "@prisma/client";
import { headers } from "next/headers";
import { cronTriggerChannel } from "@/inngest/channels/cron-trigger";
import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  registerCronSchedules,
  removeWorkflowCronSchedulers,
} from "@/lib/queue/cron";
import type { CronSchedule } from "./schedule";

export type CronTriggerToken = Realtime.Token<
  typeof cronTriggerChannel,
  ["status"]
>;

export async function fetchCronTriggerRealtimeToken(): Promise<CronTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: cronTriggerChannel(),
    topics: ["status"],
  });

  return token;
}

// Reconciles BullMQ repeatable jobs with the Cron trigger nodes persisted in the DB.
export async function syncCronSchedules(
  workflowId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { ok: false, error: "Unauthorized" };
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId, userId: session.user.id },
    include: { nodes: true },
  });

  if (!workflow) {
    return { ok: false, error: "Workflow not found" };
  }

  const cronNodes = workflow.nodes.filter(
    (node) => node.type === NodeType.CRON_TRIGGER,
  );

  // Register each cron node's schedules
  for (const node of cronNodes) {
    const data = (node.data ?? {}) as unknown as {
      schedules?: CronSchedule[];
    };
    const schedules = Array.isArray(data.schedules) ? data.schedules : [];
    await registerCronSchedules(workflowId, node.id, schedules);
  }

  // Remove stale schedulers for cron nodes that have been deleted since the
  // last save (self-healing reconcile).
  const removedCronNodeIds = await findStaleCronNodeIds(
    new Set(cronNodes.map((node) => node.id)),
  );

  if (removedCronNodeIds.length > 0) {
    await removeWorkflowCronSchedulers(removedCronNodeIds);
  }

  return { ok: true };
}

async function findStaleCronNodeIds(
  existingNodeIds: Set<string>,
): Promise<string[]> {
  const { getCronQueue } = await import("@/lib/queue/cron");
  const queue = getCronQueue();
  if (!queue) return [];

  const schedulers = await queue.getJobSchedulers();
  const stale: string[] = [];
  for (const scheduler of schedulers) {
    const nodeId = extractNodeId(scheduler.key);
    if (nodeId && !existingNodeIds.has(nodeId)) {
      stale.push(nodeId);
    }
  }
  return stale;
}

function extractNodeId(key?: string | null): string | null {
  if (!key) return null;
  // scheduler key format: cron:<nodeId>:<scheduleId>
  const parts = key.split(":");
  if (parts.length >= 3 && parts[0] === "cron") {
    return parts.slice(1, -1).join(":");
  }
  return null;
}

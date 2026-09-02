import { Queue } from "bullmq";
import {
  type CronSchedule,
  scheduleToCron,
} from "@/features/trigger/components/cron-trigger/schedule";
import { getQueueConnection } from "./connection";

export type CronJobData = {
  workflowId: string;
  nodeId: string;
  scheduleId: string;
  timezone: string;
};

let queue: Queue<CronJobData> | null | undefined;

export const getCronQueue = () => {
  if (queue !== undefined) {
    return queue;
  }

  const connection = getQueueConnection();

  queue = connection
    ? new Queue<CronJobData>("cron", {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
          removeOnFail: 100,
        },
      })
    : null;

  return queue;
};

const scheduleKey = (nodeId: string, scheduleId: string) =>
  `cron:${nodeId}:${scheduleId}`;

export const registerCronSchedules = async (
  workflowId: string,
  nodeId: string,
  schedules: CronSchedule[],
) => {
  const cronQueue = getCronQueue();
  if (!cronQueue) {
    return;
  }

  for (const schedule of schedules) {
    const repeat: {
      tz?: string;
      startDate?: string;
      endDate?: string;
      pattern?: string;
    } = {
      tz: schedule.timezone || "UTC",
    };

    repeat.pattern = scheduleToCron(schedule);

    if (schedule.startDate) repeat.startDate = schedule.startDate;
    if (schedule.endDate) repeat.endDate = schedule.endDate;

    // Upsert is idempotent: re-saving the same schedule replaces its job.
    await cronQueue.upsertJobScheduler(
      scheduleKey(nodeId, schedule.id),
      repeat,
      {
        name: "cron",
        data: {
          workflowId,
          nodeId,
          scheduleId: schedule.id,
          timezone: schedule.timezone,
        },
      },
    );
  }
};

export const unregisterCronSchedules = async (nodeId: string) => {
  const cronQueue = getCronQueue();
  if (!cronQueue) {
    return;
  }

  const prefix = scheduleKey(nodeId, "");
  const schedulers = await cronQueue.getJobSchedulers();

  for (const scheduler of schedulers) {
    if (scheduler.key?.startsWith(prefix)) {
      await cronQueue.removeJobScheduler(scheduler.key);
    }
  }
};

// Remove every cron scheduler owned by the given set of cron node ids
// (used when a workflow or its nodes are deleted).
export const removeWorkflowCronSchedulers = async (nodeIds: string[]) => {
  if (nodeIds.length === 0) return;

  for (const nodeId of nodeIds) {
    await unregisterCronSchedules(nodeId);
  }
};

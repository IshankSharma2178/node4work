import { Worker } from "bullmq";
import { inngest } from "@/inngest/client";
import { getQueueConnection } from "@/lib/queue/connection";
import type { CronJobData } from "@/lib/queue/cron";

const connection = getQueueConnection();

if (!connection) {
  console.warn(
    "[cron-worker] UPSTASH_REDIS_URL is not set — cannot start. " +
      "Add an ioredis-compatible URL (Upstash console → Connection Details → IOREDIS).",
  );
  process.exit(1);
}

const worker = new Worker<CronJobData>(
  "cron",
  async (job) => {
    const { workflowId, nodeId, scheduleId } = job.data;

    await inngest.send({
      name: "workflows/execute.workflow",
      data: {
        workflowId,
        initialData: {
          cron: {
            nodeId,
            scheduleId,
            timezone: job.data.timezone,
            timestamp: new Date().toISOString(),
          },
        },
      },
    });
  },
  {
    connection,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  console.log(
    `[cron-worker] job ${job.id} fired workflow ${job.data.workflowId} schedule ${job.data.scheduleId}`,
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `[cron-worker] job ${job?.id} (${job?.name}) failed for workflow ${job?.data.workflowId}:`,
    error,
  );
});

const shutdown = async () => {
  console.log("[cron-worker] shutting down...");
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

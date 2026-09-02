import { Worker } from "bullmq";
import { type OtpEmailData, sendOtpEmail } from "@/lib/email";
import { getQueueConnection } from "@/lib/queue/connection";

const connection = getQueueConnection();

if (!connection) {
  console.warn(
    "[email-worker] UPSTASH_REDIS_URL is not set — cannot start. " +
      "Add an ioredis-compatible URL (Upstash console → Connection Details → IOREDIS).",
  );
  process.exit(1);
}

const worker = new Worker<OtpEmailData>(
  "email",
  async (job) => {
    if (job.name === "otp") {
      await sendOtpEmail(job.data);
    }
  },
  {
    connection,
    concurrency: 2,
  },
);

worker.on("completed", (job) => {
  console.log(
    `[email-worker] job ${job.id} (${job.name}) completed for ${job.data.email}`,
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `[email-worker] job ${job?.id} (${job?.name}) failed for ${job?.data.email}:`,
    error,
  );
});

const shutdown = async () => {
  console.log("[email-worker] shutting down...");
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

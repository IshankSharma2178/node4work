import { Queue } from "bullmq";
import { type OtpEmailData, sendOtpEmail } from "@/lib/email";
import { getQueueConnection } from "./connection";

let queue: Queue<OtpEmailData> | null | undefined;

export const getEmailQueue = () => {
  if (queue !== undefined) {
    return queue;
  }

  const connection = getQueueConnection();

  queue = connection
    ? new Queue<OtpEmailData>("email", {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      })
    : null;

  return queue;
};

export const enqueueOtpEmail = async (data: OtpEmailData) => {
  const emailQueue = getEmailQueue();

  if (!emailQueue) {
    await sendOtpEmail(data);
    return;
  }

  await emailQueue.add("otp", data);
};

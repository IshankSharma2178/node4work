import type { NodeExecutor } from "@/features/executions/types";
import { cronTriggerChannel } from "@/inngest/channels/cron-trigger";

type CronTriggerData = Record<string, unknown>;

export const cronTriggerExecutor: NodeExecutor<CronTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    cronTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const result = await step.run("cron-trigger", async () => context);

  await publish(
    cronTriggerChannel().status({
      nodeId,
      status: "success",
    }),
  );

  return result;
};

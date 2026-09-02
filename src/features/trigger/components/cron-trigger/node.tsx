"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { ClockIcon } from "lucide-react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { CRON_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/cron-trigger";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchCronTriggerRealtimeToken } from "./actions";
import { CronTriggerDialog } from "./dialog";
import { type CronSchedule, cronDescription } from "./schedule";

export type CronTriggerNodeData = {
  schedules?: CronSchedule[];
};

type CronTriggerNodeType = Node<CronTriggerNodeData>;

export const CronTriggerNode = memo((props: NodeProps<CronTriggerNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: CRON_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchCronTriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const nodeData = props.data;
  const schedules = nodeData?.schedules;

  let description = "Not configured";
  if (schedules && schedules.length > 0) {
    const first = schedules[0];
    description = cronDescription(first) || "Scheduled";
    if (schedules.length > 1) {
      description += ` (+${schedules.length - 1} more)`;
    }
  }

  const handleSubmit = (values: { schedules: CronSchedule[] }) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  return (
    <>
      <CronTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={schedules}
      />
      <BaseTriggerNode
        {...props}
        icon={ClockIcon}
        name="When a cron schedule fires"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

CronTriggerNode.displayName = "CronTriggerNode";

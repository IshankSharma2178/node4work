"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { TELEGRAM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/telegram-trigger";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchTelegramTriggerRealtimeToken } from "./actions";
import { TelegramTriggerDialog, type TelegramTriggerFormValue } from "./dialog";

export type TelegramTriggerNodeData = {
  credentialId?: string;
};

type TelegramTriggerNodeType = Node<TelegramTriggerNodeData>;

export const TelegramTriggerNode = memo(
  (props: NodeProps<TelegramTriggerNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: TELEGRAM_TRIGGER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchTelegramTriggerRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.credentialId
      ? "When a new Telegram message arrives"
      : "Not configured";

    const handleSubmit = (values: TelegramTriggerFormValue) => {
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
        <TelegramTriggerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseTriggerNode
          {...props}
          icon="/telegram.svg"
          name="Telegram"
          description={description}
          status={nodeStatus}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

TelegramTriggerNode.displayName = "TelegramTriggerNode";

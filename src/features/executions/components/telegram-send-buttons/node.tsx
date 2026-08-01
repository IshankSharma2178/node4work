"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { TELEGRAM_SEND_BUTTONS_CHANNEL_NAME } from "@/inngest/channels/telegram-send-buttons";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchTelegramSendButtonsRealtimeToken } from "./actions";
import {
  TelegramSendButtonsDialog,
  type TelegramSendButtonsFormValue,
} from "./dialog";

export type TelegramSendButtonsNodeData = {
  variableName?: string;
  credentialId?: string;
  chatId?: string;
  text?: string;
  parseMode?: "None" | "Markdown" | "HTML";
  buttons?: Array<{ label: string; value: string }>;
};

type TelegramSendButtonsNodeType = Node<TelegramSendButtonsNodeData>;

export const TelegramSendButtonsNode = memo(
  (props: NodeProps<TelegramSendButtonsNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: TELEGRAM_SEND_BUTTONS_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchTelegramSendButtonsRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.text
      ? `${nodeData.buttons?.length ?? 0} button${
          (nodeData.buttons?.length ?? 0) === 1 ? "" : "s"
        }: ${nodeData.text.slice(0, 50)}...`
      : "Not configured";

    const handleSubmit = (values: TelegramSendButtonsFormValue) => {
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
        <TelegramSendButtonsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/telegram.svg"
          name="Send Telegram Buttons"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

TelegramSendButtonsNode.displayName = "TelegramSendButtonsNode";

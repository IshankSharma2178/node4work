"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { TELEGRAM_SEND_MESSAGE_CHANNEL_NAME } from "@/inngest/channels/telegram-send-message";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchTelegramSendMessageRealtimeToken } from "./actions";
import {
  TelegramSendMessageDialog,
  type TelegramSendMessageFormValue,
} from "./dialog";

export type TelegramSendMessageNodeData = {
  variableName?: string;
  credentialId?: string;
  chatId?: string;
  text?: string;
  parseMode?: "None" | "Markdown" | "HTML";
};

type TelegramSendMessageNodeType = Node<TelegramSendMessageNodeData>;

export const TelegramSendMessageNode = memo(
  (props: NodeProps<TelegramSendMessageNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: TELEGRAM_SEND_MESSAGE_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchTelegramSendMessageRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.text
      ? `To ${nodeData.chatId ?? "?"}: ${nodeData.text.slice(0, 50)}...`
      : "Not configured";

    const handleSubmit = (values: TelegramSendMessageFormValue) => {
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
        <TelegramSendMessageDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/telegram.svg"
          name="Send Telegram Message"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

TelegramSendMessageNode.displayName = "TelegramSendMessageNode";

"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { GOOGLE_SHEETS_CHANNEL_NAME } from "@/inngest/channels/google-sheets";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGoogleSheetsRealtimeToken } from "./actions";
import { GoogleSheetsDialog, type GoogleSheetsFormValues } from "./dialog";

export type GoogleSheetsNodeData = {
  variableName?: string;
  credentialId?: string;
  operation?: "append" | "read" | "update";
  spreadsheetId?: string;
  range?: string;
  values?: string[];
};

type GoogleSheetsNodeType = Node<GoogleSheetsNodeData>;

const OPERATION_LABEL: Record<string, string> = {
  append: "Append row",
  read: "Read rows",
  update: "Update cell",
};

export const GoogleSheetsNode = memo(
  (props: NodeProps<GoogleSheetsNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: GOOGLE_SHEETS_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchGoogleSheetsRealtimeToken,
    });

    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const operation = nodeData?.operation
      ? OPERATION_LABEL[nodeData.operation]
      : undefined;
    const description = nodeData?.range
      ? `${operation ?? "Google Sheets"} ${nodeData.range}`
      : "Not configured";

    const handleSubmit = (values: GoogleSheetsFormValues) => {
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
        <GoogleSheetsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/google-sheets.svg"
          name="Google Sheets"
          status={nodeStatus}
          description={description}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

GoogleSheetsNode.displayName = "GoogleSheetsNode";

"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { BaseExecutionNode } from "../base-execution-node";

export type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeData>) => {
  const nodeData = props.data;

  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not configured";

  return (
    <BaseExecutionNode
      {...props}
      id={props.id}
      icon={GlobeIcon}
      name="HTTP Request"
      description={description}
      onSettings={() => {}}
      onDoubleClick={() => {}}
    />
  );
});

HttpRequestNode.displayName = "HttpRequestNode";

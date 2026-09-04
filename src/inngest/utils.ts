import { createId } from "@paralleldrive/cuid2";
import type { Connection, Node } from "@prisma/client";
import toposort from "toposort";
import { acquireIdempotencyKey } from "@/lib/idempotency";
import { inngest } from "./client";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  if (connections.length === 0) {
    return nodes;
  }

  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  const connectedNodeIds = new Set<string>();

  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];

  try {
    sortedNodeIds = toposort(edges);

    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return sortedNodeIds.map((id) => nodeMap.get(id)).filter(Boolean) as Node[];
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  idempotencyKey?: string;
  [key: string]: any;
}) => {
  if (data.idempotencyKey) {
    const acquired = await acquireIdempotencyKey(
      `idempotency:${data.idempotencyKey}`,
    );
    if (!acquired) {
      return null;
    }
  }

  return inngest.send({
    name: "workflows/execute.workflow",
    data,
    id: createId(),
  });
};

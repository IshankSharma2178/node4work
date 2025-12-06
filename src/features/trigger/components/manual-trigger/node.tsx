import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node";

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <BaseTriggerNode
      {...props}
      icon={MousePointerIcon}
      name="When clicking 'Execute workflow'"
      // status={nodeStatus} // TODO
      // onSettings={handleOpenSettings} // TODO
      // onDoubleClick={handleOpenSettings} // TODO
    />
  );
});

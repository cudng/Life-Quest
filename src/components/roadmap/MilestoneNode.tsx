// Custom React Flow node for a roadmap milestone. Styled by status
// (locked / available / completed). Selection is handled by React Flow; this
// just renders. Handles on left/right wire the prerequisite edges.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MilestoneFlowNode } from "@/engine/roadmapLayout";
import type { NodeStatus } from "@/engine/graph";

const STATUS_STYLES: Record<NodeStatus, string> = {
  completed: "border-primary bg-primary/10 text-foreground",
  available:
    "border-[var(--accent-border)] bg-[var(--accent-bg)] text-foreground",
  locked: "border-border bg-card text-muted-foreground opacity-70",
};

const STATUS_BADGE: Record<NodeStatus, string> = {
  completed: "✓ Done",
  available: "Available",
  locked: "🔒 Locked",
};

function MilestoneNodeImpl({ data, selected }: NodeProps<MilestoneFlowNode>) {
  const { milestone, status } = data;

  return (
    <div
      className={[
        "w-[240px] rounded-xl border p-4 text-left shadow-sm transition-colors",
        STATUS_STYLES[status],
        selected ? "ring-2 ring-[var(--ring)]" : "",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-muted-foreground"
      />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {STATUS_BADGE[status]}
        </span>
        <span className="text-xs text-muted-foreground">+{milestone.xp} XP</span>
      </div>

      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
        {milestone.title}
      </h3>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground"
      />
    </div>
  );
}

export const MilestoneNode = memo(MilestoneNodeImpl);

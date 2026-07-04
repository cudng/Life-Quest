// Custom React Flow node for a roadmap milestone, forged in the dark-fantasy
// talent language (PROJECT.md). Status maps to a metal medallion — gold =
// completed (crowned ♛), ember = available (breathes), iron = locked
// (desaturated + 🔒). Selection is handled by React Flow; handles on left/right
// wire the prerequisite edges.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MilestoneFlowNode } from "@/engine/roadmapLayout";
import type { NodeStatus } from "@/engine/graph";
import {
  FANTASY,
  Medallion,
  TalentSlab,
  type Metal,
} from "@/components/ui/talent";

// Status → forged metal (the four-metal progression language).
const STATUS_METAL: Record<NodeStatus, Metal> = {
  completed: "gold", // done — the reward state (crowned)
  available: "ember", // reachable now (breathes)
  locked: "iron", // prerequisites unmet (desaturated)
};

const STATUS_LABEL: Record<NodeStatus, string> = {
  completed: "Completed",
  available: "Available",
  locked: "Locked",
};

// Subtle forged dots instead of React Flow's default handles.
const HANDLE = "!size-2 !border-0 !bg-[#7a6440]";

function MilestoneNodeImpl({ data, selected }: NodeProps<MilestoneFlowNode>) {
  const { milestone, status } = data;
  const metal = STATUS_METAL[status];
  const locked = status === "locked";
  // Crown the completed node; sigil the locked ones. (PROJECT.md sigils.)
  const badge = locked ? "🔒" : status === "completed" ? "♛" : undefined;

  return (
    <TalentSlab
      className={`w-[220px] items-center gap-2.5 py-1.5 ${
        selected ? "ring-2 ring-[#d99f36]" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className={HANDLE} />

      <Medallion
        metal={metal}
        size={32}
        badge={badge}
        dim={locked}
        pulse={status === "available"}
      >
        ✦
      </Medallion>

      <div className="min-w-0 flex-1">
        <h3
          className="line-clamp-1 font-serif text-[13px] font-semibold leading-tight"
          style={{
            color: locked ? FANTASY.goldFaint : FANTASY.goldText,
            textShadow: "0 1px 2px rgba(0,0,0,.6)",
          }}
        >
          {milestone.title}
        </h3>
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{
              color: status === "available" ? FANTASY.emberText : FANTASY.goldDim,
            }}
          >
            {STATUS_LABEL[status]}
          </span>
          <span
            className="font-mono text-[10px]"
            style={{ color: FANTASY.goldDim }}
          >
            +{milestone.xp} XP
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className={HANDLE} />
    </TalentSlab>
  );
}

export const MilestoneNode = memo(MilestoneNodeImpl);

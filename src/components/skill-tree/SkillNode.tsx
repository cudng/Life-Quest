// Custom React Flow node for a tech skill. Styled by mastery
// (locked / learning / proficient / expert); a gated child (parent below the
// unlock threshold) renders locked regardless of its stored mastery. Selection
// is handled by React Flow. Handles on left/right wire the parent → child edges.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Mastery } from "@/data/types";
import type { SkillFlowNode } from "@/engine/skillTree";

const MASTERY_STYLES: Record<Mastery, string> = {
  expert: "border-primary bg-primary/15 text-foreground",
  proficient: "border-primary bg-primary/10 text-foreground",
  learning:
    "border-[var(--accent-border)] bg-[var(--accent-bg)] text-foreground",
  locked: "border-border bg-card text-muted-foreground opacity-70",
};

const MASTERY_BADGE: Record<Mastery, string> = {
  expert: "★ Expert",
  proficient: "Proficient",
  learning: "Learning",
  locked: "Locked",
};

function SkillNodeImpl({ data, selected }: NodeProps<SkillFlowNode>) {
  const { skill, gated } = data;
  const mastery: Mastery = gated ? "locked" : skill.mastery;

  return (
    <div
      className={[
        "w-[220px] rounded-xl border p-4 text-left shadow-sm transition-colors",
        MASTERY_STYLES[mastery],
        selected ? "ring-2 ring-[var(--ring)]" : "",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-muted-foreground"
      />

      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none">{skill.icon}</span>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {skill.name}
        </h3>
      </div>

      <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
        {gated ? "🔒 Locked" : MASTERY_BADGE[mastery]}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground"
      />
    </div>
  );
}

export const SkillNode = memo(SkillNodeImpl);

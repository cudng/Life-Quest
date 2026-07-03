// Custom React Flow node for a tech skill, forged in the dark-fantasy talent
// language (PROJECT.md). Mastery maps to a metal medallion — gold = mastered
// (crowned ♛), bronze = proficient, ember = learning (breathes), iron = locked
// (desaturated + 🔒). A gated child (parent below the unlock threshold) reads
// locked regardless of its stored mastery. Selection is handled by React Flow;
// handles on left/right wire the parent → child edges.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Mastery } from "@/data/types";
import type { SkillFlowNode } from "@/engine/skillTree";
import {
  FANTASY,
  Medallion,
  TalentSlab,
  type Metal,
} from "@/components/ui/talent";

// Mastery → forged metal (the four-metal progression language).
const MASTERY_METAL: Record<Mastery, Metal> = {
  expert: "gold", // mastered — the reward state (crowned)
  proficient: "bronze", // proficient / partial
  learning: "ember", // in progress (breathes)
  locked: "iron", // locked (desaturated)
};

const MASTERY_LABEL: Record<Mastery, string> = {
  expert: "Mastered",
  proficient: "Proficient",
  learning: "Learning",
  locked: "Locked",
};

// Subtle forged dots instead of React Flow's default handles.
const HANDLE = "!size-2 !border-0 !bg-[#7a6440]";

function SkillNodeImpl({ data, selected }: NodeProps<SkillFlowNode>) {
  const { skill, gated } = data;
  const mastery: Mastery = gated ? "locked" : skill.mastery;
  const metal = MASTERY_METAL[mastery];
  const locked = mastery === "locked";
  // Crown the mastered node; sigil the locked ones. (PROJECT.md sigils.)
  const badge = locked ? "🔒" : mastery === "expert" ? "♛" : undefined;

  return (
    <TalentSlab
      className={`w-[210px] items-center gap-3 py-3 ${
        selected ? "ring-2 ring-[#d99f36]" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className={HANDLE} />

      <Medallion
        metal={metal}
        size={46}
        badge={badge}
        dim={locked}
        pulse={mastery === "learning"}
      >
        {skill.icon}
      </Medallion>

      <div className="min-w-0 flex-1">
        <h3
          className="line-clamp-2 font-serif text-sm font-semibold"
          style={{
            color: locked ? FANTASY.goldFaint : FANTASY.goldText,
            textShadow: "0 1px 2px rgba(0,0,0,.6)",
          }}
        >
          {skill.name}
        </h3>
        <p
          className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{
            color:
              mastery === "learning" ? FANTASY.emberText : FANTASY.goldDim,
          }}
        >
          {MASTERY_LABEL[mastery]}
        </p>
      </div>

      <Handle type="source" position={Position.Right} className={HANDLE} />
    </TalentSlab>
  );
}

export const SkillNode = memo(SkillNodeImpl);

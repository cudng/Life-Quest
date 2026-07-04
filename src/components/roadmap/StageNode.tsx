// Background column slab for one roadmap stage. Sits behind that stage's
// milestone nodes to group them visually (PROJECT.md dark-fantasy language):
// a recessed obsidian band with a faint gold hairline and a mono eyebrow title
// banner at the top. Non-interactive — purely a grouping frame.

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { StageFlowNode } from "@/engine/roadmapLayout";
import { FANTASY } from "@/components/ui/talent";

function StageNodeImpl({ data }: NodeProps<StageFlowNode>) {
  return (
    <div
      className="h-full w-full rounded-2xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(36,26,14,.35) 0%, rgba(10,7,5,.15) 40%)",
        boxShadow: "inset 0 0 0 1px rgba(160,120,50,.18)",
      }}
    >
      <div
        className="flex items-center gap-2 rounded-t-2xl px-3 py-2"
        style={{
          background:
            "linear-gradient(180deg, rgba(36,26,14,.6) 0%, rgba(20,13,6,0) 100%)",
          borderBottom: "1px solid rgba(160,120,50,.16)",
        }}
      >
        <span
          className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: FANTASY.eyebrow }}
        >
          {data.title}
        </span>
        <span
          className="font-mono text-[10px]"
          style={{ color: FANTASY.goldFaint }}
        >
          {data.count}
        </span>
        {data.isAdmin && (
          <button
            type="button"
            aria-label="Edit stage"
            className="nodrag nopan font-mono text-[11px] leading-none transition-colors hover:text-[#f0b85e]"
            style={{ color: FANTASY.goldFaint }}
            onClick={(e) => {
              e.stopPropagation();
              data.onEditStage?.(data.stageId);
            }}
          >
            ✎
          </button>
        )}
      </div>
    </div>
  );
}

export const StageNode = memo(StageNodeImpl);

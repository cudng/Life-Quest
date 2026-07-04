// Admin form to add a stage (a column) to the active path. Title required;
// id is a unique slug from the title; position goes to the end of the path.

import { useState } from "react";
import { useAddStage } from "@/data/mutations";
import { uniqueSlug } from "@/lib/slug";

interface AddStageFormProps {
  pathId: string;
  existingIds: Set<string>;
  nextPosition: number;
  onClose: () => void;
}

export function AddStageForm({
  pathId,
  existingIds,
  nextPosition,
  onClose,
}: AddStageFormProps) {
  const add = useAddStage();
  const [title, setTitle] = useState("");

  const canSubmit = title.trim().length > 0 && !add.isPending;

  const submit = () => {
    if (!canSubmit) return;
    add.mutate(
      {
        id: uniqueSlug(title, existingIds),
        path_id: pathId,
        title: title.trim(),
        position: nextPosition,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-[#a07832]/25 bg-[#0d0a07] p-6 text-left text-[#e8d4a8]">
      <div className="flex items-start justify-between gap-3">
        <h2
          className="font-serif text-lg font-semibold text-[#e8d4a8]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
        >
          Add stage
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[#9a7c48] transition-colors hover:text-[#e8d4a8]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        {add.isError && (
          <p className="text-sm text-destructive">
            {add.error?.message ?? "Failed to add stage"}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-md border border-[#db5f10]/50 bg-gradient-to-b from-[#241a0e] to-[#140d06] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#f0b85e] transition-colors hover:border-[#db5f10]/80 disabled:opacity-50"
        >
          Add stage
        </button>
      </div>
    </aside>
  );
}

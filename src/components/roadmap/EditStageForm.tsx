// Admin form to rename a stage (a column) or delete it. Id, path and position
// are immutable here. Deleting cascades the stage's milestones/sub_tasks.

import { useState } from "react";
import { useUpdateStage, useDeleteStage } from "@/data/mutations";
import type { Stage } from "@/data/types";

interface EditStageFormProps {
  stage: Stage;
  onClose: () => void;
}

export function EditStageForm({ stage, onClose }: EditStageFormProps) {
  const update = useUpdateStage();
  const remove = useDeleteStage();
  const [title, setTitle] = useState(stage.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canSubmit = title.trim().length > 0 && !update.isPending;

  const submit = () => {
    if (!canSubmit) return;
    update.mutate({ id: stage.id, title: title.trim() }, { onSuccess: onClose });
  };

  const del = () => {
    remove.mutate(stage.id, { onSuccess: onClose });
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-[#a07832]/25 bg-[#0d0a07] p-6 text-left text-[#e8d4a8]">
      <div className="flex items-start justify-between gap-3">
        <h2
          className="font-serif text-lg font-semibold text-[#e8d4a8]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
        >
          Edit stage
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

        {update.isError && (
          <p className="text-sm text-destructive">
            {update.error?.message ?? "Failed to update stage"}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-md border border-[#db5f10]/50 bg-gradient-to-b from-[#241a0e] to-[#140d06] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#f0b85e] transition-colors hover:border-[#db5f10]/80 disabled:opacity-50"
        >
          Save changes
        </button>
      </div>

      <div className="mt-auto border-t border-[#a07832]/20 pt-4">
        {confirmDelete ? (
          <div className="space-y-3">
            <p className="font-mono text-xs text-[#9a7c48]">
              Delete “{stage.title}” and all its milestones?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={remove.isPending}
                onClick={del}
                className="rounded-md border border-destructive/60 bg-gradient-to-b from-[#2a1010] to-[#160808] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-destructive transition-colors hover:border-destructive disabled:opacity-50"
              >
                {remove.isPending ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-md border border-[#4c4c55]/40 bg-gradient-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#9a7c48] transition-colors hover:border-[#4c4c55]/70"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-md border border-destructive/40 bg-gradient-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-destructive transition-colors hover:border-destructive/70"
          >
            🗑 Delete stage
          </button>
        )}
        {remove.isError && (
          <p className="mt-2 font-mono text-xs text-destructive">
            {remove.error?.message ?? "Failed to delete stage"}
          </p>
        )}
      </div>
    </aside>
  );
}

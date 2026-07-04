// Admin form to edit a path's name and icon, or delete it. Id and position are
// immutable here. Deleting cascades the path's stages/milestones in the DB.

import { useState } from "react";
import { useUpdatePath, useDeletePath } from "@/data/mutations";
import type { Path } from "@/data/types";

interface EditPathFormProps {
  path: Path;
  onClose: () => void;
  /** Called after a successful delete so the page can switch away. */
  onDeleted: () => void;
}

export function EditPathForm({ path, onClose, onDeleted }: EditPathFormProps) {
  const update = useUpdatePath();
  const remove = useDeletePath();
  const [title, setTitle] = useState(path.title);
  const [icon, setIcon] = useState(path.icon ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canSubmit = title.trim().length > 0 && !update.isPending;

  const submit = () => {
    if (!canSubmit) return;
    update.mutate(
      { id: path.id, title: title.trim(), icon: icon.trim() || null },
      { onSuccess: onClose },
    );
  };

  const del = () => {
    remove.mutate(path.id, { onSuccess: onDeleted });
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-[#a07832]/25 bg-[#0d0a07] p-6 text-left text-[#e8d4a8]">
      <div className="flex items-start justify-between gap-3">
        <h2
          className="font-serif text-lg font-semibold text-[#e8d4a8]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
        >
          Edit path
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

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Icon (emoji, optional)
          </span>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        {update.isError && (
          <p className="text-sm text-destructive">
            {update.error?.message ?? "Failed to update path"}
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
              Delete “{path.title}” and all its stages &amp; milestones?
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
            🗑 Delete path
          </button>
        )}
        {remove.isError && (
          <p className="mt-2 font-mono text-xs text-destructive">
            {remove.error?.message ?? "Failed to delete path"}
          </p>
        )}
      </div>
    </aside>
  );
}

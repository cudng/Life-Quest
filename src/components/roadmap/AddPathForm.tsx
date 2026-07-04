// Admin form to add a path to the active track. Title required, icon (emoji)
// optional. Id is a unique slug from the title; position goes to the end.

import { useState } from "react";
import { useAddPath } from "@/data/mutations";
import { uniqueSlug } from "@/lib/slug";

interface AddPathFormProps {
  trackId: string;
  existingIds: Set<string>;
  nextPosition: number;
  /** Called with the new path id so the page can switch to it. */
  onCreated: (id: string) => void;
  onClose: () => void;
}

export function AddPathForm({
  trackId,
  existingIds,
  nextPosition,
  onCreated,
  onClose,
}: AddPathFormProps) {
  const add = useAddPath();
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");

  const canSubmit = title.trim().length > 0 && !add.isPending;

  const submit = () => {
    if (!canSubmit) return;
    const id = uniqueSlug(title, existingIds);
    add.mutate(
      {
        id,
        track_id: trackId,
        title: title.trim(),
        icon: icon.trim() || null,
        position: nextPosition,
      },
      { onSuccess: () => onCreated(id) },
    );
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-[#a07832]/25 bg-[#0d0a07] p-6 text-left text-[#e8d4a8]">
      <div className="flex items-start justify-between gap-3">
        <h2
          className="font-serif text-lg font-semibold text-[#e8d4a8]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
        >
          Add path
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

        {add.isError && (
          <p className="text-sm text-destructive">
            {add.error?.message ?? "Failed to add path"}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-md border border-[#db5f10]/50 bg-gradient-to-b from-[#241a0e] to-[#140d06] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#f0b85e] transition-colors hover:border-[#db5f10]/80 disabled:opacity-50"
        >
          Add path
        </button>
      </div>
    </aside>
  );
}

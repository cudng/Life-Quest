// Admin form to add a track (a tab / quest line). Title required, icon (emoji)
// optional. Id is a unique slug from the title; position goes to the end.

import { useState } from "react";
import { useAddTrack } from "@/data/mutations";
import { uniqueSlug } from "@/lib/slug";

interface AddTrackFormProps {
  existingIds: Set<string>;
  nextPosition: number;
  /** Called with the new track id so the page can switch to it. */
  onCreated: (id: string) => void;
  onClose: () => void;
}

export function AddTrackForm({
  existingIds,
  nextPosition,
  onCreated,
  onClose,
}: AddTrackFormProps) {
  const add = useAddTrack();
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");

  const canSubmit = title.trim().length > 0 && !add.isPending;

  const submit = () => {
    if (!canSubmit) return;
    const id = uniqueSlug(title, existingIds);
    add.mutate(
      {
        id,
        title: title.trim(),
        icon: icon.trim() || null,
        position: nextPosition,
      },
      { onSuccess: () => onCreated(id) },
    );
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l bg-card p-6 text-left text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Add track</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Icon (emoji, optional)
          </span>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        {add.isError && (
          <p className="text-sm text-destructive">
            {add.error?.message ?? "Failed to add track"}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Add track
        </button>
      </div>
    </aside>
  );
}

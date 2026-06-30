// Admin form to add a stage (a column) to the active track. Title required;
// id is a unique slug from the title; position goes to the end of the track.

import { useState } from "react";
import { useAddStage } from "@/data/mutations";
import { uniqueSlug } from "@/lib/slug";

interface AddStageFormProps {
  trackId: string;
  existingIds: Set<string>;
  nextPosition: number;
  onClose: () => void;
}

export function AddStageForm({
  trackId,
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
        track_id: trackId,
        title: title.trim(),
        position: nextPosition,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l bg-card p-6 text-left text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Add stage</h2>
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

        {add.isError && (
          <p className="text-sm text-destructive">
            {add.error?.message ?? "Failed to add stage"}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Add stage
        </button>
      </div>
    </aside>
  );
}

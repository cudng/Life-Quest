// Admin form to add a milestone (node) to the active track. Title + target
// stage are required; xp/description/prerequisites optional. The id is a slug
// derived from the title, made unique against every existing milestone id.

import { useState } from "react";
import type { Milestone, Stage } from "@/data/types";
import { useAddMilestone } from "@/data/mutations";
import { uniqueSlug } from "@/lib/slug";

interface AddMilestoneFormProps {
  /** Stages of the active track (the column choices). */
  stages: Stage[];
  /** Milestones in the active track (prerequisite choices). */
  trackMilestones: Milestone[];
  /** Every existing milestone id, for a globally-unique slug. */
  existingIds: Set<string>;
  onClose: () => void;
}

export function AddMilestoneForm({
  stages,
  trackMilestones,
  existingIds,
  onClose,
}: AddMilestoneFormProps) {
  const add = useAddMilestone();

  const [title, setTitle] = useState("");
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");
  const [xp, setXp] = useState(0);
  const [description, setDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState<string[]>([]);

  const canSubmit = title.trim().length > 0 && stageId !== "" && !add.isPending;

  const togglePrereq = (id: string) =>
    setPrerequisites((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const submit = () => {
    if (!canSubmit) return;
    add.mutate(
      {
        id: uniqueSlug(title, existingIds),
        stage_id: stageId,
        title: title.trim(),
        description: description.trim(),
        xp,
        prerequisites,
        resources: [],
      },
      { onSuccess: onClose },
    );
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l bg-card p-6 text-left text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Add milestone</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {stages.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          This track has no stages yet. Add a stage first.
        </p>
      ) : (
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
            <span className="text-sm font-medium text-foreground">Stage</span>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">XP</span>
            <input
              type="number"
              min={0}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            />
          </label>

          {trackMilestones.length > 0 && (
            <div>
              <span className="text-sm font-medium text-foreground">
                Prerequisites
              </span>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {trackMilestones.map((m) => (
                  <li key={m.id}>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={prerequisites.includes(m.id)}
                        onChange={() => togglePrereq(m.id)}
                        className="size-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">{m.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {add.isError && (
            <p className="text-sm text-destructive">
              {add.error?.message ?? "Failed to add milestone"}
            </p>
          )}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Add milestone
          </button>
        </div>
      )}
    </aside>
  );
}

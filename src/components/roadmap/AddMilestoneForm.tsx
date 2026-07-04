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
    <aside className="flex h-full flex-col overflow-y-auto border-l border-[#a07832]/25 bg-[#0d0a07] p-6 text-left text-[#e8d4a8]">
      <div className="flex items-start justify-between gap-3">
        <h2
          className="font-serif text-lg font-semibold text-[#e8d4a8]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
        >
          Add milestone
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

      {stages.length === 0 ? (
        <p className="mt-4 text-sm text-[#9a7c48]">
          This track has no stages yet. Add a stage first.
        </p>
      ) : (
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
              Stage
            </span>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
              XP
            </span>
            <input
              type="number"
              min={0}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value) || 0)}
              className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
            />
          </label>

          {trackMilestones.length > 0 && (
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
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
                        className="size-4 accent-[#db5f10]"
                      />
                      <span className="text-sm text-[#e8d4a8]">{m.title}</span>
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
            className="rounded-md border border-[#db5f10]/50 bg-gradient-to-b from-[#241a0e] to-[#140d06] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#f0b85e] transition-colors hover:border-[#db5f10]/80 disabled:opacity-50"
          >
            Add milestone
          </button>
        </div>
      )}
    </aside>
  );
}

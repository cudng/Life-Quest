// Detail panel for the selected skill: icon/name, description, resources, and
// (admin) a mastery setter, Edit and Delete. Setting mastery grants XP (derived
// in progress.ts). A gated skill (parent below the unlock threshold) shows a
// hint and disables the mastery controls. Visitors see everything read-only.
// The parent remounts this per selection (key=id), so edit-form state seeds
// from props without a reset effect.

import { useState } from "react";
import type { Mastery, Resource, Skill } from "@/data/types";
import {
  useSetSkillMastery,
  useUpdateSkill,
  useDeleteSkill,
} from "@/data/mutations";
import { useIsAdmin } from "@/auth/useIsAdmin";
import { UNLOCK_THRESHOLD } from "@/engine/skillTree";
import {
  ResourcesEditor,
  cleanResources,
} from "@/components/skill-tree/ResourcesEditor";

const MASTERY_OPTIONS: Mastery[] = [
  "locked",
  "learning",
  "proficient",
  "expert",
];

const MASTERY_LABEL: Record<Mastery, string> = {
  locked: "Locked",
  learning: "Learning",
  proficient: "Proficient",
  expert: "Expert",
};

interface SkillDetailProps {
  skill: Skill;
  /** Parent not yet at the unlock threshold → mastery controls disabled. */
  gated: boolean;
  /** All skills — parent choices when editing. */
  allSkills: Skill[];
  onClose: () => void;
}

/** Ids of `skill` and everything beneath it — invalid parent choices (cycles). */
function descendantIds(skill: Skill, all: Skill[]): Set<string> {
  const blocked = new Set<string>([skill.id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const s of all) {
      if (s.parent_id && blocked.has(s.parent_id) && !blocked.has(s.id)) {
        blocked.add(s.id);
        grew = true;
      }
    }
  }
  return blocked;
}

export function SkillDetail({
  skill,
  gated,
  allSkills,
  onClose,
}: SkillDetailProps) {
  const setMastery = useSetSkillMastery();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const isAdmin = useIsAdmin();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(skill.name);
  const [icon, setIcon] = useState(skill.icon);
  const [description, setDescription] = useState(skill.description ?? "");
  const [parentId, setParentId] = useState(skill.parent_id ?? "");
  const [resources, setResources] = useState<Resource[]>(skill.resources);

  const parent = allSkills.find((s) => s.id === skill.parent_id);
  const blocked = descendantIds(skill, allSkills);
  const parentChoices = allSkills.filter((s) => !blocked.has(s.id));

  const saveEdit = () => {
    if (name.trim().length === 0) return;
    updateSkill.mutate(
      {
        id: skill.id,
        patch: {
          name: name.trim(),
          icon: icon.trim(),
          description: description.trim() || null,
          parent_id: parentId || null,
          resources: cleanResources(resources),
        },
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const remove = () => deleteSkill.mutate(skill.id, { onSuccess: onClose });

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l bg-card p-6 text-left text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {editing ? "Edit skill" : `${skill.icon} ${skill.name}`}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Icon (emoji)
            </span>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Parent</span>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              <option value="">— None (root) —</option>
              {parentChoices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
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

          <ResourcesEditor value={resources} onChange={setResources} />

          {updateSkill.isError && (
            <p className="text-sm text-destructive">
              {updateSkill.error?.message ?? "Failed to save"}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={name.trim().length === 0 || updateSkill.isPending}
              onClick={saveEdit}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-1 text-sm uppercase tracking-wide text-muted-foreground">
            {gated ? "🔒 Locked" : MASTERY_LABEL[skill.mastery]}
          </div>

          {skill.description && (
            <p className="mt-4 text-sm text-muted-foreground">
              {skill.description}
            </p>
          )}

          {gated && parent && (
            <p className="mt-4 rounded-md border border-[var(--accent-border)] bg-[var(--accent-bg)] p-3 text-sm text-foreground">
              Reach {MASTERY_LABEL[UNLOCK_THRESHOLD]} on {parent.name} to unlock
              this skill.
            </p>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">Mastery</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MASTERY_OPTIONS.map((m) => {
                const active = skill.mastery === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={!isAdmin || gated || setMastery.isPending}
                    onClick={() => setMastery.mutate({ id: skill.id, mastery: m })}
                    className={
                      active
                        ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        : "rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary disabled:opacity-50"
                    }
                  >
                    {MASTERY_LABEL[m]}
                  </button>
                );
              })}
            </div>
            {setMastery.isError && (
              <p className="mt-2 text-sm text-destructive">
                {setMastery.error?.message ?? "Failed to set mastery"}
              </p>
            )}
          </div>

          {skill.resources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground">
                Resources
              </h3>
              <ul className="mt-3 space-y-1">
                {skill.resources.map((r, i) => (
                  <li key={i}>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[var(--accent)] hover:underline"
                      >
                        {r.label} ↗
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        📖 {r.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isAdmin && (
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex-1 rounded-md border px-3 py-1.5 text-sm text-foreground hover:bg-secondary"
              >
                Edit
              </button>
              {confirmDelete ? (
                <button
                  type="button"
                  disabled={deleteSkill.isPending}
                  onClick={remove}
                  className="flex-1 rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  Confirm delete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 rounded-md border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {deleteSkill.isError && (
            <p className="mt-2 text-sm text-destructive">
              {deleteSkill.error?.message ?? "Failed to delete"}
            </p>
          )}
        </>
      )}
    </aside>
  );
}

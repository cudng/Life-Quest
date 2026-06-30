// Detail panel for the selected milestone: description, resources, sub-task
// checklist, and (admin) Complete / Edit / Delete. Visitors see everything
// read-only; edit controls are gated by useIsAdmin (RLS is the real guard).
// The parent remounts this per selection (key=id), so edit-form state can be
// seeded from props without a reset effect.

import { useState } from "react";
import type { Milestone } from "@/data/types";
import type { NodeStatus } from "@/engine/graph";
import { useSubTasks } from "@/data/queries";
import {
  useToggleMilestone,
  useToggleSubTask,
  useUpdateMilestone,
  useDeleteMilestone,
} from "@/data/mutations";
import { useIsAdmin } from "@/auth/useIsAdmin";

interface MilestoneDetailProps {
  milestone: Milestone;
  status: NodeStatus;
  /** Other milestones in this track — prerequisite choices when editing. */
  trackMilestones: Milestone[];
  onClose: () => void;
}

export function MilestoneDetail({
  milestone,
  status,
  trackMilestones,
  onClose,
}: MilestoneDetailProps) {
  const subTasks = useSubTasks();
  const toggleMilestone = useToggleMilestone();
  const toggleSubTask = useToggleSubTask();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const isAdmin = useIsAdmin();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description);
  const [xp, setXp] = useState(milestone.xp);
  const [prerequisites, setPrerequisites] = useState<string[]>(
    milestone.prerequisites,
  );

  const tasks = (subTasks.data ?? []).filter(
    (t) => t.milestone_id === milestone.id,
  );
  const doneTasks = tasks.filter((t) => t.completed).length;

  const completed = status === "completed";
  const canComplete = isAdmin && (completed || status === "available");

  const togglePrereq = (id: string) =>
    setPrerequisites((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const saveEdit = () => {
    if (title.trim().length === 0) return;
    updateMilestone.mutate(
      {
        id: milestone.id,
        patch: {
          title: title.trim(),
          description: description.trim(),
          xp,
          prerequisites,
        },
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const remove = () =>
    deleteMilestone.mutate(milestone.id, { onSuccess: onClose });

  // Prerequisite choices exclude the milestone itself.
  const prereqChoices = trackMilestones.filter((m) => m.id !== milestone.id);

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l bg-card p-6 text-left text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {editing ? "Edit milestone" : milestone.title}
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
            <span className="text-sm font-medium text-foreground">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            />
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

          {prereqChoices.length > 0 && (
            <div>
              <span className="text-sm font-medium text-foreground">
                Prerequisites
              </span>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {prereqChoices.map((m) => (
                  <li key={m.id}>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={prerequisites.includes(m.id)}
                        onChange={() => togglePrereq(m.id)}
                        className="size-4 accent-[var(--primary)]"
                      />
                      <span className="text-sm text-foreground">{m.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {updateMilestone.isError && (
            <p className="text-sm text-destructive">
              {updateMilestone.error?.message ?? "Failed to save"}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={title.trim().length === 0 || updateMilestone.isPending}
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
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="uppercase tracking-wide">{status}</span>
            <span>+{milestone.xp} XP</span>
          </div>

          {milestone.description && (
            <p className="mt-4 text-sm text-muted-foreground">
              {milestone.description}
            </p>
          )}

          {tasks.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Sub-tasks
                </h3>
                <span className="text-sm text-muted-foreground">
                  {doneTasks}/{tasks.length}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        disabled={!isAdmin || toggleSubTask.isPending}
                        onChange={() =>
                          toggleSubTask.mutate({
                            id: t.id,
                            completed: !t.completed,
                          })
                        }
                        className="size-4 accent-[var(--primary)]"
                      />
                      <span
                        className={
                          t.completed
                            ? "text-sm text-muted-foreground line-through"
                            : "text-sm text-foreground"
                        }
                      >
                        {t.title}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {milestone.resources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground">
                Resources
              </h3>
              <ul className="mt-3 space-y-1">
                {milestone.resources.map((r, i) => (
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
            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={!canComplete || toggleMilestone.isPending}
                onClick={() =>
                  toggleMilestone.mutate({
                    id: milestone.id,
                    completed: !completed,
                  })
                }
                className="w-full rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {completed ? "Mark incomplete" : "Complete milestone"}
              </button>

              <div className="flex gap-2">
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
                    disabled={deleteMilestone.isPending}
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

              {deleteMilestone.isError && (
                <p className="text-sm text-destructive">
                  {deleteMilestone.error?.message ?? "Failed to delete"}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
}

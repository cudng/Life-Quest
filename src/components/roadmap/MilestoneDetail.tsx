// Detail panel for the selected milestone: description, resources, sub-task
// checklist, and (admin) Complete / Edit / Delete. Visitors see everything
// read-only; edit controls are gated by useIsAdmin (RLS is the real guard).
// The parent remounts this per selection (key=id), so edit-form state can be
// seeded from props without a reset effect.
//
// Styled in the dark-fantasy talent language (PROJECT.md): obsidian panel,
// forged status medallion, serif gold titles, mono eyebrow section labels,
// ember/gold controls — matching the roadmap board it sits beside.

import { useState } from "react";
import type { Milestone } from "@/data/types";
import type { NodeStatus } from "@/engine/graph";
import { useSubTasks } from "@/data/queries";
import {
  useToggleMilestone,
  useToggleSubTask,
  useAddSubTask,
  useRenameSubTask,
  useDeleteSubTask,
  useUpdateMilestone,
  useDeleteMilestone,
} from "@/data/mutations";
import { useIsAdmin } from "@/auth/useIsAdmin";
import { uniqueSlug } from "@/lib/slug";
import { FANTASY, Medallion, type Metal } from "@/components/ui/talent";

interface MilestoneDetailProps {
  milestone: Milestone;
  status: NodeStatus;
  /** Other milestones in this track — prerequisite choices when editing. */
  trackMilestones: Milestone[];
  onClose: () => void;
}

// Status → forged metal + label (mirrors MilestoneNode).
const STATUS_METAL: Record<NodeStatus, Metal> = {
  completed: "gold",
  available: "ember",
  locked: "iron",
};
const STATUS_LABEL: Record<NodeStatus, string> = {
  completed: "Completed",
  available: "Available",
  locked: "Locked",
};

// Shared control recipes (dark-fantasy language).
const EMBER_BTN =
  "rounded-md border border-[#db5f10]/40 bg-gradient-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#db5f10]/70 disabled:opacity-50";
const GOLD_BTN =
  "rounded-md border border-[#d99f36]/55 bg-gradient-to-b from-[#241a0e] to-[#140d06] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#d99f36]/85 disabled:opacity-50";
const IRON_BTN =
  "rounded-md border border-[#4c4c55]/40 bg-gradient-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[#4c4c55]/70 disabled:opacity-50";
const DANGER_BTN =
  "rounded-md border border-destructive/50 bg-gradient-to-b from-[#2a1010] to-[#160808] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-destructive transition-colors hover:border-destructive disabled:opacity-50";
const INPUT =
  "mt-1 w-full rounded-md border border-[#a9803a]/30 bg-[#0d0a07] px-3 py-1.5 text-sm outline-none focus:border-[#d99f36]/60";
const FIELD_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.16em]";
const SECTION_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.18em]";

export function MilestoneDetail({
  milestone,
  status,
  trackMilestones,
  onClose,
}: MilestoneDetailProps) {
  const subTasks = useSubTasks();
  const toggleMilestone = useToggleMilestone();
  const toggleSubTask = useToggleSubTask();
  const addSubTask = useAddSubTask();
  const renameSubTask = useRenameSubTask();
  const deleteSubTask = useDeleteSubTask();
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
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");

  const allTasks = subTasks.data ?? [];
  const tasks = allTasks.filter((t) => t.milestone_id === milestone.id);
  const doneTasks = tasks.filter((t) => t.completed).length;

  const addTask = () => {
    const trimmed = newTask.trim();
    if (trimmed.length === 0) return;
    const existingIds = new Set(allTasks.map((t) => t.id));
    const position =
      tasks.reduce((max, t) => Math.max(max, t.position), -1) + 1;
    addSubTask.mutate(
      {
        id: uniqueSlug(`${milestone.id}-${trimmed}`, existingIds),
        milestone_id: milestone.id,
        title: trimmed,
        position,
      },
      { onSuccess: () => setNewTask("") },
    );
  };

  const saveTaskTitle = () => {
    const trimmed = editTaskTitle.trim();
    if (editTaskId === null || trimmed.length === 0) {
      setEditTaskId(null);
      return;
    }
    renameSubTask.mutate(
      { id: editTaskId, title: trimmed },
      { onSuccess: () => setEditTaskId(null) },
    );
  };

  const completed = status === "completed";
  const canComplete = isAdmin && (completed || status === "available");
  const badge = status === "locked" ? "🔒" : completed ? "♛" : undefined;

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
    <aside
      className="flex h-full flex-col overflow-y-auto p-5 text-left"
      style={{
        background:
          "radial-gradient(130% 100% at 50% 0%, #150f0a 0%, #0a0705 70%)",
        boxShadow: "inset 1px 0 0 rgba(160,120,50,.25)",
        color: FANTASY.goldText,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {!editing && (
            <Medallion
              metal={STATUS_METAL[status]}
              size={34}
              badge={badge}
              dim={status === "locked"}
              pulse={status === "available"}
            >
              ✦
            </Medallion>
          )}
          <div className="min-w-0">
            <p
              className={SECTION_LABEL}
              style={{ color: FANTASY.eyebrow }}
            >
              {editing ? "Edit" : "Milestone"}
            </p>
            <h2
              className="font-serif text-lg font-semibold leading-tight"
              style={{
                color: FANTASY.goldText,
                textShadow: "0 1px 2px rgba(0,0,0,.6)",
              }}
            >
              {editing ? "Edit milestone" : milestone.title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 transition-colors"
          style={{ color: FANTASY.goldDim }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className={FIELD_LABEL} style={{ color: FANTASY.goldDim }}>
              Title
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INPUT}
              style={{ color: FANTASY.goldText }}
            />
          </label>

          <label className="block">
            <span className={FIELD_LABEL} style={{ color: FANTASY.goldDim }}>
              XP
            </span>
            <input
              type="number"
              min={0}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value) || 0)}
              className={INPUT}
              style={{ color: FANTASY.goldText }}
            />
          </label>

          <label className="block">
            <span className={FIELD_LABEL} style={{ color: FANTASY.goldDim }}>
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={INPUT}
              style={{ color: FANTASY.goldText }}
            />
          </label>

          {prereqChoices.length > 0 && (
            <div>
              <span className={FIELD_LABEL} style={{ color: FANTASY.goldDim }}>
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
                        className="size-4"
                        style={{ accentColor: "#d99f36" }}
                      />
                      <span
                        className="font-serif text-sm"
                        style={{ color: FANTASY.goldText }}
                      >
                        {m.title}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {updateMilestone.isError && (
            <p className="font-mono text-xs text-destructive">
              {updateMilestone.error?.message ?? "Failed to save"}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={title.trim().length === 0 || updateMilestone.isPending}
              onClick={saveEdit}
              className={GOLD_BTN}
              style={{ color: FANTASY.goldText }}
            >
              {updateMilestone.isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={IRON_BTN}
              style={{ color: FANTASY.goldDim }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{
                color:
                  status === "available"
                    ? FANTASY.emberText
                    : FANTASY.goldDim,
              }}
            >
              {STATUS_LABEL[status]}
            </span>
            <span
              className="font-mono text-xs"
              style={{ color: FANTASY.goldDim }}
            >
              +{milestone.xp} XP
            </span>
          </div>

          {milestone.description && (
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: FANTASY.goldDim }}
            >
              {milestone.description}
            </p>
          )}

          {(tasks.length > 0 || isAdmin) && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className={SECTION_LABEL} style={{ color: FANTASY.eyebrow }}>
                  Sub-tasks
                </h3>
                {tasks.length > 0 && (
                  <span
                    className="font-mono text-xs"
                    style={{ color: FANTASY.goldDim }}
                  >
                    {doneTasks}/{tasks.length}
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    {editTaskId === t.id ? (
                      <>
                        <input
                          type="text"
                          autoFocus
                          value={editTaskTitle}
                          onChange={(e) => setEditTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTaskTitle();
                            if (e.key === "Escape") setEditTaskId(null);
                          }}
                          className={`${INPUT} mt-0 flex-1`}
                          style={{ color: FANTASY.goldText }}
                        />
                        <button
                          type="button"
                          onClick={saveTaskTitle}
                          className="shrink-0 font-mono text-xs"
                          style={{ color: FANTASY.goldLink }}
                          aria-label="Save"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTaskId(null)}
                          className="shrink-0 font-mono text-xs"
                          style={{ color: FANTASY.goldDim }}
                          aria-label="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <label className="flex flex-1 cursor-pointer items-center gap-3">
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
                            className="size-4"
                            style={{ accentColor: "#d99f36" }}
                          />
                          <span
                            className="text-sm"
                            style={{
                              color: t.completed
                                ? FANTASY.goldFaint
                                : FANTASY.goldText,
                              textDecoration: t.completed
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {t.title}
                          </span>
                        </label>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditTaskId(t.id);
                                setEditTaskTitle(t.title);
                              }}
                              className="shrink-0 text-xs opacity-70 transition-opacity hover:opacity-100"
                              style={{ color: FANTASY.goldDim }}
                              aria-label="Edit sub-task"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              disabled={deleteSubTask.isPending}
                              onClick={() => deleteSubTask.mutate(t.id)}
                              className="shrink-0 text-xs text-destructive opacity-70 transition-opacity hover:opacity-100"
                              aria-label="Delete sub-task"
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {isAdmin && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newTask}
                    placeholder="New sub-task…"
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTask();
                    }}
                    className={`${INPUT} mt-0 flex-1`}
                    style={{ color: FANTASY.goldText }}
                  />
                  <button
                    type="button"
                    disabled={newTask.trim().length === 0 || addSubTask.isPending}
                    onClick={addTask}
                    className={EMBER_BTN}
                    style={{ color: FANTASY.emberText }}
                  >
                    ＋ Add
                  </button>
                </div>
              )}

              {(addSubTask.isError || renameSubTask.isError) && (
                <p className="mt-2 font-mono text-xs text-destructive">
                  {addSubTask.error?.message ??
                    renameSubTask.error?.message ??
                    "Failed to save sub-task"}
                </p>
              )}
            </div>
          )}

          {milestone.resources.length > 0 && (
            <div className="mt-6">
              <h3 className={SECTION_LABEL} style={{ color: FANTASY.eyebrow }}>
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
                        className="text-sm hover:underline"
                        style={{ color: FANTASY.goldLink }}
                      >
                        {r.label} ↗
                      </a>
                    ) : (
                      <span
                        className="text-sm"
                        style={{ color: FANTASY.goldDim }}
                      >
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
                className={`w-full ${GOLD_BTN}`}
                style={{ color: FANTASY.goldText }}
              >
                {completed ? "Mark incomplete" : "Complete milestone"}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className={`flex-1 ${EMBER_BTN}`}
                  style={{ color: FANTASY.emberText }}
                >
                  Edit
                </button>
                {confirmDelete ? (
                  <button
                    type="button"
                    disabled={deleteMilestone.isPending}
                    onClick={remove}
                    className={`flex-1 ${DANGER_BTN}`}
                  >
                    {deleteMilestone.isPending ? "Deleting…" : "Confirm delete"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className={`flex-1 ${DANGER_BTN}`}
                  >
                    Delete
                  </button>
                )}
              </div>

              {deleteMilestone.isError && (
                <p className="font-mono text-xs text-destructive">
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

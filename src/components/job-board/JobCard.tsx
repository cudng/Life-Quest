// One job application card inside a kanban column. Read view shows company,
// role, applied date, an optional link and notes. For admins it adds a status
// dropdown (move between columns), Edit (lifts to the parent form via onEdit)
// and a 2-step Delete — mirroring SkillDetail's admin controls. Moving an
// application to "interview"/"offer" can unlock achievements (evaluated by the
// page's useAchievementSync). Visitors see everything read-only.

import { memo, useState } from "react";
import type { JobApplication, JobStatus } from "@/data/types";
import {
  useUpdateJobApplication,
  useDeleteJobApplication,
} from "@/data/mutations";
import { useIsAdmin } from "@/auth/useIsAdmin";

const STATUS_OPTIONS: JobStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
];

const STATUS_LABEL: Record<JobStatus, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

interface JobCardProps {
  app: JobApplication;
  onEdit: (app: JobApplication) => void;
}

function JobCardBase({ app, onEdit }: JobCardProps) {
  const updateApp = useUpdateJobApplication();
  const deleteApp = useDeleteJobApplication();
  const isAdmin = useIsAdmin();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const move = (status: JobStatus) =>
    updateApp.mutate({ id: app.id, patch: { status } });

  const remove = () => deleteApp.mutate(app.id);

  return (
    <div className="rounded-lg border bg-card p-3 text-left text-card-foreground">
      <div className="font-medium text-foreground">{app.company}</div>
      <div className="text-sm text-muted-foreground">{app.role}</div>

      <div className="mt-2 text-xs text-muted-foreground">
        Applied {app.applied_at}
      </div>

      {app.url && (
        <a
          href={app.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block text-xs text-[var(--accent)] hover:underline"
        >
          Posting ↗
        </a>
      )}

      {app.notes && (
        <p className="mt-2 text-xs text-muted-foreground">{app.notes}</p>
      )}

      {isAdmin && (
        <div className="mt-3 space-y-2">
          <select
            value={app.status}
            disabled={updateApp.isPending}
            onChange={(e) => move(e.target.value as JobStatus)}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs disabled:opacity-50"
            aria-label="Status"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(app)}
              className="flex-1 rounded-md border px-2 py-1 text-xs text-foreground hover:bg-secondary"
            >
              Edit
            </button>
            {confirmDelete ? (
              <button
                type="button"
                disabled={deleteApp.isPending}
                onClick={remove}
                className="flex-1 rounded-md bg-destructive px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                Confirm delete
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex-1 rounded-md border border-destructive px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            )}
          </div>

          {(updateApp.isError || deleteApp.isError) && (
            <p className="text-xs text-destructive">
              {updateApp.error?.message ??
                deleteApp.error?.message ??
                "Action failed"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export const JobCard = memo(JobCardBase);

// Admin form to add or edit a job application. company + role required; url and
// notes optional; status and applied date default sensibly. Reused for both
// modes: pass `app` to edit (the parent remounts via key=app.id so fields seed
// from props without a reset effect), omit it to add a new one. Adding an app or
// setting it to interview/offer can unlock achievements (page-level sync).

import { useState } from "react";
import type { JobApplication, JobStatus } from "@/data/types";
import {
  useAddJobApplication,
  useUpdateJobApplication,
} from "@/data/mutations";
import { localToday } from "@/lib/date";

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

interface JobFormProps {
  /** Present = edit that application; absent = add a new one. */
  app?: JobApplication;
  onClose: () => void;
}

export function JobForm({ app, onClose }: JobFormProps) {
  const add = useAddJobApplication();
  const update = useUpdateJobApplication();

  const [company, setCompany] = useState(app?.company ?? "");
  const [role, setRole] = useState(app?.role ?? "");
  const [url, setUrl] = useState(app?.url ?? "");
  const [status, setStatus] = useState<JobStatus>(app?.status ?? "applied");
  const [appliedAt, setAppliedAt] = useState(app?.applied_at ?? localToday());
  const [notes, setNotes] = useState(app?.notes ?? "");

  const pending = add.isPending || update.isPending;
  const canSubmit =
    company.trim().length > 0 && role.trim().length > 0 && !pending;

  const submit = () => {
    if (!canSubmit) return;
    const fields = {
      company: company.trim(),
      role: role.trim(),
      url: url.trim() || null,
      status,
      applied_at: appliedAt,
      notes: notes.trim() || null,
    };

    if (app) {
      update.mutate(
        { id: app.id, patch: fields },
        { onSuccess: onClose },
      );
    } else {
      add.mutate(fields, { onSuccess: onClose });
    }
  };

  const error = app ? update.error : add.error;

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l bg-card p-6 text-left text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {app ? "Edit application" : "Add application"}
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

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Company</span>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Role</span>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Posting URL (optional)
          </span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Applied date
          </span>
          <input
            type="date"
            value={appliedAt}
            onChange={(e) => setAppliedAt(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        {error && (
          <p className="text-sm text-destructive">
            {error.message ?? "Failed to save"}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {app ? "Save" : "Add application"}
        </button>
      </div>
    </aside>
  );
}

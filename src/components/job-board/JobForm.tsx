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
  useDeleteJobApplication,
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
  const del = useDeleteJobApplication();

  const [confirmDelete, setConfirmDelete] = useState(false);
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

  const remove = () => {
    if (!app) return;
    del.mutate(app.id, { onSuccess: onClose });
  };

  const error = app ? update.error ?? del.error : add.error;

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-[#a07832]/25 bg-[#0d0a07] p-6 text-left text-[#e8d4a8]">
      <div className="flex items-start justify-between gap-3">
        <h2
          className="font-serif text-lg font-semibold text-[#e8d4a8]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
        >
          {app ? "Edit application" : "Add application"}
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
            Company
          </span>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Role
          </span>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Posting URL (optional)
          </span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Applied date
          </span>
          <input
            type="date"
            value={appliedAt}
            onChange={(e) => setAppliedAt(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        {error && (
          <p className="text-sm text-destructive">
            {error.message ?? "Failed to save"}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="flex-1 rounded-md border border-[#db5f10]/50 bg-gradient-to-b from-[#241a0e] to-[#140d06] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#f0b85e] transition-colors hover:border-[#db5f10]/80 disabled:opacity-50"
          >
            {app ? "Save" : "Add application"}
          </button>

          {app &&
            (confirmDelete ? (
              <button
                type="button"
                disabled={del.isPending}
                onClick={remove}
                className="flex-1 rounded-md border border-destructive/60 bg-gradient-to-b from-[#2a1010] to-[#160808] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-destructive transition-colors hover:border-destructive disabled:opacity-50"
              >
                {del.isPending ? "Deleting…" : "Confirm"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex-1 rounded-md border border-destructive/40 bg-gradient-to-b from-[#1b1712] to-[#100c08] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-destructive transition-colors hover:border-destructive/70"
              >
                Delete
              </button>
            ))}
        </div>
      </div>
    </aside>
  );
}

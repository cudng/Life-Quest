// One job application card inside a kanban column. Read view shows company,
// role, applied date, an optional link and notes. For admins it adds a single
// ✎ edit icon that lifts the application to the parent form (onEdit); status
// changes and delete live inside that edit panel. The column already conveys
// the status, so no per-card status control is shown. Visitors see everything
// read-only.

import { memo } from "react";
import type { JobApplication } from "@/data/types";
import { useIsAdmin } from "@/auth/useIsAdmin";

interface JobCardProps {
  app: JobApplication;
  onEdit: (app: JobApplication) => void;
}

function JobCardBase({ app, onEdit }: JobCardProps) {
  const isAdmin = useIsAdmin();

  return (
    <div className="rounded-lg border border-[#a07832]/25 bg-gradient-to-b from-[#161009] to-[#0d0a07] p-3 text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-serif font-medium text-[#e8d4a8]">
            {app.company}
          </div>
          <div className="text-sm text-[#9a7c48]">{app.role}</div>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onEdit(app)}
            aria-label="Edit application"
            className="shrink-0 text-sm text-[#9a7c48] transition-colors hover:text-[#f0b85e]"
          >
            ✎
          </button>
        )}
      </div>

      <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#9a7c48]">
        Applied {app.applied_at}
      </div>

      {app.url && (
        <a
          href={app.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block text-xs text-[#d9a341] hover:underline"
        >
          Posting ↗
        </a>
      )}

      {app.notes && <p className="mt-2 text-xs text-[#9a7c48]">{app.notes}</p>}
    </div>
  );
}

export const JobCard = memo(JobCardBase);

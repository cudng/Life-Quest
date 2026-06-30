// Home teaser previews: compact summaries of the roadmap and skill tree, each
// linking into its full page. Reads the same fetched content as the rest of
// Home and derives a one-line status from the snapshot.

import { Link } from "@tanstack/react-router";
import type { ProgressSnapshot } from "@/engine/progress";
import { useMilestones, useSkills } from "@/data/queries";
import { getAvailableNodes } from "@/engine/graph";

interface TeasersProps {
  snapshot: ProgressSnapshot;
}

export function Teasers({ snapshot }: TeasersProps) {
  const milestones = useMilestones();
  const skills = useSkills();

  const allMilestones = milestones.data ?? [];
  const completedSet = new Set(snapshot.completedNodeIds);
  const doneCount = allMilestones.filter((m) => completedSet.has(m.id)).length;
  const nextMilestone = getAvailableNodes(allMilestones, completedSet)[0];

  const allSkills = skills.data ?? [];
  const masteryValues = Object.values(snapshot.skillMastery);
  const proficientPlus = masteryValues.filter(
    (m) => m === "proficient" || m === "expert",
  ).length;
  const learning = masteryValues.filter((m) => m === "learning").length;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Link
        to="/roadmap"
        className="group rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:border-[var(--accent-border)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Roadmap</h2>
          <span className="text-sm text-muted-foreground group-hover:text-foreground">
            Open →
          </span>
        </div>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {doneCount}/{allMilestones.length}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            milestones done
          </span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {nextMilestone ? `Next up: ${nextMilestone.title}` : "All caught up 🎉"}
        </p>
      </Link>

      <Link
        to="/skill-tree"
        className="group rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:border-[var(--accent-border)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Skill Tree</h2>
          <span className="text-sm text-muted-foreground group-hover:text-foreground">
            Open →
          </span>
        </div>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {proficientPlus}/{allSkills.length}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            proficient+
          </span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {learning > 0 ? `${learning} in progress` : "Pick a skill to learn"}
        </p>
      </Link>
    </div>
  );
}

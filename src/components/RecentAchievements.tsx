// Recent achievements teaser for Home. Joins the unlocked rows (for their
// timestamps) against the in-code ACHIEVEMENTS definitions, shows the most
// recently earned badges, and links to the full wall.

import { Link } from "@tanstack/react-router";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useAchievementsUnlocked } from "@/data/queries";

const RECENT_LIMIT = 4;

const DEF_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export function RecentAchievements() {
  const unlocked = useAchievementsUnlocked();
  const rows = unlocked.data ?? [];

  const recent = [...rows]
    .sort((a, b) => b.unlocked_at.localeCompare(a.unlocked_at))
    .map((r) => DEF_BY_ID.get(r.id))
    .filter((a): a is (typeof ACHIEVEMENTS)[number] => a !== undefined)
    .slice(0, RECENT_LIMIT);

  return (
    <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
        <Link
          to="/achievements"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {rows.length}/{ACHIEVEMENTS.length} earned →
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No badges yet — complete a milestone or build a streak to earn your first.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {recent.map((a) => (
            <li
              key={a.id}
              className="flex flex-col items-center gap-1 rounded-lg border bg-secondary/40 p-3 text-center"
              title={a.description}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-sm font-medium text-foreground">
                {a.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

# Home Page

The gamified character-sheet dashboard at the `/` route.

- **Route:** `src/routes/index.tsx` (component `Index`)
- **Components:** `src/components/home/`
- **Design source:** `prototype/Life Quest Home.html`

## Data

`index.tsx` calls `useProgress()` (aggregated `ProgressSnapshot`) and `useIsAdmin()`.
It renders a loading/error state until the snapshot is ready. Individual sections
fetch their own cached queries as needed.

Required DB migrations: `src/supabase/migrations/002_home_attributes.sql`
(adds the `attributes` table plus `profile.role` and `profile.longest_streak`) and
`003_profile_display_name.sql` (adds `profile.display_name`).

## Layout

Centered `max-w-[1180px]` column (`gap-3.5`):

1. **Admin toolbar** — admins only; right-aligned `CharacterAdminDialog` trigger.
2. **HudBanner** — full width.
3. **Grid `1fr / 340px`** (single column below `lg`):
   - Left: `ActiveQuestline`, `SkillTreeSummary`
   - Right rail: `QuestLog`, `StreakCard`, `AttributesCard`
4. **AchievementsCarousel** — full width.

## Sections

| Component | Data source | What it shows |
|---|---|---|
| `HudBanner` | `snapshot` + `useSession` | Level medallion, name/role, hero XP bar (shimmer), MILESTONES / BADGES chips |
| `ActiveQuestline` | `useTracks` / `useStages` / `useMilestones` | Track tabs, stage node map (done/active/locked), % complete, current objective |
| `SkillTreeSummary` | `useSkills` | Root skills + children colored by mastery, unlocked / learning counts |
| `QuestLog` | `useDailyQuests` + `snapshot` | Today's daily quests with diamond checkboxes (admin toggles) |
| `StreakCard` | `snapshot` | Streak count, longest, 7-day activity dots, admin check-in |
| `AttributesCard` | `useAttributes` | Character stat bars (value 0–100) |
| `AchievementsCarousel` | `ACHIEVEMENTS` + `useAchievementsUnlocked` | Marquee of earned / locked badges |
| `CharacterAdminDialog` | profile + attributes mutations | Admin editing of role, longest streak, and attribute CRUD |

## Theming

Everything uses the `--q-*` design tokens (dark = prototype values, light = designed
variant), so Home flips with the global dark/light/auto switch in the nav (`__root.tsx`).
Custom animations (`dq-shimmer`, `dq-pulse`, `dq-marquee`) and helpers live in `src/index.css`.

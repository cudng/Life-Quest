# Life Quest — Gamified Career Roadmap

A personal RPG-style career and life tracker. Level up through real milestones, build a tech skill tree, complete daily quests, track job applications, and earn achievements.

## Stack

- **React + Vite + TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **TanStack Router + TanStack Query**
- **Supabase** (Postgres + Auth + RLS)
- **React Flow** (@xyflow/react)
- **Framer Motion** + **canvas-confetti**

## Features

- **Life Roadmap** — multi-track quest path (Career, Education, …) with stages, milestones, and sub-task checklists
- **Tech Skill Tree** — talent tree of technologies with mastery levels (Learning → Proficient → Expert)
- **Daily Quests + Streak** — repeatable tasks that reset daily and build a streak
- **Job Board** — application tracker with status pipeline (applied → screening → interview → offer)
- **Achievements** — badge wall with XP rewards for hitting milestones

## Development

```bash
npm install
npm run dev
```

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
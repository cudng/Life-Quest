# Project Notes

## Dark-fantasy UI (progression surfaces)

Style used for every "progression map" in the app (Home skill tree, roadmap
questline, and any future tree). Goal: MMORPG dark-fantasy talent tree
(Diablo / Path of Exile / WoW-talent), **not** generic web pills. Reuse the
shared primitives so the whole game UI stays one coherent style.

### Source of truth
`src/components/ui/talent.tsx` — do not re-implement these per screen:
- `Medallion` — forged metal node (beveled rim + recessed rune socket).
- `Conduit` — engraved channel between nodes; glows gold when the path is allocated.
- `Pips` — row of gem diamonds for ranks / child mastery.
- `TalentSlab` — recessed obsidian slab with gold corner brackets (the board nodes sit on).
- `METAL`, `FANTASY` — palette constants (below).

### Core recipe (what makes it read as dark-fantasy)
1. **Obsidian recessed slab**, not a flat card: dark radial gradient
   (`#1b1712 → #100c08 → #0a0705`), inner shadow, faint gold hairline
   (`rgba(160,120,50,.16)`), gold `L`-shaped corner brackets.
2. **Beveled metal medallions**: circular, `inset` top highlight
   (`rgba(255,244,214,.55)`) + bottom shade (`rgba(0,0,0,.55)`), recessed
   socket (`radial-gradient(#241a0e,#0c0803)`) holding an emoji/glyph rune.
3. **Four metals signal state** (this is the progression language):
   | Metal | Meaning | Use for |
   |-------|---------|---------|
   | `gold` | mastered / completed — the reward state | skill `expert`, stage `done` |
   | `bronze` | proficient / partial | skill `proficient` |
   | `ember` | in progress / active (pair with `pulse`) | skill `learning`, stage `active` |
   | `iron` | locked (pair with `dim`) | skill/stage `locked` |
4. **Allocated paths glow gold**, unallocated stay dark iron dashes.
5. **Gold-on-black is the reward signal.** Ember/orange = energy/in-progress.
6. **Locked = desaturated** (`grayscale(1) opacity .5`) + 🔒 corner sigil.
   **Mastered = crowned** (`♛` gold corner sigil).

### Palette (hex — the slab is always dark, theme-independent)
- Gold rim: `linear-gradient(150deg,#ffe7a6,#d99f36,#8a5c17)`
- Bronze rim: `linear-gradient(150deg,#cd9a52,#8a5c22,#533713)`
- Ember rim: `linear-gradient(150deg,#f8b45a,#db5f10,#7c2f07)`
- Iron rim: `linear-gradient(150deg,#4c4c55,#2a2a30,#17171b)`
- Text: gold `#e8d4a8`, gold-link `#d9a341`, gold-dim `#9a7c48`,
  gold-faint `#7a6440`, ember `#f0b85e`, eyebrow `#c9922f`
- (Achievement rarity tiers live separately in `src/lib/rarity.ts`:
  bone → spectral blue → blood violet → ember/gold. Same dark-fantasy family.)

### Typography
- Section eyebrow: `font-mono`, `tracking-[0.18em]`, gold `#c9922f`, uppercase.
- Titles / node names: `font-serif`, gold text, `text-shadow 0 1px 2px rgba(0,0,0,.6)`.
- Numbers / XP / counters: `font-mono`, gold-dim.

### Motion
- Active/learning nodes breathe via `animate-[pulse_2.4s_ease-in-out_infinite]`.
- Always guard with `motion-reduce:animate-none`.

### Rules of thumb
- Home tree/roadmap cards are **preview only** — show a small slice (e.g. first
  3 root skills / one active track) and link out to the full page.
- New progression screens: compose `TalentSlab` + `Medallion` + `Conduit` +
  `Pips`. If you need a new state, add a metal to `METAL`, don't inline colors.

## SKILLS TREE

Rules distilled from how the most-played RPGs/MMORPGs build talent/skill trees
(Path of Exile, Diablo 2/3/4, WoW, Assassin's Creed). Apply these when
designing the Life Quest skill tree — the tree models real-life skills, so
"nodes" are learning milestones, not combat spells, but the design language is
the same.

### 1. Every node is a meaningful choice
- A node should **commit** the player to a direction (a specialization),
  not just nudge a number. The whole point of a tree over a flat list is the
  choice *between* branches you cannot all take at once.
- Rule of thumb: aim for **70%+ of nodes to be "meaningful"** (unlock or
  reshape a capability), not filler `+5%` stat bumps. AC Origins hit 76%.
- Good nodes carry a **verb**: *unlock, chain, convert, revive, automate*.
  A node you describe with a verb is doing something; a node described with a
  number is filler.

### 2. Don't gate core mechanics behind the tree
- The tree **enhances and specializes** systems the player already has; it does
  **not** hand out the basic ability to play. Never lock a fundamental action
  behind a skill point.
- For Life Quest: a skill's *existence* shouldn't require a node — nodes deepen
  mastery (proficient → expert), open sub-tracks, or grant perks.

### 3. Structure: shared trunk, branching specializations
- Two proven shapes:
  - **Separate trees per class/domain** (WoW): each domain (e.g. Backend,
    Design, Fitness) has its own branch.
  - **One giant shared tree, different entry points** (Path of Exile): every
    character walks the same map but starts in a different spot.
- Life Quest fits a **shared-trunk model**: common root skills, then branches
  fork into domains and deepen. Use **branch points** as the strategic
  decisions and **linear runs** between them for smooth early pacing.

### 4. Gate with prerequisites, keep the tree non-completable
- Nodes unlock when their **parent/prerequisite** is allocated — this is what
  makes conduits/paths mean something. Deeper = stronger, so the payoff nodes
  sit behind investment.
- The tree should **not be fully completable** in one run. Scarcity of points
  is what forces identity. (If everything is reachable, there's no build.)
- Put a few **capstone / keystone** nodes deep in each branch as aspirational
  goals ("crowned" gold state in our `METAL` language).

### 5. Pacing — avoid choice paralysis
- Size the tree so early players aren't overwhelmed: a **linear opening**, then
  branches. Depth for veterans, clarity for newcomers.
- Introduce complexity progressively; don't expose the full 100-node map on
  first login. (Home tree is preview-only per the dark-fantasy rules above —
  show a slice, link to the full page.)

### 6. Respec: allowed, but costly
- **Allow full respec** so a mistake isn't permanent — but at a **high cost**
  (rare currency / cooldown), never free. Cheap respec deletes the weight of
  every choice; players just reset before each task.
- PoE gates it behind rare drops; Torchlight locks in past a level. Pick a
  friction that keeps choices consequential.

### 7. Visual language (reuse the dark-fantasy primitives)
- Group related nodes with shared **icon family / color** so patterns read at a
  glance. State is communicated by **metal** (see the four-metal table above):
  gold = mastered, bronze = proficient, ember = in progress, iron = locked.
- Allocated paths **glow gold**; unallocated stay dark iron dashes. Locked =
  desaturated + 🔒; capstone/mastered = crowned ♛.

### One-line checklist before adding a node
Meaningful choice? · Has a verb (not just a number)? · Doesn't gate a core
mechanic? · Sits behind a clear prerequisite? · Keeps the tree non-completable?
· Respec stays costly? · State readable via metal + conduit glow?

Sources: [GDKeys — Keys to Meaningful Skill Trees](https://gdkeys.com/keys-to-meaningful-skill-trees/),
[Envato Tuts+ — Let's Spec Into Talent Trees](https://code.tutsplus.com/lets-spec-into-talent-trees-a-primer-for-game-designers--gamedev-6691a),
[TheGamer — What Goes Into Crafting Good Skill Trees](https://www.thegamer.com/good-skill-trees-rpgs/),
[Designing an MMORPG Skill Tree (Medium)](https://krisnamughni24.medium.com/designing-an-mmorpg-skill-tree-eae66047baa3).

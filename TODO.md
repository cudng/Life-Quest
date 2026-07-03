More gaming feeling

Left to do:

1. Random loot drop on milestone completion (cosmetic: banner themes, avatar frames) —
   needs migration 007 (owned/equipped cosmetics).
2. Weekly "boss quest" — one big challenge with a big XP payout and its own card —
   needs migration 008 (boss_quests table).

Done (this pass):

- Floating "+XP" flying from quest row into the HUD XP bar.
- Perfect-day bonus: +50 XP per day with all dailies done, ember confetti + "DAILY CLEAR!".
- Titles per level (Novice → Apprentice → Adept → Expert → Master → Grandmaster).
- Achievement rarity tiers (common/rare/epic/legendary) with dark-fantasy glows.
- XP bar near-level state (≥90%: medallion pulses, bar glows harder, shimmer speeds up).
- Streak flame scales with length (7+ bigger, 30+ blue); streak-freeze tokens (migration 005).
- Dark-fantasy sound effects (quest tick, level-up fanfare) with mute toggle in navbar.
- Avatar/portrait in HUD that evolves with level tier.
- Daily login reward calendar, 7-day cycle, day 7 = chest (migration 006).
- Segmented/notched XP bar.
- Attribute gains animate (+1 floats over stat bar) via quest→attribute link (migration 004).
- Home layout rework: HUD = user info (identity, XP, attributes); right sidebar =
  streak / login rewards / scrollable quest log; account dropdown in navbar.

Project overall

1. Skeletons + error boundaries app-wide.
2. Engine unit tests (level curve, streak logic).
3. PWA + offline cache (planned Step 11).
4. Notifications/reminders (daily quest nudge via PWA push).
5. Data export/backup.
6. Seasonal stats page ("July: 1,240 XP, 18 quests").

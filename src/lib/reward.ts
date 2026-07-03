// Reward feedback. A short confetti burst, fired on positive events (e.g. a
// newly unlocked achievement). Kept tiny so any view can call it.

import confetti from "canvas-confetti";

export function fireConfetti(): void {
  void confetti({
    particleCount: 120,
    spread: 75,
    startVelocity: 45,
    origin: { y: 0.7 },
    disableForReducedMotion: true,
  });
}

/** Bigger ember celebration for a perfect day: two side cannons + center burst. */
export function fireDailyClear(): void {
  const embers = ["#d97706", "#b45309", "#9a3412", "#7f1d1d", "#fbbf24"];
  void confetti({
    particleCount: 80,
    angle: 60,
    spread: 60,
    startVelocity: 55,
    origin: { x: 0, y: 0.85 },
    colors: embers,
    disableForReducedMotion: true,
  });
  void confetti({
    particleCount: 80,
    angle: 120,
    spread: 60,
    startVelocity: 55,
    origin: { x: 1, y: 0.85 },
    colors: embers,
    disableForReducedMotion: true,
  });
  void confetti({
    particleCount: 140,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: embers,
    disableForReducedMotion: true,
  });
}

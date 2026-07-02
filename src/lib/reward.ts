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

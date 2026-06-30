// Minimal ambient types for canvas-confetti (it ships no declarations and we
// avoid pulling @types). Only the options we use are declared.
declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    ticks?: number;
  }
  type ConfettiFn = (options?: ConfettiOptions) => Promise<null> | null;
  const confetti: ConfettiFn;
  export default confetti;
}

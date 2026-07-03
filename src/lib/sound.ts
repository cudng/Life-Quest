// Synthesized UI sounds (WebAudio, no asset files) + a persisted mute flag.
// The AudioContext is created lazily on first play — normally inside a click,
// which satisfies browser autoplay policies. Mute state lives in localStorage
// and is exposed store-style for useSyncExternalStore.

const MUTE_KEY = "dq-muted";

let muted = false;
try {
  muted = localStorage.getItem(MUTE_KEY) === "1";
} catch {
  /* storage unavailable — stay unmuted */
}

const listeners = new Set<() => void>();

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  try {
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    /* non-persistent mute is fine */
  }
  for (const l of listeners) l();
}

/** Subscribe to mute changes (for useSyncExternalStore). */
export function subscribeMuted(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

/** One enveloped oscillator note, optionally bending down to `bendTo`. */
function note(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  peak: number,
  bendTo?: number,
): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (bendTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(bendTo, start + duration);
  }
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** Low, muted pluck for ticking off a quest — a dull thud, not an arcade blip. */
export function playTick(): void {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;
  note(ac, 196, t, 0.16, "triangle", 0.18, 131); // G3 falling to C3
  note(ac, 98, t, 0.18, "sine", 0.12); // sub thump underneath
}

/** Solemn D-minor horn fanfare (drone + slow arpeggio) for big moments. */
export function playFanfare(): void {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;
  note(ac, 146.83, t, 1.3, "triangle", 0.09); // D3 drone underneath
  note(ac, 73.42, t, 1.3, "sine", 0.08); // D2 sub
  const seq = [293.66, 349.23, 440, 587.33]; // D4 F4 A4 D5 (minor)
  seq.forEach((freq, i) => {
    note(
      ac,
      freq,
      t + i * 0.18,
      i === seq.length - 1 ? 0.85 : 0.24,
      "triangle",
      0.11,
    );
  });
}

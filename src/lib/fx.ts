// Floating "+XP" fly-to-bar effect. Imperative DOM helper: spawns a fixed
// element at the source rect, flies it into the HUD XP bar, then removes it.
// No-ops when the bar isn't mounted or the user prefers reduced motion (the
// global CSS media query can't freeze WAAPI animations, so check here).

export const XP_BAR_ANCHOR_ID = "hud-xp-bar";

export function flyXp(label: string, from: DOMRect): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById(XP_BAR_ANCHOR_ID);
  if (!target) return;
  const to = target.getBoundingClientRect();

  const el = document.createElement("span");
  el.textContent = label;
  el.className = "dq-fly-xp";
  el.style.left = `${from.left + from.width / 2}px`;
  el.style.top = `${from.top + from.height / 2}px`;
  document.body.appendChild(el);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const anim = el.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      {
        transform: "translate(-50%, calc(-50% - 16px)) scale(1.15)",
        opacity: 1,
        offset: 0.25,
      },
      {
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.5)`,
        opacity: 0.15,
      },
    ],
    { duration: 850, easing: "cubic-bezier(0.5, -0.15, 0.2, 1)" },
  );
  anim.onfinish = () => {
    el.remove();
    // Arrival flash on the bar itself.
    target.animate(
      [
        { filter: "brightness(1)" },
        { filter: "brightness(1.4)" },
        { filter: "brightness(1)" },
      ],
      { duration: 280, easing: "ease-out" },
    );
  };
}

/**
 * Big centered announcement (e.g. "DAILY CLEAR!") that scales in, holds, and
 * fades. Under reduced motion it appears statically for a moment instead.
 */
export function announce(text: string): void {
  const el = document.createElement("div");
  el.textContent = text;
  el.className = "dq-announce";
  document.body.appendChild(el);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTimeout(() => el.remove(), 1600);
    return;
  }
  const anim = el.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.6)", opacity: 0 },
      {
        transform: "translate(-50%, -50%) scale(1.08)",
        opacity: 1,
        offset: 0.18,
      },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.3 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.75 },
      { transform: "translate(-50%, -50%) scale(1.15)", opacity: 0 },
    ],
    { duration: 1800, easing: "ease-out" },
  );
  anim.onfinish = () => el.remove();
}

/**
 * Float a gain label (e.g. "+1 FOCUS") up from an attribute row in the
 * AttributesCard, found via its data-attr-anchor attribute. No-ops when the
 * card isn't mounted or the user prefers reduced motion.
 */
export function floatOverAttribute(attributeId: string, label: string): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const anchor = document.querySelector(
    `[data-attr-anchor="${CSS.escape(attributeId)}"]`,
  );
  if (!(anchor instanceof HTMLElement)) return;
  const to = anchor.getBoundingClientRect();

  const el = document.createElement("span");
  el.textContent = label;
  el.className = "dq-fly-xp";
  el.style.left = `${to.right}px`;
  el.style.top = `${to.top + to.height / 2}px`;
  document.body.appendChild(el);

  const anim = el.animate(
    [
      { transform: "translate(-100%, -50%) scale(0.8)", opacity: 0 },
      {
        transform: "translate(-100%, calc(-50% - 10px)) scale(1)",
        opacity: 1,
        offset: 0.3,
      },
      { transform: "translate(-100%, calc(-50% - 28px)) scale(1)", opacity: 0 },
    ],
    { duration: 1000, easing: "ease-out" },
  );
  anim.onfinish = () => el.remove();
}

// Slug helpers for content ids. Content tables (tracks/stages/milestones) use
// text primary keys with no auto-generation, so the admin forms derive an id
// from the title and make it unique against the ids already loaded.

/** Lowercase, hyphenate, strip non-alphanumerics. Empty input → "item". */
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

/** slugify(base), then append -2, -3, … until it's not in `existing`. */
export function uniqueSlug(base: string, existing: ReadonlySet<string>): string {
  const slug = slugify(base);
  if (!existing.has(slug)) return slug;
  let n = 2;
  while (existing.has(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}

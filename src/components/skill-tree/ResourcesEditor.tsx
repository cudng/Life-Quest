// Editable list of { label, url } resource links. Controlled: the parent owns
// the array and trims empty rows on submit. Used by the skill add/edit forms.

import type { Resource } from "@/data/types";

interface ResourcesEditorProps {
  value: Resource[];
  onChange: (next: Resource[]) => void;
}

/**
 * Normalize for persistence: trim, drop fully-blank rows, omit an empty url
 * (label-only resource, e.g. a book), and fall back to the url as the label.
 */
export function cleanResources(rows: Resource[]): Resource[] {
  return rows
    .map((r) => {
      const label = r.label.trim();
      const url = (r.url ?? "").trim();
      return url ? { label: label || url, url } : { label };
    })
    .filter((r) => r.label !== "");
}

export function ResourcesEditor({ value, onChange }: ResourcesEditorProps) {
  const update = (i: number, patch: Partial<Resource>) =>
    onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const add = () => onChange([...value, { label: "", url: "" }]);

  return (
    <div>
      <span className="text-sm font-medium text-foreground">Resources</span>
      <ul className="mt-2 space-y-2">
        {value.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={r.label}
              placeholder="Label"
              onChange={(e) => update(i, { label: e.target.value })}
              className="w-1/3 rounded-md border bg-background px-2 py-1 text-sm"
            />
            <input
              type="url"
              value={r.url ?? ""}
              placeholder="https://… (optional)"
              onChange={(e) => update(i, { url: e.target.value })}
              className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove resource"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={add}
        className="mt-2 rounded-md border px-3 py-1 text-sm text-foreground hover:bg-secondary"
      >
        ＋ Resource
      </button>
    </div>
  );
}

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
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
        Resources
      </span>
      <ul className="mt-2 space-y-2">
        {value.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={r.label}
              placeholder="Label"
              onChange={(e) => update(i, { label: e.target.value })}
              className="w-1/3 rounded-md border border-[#a07832]/35 bg-[#100c08] px-2 py-1 text-sm text-[#e8d4a8] outline-none transition-colors placeholder:text-[#7a6440] focus:border-[#db5f10]/60"
            />
            <input
              type="url"
              value={r.url ?? ""}
              placeholder="https://… (optional)"
              onChange={(e) => update(i, { url: e.target.value })}
              className="min-w-0 flex-1 rounded-md border border-[#a07832]/35 bg-[#100c08] px-2 py-1 text-sm text-[#e8d4a8] outline-none transition-colors placeholder:text-[#7a6440] focus:border-[#db5f10]/60"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[#9a7c48] transition-colors hover:text-destructive"
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
        className="mt-2 rounded-md border border-[#a07832]/35 bg-gradient-to-b from-[#1b1712] to-[#100c08] px-3 py-1 font-mono text-xs uppercase tracking-wider text-[#9a7c48] transition-colors hover:border-[#db5f10]/60 hover:text-[#e8d4a8]"
      >
        ＋ Resource
      </button>
    </div>
  );
}

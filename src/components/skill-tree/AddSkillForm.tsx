// Admin form to add a skill. Name required; icon/parent/description optional.
// The tree is one shared trunk (Programming), so the parent defaults to that
// trunk — a new node joins the tree by default. Picking "None" starts a
// separate trunk; picking any node nests deeper (e.g. Rust → Cargo).
// The id is a slug from the name, made unique against every existing skill id.
// New skills start locked. Position goes to the end of its sibling group.

import { useState } from "react";
import type { Resource, Skill } from "@/data/types";
import { useAddSkill } from "@/data/mutations";
import { uniqueSlug } from "@/lib/slug";
import {
  ResourcesEditor,
  cleanResources,
} from "@/components/skill-tree/ResourcesEditor";

interface AddSkillFormProps {
  /** All skills — parent choices + sibling positioning + unique slug. */
  allSkills: Skill[];
  onClose: () => void;
}

export function AddSkillForm({ allSkills, onClose }: AddSkillFormProps) {
  const add = useAddSkill();

  // Default to the single trunk (the lone root) so new nodes join the tree; if
  // there are several roots we can't guess, so fall back to None.
  const roots = allSkills.filter((s) => s.parent_id === null);
  const defaultParentId = roots.length === 1 ? roots[0].id : "";

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState(defaultParentId);
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);

  const canSubmit = name.trim().length > 0 && !add.isPending;

  const submit = () => {
    if (!canSubmit) return;
    const existingIds = new Set(allSkills.map((s) => s.id));
    const parent = parentId || null;
    const nextPosition =
      allSkills
        .filter((s) => s.parent_id === parent)
        .reduce((max, s) => Math.max(max, s.position), -1) + 1;

    add.mutate(
      {
        id: uniqueSlug(name, existingIds),
        name: name.trim(),
        icon: icon.trim(),
        parent_id: parent,
        description: description.trim() || null,
        resources: cleanResources(resources),
        position: nextPosition,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-[#a07832]/25 bg-[#0d0a07] p-6 text-left text-[#e8d4a8]">
      <div className="flex items-start justify-between gap-3">
        <h2
          className="font-serif text-lg font-semibold text-[#e8d4a8]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
        >
          Add skill
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[#9a7c48] transition-colors hover:text-[#e8d4a8]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Icon (emoji, optional)
          </span>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Parent
          </span>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          >
            <option value="">— None (new trunk) —</option>
            {allSkills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9922f]">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-md border border-[#a07832]/35 bg-[#100c08] px-3 py-1.5 text-sm text-[#e8d4a8] outline-none transition-colors focus:border-[#db5f10]/60"
          />
        </label>

        <ResourcesEditor value={resources} onChange={setResources} />

        {add.isError && (
          <p className="text-sm text-destructive">
            {add.error?.message ?? "Failed to add skill"}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-md border border-[#db5f10]/50 bg-gradient-to-b from-[#241a0e] to-[#140d06] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#f0b85e] transition-colors hover:border-[#db5f10]/80 disabled:opacity-50"
        >
          Add skill
        </button>
      </div>
    </aside>
  );
}

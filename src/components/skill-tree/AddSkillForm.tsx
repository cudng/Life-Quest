// Admin form to add a skill. Name required; icon/parent/description optional.
// A root skill (no parent) is a language; choosing a parent makes it a subskill.
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

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState("");
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
    <aside className="flex h-full flex-col overflow-y-auto border-l bg-card p-6 text-left text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Add skill</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Icon (emoji, optional)
          </span>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Parent</span>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">— None (root language) —</option>
            {allSkills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
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
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Add skill
        </button>
      </div>
    </aside>
  );
}

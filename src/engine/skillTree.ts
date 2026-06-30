// Pure layout + gating for the Skill Tree React Flow canvas. Takes all skills
// and produces positioned nodes (depth = column, pre-order row) plus parent→child
// edges. A child skill is "gated" (cannot advance) until its parent language
// reaches the unlock threshold. No React, no app state — easy to unit-test.

import type { Edge, Node } from "@xyflow/react";
import type { Mastery, Skill } from "@/data/types";

/** Mastery ordered low→high, for threshold comparisons. */
export const MASTERY_RANK: Record<Mastery, number> = {
  locked: 0,
  learning: 1,
  proficient: 2,
  expert: 3,
};

/** A child unlocks once its parent reaches at least this mastery. */
export const UNLOCK_THRESHOLD: Mastery = "learning";

/** Data carried by each skill node. Index signature satisfies React Flow. */
export interface SkillNodeData {
  skill: Skill;
  /** Parent not yet at the unlock threshold → controls disabled, shown locked. */
  gated: boolean;
  [key: string]: unknown;
}

export type SkillFlowNode = Node<SkillNodeData, "skill">;

// Spacing between depth columns and stacked rows.
export const COLUMN_WIDTH = 280;
export const ROW_HEIGHT = 120;
const COLUMN_X0 = 40;
const ROW_Y0 = 40;

/**
 * Whether a skill cannot advance yet because its parent is below the threshold.
 * Roots (no parent) and orphans (missing parent) are never gated.
 */
export function isSkillGated(
  skill: Skill,
  byId: ReadonlyMap<string, Skill>,
): boolean {
  if (!skill.parent_id) return false;
  const parent = byId.get(skill.parent_id);
  if (!parent) return false;
  return MASTERY_RANK[parent.mastery] < MASTERY_RANK[UNLOCK_THRESHOLD];
}

/**
 * Build the React Flow nodes + edges for the whole skill tree.
 * Pre-order DFS: each skill takes the next row; depth sets its column. Roots are
 * separated by a blank row. Edges run parent → child.
 */
export function buildSkillFlow(skills: readonly Skill[]): {
  nodes: SkillFlowNode[];
  edges: Edge[];
} {
  const byId = new Map(skills.map((s) => [s.id, s]));

  const childrenOf = new Map<string | null, Skill[]>();
  for (const s of skills) {
    const key = s.parent_id;
    const list = childrenOf.get(key);
    if (list) list.push(s);
    else childrenOf.set(key, [s]);
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  }

  const nodes: SkillFlowNode[] = [];
  let row = 0;

  const visit = (skill: Skill, depth: number): void => {
    // Use the admin-dragged coordinates when both are stored; otherwise fall
    // back to the computed grid spot.
    const position =
      skill.pos_x !== null && skill.pos_y !== null
        ? { x: skill.pos_x, y: skill.pos_y }
        : {
            x: COLUMN_X0 + depth * COLUMN_WIDTH,
            y: ROW_Y0 + row * ROW_HEIGHT,
          };
    nodes.push({
      id: skill.id,
      type: "skill",
      position,
      data: { skill, gated: isSkillGated(skill, byId) },
    });
    row += 1;
    for (const child of childrenOf.get(skill.id) ?? []) visit(child, depth + 1);
  };

  for (const root of childrenOf.get(null) ?? []) {
    visit(root, 0);
    row += 1; // blank row between root groups
  }

  const edges: Edge[] = [];
  for (const skill of skills) {
    if (skill.parent_id && byId.has(skill.parent_id)) {
      edges.push({
        id: `${skill.parent_id}->${skill.id}`,
        source: skill.parent_id,
        target: skill.id,
      });
    }
  }

  return { nodes, edges };
}

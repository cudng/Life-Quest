// Pure layout for the Roadmap React Flow canvas. Takes one track's stages
// (sorted by position) plus that track's milestones and the set of completed
// milestone ids, and produces positioned nodes + prerequisite edges. No React,
// no app state — easy to unit-test.

import type { Edge, Node } from "@xyflow/react";
import type { Milestone, Stage } from "@/data/types";
import { getNodeStatus, type NodeStatus } from "@/engine/graph";

/** Data carried by each milestone node. Index signature satisfies React Flow. */
export interface MilestoneNodeData {
  milestone: Milestone;
  status: NodeStatus;
  stageTitle: string;
  [key: string]: unknown;
}

export type MilestoneFlowNode = Node<MilestoneNodeData, "milestone">;

// Spacing between columns (stages) and rows (milestones within a stage).
export const COLUMN_WIDTH = 300;
export const ROW_HEIGHT = 140;
const COLUMN_X0 = 40;
const ROW_Y0 = 80;

/** Within a stage, fewer prerequisites first (entry points on top), then id. */
function orderInStage(a: Milestone, b: Milestone): number {
  const byPrereqs = a.prerequisites.length - b.prerequisites.length;
  return byPrereqs !== 0 ? byPrereqs : a.id.localeCompare(b.id);
}

/**
 * Build the React Flow nodes + edges for a single track.
 * @param stages       the track's stages, already sorted by position
 * @param milestones   all milestones (filtered here to those in these stages)
 * @param completedIds set of completed milestone ids (for status styling)
 */
export function buildRoadmapFlow(
  stages: readonly Stage[],
  milestones: readonly Milestone[],
  completedIds: ReadonlySet<string>,
): { nodes: MilestoneFlowNode[]; edges: Edge[] } {
  const nodes: MilestoneFlowNode[] = [];
  const presentIds = new Set<string>();

  stages.forEach((stage, col) => {
    const inStage = milestones
      .filter((m) => m.stage_id === stage.id)
      .sort(orderInStage);

    inStage.forEach((milestone, row) => {
      presentIds.add(milestone.id);
      nodes.push({
        id: milestone.id,
        type: "milestone",
        position: {
          x: COLUMN_X0 + col * COLUMN_WIDTH,
          y: ROW_Y0 + row * ROW_HEIGHT,
        },
        data: {
          milestone,
          status: getNodeStatus(milestone, completedIds),
          stageTitle: stage.title,
        },
      });
    });
  });

  // Prerequisite edges, only between milestones present in this track.
  const edges: Edge[] = [];
  for (const node of nodes) {
    for (const prereqId of node.data.milestone.prerequisites) {
      if (!presentIds.has(prereqId)) continue;
      edges.push({
        id: `${prereqId}->${node.id}`,
        source: prereqId,
        target: node.id,
        animated: node.data.status === "available",
      });
    }
  }

  return { nodes, edges };
}

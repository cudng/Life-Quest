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

/** Data for a stage's background column slab (title banner + grouping band). */
export interface StageNodeData {
  stageId: string;
  title: string;
  count: number;
  /** Injected by the canvas for admins — opens the stage edit panel. */
  isAdmin?: boolean;
  onEditStage?: (stageId: string) => void;
  [key: string]: unknown;
}

export type StageFlowNode = Node<StageNodeData, "stage">;

// Spacing between columns (stages) and rows (milestones within a stage).
export const COLUMN_WIDTH = 300;
export const ROW_HEIGHT = 96;
const COLUMN_X0 = 40;
const ROW_Y0 = 80;

// Milestone node width + the padding the stage band adds around its column.
const NODE_WIDTH = 220;
const NODE_HEIGHT = 56;
const BAND_PAD_X = 24;
const BAND_Y0 = 8;

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
): { nodes: MilestoneFlowNode[]; stageNodes: StageFlowNode[]; edges: Edge[] } {
  const nodes: MilestoneFlowNode[] = [];
  const stageNodes: StageFlowNode[] = [];
  const presentIds = new Set<string>();

  stages.forEach((stage, col) => {
    const inStage = milestones
      .filter((m) => m.stage_id === stage.id)
      .sort(orderInStage);

    const colX = COLUMN_X0 + col * COLUMN_WIDTH;

    // Background slab spanning this stage's column — the visible grouping band.
    const contentH =
      inStage.length > 0
        ? ROW_Y0 - BAND_Y0 + (inStage.length - 1) * ROW_HEIGHT + NODE_HEIGHT + 16
        : 88;
    stageNodes.push({
      id: `stage-${stage.id}`,
      type: "stage",
      position: { x: colX - BAND_PAD_X, y: BAND_Y0 },
      data: { stageId: stage.id, title: stage.title, count: inStage.length },
      draggable: false,
      selectable: false,
      width: NODE_WIDTH + BAND_PAD_X * 2,
      height: contentH,
      style: { width: NODE_WIDTH + BAND_PAD_X * 2, height: contentH },
    });

    inStage.forEach((milestone, row) => {
      presentIds.add(milestone.id);
      nodes.push({
        id: milestone.id,
        type: "milestone",
        position: {
          x: colX,
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

  return { nodes, stageNodes, edges };
}

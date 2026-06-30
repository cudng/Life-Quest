// Prerequisite graph logic for milestone/quest nodes. Pure, no app state.

export type NodeStatus = "locked" | "available" | "completed";

/** Minimal shape the graph needs; satisfied structurally by Milestone/QuestNode. */
export interface GraphNode {
  id: string;
  prerequisites: string[];
}

/**
 * Status of a single node given the set of completed node ids:
 * - "completed"  the node itself is done
 * - "available"  not done, but every prerequisite is done (or it has none)
 * - "locked"     at least one prerequisite is not yet done
 */
export function getNodeStatus(
  node: GraphNode,
  completedIds: ReadonlySet<string>,
): NodeStatus {
  if (completedIds.has(node.id)) return "completed";
  const unlocked = node.prerequisites.every((id) => completedIds.has(id));
  return unlocked ? "available" : "locked";
}

/** All nodes currently available to start (status === "available"). */
export function getAvailableNodes<T extends GraphNode>(
  nodes: readonly T[],
  completedIds: ReadonlySet<string>,
): T[] {
  return nodes.filter((node) => getNodeStatus(node, completedIds) === "available");
}

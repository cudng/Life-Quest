// React Flow canvas for the skill tree. Receives the pre-built nodes/edges from
// the layout engine, renders pan/zoom with custom skill nodes, and reports the
// selected skill id upward. Local node/edge state lets React Flow handle
// dragging + selection; it re-syncs whenever the incoming layout changes.

import { useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Edge,
  type NodeMouseHandler,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SkillNode } from "@/components/skill-tree/SkillNode";
import type { SkillFlowNode } from "@/engine/skillTree";
import { useUpdateSkillPosition } from "@/data/mutations";
import { useIsAdmin } from "@/auth/useIsAdmin";

// Stable reference — React Flow warns if this is recreated each render.
const nodeTypes: NodeTypes = { skill: SkillNode };

interface SkillCanvasProps {
  nodes: SkillFlowNode[];
  edges: Edge[];
  onSelect: (id: string | null) => void;
}

export function SkillCanvas({ nodes, edges, onSelect }: SkillCanvasProps) {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);
  const updatePosition = useUpdateSkillPosition();
  const isAdmin = useIsAdmin();

  // Re-sync when the layout changes. Positions live in the DB (pos_x/pos_y via
  // buildSkillFlow), so this only fires on an actual skills refetch and never
  // overwrites an in-progress drag.
  useEffect(() => setFlowNodes(nodes), [nodes, setFlowNodes]);
  useEffect(() => setFlowEdges(edges), [edges, setFlowEdges]);

  const handleNodeClick: NodeMouseHandler<SkillFlowNode> = (_e, node) =>
    onSelect(node.id);

  // Persist the dropped position so it survives reloads (admin only — RLS
  // rejects others, no point firing the request).
  const handleNodeDragStop: NodeMouseHandler<SkillFlowNode> = (_e, node) => {
    if (!isAdmin) return;
    updatePosition.mutate({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
    });
  };

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      nodesDraggable={isAdmin}
      onNodeClick={handleNodeClick}
      onNodeDragStop={handleNodeDragStop}
      onPaneClick={() => onSelect(null)}
      fitView
      minZoom={0.2}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable className="!bg-card" />
    </ReactFlow>
  );
}

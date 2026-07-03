// React Flow canvas for the skill tree. Receives the pre-built nodes/edges from
// the layout engine, renders pan/zoom with custom skill nodes, and reports the
// selected skill id upward. Local node/edge state lets React Flow handle
// dragging + selection; it re-syncs whenever the incoming layout changes.
// Styling follows the dark-fantasy language (PROJECT.md): obsidian board,
// allocated paths glow gold, gated paths stay iron dashes.

import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
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
import type { Mastery } from "@/data/types";
import { useUpdateSkillPosition } from "@/data/mutations";
import { useIsAdmin } from "@/auth/useIsAdmin";

// Stable reference — React Flow warns if this is recreated each render.
const nodeTypes: NodeTypes = { skill: SkillNode };

// Conduit colours (PROJECT.md): allocated = gold glow, unallocated = iron dash.
const GOLD = "#d99f36";
const IRON = "#3a3a42";

// MiniMap dot colour per mastery metal.
const MINIMAP_METAL: Record<Mastery, string> = {
  expert: "#d99f36",
  proficient: "#8a5c22",
  learning: "#db5f10",
  locked: "#2a2a30",
};

/**
 * A parent → child conduit is "allocated" (glows gold) once the child is no
 * longer gated — i.e. the prerequisite mastery has been reached. Gated paths
 * stay dark iron dashes.
 */
function styleEdges(nodes: SkillFlowNode[], edges: Edge[]): Edge[] {
  const gatedById = new Map(nodes.map((n) => [n.id, n.data.gated]));
  return edges.map((e) => {
    const allocated = !gatedById.get(e.target);
    return {
      ...e,
      animated: allocated,
      style: allocated
        ? {
            stroke: GOLD,
            strokeWidth: 2,
            filter: "drop-shadow(0 0 3px rgba(224,168,72,.7))",
          }
        : { stroke: IRON, strokeWidth: 1.5, strokeDasharray: "4 5" },
    };
  });
}

interface SkillCanvasProps {
  nodes: SkillFlowNode[];
  edges: Edge[];
  onSelect: (id: string | null) => void;
}

export function SkillCanvas({ nodes, edges, onSelect }: SkillCanvasProps) {
  const styledEdges = useMemo(() => styleEdges(nodes, edges), [nodes, edges]);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(styledEdges);
  const updatePosition = useUpdateSkillPosition();
  const isAdmin = useIsAdmin();

  // Re-sync when the layout changes. Positions live in the DB (pos_x/pos_y via
  // buildSkillFlow), so this only fires on an actual skills refetch and never
  // overwrites an in-progress drag.
  useEffect(() => setFlowNodes(nodes), [nodes, setFlowNodes]);
  useEffect(() => setFlowEdges(styledEdges), [styledEdges, setFlowEdges]);

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
      style={{
        background:
          "radial-gradient(130% 100% at 50% 0%, #150f0a 0%, #0a0705 70%)",
      }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={26}
        size={1}
        color="#241c12"
      />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        maskColor="rgba(0,0,0,.6)"
        style={{ background: "#0d0a07" }}
        nodeColor={(n) => {
          const data = n.data as SkillFlowNode["data"];
          const mastery: Mastery = data.gated ? "locked" : data.skill.mastery;
          return MINIMAP_METAL[mastery];
        }}
      />
    </ReactFlow>
  );
}

// React Flow canvas for one track. Receives the pre-built nodes/edges from the
// layout engine, renders pan/zoom with custom milestone nodes, and reports the
// selected milestone id upward. Local node/edge state lets React Flow handle
// dragging + selection; it re-syncs whenever the incoming layout changes.
// Styling follows the dark-fantasy language (PROJECT.md): obsidian board,
// reachable paths glow gold, locked paths stay iron dashes.

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
import { MilestoneNode } from "@/components/roadmap/MilestoneNode";
import type { MilestoneFlowNode } from "@/engine/roadmapLayout";
import type { NodeStatus } from "@/engine/graph";

// Stable reference — React Flow warns if this is recreated each render.
const nodeTypes: NodeTypes = { milestone: MilestoneNode };

// Conduit colours (PROJECT.md): allocated = gold glow, unallocated = iron dash.
const GOLD = "#d99f36";
const IRON = "#3a3a42";

// MiniMap dot colour per status metal.
const MINIMAP_METAL: Record<NodeStatus, string> = {
  completed: "#d99f36",
  available: "#db5f10",
  locked: "#2a2a30",
};

/**
 * A prerequisite → milestone conduit is "allocated" (glows gold) once the
 * target is no longer locked — i.e. its prerequisites are met. Locked paths
 * stay dark iron dashes.
 */
function styleEdges(nodes: MilestoneFlowNode[], edges: Edge[]): Edge[] {
  const statusById = new Map(nodes.map((n) => [n.id, n.data.status]));
  return edges.map((e) => {
    const allocated = statusById.get(e.target) !== "locked";
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

interface RoadmapCanvasProps {
  nodes: MilestoneFlowNode[];
  edges: Edge[];
  onSelect: (id: string | null) => void;
}

export function RoadmapCanvas({ nodes, edges, onSelect }: RoadmapCanvasProps) {
  const styledEdges = useMemo(() => styleEdges(nodes, edges), [nodes, edges]);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(styledEdges);

  // Re-sync when the track switches or statuses change.
  useEffect(() => setFlowNodes(nodes), [nodes, setFlowNodes]);
  useEffect(() => setFlowEdges(styledEdges), [styledEdges, setFlowEdges]);

  const handleNodeClick: NodeMouseHandler<MilestoneFlowNode> = (_e, node) =>
    onSelect(node.id);

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
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
          const data = n.data as MilestoneFlowNode["data"];
          return MINIMAP_METAL[data.status];
        }}
      />
    </ReactFlow>
  );
}

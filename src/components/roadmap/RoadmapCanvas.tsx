// React Flow canvas for one track. Receives the pre-built nodes/edges from the
// layout engine, renders pan/zoom with custom milestone nodes, and reports the
// selected milestone id upward. Local node/edge state lets React Flow handle
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
import { MilestoneNode } from "@/components/roadmap/MilestoneNode";
import type { MilestoneFlowNode } from "@/engine/roadmapLayout";

// Stable reference — React Flow warns if this is recreated each render.
const nodeTypes: NodeTypes = { milestone: MilestoneNode };

interface RoadmapCanvasProps {
  nodes: MilestoneFlowNode[];
  edges: Edge[];
  onSelect: (id: string | null) => void;
}

export function RoadmapCanvas({ nodes, edges, onSelect }: RoadmapCanvasProps) {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Re-sync when the track switches or statuses change.
  useEffect(() => setFlowNodes(nodes), [nodes, setFlowNodes]);
  useEffect(() => setFlowEdges(edges), [edges, setFlowEdges]);

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
    >
      <Background />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable className="!bg-card" />
    </ReactFlow>
  );
}

import React from "react";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import * as htmlToImage from "html-to-image";
import "reactflow/dist/style.css";

import { nodeTypes } from "./components/nodes/nodeTypes";
import Modal from "./components/Modal";
import Palette from "./components/Palette";
import PropertiesPanel from "./components/PropertiesPanel";
import NodeEditor from "./components/editors/NodeEditor";

import { defaultNodeData, downloadText } from "./utils/defaults";
import {
  loadState,
  saveState,
  toReactFlow,
  fromReactFlow,
} from "./utils/storage";
import { validateFlow } from "./utils/validate";
import useHistory from "./hooks/useHistory";
import type { NodeType } from "./types/flow";

function InnerFlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const { setViewport, getViewport, project } = useReactFlow();

  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
    null
  );
  const [modalOpen, setModalOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const history = useHistory<{
    nodes: Node[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  }>({ nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } });

  // Load saved
  React.useEffect(() => {
    const parsed = loadState();
    if (parsed) {
      const { rfNodes, rfEdges, viewport } = toReactFlow(parsed);
      setNodes(rfNodes);
      setEdges(rfEdges);
      setViewport(viewport || { x: 0, y: 0, zoom: 1 });
      history.set({ nodes: rfNodes, edges: rfEdges, viewport });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save
  const saveTimeout = React.useRef<number | null>(null);
  const scheduleSave = React.useCallback(() => {
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      const viewport = getViewport();
      saveState(fromReactFlow(nodes, edges, viewport));
    }, 350);
  }, [edges, nodes, getViewport]);
  React.useEffect(() => {
    scheduleSave();
  }, [nodes, edges, scheduleSave]);

  const onConnect = React.useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge({ ...params, type: undefined }, eds));
      history.set({
        nodes,
        edges: addEdge(params, edges),
        viewport: getViewport(),
      });
    },
    [edges, getViewport, history, nodes, setEdges]
  );

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type =
        (event.dataTransfer.getData("application/jl-node-type") as NodeType) ||
        "webhook";
      const bounds = (
        event.currentTarget as HTMLElement
      ).getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const baseData: Record<string, unknown> = defaultNodeData(type);
      const newNode: Node = {
        id,
        type,
        position,
        data: { ...baseData, label: (baseData.name as string) || type },
      };
      setNodes((nds) => nds.concat(newNode));
      history.set({
        nodes: [...nodes, newNode],
        edges,
        viewport: getViewport(),
      });
    },
    [edges, getViewport, history, nodes, project, setNodes]
  );

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeClick: NodeMouseHandler = React.useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);
  const onNodeDoubleClick: NodeMouseHandler = React.useCallback((_, node) => {
    setSelectedNodeId(node.id);
    setModalOpen(true);
  }, []);

  const selectedNode = React.useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );
  const [draftData, setDraftData] = React.useState<Record<string, unknown>>({});
  React.useEffect(() => {
    if (selectedNode) setDraftData({ ...(selectedNode.data as any) });
  }, [selectedNode]);

  const applyEdit = React.useCallback(() => {
    if (!selectedNode) return;
    const updated = nodes.map((n) =>
      n.id === selectedNode.id
        ? {
            ...n,
            data: {
              ...draftData,
              label: (draftData as any).name || (n.data as any).label,
            },
          }
        : n
    );
    setNodes(updated);
    setModalOpen(false);
    history.set({ nodes: updated, edges, viewport: getViewport() });
  }, [draftData, edges, getViewport, history, nodes, selectedNode, setNodes]);

  const deleteSelected = React.useCallback(() => {
    if (!selectedNodeId) return;
    const remainingEdges = edges.filter(
      (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
    );
    const remainingNodes = nodes.filter((n) => n.id !== selectedNodeId);
    setEdges(remainingEdges);
    setNodes(remainingNodes);
    setSelectedNodeId(null);
    history.set({
      nodes: remainingNodes,
      edges: remainingEdges,
      viewport: getViewport(),
    });
  }, [edges, getViewport, history, nodes, selectedNodeId, setEdges, setNodes]);

  // keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "Delete" ||
        (e.key === "Backspace" && (e.metaKey || e.ctrlKey))
      )
        deleteSelected();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) history.redo();
        else history.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected, history]);

  // export/import
  const exportJSON = React.useCallback(() => {
    const viewport = getViewport();
    const toExport = fromReactFlow(nodes, edges, viewport);
    downloadText("flow.json", JSON.stringify(toExport, null, 2));
  }, [edges, getViewport, nodes]);

  const onImportFile = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        validateFlow(parsed);
        const { rfNodes, rfEdges, viewport } = toReactFlow(parsed);
        setNodes(rfNodes);
        setEdges(rfEdges);
        setViewport(viewport);
        setSelectedNodeId(null);
        setError(null);
        history.set({ nodes: rfNodes, edges: rfEdges, viewport });
      } catch (err: any) {
        setError(err?.message || "Failed to import JSON");
      } finally {
        (e.target as HTMLInputElement).value = "";
      }
    },
    [history, setEdges, setNodes, setViewport]
  );

  // PNG
  const rfWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const exportPNG = React.useCallback(async () => {
    if (!rfWrapperRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(rfWrapperRef.current, {
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "flow.png";
      a.click();
    } catch {
      setError("PNG export failed");
    }
  }, []);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/jl-node-type", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const resetView = () => setViewport({ x: 0, y: 0, zoom: 1 });

  return (
    <div
      className="h-screen w-full grid grid-cols-[260px_1fr_300px]"
      aria-label="Flow Builder Layout"
    >
      <Palette
        onDragStart={onDragStart}
        onExport={exportJSON}
        onImport={() => {}}
        onImportFile={onImportFile}
        onExportPng={exportPNG}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onResetView={resetView}
        error={error}
      />
      <main
        className="relative bg-gray-50"
        onDrop={onDrop}
        onDragOver={onDragOver}
        ref={rfWrapperRef}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={16} size={1} />
          <MiniMap pannable zoomable />
          <Controls />
          <Panel position="top-center" className="pointer-events-none">
            <div className="rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs text-gray-700 shadow">
              {nodes.length} nodes • {edges.length} edges
            </div>
          </Panel>
        </ReactFlow>
      </main>
      <PropertiesPanel
        selected={selectedNode}
        onEdit={() => setModalOpen(true)}
        onDelete={deleteSelected}
      />
      <Modal
        open={modalOpen && !!selectedNode}
        onClose={() => setModalOpen(false)}
        title={`Configure: ${selectedNode?.data?.label || selectedNode?.type}`}
      >
        {selectedNode && (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              applyEdit();
            }}
          >
            <NodeEditor
              type={selectedNode.type as NodeType}
              value={draftData}
              onChange={setDraftData}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-black text-white px-3 py-2 text-sm"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <InnerFlowBuilder />
    </ReactFlowProvider>
  );
}

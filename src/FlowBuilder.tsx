/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type EdgeChange,
  type NodeChange,
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
  // We'll manage our own change handlers so we can snapshot to history.
  const [nodes, setNodes] = useNodesState([] as Node[]);
  const [edges, setEdges] = useEdgesState([] as Edge[]);
  const { setViewport, getViewport, project } = useReactFlow();

  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
    null
  );
  const [selectedEdgeIds, setSelectedEdgeIds] = React.useState<string[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const history = useHistory<{
    nodes: Node[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  }>({
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  });

  // Guard to avoid feedback loop when applying a history state to the canvas
  const applyingHistoryRef = React.useRef(false);

  // Load saved state from localStorage on mount (and push an initial snapshot)
  React.useEffect(() => {
    const parsed = loadState();
    if (parsed) {
      const { rfNodes, rfEdges, viewport } = toReactFlow(parsed);
      setNodes(rfNodes);
      setEdges(rfEdges);
      setViewport(viewport || { x: 0, y: 0, zoom: 1 });
      history.set({
        nodes: rfNodes,
        edges: rfEdges,
        viewport: viewport || { x: 0, y: 0, zoom: 1 },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply history.present into React Flow (without creating a new snapshot)
  React.useEffect(() => {
    const { nodes: hn, edges: he, viewport: hv } = history.present || {};
    if (!hn || !he || !hv) return;
    applyingHistoryRef.current = true;
    setNodes(hn);
    setEdges(he);
    setViewport(hv);
    // release guard on next tick so user changes snapshot again
    (queueMicrotask ?? ((fn: () => void) => setTimeout(fn, 0)))(() => {
      applyingHistoryRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.present]);

  // Auto-save (debounced)
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

  // React Flow change handlers -> apply changes + snapshot (unless applying history)
  const onNodesChange = React.useCallback(
    (changes: NodeChange[]) => {
      if (applyingHistoryRef.current) return;
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds);
        history.set({ nodes: next, edges, viewport: getViewport() });
        return next;
      });
    },
    [edges, getViewport, history, setNodes]
  );

  const onEdgesChange = React.useCallback(
    (changes: EdgeChange[]) => {
      if (applyingHistoryRef.current) return;
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        history.set({ nodes, edges: next, viewport: getViewport() });
        return next;
      });
    },
    [nodes, getViewport, history, setEdges]
  );

  const onConnect = React.useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => {
        const next = addEdge({ ...params, type: undefined }, eds);
        history.set({ nodes, edges: next, viewport: getViewport() });
        return next;
      });
    },
    [nodes, getViewport, history, setEdges]
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
        data: { ...baseData, label: (baseData as any).name || type },
      };
      setNodes((nds) => {
        const next = nds.concat(newNode);
        history.set({ nodes: next, edges, viewport: getViewport() });
        return next;
      });
    },
    [edges, getViewport, history, project, setNodes]
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

  // Track selection (nodes & edges) for deletion
  const onSelectionChange = React.useCallback(
    ({
      nodes: selNodes,
      edges: selEdges,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) => {
      setSelectedNodeId(selNodes[0]?.id ?? null);
      setSelectedEdgeIds(selEdges.map((e) => e.id));
    },
    []
  );

  const selectedNode = React.useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // Editing modal draft
  const [draftData, setDraftData] = React.useState<Record<string, unknown>>({});
  React.useEffect(() => {
    if (selectedNode) setDraftData({ ...(selectedNode.data as any) });
  }, [selectedNode]);

  const applyEdit = React.useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => {
      const updated = nds.map((n) =>
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
      history.set({ nodes: updated, edges, viewport: getViewport() });
      return updated;
    });
    setModalOpen(false);
  }, [draftData, edges, getViewport, history, selectedNode, setNodes]);

  const deleteSelected = React.useCallback(() => {
    let nextEdges = edges;
    let nextNodes = nodes;

    // delete selected edges
    if (selectedEdgeIds.length) {
      nextEdges = edges.filter((e) => !selectedEdgeIds.includes(e.id));
      setSelectedEdgeIds([]);
    }

    // delete selected node (and its incident edges)
    if (selectedNodeId) {
      nextEdges = nextEdges.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      );
      nextNodes = nodes.filter((n) => n.id !== selectedNodeId);
      setSelectedNodeId(null);
    }

    if (nextEdges !== edges || nextNodes !== nodes) {
      setEdges(nextEdges);
      setNodes(nextNodes);
      history.set({
        nodes: nextNodes,
        edges: nextEdges,
        viewport: getViewport(),
      });
    }
  }, [
    edges,
    nodes,
    selectedEdgeIds,
    selectedNodeId,
    getViewport,
    history,
    setEdges,
    setNodes,
  ]);

  // keyboard shortcuts: Delete edges/nodes; Ctrl/Cmd+Z / Shift+Ctrl/Cmd+Z
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isDelete =
        e.key === "Delete" ||
        (e.key === "Backspace" && (e.metaKey || e.ctrlKey));
      if (isDelete) {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected, history]);

  // export/import JSON
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
        setSelectedEdgeIds([]);
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

  // PNG export
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
          onSelectionChange={onSelectionChange}
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
                className="rounded-lg border border-red-500 px-3 py-2 text-sm hover:bg-red-200 hover:cursor-pointer "
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:opacity-80 hover:cursor-pointer "
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FlowState } from "../types/flow";
import { STORAGE_KEY } from "./defaults";

export function loadState(): FlowState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FlowState) : null;
  } catch {
    return null;
  }
}

export function saveState(state: FlowState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function toReactFlow(parsed: FlowState) {
  const rfNodes = (parsed.nodes || []).map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: { ...n.data, label: n.label },
  }));
  const rfEdges = (parsed.edges || []).map((e) => ({
    id: e.id,
    source: e.from.nodeId,
    sourceHandle: e.from.port,
    target: e.to.nodeId,
    targetHandle: e.to.port,
  }));
  return { rfNodes, rfEdges, viewport: parsed.viewport };
}

export function fromReactFlow(
  nodes: any[],
  edges: any[],
  viewport: { x: number; y: number; zoom: number }
): FlowState {
  return {
    version: 1,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      label: n.data?.label ?? n.data?.name ?? n.type,
      data: { ...(n.data || {}) },
    })),
    edges: edges.map((e) => ({
      id: e.id,
      from: { nodeId: e.source, port: e.sourceHandle || "out" },
      to: { nodeId: e.target, port: e.targetHandle || "in" },
    })),
    viewport,
  };
}

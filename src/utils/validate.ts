/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FlowState } from "../types/flow";

export function validateFlow(obj: any): asserts obj is FlowState {
  if (typeof obj !== "object" || obj == null) throw new Error("Invalid JSON");
  if (typeof obj.version !== "number") throw new Error("Missing version");
  if (!Array.isArray(obj.nodes)) throw new Error("Missing nodes[]");
  if (!Array.isArray(obj.edges)) throw new Error("Missing edges[]");
  if (
    !obj.viewport ||
    typeof obj.viewport.x !== "number" ||
    typeof obj.viewport.y !== "number" ||
    typeof obj.viewport.zoom !== "number"
  )
    throw new Error("Missing viewport");
  for (const n of obj.nodes) {
    if (typeof n.id !== "string") throw new Error("Node missing id");
    if (!n.type) throw new Error(`Node ${n.id} missing type`);
    if (
      !n.position ||
      typeof n.position.x !== "number" ||
      typeof n.position.y !== "number"
    )
      throw new Error(`Node ${n.id} invalid position`);
    if (typeof n.data !== "object")
      throw new Error(`Node ${n.id} invalid data`);
  }
  for (const e of obj.edges) {
    if (typeof e.id !== "string") throw new Error("Edge missing id");
    if (!e.from?.nodeId || !e.to?.nodeId)
      throw new Error(`Edge ${e.id} invalid endpoints`);
  }
}

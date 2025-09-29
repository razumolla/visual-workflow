/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from "reactflow";
import type { NodeType } from "../../types/flow";

const NODE_BG: Record<NodeType, string> = {
  webhook: "bg-emerald-100 border-emerald-400",
  code: "bg-indigo-100 border-indigo-400",
  http: "bg-sky-100 border-sky-400",
  smtp: "bg-rose-100 border-rose-400",
};

export default function GenericNode({
  data,
  type,
}: {
  data: any;
  type: NodeType;
}) {
  const color = NODE_BG[type] || "bg-gray-100 border-gray-300";
  return (
    <div
      className={`rounded-xl border ${color} px-3 py-2 shadow-sm text-sm min-w-[140px]`}
    >
      <div className="font-semibold leading-5 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-black/50" />
        {data?.label || data?.name || type}
      </div>
      <div className="text-xs text-gray-600 mt-1 truncate">
        {type === "webhook" && (
          <span>
            {String(data?.method || "GET")} {String(data?.path || "/path")}
          </span>
        )}
        {type === "code" && (
          <span>JavaScript • {String(data?.name || "Code")}</span>
        )}
        {type === "http" && (
          <span>
            {String(data?.method || "GET")} {String(data?.url || "http://")}
          </span>
        )}
        {type === "smtp" && (
          <span>
            {String(data?.host || "smtp.local")}:{String(data?.port || 587)}
          </span>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="!bg-gray-700"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!bg-gray-700"
      />
    </div>
  );
}

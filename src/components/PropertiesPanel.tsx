/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export default function PropertiesPanel({
  selected,
  onEdit,
  onDelete,
}: {
  selected: any | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const readOnly = React.useMemo(() => {
    if (!selected) return null;
    const data = (selected.data || {}) as Record<string, unknown>;
    return (
      <div className="text-sm space-y-2">
        <div>
          <div className="text-xs text-gray-500">Type</div>
          <div className="uppercase font-medium">{String(selected.type)}</div>
        </div>
        {Object.entries(data).map(([k, v]) => (
          <div key={k}>
            <div className="text-xs text-gray-500">{k}</div>
            <div className="break-words text-gray-800">
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </div>
          </div>
        ))}
      </div>
    );
  }, [selected]);

  return (
    <aside className="border-l bg-white p-3">
      <h2 className="text-sm font-semibold mb-3">Properties</h2>
      {!selected && (
        <p className="text-xs text-gray-500">
          Select a node to view its properties.
        </p>
      )}
      {selected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">
              {selected.data?.label || selected.type}
            </div>
            <button
              onClick={onEdit}
              className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
              aria-label="Edit node"
            >
              Edit
            </button>
          </div>
          {readOnly}
          <button
            onClick={onDelete}
            className="mt-3 w-full rounded-lg border px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            Delete Node
          </button>
        </div>
      )}
    </aside>
  );
}

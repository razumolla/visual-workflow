/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";

export default function PropertiesPanel({
  selected,
  onEdit,
  onDelete,
}: {
  selected: any | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const readOnly = useMemo(() => {
    if (!selected) return null;
    const data = (selected.data || {}) as Record<string, unknown>;
    return (
      <div className="text-sm space-y-2">
        {Object.entries(data).map(
          ([k, v]) =>
            // skip label field
            k !== "label" && (
              <div key={k}>
                <div className="text-sm text-gray-500">{k} :</div>
                <div className="break-words text-gray-800">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </div>
              </div>
            )
        )}
      </div>
    );
  }, [selected]);

  return (
    <aside className="border-l bg-white p-3">
      <h2 className="text-sm font-semibold mb-3">Properties</h2>
      {!selected && (
        <p className="text-base text-gray-500">
          Select a node to view it's properties.
        </p>
      )}
      {selected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">
              <div className="text-base text-gray-500">
                Node Type :{" "}
                <span className="uppercase font-medium">
                  {String(selected.type)}
                </span>
              </div>
            </div>

            <button
              onClick={onEdit}
              className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:opacity-80 hover:cursor-pointer"
              aria-label="Edit node"
            >
              Edit
            </button>
          </div>
          <hr className="border-gray-200 my-3 border-dashed" />
          {readOnly}
          <button
            onClick={onDelete}
            className="mt-3 w-full rounded-lg border px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
          >
            Delete Node
          </button>
        </div>
      )}
    </aside>
  );
}

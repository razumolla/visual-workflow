import React, { useRef } from "react";
import type { NodeType } from "../types/flow";

export default function Palette({
  onDragStart,
  onExport,
  onImportFile,
  onExportPng,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onResetView,
  error,
}: {
  onDragStart: (e: React.DragEvent, t: NodeType) => void;
  onExport: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportPng: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResetView: () => void;
  error: string | null;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <aside className="border-r bg-white p-3">
      <h2 className="text-base font-semibold mb-3">All Nodes</h2>
      <div className="grid gap-2">
        {(["webhook", "code", "http", "smtp"] as NodeType[]).map((t) => (
          <button
            key={t}
            draggable
            onDragStart={(e) => onDragStart(e, t)}
            className="w-full rounded-xl border border-blue-400 px-3 py-2 text-left hover:bg-gray-100 focus:outline-none
              hover:cursor-grab active:cursor-grabbing"
            aria-label={`Drag ${t} node`}
          >
            <div className="text-sm font-medium capitalize">{t}</div>
            <div className="text-xs text-gray-500">
              {t === "webhook" && "Trigger via HTTP"}
              {t === "code" && "Execute JS"}
              {t === "http" && "HTTP request"}
              {t === "smtp" && "Send email"}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <h3 className="text-base font-semibold">Flow</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={onExport}
            className="rounded-lg bg-blue-500 text-white px-3 py-2 text-sm hover:opacity-90 hover:cursor-pointer "
          >
            Export JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border  border-blue-400 px-3 py-2 text-sm hover:bg-blue-50 hover:cursor-pointer "
          >
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImportFile}
          />
          <button
            onClick={onExportPng}
            className="rounded-lg border  border-blue-400 px-3 py-2 text-sm hover:bg-blue-50 hover:cursor-pointer "
          >
            Export PNG
          </button>
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="flex-1 rounded-lg border  border-blue-400 px-3 py-2 text-sm disabled:opacity-40 hover:cursor-pointer"
            >
              Undo
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="flex-1 rounded-lg border  border-blue-400 px-3 py-2 text-sm disabled:opacity-40 hover:cursor-pointer "
            >
              Redo
            </button>
          </div>
          <button
            onClick={onResetView}
            className="rounded-lg border  border-blue-400 px-3 py-2 text-sm hover:bg-blue-50 hover:cursor-pointer "
          >
            Reset View
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-rose-600 mt-2">
            {error}
          </p>
        )}
      </div>
      <div className="mt-6 text-[14px] text-gray-600">
        Drag a node type into the canvas. Click to view, double-click to edit.
      </div>
    </aside>
  );
}

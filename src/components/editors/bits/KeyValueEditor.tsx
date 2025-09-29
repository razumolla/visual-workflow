export default function KeyValueEditor({
  value = [],
  onChange,
}: {
  value?: { key: string; value: string }[];
  onChange: (v: { key: string; value: string }[]) => void;
}) {
  const items = value as { key: string; value: string }[];
  const setItem = (i: number, field: "key" | "value", val: string) => {
    const next = items.map((it, idx) =>
      idx === i ? { ...it, [field]: val } : it
    );
    onChange(next);
  };
  const add = () => onChange([...(items || []), { key: "", value: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-700">Headers</span>
        <button
          type="button"
          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          onClick={add}
        >
          + Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">
            <input
              className="col-span-2 rounded border border-gray-300 px-2 py-1"
              placeholder="Key"
              value={it.key}
              onChange={(e) => setItem(i, "key", e.target.value)}
            />
            <input
              className="col-span-3 rounded border border-gray-300 px-2 py-1"
              placeholder="Value"
              value={it.value}
              onChange={(e) => setItem(i, "value", e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        {(!items || items.length === 0) && (
          <p className="text-xs text-gray-500">No headers</p>
        )}
      </div>
    </div>
  );
}

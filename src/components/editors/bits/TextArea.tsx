/* eslint-disable @typescript-eslint/no-explicit-any */
export default function TextArea({
  label,
  name,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  name: string;
  value?: any;
  onChange: (v: any) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm mb-3">
      <span className="block text-gray-700 mb-1">{label}</span>
      <textarea
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-sky-200 font-mono text-xs"
        name={name}
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function Select({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value?: string | number;
  onChange: (v: string | number) => void;
  options: { label: string; value: string | number }[];
}) {
  return (
    <label className="block text-sm mb-3">
      <span className="block text-gray-700 mb-1">{label}</span>
      <select
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-sky-200"
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

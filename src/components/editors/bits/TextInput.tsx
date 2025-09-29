/* eslint-disable @typescript-eslint/no-explicit-any */
export default function TextInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value?: any;
  onChange: (v: any) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm mb-3">
      <span className="block text-gray-700 mb-1">{label}</span>
      <input
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-sky-200"
        name={name}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}

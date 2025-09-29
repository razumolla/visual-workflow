import TextInput from "./bits/TextInput";
import Select from "./bits/Select";

type Props = {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
};
export default function WebhookEditor({ value, onChange }: Props) {
  return (
    <div>
      <TextInput
        label="Name"
        name="name"
        value={value.name}
        onChange={(v) => onChange({ ...value, name: v })}
        required
      />
      <Select
        label="Method"
        name="method"
        value={(value.method as string) || "GET"}
        onChange={(v) => onChange({ ...value, method: v })}
        options={[
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
        ]}
      />
      <TextInput
        label="Path"
        name="path"
        value={value.path}
        onChange={(v) => onChange({ ...value, path: v })}
      />
    </div>
  );
}

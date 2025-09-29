import TextInput from "./bits/TextInput";
import TextArea from "./bits/TextArea";

type Props = {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
};
export default function CodeEditor({ value, onChange }: Props) {
  return (
    <div>
      <TextInput
        label="Name"
        name="name"
        value={value.name}
        onChange={(v) => onChange({ ...value, name: v })}
        required
      />
      <TextInput
        label="Language"
        name="language"
        value={value.language ?? "JavaScript"}
        onChange={(v) => onChange({ ...value, language: v })}
      />
      <TextArea
        label="Code"
        name="code"
        rows={10}
        value={value.code}
        onChange={(v) => onChange({ ...value, code: v })}
      />
    </div>
  );
}

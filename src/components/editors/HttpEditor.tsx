/* eslint-disable @typescript-eslint/no-explicit-any */
import TextInput from "./bits/TextInput";
import TextArea from "./bits/TextArea";
import Select from "./bits/Select";
import KeyValueEditor from "./bits/KeyValueEditor";

type Props = {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
};
export default function HttpEditor({ value, onChange }: Props) {
  const bodyMode = (value.bodyMode as string) ?? "none";
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
        options={["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => ({
          label: m,
          value: m,
        }))}
      />
      <TextInput
        label="URL"
        name="url"
        value={value.url}
        onChange={(v) => onChange({ ...value, url: v })}
      />
      <div className="mt-2">
        <KeyValueEditor
          value={(value.headers as any) || []}
          onChange={(v) => onChange({ ...value, headers: v })}
        />
      </div>
      <Select
        label="Body Mode"
        name="bodyMode"
        value={bodyMode}
        onChange={(v) => onChange({ ...value, bodyMode: v })}
        options={[
          { label: "none", value: "none" },
          { label: "json", value: "json" },
          { label: "text", value: "text" },
          { label: "form", value: "form" },
        ]}
      />
      {bodyMode !== "none" && (
        <TextArea
          label="Body"
          name="body"
          rows={6}
          value={value.body}
          onChange={(v) => onChange({ ...value, body: v })}
        />
      )}
    </div>
  );
}

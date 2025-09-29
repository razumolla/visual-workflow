import React from "react";
import TextInput from "./bits/TextInput";
import TextArea from "./bits/TextArea";

type Props = {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
};
export default function SmtpEditor({ value, onChange }: Props) {
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
        label="Host"
        name="host"
        value={value.host}
        onChange={(v) => onChange({ ...value, host: v })}
      />
      <TextInput
        label="Port"
        name="port"
        type="number"
        value={value.port}
        onChange={(v) => onChange({ ...value, port: Number(v) || 0 })}
      />
      <TextInput
        label="Username"
        name="username"
        value={value.username}
        onChange={(v) => onChange({ ...value, username: v })}
      />
      <TextInput
        label="From"
        name="from"
        value={value.from}
        onChange={(v) => onChange({ ...value, from: v })}
      />
      <TextInput
        label="To"
        name="to"
        value={value.to}
        onChange={(v) => onChange({ ...value, to: v })}
      />
      <TextInput
        label="Subject"
        name="subject"
        value={value.subject}
        onChange={(v) => onChange({ ...value, subject: v })}
      />
      <TextInput
        label="Text"
        name="text"
        value={value.text}
        onChange={(v) => onChange({ ...value, text: v })}
      />
      <TextArea
        label="HTML"
        name="html"
        rows={6}
        value={value.html}
        onChange={(v) => onChange({ ...value, html: v })}
      />
    </div>
  );
}

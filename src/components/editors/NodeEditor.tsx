import type { NodeType } from "../../types/flow";
import WebhookEditor from "./WebhookEditor";
import CodeEditor from "./CodeEditor";
import HttpEditor from "./HttpEditor";
import SmtpEditor from "./SmtpEditor";

type Props = {
  type: NodeType;
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
};

export default function NodeEditor({ type, value, onChange }: Props) {
  switch (type) {
    case "webhook":
      return <WebhookEditor value={value} onChange={onChange} />;
    case "code":
      return <CodeEditor value={value} onChange={onChange} />;
    case "http":
      return <HttpEditor value={value} onChange={onChange} />;
    case "smtp":
      return <SmtpEditor value={value} onChange={onChange} />;
    default:
      return <div className="text-sm text-gray-600">Unknown node type</div>;
  }
}

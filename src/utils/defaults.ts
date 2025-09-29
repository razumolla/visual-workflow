import type { NodeType } from "../types/flow";

export const STORAGE_KEY = "jl-flowbuilder-state-v1";

export function uid(prefix = "n"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultNodeData(type: NodeType): Record<string, unknown> {
  switch (type) {
    case "webhook":
      return { name: "Webhook", method: "POST", path: "/inbound" };
    case "code":
      return {
        name: "Code",
        language: "JavaScript",
        code: "// write code here\n",
      };
    case "http":
      return {
        name: "HTTP Request",
        method: "GET",
        url: "https://api.example.com",
        headers: [],
        bodyMode: "none",
      };
    case "smtp":
      return {
        name: "SMTP",
        host: "smtp.example.com",
        port: 587,
        username: "",
        from: "",
        to: "",
        subject: "",
        text: "",
        html: "",
      };
  }
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

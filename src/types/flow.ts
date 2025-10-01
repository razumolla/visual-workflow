export type NodeType = "webhook" | "code" | "http" | "smtp";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type WebhookMethod = "GET" | "POST";
export type BodyMode = "none" | "json" | "text" | "form";

export interface HeaderKV {
  key: string;
  value: string;
}

export interface WebhookData {
  name: string;
  method: WebhookMethod;
  path: string;
  label?: string;
}

export interface CodeData {
  name: string;
  language: "JavaScript";
  code: string;
  label?: string;
}

export interface HttpData {
  name: string;
  method: HttpMethod;
  url: string;
  headers: HeaderKV[];
  bodyMode: BodyMode;
  body?: string;
  label?: string;
}

export interface SmtpData {
  name: string;
  host: string;
  port: number;
  username: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  label?: string;
}

export type NodeDataMap = {
  webhook: WebhookData;
  code: CodeData;
  http: HttpData;
  smtp: SmtpData;
};

export type AnyNodeData = NodeDataMap[keyof NodeDataMap];

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  label: string;
  data: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  from: { nodeId: string; port: "out" };
  to: { nodeId: string; port: "in" };
}

export interface FlowState {
  version: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: { x: number; y: number; zoom: number };
}

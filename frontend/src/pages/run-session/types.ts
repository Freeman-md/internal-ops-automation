export type RunState =
  | {
      mode: "workflow";
      name: string;
      input?: Record<string, unknown>;
    }
  | {
      mode: "ai";
      prompt: string;
    };

export type StreamEvent = {
  id: string;
  type: string;
  payload: unknown;
  receivedAt: number;
};

export type LogPayload = {
  scope?: string;
  level?: string;
  message?: string;
  meta?: Record<string, unknown>;
  timeStamp?: number;
};

export type WorkflowResultPayload = {
  success?: boolean;
  data?: {
    status?: string;
    reason?: string;
    artifacts?: Record<string, unknown>;
  };
  error?: {
    type?: string;
    message?: string;
    meta?: Record<string, unknown>;
  };
  durationMs?: number;
};

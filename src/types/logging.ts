export type LogLevel = "info" | "warn" | "error";

export type LogEvent = {
    scope: string;
    level: LogLevel;
    message: string;
    meta?: Record<string, any>;
    timeStamp: number;
};

export type LogSink = (event: LogEvent) => void;
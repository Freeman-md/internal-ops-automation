import { LogEvent, LogLevel, LogSink } from "./types";

const consoleSink: LogSink = (event) => {
    const prefix = `[${event.scope}]`;
    console.log(prefix, event.message, event.meta ?? "");
}

let sinks: LogSink[] = [consoleSink]

export function registerLogSink(sink: LogSink) {
    sinks.push(sink)
}

export function log(
    scope: string,
    message: string,
    meta?: Record<string, any>,
    level: LogLevel = "info",
) {
    const event: LogEvent = {
        scope,
        level, 
        message,
        meta,
        timeStamp: Date.now()
    };

    for (const sink of sinks) {
        sink(event)
    }
}
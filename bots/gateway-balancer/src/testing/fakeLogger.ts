import type { LogFields, Logger } from "../ports";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  fields: LogFields;
}

export class FakeLogger implements Logger {
  readonly entries: LogEntry[];

  constructor(
    private readonly bindings: LogFields = {},
    entries?: LogEntry[]
  ) {
    this.entries = entries ?? [];
  }

  child(bindings: LogFields): Logger {
    return new FakeLogger({ ...this.bindings, ...bindings }, this.entries);
  }

  debug(message: string, fields?: LogFields): void {
    this.log("debug", message, fields);
  }

  info(message: string, fields?: LogFields): void {
    this.log("info", message, fields);
  }

  warn(message: string, fields?: LogFields): void {
    this.log("warn", message, fields);
  }

  error(message: string, fields?: LogFields): void {
    this.log("error", message, fields);
  }

  private log(level: LogLevel, message: string, fields?: LogFields): void {
    this.entries.push({ level, message, fields: { ...this.bindings, ...(fields ?? {}) } });
  }
}

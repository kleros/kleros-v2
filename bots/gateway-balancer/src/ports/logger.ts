export type LogFields = Record<string, unknown>;

/** Structured logger. Implementations must redact configured secrets; callers never log a key or a webhook URL. */
export interface Logger {
  child(bindings: LogFields): Logger;
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}

import type { LogFields, Logger } from "../../ports";
import type { Redact } from "../redact";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface JsonLoggerOptions {
  redact: Redact;
  /** Receives one JSON line per entry, newline included. */
  write?: (line: string) => void;
  level?: LogLevel;
  now?: () => Date;
}

/** Serializable form of a field value: bigints as decimal strings, errors as name and message. */
function normalize(value: unknown, redact: Redact, depth = 0): unknown {
  if (depth > 8) return "[depth]";
  if (typeof value === "string") return redact(value);
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return { name: value.name, message: redact(value.message) };
  }
  if (Array.isArray(value)) return value.map((v) => normalize(v, redact, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalize(v, redact, depth + 1);
    return out;
  }
  if (typeof value === "function" || typeof value === "symbol") return String(value);
  return value;
}

/** JSON-lines logger; every string (message, fields, error messages) passes through the redactor. */
export class JsonLogger implements Logger {
  private readonly write: (line: string) => void;
  private readonly threshold: number;
  private readonly now: () => Date;

  constructor(
    private readonly options: JsonLoggerOptions,
    private readonly bindings: LogFields = {}
  ) {
    this.write = options.write ?? ((line) => process.stderr.write(line));
    this.threshold = LEVELS[options.level ?? "info"];
    this.now = options.now ?? (() => new Date());
  }

  child(bindings: LogFields): Logger {
    return new JsonLogger(this.options, { ...this.bindings, ...bindings });
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
    if (LEVELS[level] < this.threshold) return;
    const redact = this.options.redact;
    const entry = {
      ...(normalize({ ...this.bindings, ...(fields ?? {}) }, redact) as Record<string, unknown>),
      time: this.now().toISOString(),
      level,
      msg: redact(message),
    };
    // Redacted once more as a whole, in case a secret was split across fields and re-joined by serialization.
    this.write(`${redact(JSON.stringify(entry))}\n`);
  }
}

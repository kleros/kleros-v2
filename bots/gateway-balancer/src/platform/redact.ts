import type { JsonValue } from "../domain";

export type Redact = (text: string) => string;

const URL_PATTERN = /\b(?:https?|wss?):\/\/[^\s"'<>`]+/gi;
const SECRET_ENV_NAME = /(KEY|SECRET|TOKEN|PASSWORD|WEBHOOK|RPC_URL|_URL)$/i;

/**
 * Removes secrets from free text: every configured secret value (the private key, every RPC URL, webhook URLs, any
 * environment value whose name looks secret) and, as a second net, any URL at all, since RPC and webhook URLs may
 * embed credentials. Matching ignores case (a library may print a key checksummed, upper-cased or lower-cased), and a
 * hex secret is also found in its bare form without `0x` (decisions [L45]).
 */
export class Redactor {
  private readonly pattern: RegExp | null;

  constructor(secrets: Iterable<string | undefined | null>) {
    const set = new Set<string>();
    for (const secret of secrets) {
      if (!secret || secret.length < 6) continue;
      set.add(secret.toLowerCase());
      // Bare hex: `0xabc...` is also found as `abc...`, whatever the case of either.
      const bare = /^0x([0-9a-fA-F]+)$/.exec(secret)?.[1];
      if (bare && bare.length >= 6) set.add(bare.toLowerCase());
      try {
        // A URL also appears normalized (trailing slash, lower-cased host) in library messages.
        const normalized = new URL(secret).toString();
        set.add(normalized.toLowerCase());
        if (normalized.endsWith("/")) set.add(normalized.slice(0, -1).toLowerCase());
      } catch {
        // Not a URL.
      }
    }
    // Longest first, so a URL is replaced before a key it embeds.
    const ordered = [...set].sort((a, b) => b.length - a.length);
    this.pattern = ordered.length ? new RegExp(ordered.map(escapeRegExp).join("|"), "gi") : null;
  }

  /** The secrets named by the environment: the key, values of variables that look secret, and `extra` names. */
  static fromEnv(env: NodeJS.ProcessEnv, extraNames: Iterable<string> = []): Redactor {
    return new Redactor(secretEnvValues(env, extraNames));
  }

  readonly text: Redact = (text) => {
    const out = this.pattern ? text.replace(this.pattern, "[redacted]") : text;
    return out.replace(URL_PATTERN, "[redacted-url]");
  };

  /** Redacts every string inside a JSON value (keys included); bigints and numbers pass unchanged. */
  readonly json = <T extends JsonValue>(value: T): T => redactJson(value, this.text) as T;
}

/** Values of `BALANCER_PRIVATE_KEY`, of the `extraNames` variables and of every variable whose name looks secret. */
export function secretEnvValues(env: NodeJS.ProcessEnv, extraNames: Iterable<string> = []): string[] {
  const names = new Set(extraNames);
  names.add("BALANCER_PRIVATE_KEY");
  const values: string[] = [];
  for (const [name, value] of Object.entries(env)) {
    if (value && (names.has(name) || SECRET_ENV_NAME.test(name))) values.push(value);
  }
  return values;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function redactJson(value: JsonValue, redact: Redact): JsonValue {
  if (typeof value === "string") return redact(value);
  if (Array.isArray(value)) return value.map((v) => redactJson(v, redact));
  if (value && typeof value === "object") {
    const out: { [key: string]: JsonValue } = {};
    for (const [k, v] of Object.entries(value)) out[redact(k)] = redactJson(v, redact);
    return out;
  }
  return value;
}

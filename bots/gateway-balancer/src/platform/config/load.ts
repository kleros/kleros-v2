import { readFileSync } from "node:fs";
import type { ZodIssue } from "zod";
import { appConfigSchema, type AppConfig, type ChainConfig } from "../../config/schema";
import { validateTopology } from "../../config/validate";
import type { ChainId, Hex } from "../../domain";

export const CONFIG_PATH_ENV = "GATEWAY_BALANCER_CONFIG";
export const PRIVATE_KEY_ENV = "BALANCER_PRIVATE_KEY";
export const DEFAULT_CONFIG_PATH = "config/config.json";

export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly problems: string[]
  ) {
    super(`${message}:\n  - ${problems.join("\n  - ")}`);
    this.name = "ConfigError";
  }
}

/** Secrets resolved from the environment. Never part of `AppConfig`, never logged, journaled or notified. */
export interface Secrets {
  privateKey: Hex | null;
  rpcUrls: ReadonlyMap<ChainId, string>;
  slackWebhookUrl: string | null;
}

/** `topology.pairs[0].foreignGateway`. */
export function jsonPath(path: ReadonlyArray<string | number>): string {
  return path.reduce<string>(
    (acc, part) => (typeof part === "number" ? `${acc}[${part}]` : acc ? `${acc}.${part}` : part),
    ""
  );
}

function describeIssue(issue: ZodIssue): string {
  return `${jsonPath(issue.path) || "(root)"}: ${issue.message}`;
}

/** Parses and validates a configuration value (the file's JSON). Throws `ConfigError` naming each JSON path. */
export function parseConfig(raw: unknown): AppConfig {
  const result = appConfigSchema.safeParse(raw);
  // The secret-name check also reads the file as written, so a lane schema that rejects or strips an entry cannot
  // hide a collision: it is reported beside the schema's own issues.
  const rawSecretNames = secretVariableProblems(raw);
  if (!result.success) {
    const problems = [...result.error.issues.map(describeIssue), ...rawSecretNames];
    throw new ConfigError("invalid configuration", [...new Set(problems)]);
  }
  const problems = validateTopology(result.data.topology);
  if (problems.length > 0) throw new ConfigError("invalid topology", problems);
  const secretNames = [...new Set([...secretVariableProblems(result.data), ...rawSecretNames])];
  if (secretNames.length > 0) throw new ConfigError("invalid secret variable names", secretNames);
  return result.data;
}

/**
 * Each secret has its own variable (decisions [L33], [L38]): every key of the composed configuration whose name ends
 * in `Env` names an environment variable, and none may name the private key's variable, the configuration path
 * variable, a topology `rpcUrlEnv` or the Slack webhook variable unless it is that key itself. Otherwise one secret
 * would be sent where another is expected (a key posted as a webhook URL, an RPC URL sent as a price API key).
 */
export function secretVariableProblems(config: unknown): string[] {
  const problems: string[] = [];
  const reserved = new Map<string, string>([
    [PRIVATE_KEY_ENV, "the private key"],
    [CONFIG_PATH_ENV, "the configuration path"],
  ]);
  const claim = (path: string, name: string, what: string) => {
    const owner = reserved.get(name);
    if (owner) problems.push(`${path}: ${name} is already the variable of ${owner}`);
    else reserved.set(name, what);
  };
  // `config` may be the unparsed file: read it defensively.
  const app = (config ?? {}) as Partial<AppConfig>;
  const claimed = new Set<string>();
  const chains: unknown = app.topology?.chains;
  if (Array.isArray(chains)) {
    chains.forEach((chain: Partial<ChainConfig> | null, i) => {
      if (typeof chain?.rpcUrlEnv !== "string") return;
      const path = `topology.chains[${i}].rpcUrlEnv`;
      claimed.add(path);
      claim(path, chain.rpcUrlEnv, `the RPC URL of chain ${chain.name}`);
    });
  }
  const slack = app.platform?.notifications?.providers?.slack;
  if (typeof slack?.webhookUrlEnv === "string") {
    const path = "platform.notifications.providers.slack.webhookUrlEnv";
    claimed.add(path);
    claim(path, slack.webhookUrlEnv, "the Slack webhook URL");
  }
  // Every other `*Env` key, in any lane's section: it may share a name with another non-reserved key (two price
  // providers reading one API key), never with a reserved one.
  const walk = (value: unknown, path: Array<string | number>) => {
    if (Array.isArray(value)) return value.forEach((item, i) => walk(item, [...path, i]));
    if (value === null || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      const childPath = [...path, key];
      if (key.endsWith("Env") && typeof child === "string") {
        const at = jsonPath(childPath);
        const owner = reserved.get(child);
        if (!claimed.has(at) && owner) problems.push(`${at}: ${child} is already the variable of ${owner}`);
      } else walk(child, childPath);
    }
  };
  walk(config, []);
  return problems;
}

export function loadConfigFile(path: string): AppConfig {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    throw new ConfigError("cannot read the configuration file", [`${path}: ${(error as Error).message}`]);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw new ConfigError("the configuration file is not JSON", [`${path}: ${(error as Error).message}`]);
  }
  return parseConfig(raw);
}

/**
 * Resolves the secrets the configuration names. With `required` every chain's RPC variable and the key must be
 * set (and the Slack webhook when Slack is enabled); otherwise missing values stay null or absent. Error
 * messages name the variable, never its value.
 */
export function resolveSecrets(config: AppConfig, env: NodeJS.ProcessEnv, required: boolean): Secrets {
  const problems: string[] = [];
  const rpcUrls = new Map<ChainId, string>();
  for (const chain of config.topology.chains) {
    const url = env[chain.rpcUrlEnv];
    if (url) rpcUrls.set(chain.id, url);
    else if (required)
      problems.push(`missing environment variable ${chain.rpcUrlEnv} (RPC URL of chain ${chain.name})`);
  }
  let privateKey: Hex | null = null;
  const key = env[PRIVATE_KEY_ENV];
  if (key) {
    const normalized = key.startsWith("0x") ? key : `0x${key}`;
    if (/^0x[0-9a-fA-F]{64}$/.test(normalized)) privateKey = normalized as Hex;
    else problems.push(`${PRIVATE_KEY_ENV} is not a 32-byte hex private key`);
  } else if (required) problems.push(`missing environment variable ${PRIVATE_KEY_ENV}`);
  const slack = config.platform.notifications.providers.slack;
  const slackWebhookUrl = env[slack.webhookUrlEnv] || null;
  if (slack.enabled && !slackWebhookUrl && required) {
    problems.push(`missing environment variable ${slack.webhookUrlEnv} (Slack is enabled)`);
  }
  if (problems.length > 0) throw new ConfigError("invalid environment", problems);
  return { privateKey, rpcUrls, slackWebhookUrl };
}

export interface LoadedConfig {
  config: AppConfig;
  secrets: Secrets;
}

/** The configuration file named by `GATEWAY_BALANCER_CONFIG` plus the secrets from `env`. */
export function loadConfig(env: NodeJS.ProcessEnv, options: { requireSecrets: boolean }): LoadedConfig {
  const config = loadConfigFile(env[CONFIG_PATH_ENV] || DEFAULT_CONFIG_PATH);
  return { config, secrets: resolveSecrets(config, env, options.requireSecrets) };
}

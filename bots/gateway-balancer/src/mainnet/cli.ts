/**
 * Writes `config/mainnet.json` for the Veashi gateways on Base and Arbitrum (decisions [O14]). Run from the repository
 * root after the operator's deploy:
 *
 *   yarn workspace @kleros/gateway-balancer-bot exec tsx src/mainnet/cli.ts
 *     [--deployments <dir>]        default: ../../contracts/deployments (relative to bots/gateway-balancer)
 *     [--foreign-gateway 0x…]      instead of <dir>/base/VeashiForeignGateway.json
 *     [--home-gateway 0x…]         instead of <dir>/arbitrum/VeashiHomeGateway.json
 *     [--out <path>]               default: config/mainnet.json (never committed, see .gitignore)
 *     [--check]                    validate and print the configuration, write nothing
 *
 * Reads no chain, no key and no environment variable. Exit code 0 on success, 1 on an invalid input, 2 on usage.
 */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { generateMainnetConfig, serializeConfig, writeMainnetConfig } from "./generate";

export const DEFAULT_DEPLOYMENTS_DIR = "../../contracts/deployments";
export const DEFAULT_OUT = "config/mainnet.json";

const VALUE_FLAGS = ["--deployments", "--foreign-gateway", "--home-gateway", "--out"] as const;

export interface CliOptions {
  deploymentsDir: string;
  foreignGateway?: string;
  homeGateway?: string;
  out: string;
  check: boolean;
}

export function parseArgs(argv: string[]): CliOptions {
  const values = new Map<string, string>();
  let check = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--check") check = true;
    else if ((VALUE_FLAGS as readonly string[]).includes(arg) && argv[i + 1] !== undefined) values.set(arg, argv[++i]);
    else throw new UsageError(`unknown or incomplete argument ${arg}`);
  }
  return {
    deploymentsDir: values.get("--deployments") ?? DEFAULT_DEPLOYMENTS_DIR,
    foreignGateway: values.get("--foreign-gateway"),
    homeGateway: values.get("--home-gateway"),
    out: values.get("--out") ?? DEFAULT_OUT,
    check,
  };
}

export class UsageError extends Error {}

export function runCli(argv: string[], out: (line: string) => void, err: (line: string) => void): number {
  let options: CliOptions;
  try {
    options = parseArgs(argv);
  } catch (error) {
    err(`mainnet config: ${(error as Error).message}`);
    return 2;
  }
  try {
    const { raw } = generateMainnetConfig({
      deploymentsDir: resolve(options.deploymentsDir),
      foreignGateway: options.foreignGateway,
      homeGateway: options.homeGateway,
    });
    if (options.check) {
      out(serializeConfig(raw).trimEnd());
      return 0;
    }
    writeMainnetConfig(resolve(options.out), raw);
    out(`mainnet config: wrote ${options.out}; check it with GATEWAY_BALANCER_CONFIG=${options.out} … status`);
    return 0;
  } catch (error) {
    err(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = runCli(process.argv.slice(2), console.log, console.error);
}

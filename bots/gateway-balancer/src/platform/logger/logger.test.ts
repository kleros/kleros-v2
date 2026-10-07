import { describe, expect, it } from "vitest";
import { Redactor } from "../redact";
import { JsonLogger } from "./logger";

const KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC = "https://arb-mainnet.example.io/v2/RPCKEY1234567890";
const WEBHOOK = "https://hooks.slack.com/services/T0/B0/WEBHOOKSECRET99";
const env = { BALANCER_PRIVATE_KEY: KEY, ARBITRUM_RPC_URL: RPC, SLACK_WEBHOOK_URL: WEBHOOK, PATH: "/usr/bin" };

function capture(level: "debug" | "info" = "debug") {
  const lines: string[] = [];
  const logger = new JsonLogger({
    redact: Redactor.fromEnv(env).text,
    write: (line) => lines.push(line),
    level,
    now: () => new Date("2026-01-01T00:00:00Z"),
  });
  return { logger, lines };
}

function assertClean(lines: string[]) {
  for (const line of lines) {
    expect(line).not.toContain(KEY);
    expect(line).not.toContain(KEY.slice(2));
    expect(line).not.toContain("RPCKEY1234567890");
    expect(line).not.toContain("arb-mainnet.example.io");
    expect(line).not.toContain("WEBHOOKSECRET99");
  }
}

describe("JsonLogger", () => {
  it("writes one JSON object per line with level, message and time", () => {
    const { logger, lines } = capture();
    logger.info("started", { loops: 3, amount: 10n ** 21n, at: new Date("2026-01-01T00:00:00Z") });
    logger.warn("careful");
    expect(lines).toHaveLength(2);
    for (const line of lines) expect(line.endsWith("\n")).toBe(true);
    expect(JSON.parse(lines[0]!)).toEqual({
      time: "2026-01-01T00:00:00.000Z",
      level: "info",
      msg: "started",
      loops: 3,
      amount: "1000000000000000000000",
      at: "2026-01-01T00:00:00.000Z",
    });
    expect(JSON.parse(lines[1]!)).toMatchObject({ level: "warn", msg: "careful" });
  });

  it("never writes the key, an RPC URL or the webhook, as fields, nested values or inside errors", () => {
    const { logger, lines } = capture();
    logger.info(`connecting to ${RPC} with ${KEY}`);
    logger.error("boom", {
      key: KEY,
      bareKey: KEY.slice(2),
      rpc: RPC,
      nested: { deeper: [WEBHOOK, { url: RPC.toUpperCase() }] },
      error: new Error(`request to ${RPC} failed; posted to ${WEBHOOK}`),
    });
    logger.child({ rpc: RPC }).debug("child", { hook: WEBHOOK });
    assertClean(lines);
    expect(lines.join("")).toContain("[redacted");
    expect(JSON.parse(lines[1]!).error).toEqual({ name: "Error", message: expect.stringContaining("[redacted") });
  });

  it("merges child bindings, the call's fields winning", () => {
    const { logger, lines } = capture();
    const child = logger.child({ component: "executor", chainId: 1 }).child({ chainId: 2 });
    child.info("sent", { key: "op:1:step:send" });
    child.info("override", { component: "other" });
    expect(JSON.parse(lines[0]!)).toMatchObject({ component: "executor", chainId: 2, key: "op:1:step:send" });
    expect(JSON.parse(lines[1]!)).toMatchObject({ component: "other", chainId: 2 });
  });

  it("drops entries below the configured level", () => {
    const { logger, lines } = capture("info");
    logger.debug("hidden");
    logger.info("shown");
    expect(lines.map((l) => JSON.parse(l).msg)).toEqual(["shown"]);
  });
});

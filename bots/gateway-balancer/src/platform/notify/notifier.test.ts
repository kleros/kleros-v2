import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import type { Notification } from "../../domain";
import { FakeClock } from "../../testing/fakeClock";
import { FakeJournal } from "../../testing/fakeJournal";
import { FakeLogger } from "../../testing/fakeLogger";
import { exampleConfig, exampleTopology } from "../../testing/ports";
import { SqliteJournal, type Ownership } from "../journal/sqliteJournal";
import { Redactor } from "../redact";
import { PlatformNotifier, type NotificationProvider } from "./notifier";
import { SlackProvider } from "./slack";

const WEBHOOK = "https://hooks.slack.com/services/T000/B000/SECRETWEBHOOKTOKEN";
const RPC = "https://arb.example.io/v2/RPCSECRET123456";
const redactor = new Redactor([WEBHOOK, RPC]);

interface Call {
  url: string;
  body: Record<string, unknown>;
}

function recordingFetch(calls: Call[], status = 200): typeof globalThis.fetch {
  return async (input, init) => {
    calls.push({ url: String(input), body: JSON.parse(String(init?.body)) as Record<string, unknown> });
    return new Response("ok", { status });
  };
}

function setup(
  platform: Record<string, unknown>,
  options: { fetch?: typeof globalThis.fetch; extra?: NotificationProvider[] } = {}
) {
  const config = exampleConfig({ platform } as never);
  const clock = new FakeClock();
  const journal = new FakeJournal(() => clock.now());
  const calls: Call[] = [];
  const slackConfig = config.platform.notifications.providers.slack;
  const slack = new SlackProvider(
    slackConfig.enabled,
    slackConfig.minSeverity,
    WEBHOOK,
    config.topology,
    options.fetch ?? recordingFetch(calls)
  );
  const notifier = new PlatformNotifier({
    journal,
    clock,
    logger: new FakeLogger(),
    redact: redactor.text,
    providers: [slack, ...(options.extra ?? [])],
    minSeverity: config.platform.notifications.minSeverity,
    dedupWindowSeconds: config.platform.notifications.dedupWindowSeconds,
  });
  return { notifier, journal, clock, calls };
}

const base: Notification = {
  severity: "warning",
  title: "Reporter low",
  body: "reporter balance below threshold",
  dedupKey: "reporter-low:home->eth-home",
  routeId: "home->eth-home",
  pairId: "eth-home",
  chainId: 1003,
  operationId: "op-7",
  txHashes: ["0xabc"],
  action: "Top up the reporter",
};

const slackOn = { notifications: { providers: { slack: { enabled: true } } } };

describe("PlatformNotifier", () => {
  it("journals every notification even when no provider is enabled", async () => {
    const { notifier, journal, calls } = setup({});
    await notifier.notify(base);
    expect(calls).toEqual([]);
    const [entry] = await journal.listNotifications();
    expect(entry).toMatchObject({
      delivered: false,
      providers: [],
      suppressed: "no provider enabled for this severity",
    });
    expect(entry?.notification.title).toBe("Reporter low");
  });

  it("applies the global severity floor and the per-provider floor from configuration", async () => {
    const { notifier, journal, calls } = setup({
      notifications: { minSeverity: "warning", providers: { slack: { enabled: true, minSeverity: "critical" } } },
    });
    await notifier.notify({ ...base, severity: "info", dedupKey: "a" });
    await notifier.notify({ ...base, severity: "warning", dedupKey: "b" });
    await notifier.notify({ ...base, severity: "critical", dedupKey: "c" });
    expect(calls).toHaveLength(1);
    const log = (await journal.listNotifications()).reverse();
    expect(log.map((e) => [e.notification.dedupKey, e.delivered, e.suppressed])).toEqual([
      ["a", false, "filtered: below warning"],
      ["b", false, "no provider enabled for this severity"],
      ["c", true, null],
    ]);
  });

  it("toggles each provider independently", async () => {
    const sent: string[] = [];
    const other: NotificationProvider = {
      name: "other",
      enabled: true,
      minSeverity: "info",
      send: async (n) => {
        sent.push(n.dedupKey);
      },
    };
    const { notifier, calls, journal } = setup({}, { extra: [other] });
    await notifier.notify(base);
    expect(calls).toHaveLength(0);
    expect(sent).toEqual([base.dedupKey]);
    expect((await journal.listNotifications())[0]?.providers).toEqual(["other"]);
  });

  it("deduplicates through Journal.shouldNotify within the configured window", async () => {
    const { notifier, journal, clock, calls } = setup({
      notifications: { dedupWindowSeconds: 600, ...slackOn.notifications },
    });
    await notifier.notify(base);
    clock.advance(60_000);
    await notifier.notify(base);
    clock.advance(600_000);
    await notifier.notify(base);
    expect(calls).toHaveLength(2);
    const log = (await journal.listNotifications()).reverse();
    expect(log.map((e) => e.suppressed)).toEqual([null, "deduplicated", null]);
  });

  it("writes no dedup row unless a provider was enabled for the severity and attempted delivery (L35)", async () => {
    const { notifier, journal, calls } = setup({
      notifications: { providers: { slack: { enabled: true, minSeverity: "critical" } } },
    });
    // No provider takes a warning: journaled, but the key is not marked as notified.
    await notifier.notify({ ...base, severity: "warning", dedupKey: "attention:op-9" });
    await notifier.notify({ ...base, severity: "warning", dedupKey: "attention:op-9" });
    expect(calls).toHaveLength(0);
    // The same key escalated to critical reaches Slack at once, not deduplicated against the undelivered ones.
    await notifier.notify({ ...base, severity: "critical", dedupKey: "attention:op-9" });
    expect(calls).toHaveLength(1);
    const log = (await journal.listNotifications()).reverse();
    expect(log.map((e) => [e.delivered, e.suppressed])).toEqual([
      [false, "no provider enabled for this severity"],
      [false, "no provider enabled for this severity"],
      [true, null],
    ]);
    // Only the attempted delivery recorded the hit: the next occurrence inside the window is deduplicated.
    await notifier.notify({ ...base, severity: "critical", dedupKey: "attention:op-9" });
    expect(calls).toHaveLength(1);
  });

  it("redacts title, body and action before any provider sees them", async () => {
    const seen: Notification[] = [];
    const spy: NotificationProvider = {
      name: "spy",
      enabled: true,
      minSeverity: "info",
      send: async (n) => {
        seen.push(n);
      },
    };
    const { notifier, calls, journal } = setup(slackOn, { extra: [spy] });
    await notifier.notify({
      ...base,
      title: `RPC ${RPC} down`,
      body: `request to ${RPC} failed; webhook ${WEBHOOK}`,
      action: `check ${RPC}`,
    });
    const everything = JSON.stringify([calls.map((c) => c.body), seen, await journal.listNotifications()]);
    expect(everything).not.toContain("RPCSECRET");
    expect(everything).not.toContain("SECRETWEBHOOKTOKEN");
    expect(JSON.stringify(calls.map((c) => c.body))).not.toContain("arb.example.io");
    expect(seen[0]?.body).toContain("[redacted");
  });

  it("sends the Slack payload with pair, route, chain, operation, explorer links and action", async () => {
    const { notifier, calls } = setup(slackOn);
    const topology = exampleTopology();
    topology.chains = topology.chains.map((c) =>
      c.id === 1003 ? { ...c, explorerTxUrl: "https://explorer.test/tx/{hash}" } : c
    );
    const config = exampleConfig({ topology });
    const slack = new SlackProvider(true, "info", WEBHOOK, config.topology, recordingFetch(calls));
    await notifier.notify(base);
    await slack.send(base);
    expect(calls[0]?.url).toBe(WEBHOOK);
    for (const call of calls) {
      const text = JSON.stringify(call.body);
      expect(text).toContain("Reporter low");
      expect(text).toContain("reporter balance below threshold");
      expect(text).toContain("*Pair:* eth-home");
      expect(text).toContain("*Route:* home->eth-home");
      expect(text).toContain("*Chain:* home (1003)");
      expect(text).toContain("*Operation:* op-7");
      expect(text).toContain("*Action:* Top up the reporter");
      expect(text).toContain("WARNING");
    }
    expect(JSON.stringify(calls[0]?.body)).toContain("0xabc");
    expect(JSON.stringify(calls[1]?.body)).toContain("<https://explorer.test/tx/0xabc>");
  });

  it("never propagates a provider error and journals it as not delivered", async () => {
    const failing: typeof globalThis.fetch = async () => {
      throw new TypeError(`fetch failed for ${WEBHOOK}`);
    };
    const { notifier, journal } = setup(slackOn, { fetch: failing });
    await expect(notifier.notify(base)).resolves.toBeUndefined();
    const [entry] = await journal.listNotifications();
    expect(entry?.delivered).toBe(false);
    expect(entry?.suppressed).toMatch(/^provider error: slack: request failed/);
    expect(JSON.stringify(entry)).not.toContain("SECRETWEBHOOKTOKEN");

    const { notifier: rejecting, journal: journal2 } = setup(slackOn, { fetch: recordingFetch([], 500) });
    await rejecting.notify(base);
    expect((await journal2.listNotifications())[0]?.suppressed).toBe("provider error: slack: Slack responded 500");
  });

  it("undoes the dedup hit when every provider failed, so the next occurrence is delivered (S-6)", async () => {
    let fail = true;
    const calls: Call[] = [];
    const fetch: typeof globalThis.fetch = async (input, init) => {
      if (fail) throw new TypeError("fetch failed");
      return recordingFetch(calls)(input, init);
    };
    const { notifier, journal, clock } = sqliteSetup(fetch);
    const critical: Notification = { ...base, severity: "critical", dedupKey: "attention:op-9" };
    await notifier.notify(critical);
    expect(calls).toHaveLength(0);
    clock.advance(60_000);
    fail = false;
    await notifier.notify(critical);
    expect(calls).toHaveLength(1);
    // Once delivered, the window applies again.
    clock.advance(60_000);
    await notifier.notify(critical);
    expect(calls).toHaveLength(1);
    const log = (await journal.listNotifications()).reverse();
    expect(log.map((e) => [e.delivered, e.suppressed?.split(":")[0] ?? null])).toEqual([
      [false, "provider error"],
      [true, null],
      [false, "deduplicated"],
    ]);
    await journal.close();
  });

  it("delivers the lost-ownership critical after another instance took over the owner row (L21)", async () => {
    const calls: Call[] = [];
    const { notifier, journal, clock, path } = sqliteSetup(recordingFetch(calls));
    const successor = SqliteJournal.open(path, owner({ staleAfterMs: 0 }), { redactor });
    expect(journal.heartbeat()).toBe("lost");
    await expect(journal.recordObservation("x", 1, clock.now())).rejects.toThrow(/lost ownership/);
    const lost: Notification = {
      severity: "critical",
      title: "Balancer instance lost journal ownership",
      body: "another instance owns the journal",
      dedupKey: "ownership-lost:1",
    };
    await expect(notifier.notify(lost)).resolves.toBeUndefined();
    expect(calls).toHaveLength(1);
    expect(JSON.stringify(calls[0]?.body)).toContain("lost journal ownership");
    // The in-memory window still deduplicates while the journal is fenced out.
    await notifier.notify(lost);
    expect(calls).toHaveLength(1);
    // Nothing was written beside the successor.
    expect(await successor.listNotifications()).toEqual([]);
    await journal.close();
    await successor.close();
  });
});

const tmp = mkdtempSync(join(tmpdir(), "gb-notifier-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

function owner(overrides: Partial<Ownership> = {}): Ownership {
  return { instanceId: randomUUID(), pid: process.pid, startedAt: new Date(), staleAfterMs: 60_000, ...overrides };
}

/** The notifier as `createPlatform` wires it: a SqliteJournal and its `forgetNotifyHit`, Slack enabled. */
function sqliteSetup(fetch: typeof globalThis.fetch) {
  const clock = new FakeClock();
  const path = join(tmp, `${randomUUID()}.sqlite`);
  const journal = SqliteJournal.open(path, owner(), { redactor, now: () => clock.now() });
  const config = exampleConfig({ platform: slackOn } as never);
  const notifier = new PlatformNotifier({
    journal,
    clock,
    logger: new FakeLogger(),
    redact: redactor.text,
    providers: [new SlackProvider(true, "info", WEBHOOK, config.topology, fetch)],
    minSeverity: "info",
    dedupWindowSeconds: 600,
    forgetHit: (key, at) => journal.forgetNotifyHit(key, at),
  });
  return { notifier, journal, clock, path };
}

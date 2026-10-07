import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { zeroAddress, type Transport } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { AppConfig } from "../config/schema";
import type { ChainId, Loop } from "../domain";
import type { ChainClient, Clock, CorePorts, CreatePlatform, Platform } from "../ports";
import { Scheduler, intervalResolver } from "./app/scheduler";
import { chainTransport, ViemChainClient } from "./chains/chainClient";
import { systemClock } from "./clock";
import { loadConfig, type Secrets } from "./config/load";
import { PlatformExecutor, type ExecutorChain } from "./executor/executor";
import { ViemExecutorRpc } from "./executor/rpc";
import { createTimedFetch } from "./fetch";
import { createGasMonitor } from "./gas/gasMonitor";
import { collectStatus, startHealthServer, statusJson, type HealthServer } from "./health/health";
import { inertChainClients, inertExecutor } from "./inert";
import { SqliteJournal } from "./journal/sqliteJournal";
import { JsonLogger } from "./logger/logger";
import { LogOnlyNotifier, PlatformNotifier } from "./notify/notifier";
import { SlackProvider } from "./notify/slack";
import { reconcile } from "./reconcile/reconcile";
import { Redactor, secretEnvValues } from "./redact";

export const COMMANDS = ["start", "status", "reconcile"] as const;
export type Command = (typeof COMMANDS)[number];

export interface PlatformOverrides {
  /** Where `status` and `reconcile` print their JSON (default: stdout). */
  stdout?: (text: string) => void;
  /** Where JSON log lines go (default: stderr). */
  logWrite?: (line: string) => void;
  /** Per-chain transport instead of HTTP to the configured RPC URL (tests). */
  transports?: ReadonlyMap<ChainId, Transport>;
  clock?: Clock;
  fetch?: typeof globalThis.fetch;
  /** Install SIGTERM/SIGINT handlers in `start` (default true). */
  handleSignals?: boolean;
}

export interface PlatformHandle extends Platform {
  readonly command: Command;
  /** Requests shutdown (what SIGTERM does). */
  stop(): void;
  /** The health server port once `start` is running. */
  healthPort(): number | null;
}

function parseCommand(argv: string[]): Command {
  const command = argv[0] ?? "start";
  if (!(COMMANDS as readonly string[]).includes(command)) {
    throw new Error(`unknown command "${command}"; expected one of ${COMMANDS.join(", ")}`);
  }
  return command as Command;
}

function redactorFor(config: AppConfig, env: NodeJS.ProcessEnv, secrets: Secrets): Redactor {
  const names = [
    ...config.topology.chains.map((c) => c.rpcUrlEnv),
    config.platform.notifications.providers.slack.webhookUrlEnv,
  ];
  return new Redactor([
    ...secretEnvValues(env, names),
    secrets.privateKey,
    secrets.slackWebhookUrl,
    ...secrets.rpcUrls.values(),
  ]);
}

/**
 * Platform lane: config and secrets, logger, journal (node:sqlite), chain clients, executor, reconciliation,
 * notifier, health. `status` builds the same `CorePorts` shape with inert placeholders and a read-only journal, so
 * it needs neither the key nor any RPC variable.
 */
export const createPlatform: CreatePlatform = (env, argv) => buildPlatform(env, argv);

export async function buildPlatform(
  env: NodeJS.ProcessEnv,
  argv: string[],
  overrides: PlatformOverrides = {}
): Promise<PlatformHandle> {
  const command = parseCommand(argv);
  return command === "status" ? buildStatusPlatform(env, overrides) : buildRunningPlatform(env, command, overrides);
}

function buildStatusPlatform(env: NodeJS.ProcessEnv, overrides: PlatformOverrides): PlatformHandle {
  const { config, secrets } = loadConfig(env, { requireSecrets: false });
  const redactor = redactorFor(config, env, secrets);
  const logger = new JsonLogger({ redact: redactor.text, write: overrides.logWrite });
  const clock = overrides.clock ?? systemClock;
  const journal = SqliteJournal.openReadOnly(config.platform.journalPath, { redactor });
  const signer = secrets.privateKey ? privateKeyToAccount(secrets.privateKey).address : zeroAddress;
  const ports: CorePorts = {
    config,
    logger,
    clock,
    journal,
    chains: inertChainClients(config.topology),
    executor: inertExecutor(signer),
    notifier: new LogOnlyNotifier(logger),
    signer,
    fetch: createTimedFetch(config.platform.http.timeoutMs, overrides.fetch),
  };
  const stdout = overrides.stdout ?? ((text: string) => void process.stdout.write(text));
  return {
    command: "status",
    ports,
    stop: () => undefined,
    healthPort: () => null,
    async run(_loops, runArgv) {
      if (parseCommand(runArgv) !== "status") throw new Error("this platform was created for status");
      try {
        stdout(`${statusJson(await collectStatus(journal, clock.now()), 2)}\n`);
        return 0;
      } finally {
        await journal.close();
      }
    },
  };
}

async function buildRunningPlatform(
  env: NodeJS.ProcessEnv,
  command: Command,
  overrides: PlatformOverrides
): Promise<PlatformHandle> {
  const { config, secrets } = loadConfig(env, { requireSecrets: true });
  const settings = config.platform;
  const redactor = redactorFor(config, env, secrets);
  const redact = redactor.text;
  const logger = new JsonLogger({ redact, write: overrides.logWrite });
  const clock = overrides.clock ?? systemClock;
  const shutdown = new AbortController();

  if (settings.journalPath !== ":memory:") mkdirSync(dirname(settings.journalPath), { recursive: true });
  const journal = SqliteJournal.open(
    settings.journalPath,
    {
      instanceId: randomUUID(),
      pid: process.pid,
      startedAt: new Date(),
      staleAfterMs: settings.ownership.staleAfterMs,
    },
    { redactor },
    // The owner row is taken at the start of `run`, so a lane factory that throws before it holds nothing.
    { acquire: false }
  );

  const fetch = createTimedFetch(settings.http.timeoutMs, overrides.fetch);
  const slack = settings.notifications.providers.slack;
  const notifier = new PlatformNotifier({
    journal,
    clock,
    logger: logger.child({ component: "notifier" }),
    redact,
    providers: [new SlackProvider(slack.enabled, slack.minSeverity, secrets.slackWebhookUrl, config.topology, fetch)],
    minSeverity: settings.notifications.minSeverity,
    dedupWindowSeconds: settings.notifications.dedupWindowSeconds,
    forgetHit: (dedupKey, at) => journal.forgetNotifyHit(dedupKey, at),
  });

  const account = privateKeyToAccount(secrets.privateKey!);
  const transportFor = (chainId: ChainId): Transport =>
    overrides.transports?.get(chainId) ?? chainTransport(secrets.rpcUrls.get(chainId)!);
  const chains = new Map<ChainId, ChainClient>();
  const executorChains = new Map<ChainId, ExecutorChain>();
  for (const chain of config.topology.chains) {
    chains.set(chain.id, new ViemChainClient(chain.id, transportFor(chain.id), redact));
    executorChains.set(chain.id, {
      chainId: chain.id,
      name: chain.name,
      confirmations: chain.confirmations,
      rpc: new ViemExecutorRpc(transportFor(chain.id), redact, chain.id),
    });
  }
  const executor = new PlatformExecutor({
    account,
    chains: executorChains,
    journal,
    clock,
    logger: logger.child({ component: "executor" }),
    notifier,
    redact,
    signal: shutdown.signal,
    options: settings.executor,
  });
  const ports: CorePorts = {
    config,
    logger,
    clock,
    journal,
    chains,
    executor,
    notifier,
    signer: account.address,
    fetch,
  };
  const stdout = overrides.stdout ?? ((text: string) => void process.stdout.write(text));
  let health: HealthServer | null = null;

  async function run(loops: Loop[], runArgv: string[]): Promise<number> {
    const runCommand = parseCommand(runArgv);
    if (runCommand !== command) throw new Error(`this platform was created for ${command}, not ${runCommand}`);
    try {
      journal.acquire();
    } catch (error) {
      await journal.close();
      throw error;
    }
    let exitCode = 0;
    // The lost-ownership critical is awaited before the journal closes; the notifier delivers it although every
    // journal write of this instance is now fenced out.
    let lostNotice: Promise<void> = Promise.resolve();
    const heartbeat = setInterval(() => {
      try {
        if (journal.heartbeat() === "lost") {
          clearInterval(heartbeat);
          exitCode = 1;
          logger.error("another instance took over the journal; stopping");
          lostNotice = notifier.notify({
            severity: "critical",
            title: "Balancer instance lost journal ownership",
            body:
              `Another instance now owns the journal at ${settings.journalPath}; this instance ` +
              `(pid ${process.pid}) stops ticking and exits.`,
            dedupKey: `ownership-lost:${process.pid}`,
            action: 'Make sure exactly one balancer instance runs against this volume (README: "Single instance").',
          });
          shutdown.abort();
        }
      } catch (error) {
        logger.warn("heartbeat failed", { error });
      }
    }, settings.ownership.heartbeatMs);
    heartbeat.unref();
    const onSignal = (signal: NodeJS.Signals) => {
      logger.info("shutdown requested", { signal });
      shutdown.abort();
    };
    const handleSignals = overrides.handleSignals ?? true;
    if (handleSignals) {
      process.once("SIGTERM", onSignal);
      process.once("SIGINT", onSignal);
    }
    try {
      const report = await reconcile({ journal, executor, notifier, logger: logger.child({ component: "reconcile" }) });
      if (command === "reconcile") {
        stdout(`${JSON.stringify(report, null, 2)}\n`);
        return exitCode;
      }
      if (shutdown.signal.aborted) return exitCode;
      if (settings.health.enabled) {
        health = await startHealthServer({
          host: settings.health.host,
          port: settings.health.port,
          journal,
          now: () => clock.now(),
          logger,
        });
        logger.info("health endpoint listening", { host: settings.health.host, port: health.port });
      }
      const gasMonitor = createGasMonitor({
        topology: config.topology,
        reserveRpc: new Map([...executorChains].map(([id, chain]) => [id, chain.rpc])),
        journal,
        notifier,
        logger: logger.child({ component: "gas" }),
        signer: account.address,
        minimumFor: (chainId) =>
          settings.gas.minimumReserveWei[String(chainId)] ?? settings.gas.defaultMinimumReserveWei,
      });
      const scheduler = new Scheduler([...loops, gasMonitor], {
        clock,
        logger: logger.child({ component: "scheduler" }),
        signal: shutdown.signal,
        intervalFor: intervalResolver(
          { ...settings.schedule.intervalsMs, [gasMonitor.id]: settings.gas.intervalMs },
          settings.schedule.defaultIntervalMs
        ),
        suspendedIntervalMs: settings.schedule.suspendedIntervalMs,
        backoff: settings.schedule.backoff,
      });
      logger.info("started", { loops: loops.map((l) => l.id), signer: account.address });
      const running = scheduler.run();
      await new Promise<void>((resolve) => {
        if (shutdown.signal.aborted) resolve();
        else shutdown.signal.addEventListener("abort", () => resolve(), { once: true });
      });
      const stopped = await Promise.race([
        running.then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), settings.schedule.stopTimeoutMs).unref()),
      ]);
      if (!stopped) {
        logger.error("the in-flight tick did not finish within the stop timeout", {
          stopTimeoutMs: settings.schedule.stopTimeoutMs,
        });
        exitCode = 1;
      }
      return exitCode;
    } finally {
      clearInterval(heartbeat);
      await lostNotice;
      if (handleSignals) {
        process.off("SIGTERM", onSignal);
        process.off("SIGINT", onSignal);
      }
      if (health) await health.close();
      await journal.close();
      logger.info("stopped", { exitCode });
    }
  }

  return {
    command,
    ports,
    run,
    stop: () => shutdown.abort(),
    healthPort: () => health?.port ?? null,
  };
}

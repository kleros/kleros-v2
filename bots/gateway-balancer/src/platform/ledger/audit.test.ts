import { describe, expect, it } from "vitest";
import type { Address, ChainId } from "../../domain";
import type { FakeChainClient } from "../../testing/fakeChain";
import { EXAMPLE_ADDRESSES, EXAMPLE_CHAINS, makeFakePorts } from "../../testing/ports";
import type { ReserveRpc } from "../gas/reserve";
import { createLedgerAudit } from "./audit";

const FOREIGN = EXAMPLE_CHAINS.foreignEth;
const HOME = EXAMPLE_CHAINS.home;
const USDC = EXAMPLE_ADDRESSES.usdcOnForeignEth;
const WETH = EXAMPLE_ADDRESSES.wethOnHome;
const SCOPE = { kind: "arbitration" as const, pairId: "eth-home" };

function reserveRpc(client: FakeChainClient): ReserveRpc {
  return {
    getBlockNumber: () => client.getBlockNumber(),
    getBalance: (address) => client.getNativeBalance(address),
    getNonce: (address) => client.getTransactionCount(address, "latest"),
  };
}

function setup() {
  const ports = makeFakePorts();
  for (const chain of ports.chains.values()) chain.setNativeBalance(ports.signer, 10n ** 18n);
  const audit = createLedgerAudit({
    topology: ports.config.topology,
    chains: ports.chains,
    reserveRpc: new Map<ChainId, ReserveRpc>([...ports.chains].map(([id, client]) => [id, reserveRpc(client)])),
    journal: ports.journal,
    notifier: ports.notifier,
    logger: ports.logger,
    signer: ports.signer,
  });
  const tick = () => audit.tick({ now: ports.clock.now(), signal: new AbortController().signal });
  const credit = (
    chainId: ChainId,
    asset: Address | "native",
    amount: bigint,
    location: "eoa" | "in-transit" = "eoa"
  ) =>
    ports.journal.ledger.credit({
      scope: SCOPE,
      chainId,
      asset,
      location,
      amount,
      operationId: "op-1",
      reason: "seed",
    });
  const observed = async (chainId: ChainId, asset: string) =>
    (await ports.journal.observations(`ledger:${chainId}:${asset.toLowerCase()}`))[0]?.value as Record<string, unknown>;
  return { ports, tick, credit, observed };
}

describe("ledger audit", () => {
  it("records ok when the chain covers the ledger; a native surplus is the gas float", async () => {
    const { ports, tick, credit, observed } = setup();
    await credit(FOREIGN, "native", 4n * 10n ** 17n);
    await credit(FOREIGN, USDC, 500n);
    ports.chains.get(FOREIGN)!.setErc20Balance(USDC, ports.signer, 500n);
    expect(await tick()).toEqual({ status: "idle", summary: "ledger matches the chain" });
    expect(await observed(FOREIGN, "native")).toMatchObject({
      ledgerEoa: 4n * 10n ** 17n,
      onChain: 10n ** 18n,
      state: "ok",
    });
    expect(await observed(FOREIGN, USDC)).toMatchObject({
      symbol: "USDC",
      ledgerEoa: 500n,
      onChain: 500n,
      state: "ok",
    });
    // The wrapped native token is audited even with no holding.
    expect(await observed(HOME, WETH)).toMatchObject({ symbol: "WETH", ledgerEoa: 0n, onChain: 0n, state: "ok" });
    expect(ports.notifier.sent).toEqual([]);
  });

  it("raises one critical per chain and asset when the ledger holds more native than the EOA", async () => {
    const { ports, tick, credit, observed } = setup();
    await credit(FOREIGN, "native", 10n ** 18n + 1n);
    const result = await tick();
    expect(result.status).toBe("acted");
    expect(result.summary).toContain("over by 1");
    expect(await observed(FOREIGN, "native")).toMatchObject({ state: "over" });
    const critical = ports.notifier.sent.filter((n) => n.severity === "critical");
    expect(critical).toEqual([
      expect.objectContaining({
        title: "Ledger holds more ETH than the EOA on foreign-eth",
        dedupKey: `ledger-over:${FOREIGN}:native`,
        chainId: FOREIGN,
      }),
    ]);
    expect(critical[0]!.body).toContain("The executor refuses every transaction on foreign-eth");
  });

  it("counts in-transit holdings nowhere and other chains' holdings only on their chain", async () => {
    const { tick, credit, observed } = setup();
    await credit(FOREIGN, "native", 5n * 10n ** 18n, "in-transit");
    await credit(HOME, USDC, 7n);
    await tick();
    expect(await observed(FOREIGN, "native")).toMatchObject({ ledgerEoa: 0n, state: "ok" });
    // A token held on a chain where it is not a collected asset is audited there by its address.
    expect(await observed(HOME, USDC)).toMatchObject({
      symbol: `token ${USDC}`,
      ledgerEoa: 7n,
      onChain: 0n,
      state: "over",
    });
    expect(await observed(FOREIGN, USDC)).toMatchObject({ ledgerEoa: 0n, state: "ok" });
  });

  it("raises a critical when the ledger holds more of a token than the EOA", async () => {
    const { ports, tick, credit, observed } = setup();
    await credit(FOREIGN, USDC, 500n);
    ports.chains.get(FOREIGN)!.setErc20Balance(USDC, ports.signer, 499n);
    await tick();
    expect(await observed(FOREIGN, USDC)).toMatchObject({ ledgerEoa: 500n, onChain: 499n, state: "over" });
    expect(ports.notifier.sent).toEqual([
      expect.objectContaining({
        severity: "critical",
        title: "Ledger holds more USDC than the EOA on foreign-eth",
        dedupKey: `ledger-over:${FOREIGN}:${USDC.toLowerCase()}`,
      }),
    ]);
  });

  it("reports a token surplus as pending while an operation is open and warns when none is", async () => {
    const { ports, tick, observed } = setup();
    ports.chains.get(FOREIGN)!.setErc20Balance(USDC, ports.signer, 300n);
    const op = await ports.journal.createOperation({
      kind: "transfer",
      description: "t",
      scopes: [SCOPE],
      payload: null,
    });
    await tick();
    expect(await observed(FOREIGN, USDC)).toMatchObject({ state: "pending" });
    expect(ports.notifier.sent).toEqual([]);
    await ports.journal.updateOperation(op.id, { status: "completed" });
    await tick();
    expect(await observed(FOREIGN, USDC)).toMatchObject({ state: "untracked" });
    expect(ports.notifier.sent).toEqual([
      expect.objectContaining({
        severity: "warning",
        title: "USDC in the EOA that no scope holds on foreign-eth",
        dedupKey: `ledger-untracked:${FOREIGN}:${USDC.toLowerCase()}`,
      }),
    ]);
  });

  it("reports a failed read as a failed tick and still audits the other chains", async () => {
    const { ports, tick, observed } = setup();
    ports.chains.get(FOREIGN)!.getErc20Balance = async () => {
      throw new Error("rpc down");
    };
    const result = await tick();
    expect(result).toEqual({ status: "failed", summary: "foreign-eth: rpc down" });
    expect(await observed(HOME, WETH)).toMatchObject({ state: "ok" });
  });
});

import { describe, expect, it } from "vitest";
import { createGatewayAdapters } from "./gateway";
import { ABORTED } from "./platform/executor/executor";
import { createRatesLoops, createPriceOracle } from "./rates";
import { ABORTED_PREFIX } from "./rates/loop";
import { createRefillLoops } from "./refill";
import { isAborted as refillIsAborted } from "./refill/loop";
import { createReporterLoops } from "./reporter";
import { isAborted as reporterIsAborted } from "./reporter/loop";
import { FakePriceOracle, FakeRouteProvider, FakeTransfers, makeFakePorts } from "./testing";

/**
 * The composition root's contract: every lane factory returns loops with unique ids over the example
 * topology. Stubs return no loops, so this passes before any lane delivers and keeps passing after.
 */
describe("wiring", () => {
  it("builds loops with unique ids from every lane factory", () => {
    const ports = makeFakePorts();
    const priceOracle = new FakePriceOracle();
    const routeProvider = new FakeRouteProvider();
    const transfers = new FakeTransfers();
    const gateways = createGatewayAdapters(ports);
    const loops = [
      ...createRefillLoops(ports, { gateways, transfers, priceOracle }),
      ...createReporterLoops(ports, { gateways, transfers, routeProvider }),
      ...createRatesLoops(ports, { priceOracle }),
    ];
    const ids = loops.map((loop) => loop.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^(refill|reporter|rate):/);
  });

  it("exposes a price oracle that answers for every base symbol", async () => {
    const oracle = createPriceOracle(makeFakePorts());
    const result = await oracle.price("ETH");
    expect(["price", "unavailable"]).toContain(result.kind);
  });
});

/**
 * The `aborted:` contract in one run ([L70]): the executor's marker on every `failed` submit that never signed, as
 * the executor writes it, is what each lane's matcher reads as "retry, not a contract rejection".
 */
describe("the aborted: contract between the executor and the loops", () => {
  const executorForms = [
    `${ABORTED} shutdown requested before signing revertData=none`,
    `${ABORTED} the wait budget expired before signing revertData=none`,
    `${ABORTED} HTTP request failed revertData=none`,
    `${ABORTED} interrupted before signing revertData=none`,
    `${ABORTED} chain 999 is not configured; interrupted before signing revertData=none`,
  ];
  const rejections = [
    "execution reverted revertData=0x08c379a0",
    "chain 999 is not configured revertData=none",
    "reserve short on chain 8453 revertData=none",
  ];

  it("every lane matcher accepts the executor's forms and rejects a contract or chain rejection", () => {
    expect(ABORTED_PREFIX).toBe(ABORTED);
    for (const form of executorForms) {
      expect(form).toMatch(/^aborted: .* revertData=none$/);
      expect(form.startsWith(ABORTED_PREFIX)).toBe(true);
      expect(refillIsAborted(form)).toBe(true);
      expect(reporterIsAborted(form)).toBe(true);
    }
    for (const rejection of rejections) {
      expect(rejection.startsWith(ABORTED_PREFIX)).toBe(false);
      expect(refillIsAborted(rejection)).toBe(false);
      expect(reporterIsAborted(rejection)).toBe(false);
    }
  });
});

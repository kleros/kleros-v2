import { describe, expect, it } from "vitest";
import { createGatewayAdapters } from "./gateway";
import { createRatesLoops, createPriceOracle } from "./rates";
import { createRefillLoops } from "./refill";
import { createReporterLoops } from "./reporter";
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

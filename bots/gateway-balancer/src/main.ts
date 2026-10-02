/**
 * Composition root. Frozen: the wiring order and the factory types in `src/ports/factories.ts` are the
 * contract between lanes. Commands: `start` (run every loop), `status` (print health from the journal),
 * `reconcile` (startup reconciliation only, then exit).
 */
import { createGatewayAdapters } from "./gateway";
import { createRouteProvider, createTransfers } from "./lifi";
import { createPlatform } from "./platform";
import { createRatesLoops, createPriceOracle } from "./rates";
import { createRefillLoops } from "./refill";
import { createReporterLoops } from "./reporter";

async function main(): Promise<number> {
  const platform = await createPlatform(process.env);
  const { ports } = platform;
  const priceOracle = createPriceOracle(ports);
  const gateways = createGatewayAdapters(ports);
  const routeProvider = createRouteProvider(ports, { priceOracle });
  const transfers = createTransfers(ports, { routeProvider, priceOracle });
  const loops = [
    ...createRefillLoops(ports, { gateways, transfers, priceOracle }),
    ...createReporterLoops(ports, { gateways, transfers, routeProvider }),
    ...createRatesLoops(ports, { priceOracle }),
  ];
  return platform.run(loops, process.argv.slice(2));
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    process.exitCode = 1;
  }
);

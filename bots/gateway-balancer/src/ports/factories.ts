import type { Loop } from "../domain";
import type { CorePorts } from "./core";
import type { GatewayAdapters } from "./gateway";
import type { PriceOracle } from "./prices";
import type { RouteProvider } from "./routing";
import type { Transfers } from "./transfers";

/**
 * The composition contract between lanes. `src/main.ts` wires these in this order; each lane exports its
 * factory from its `index.ts` with exactly this type, and the stubs committed with the seed keep the wiring
 * compiling before a lane delivers.
 */
export interface Platform {
  ports: CorePorts;
  /** `argv`: `start` | `status` | `reconcile`. Resolves with the process exit code. */
  run(loops: Loop[], argv: string[]): Promise<number>;
}

export type CreatePlatform = (env: NodeJS.ProcessEnv) => Promise<Platform>;
export type CreatePriceOracle = (ports: CorePorts) => PriceOracle;
export type CreateGatewayAdapters = (ports: CorePorts) => GatewayAdapters;
export type CreateRouteProvider = (ports: CorePorts, deps: { priceOracle: PriceOracle }) => RouteProvider;
export type CreateTransfers = (
  ports: CorePorts,
  deps: { routeProvider: RouteProvider; priceOracle: PriceOracle }
) => Transfers;
export type CreateRefillLoops = (
  ports: CorePorts,
  deps: { gateways: GatewayAdapters; transfers: Transfers; priceOracle: PriceOracle }
) => Loop[];
export type CreateReporterLoops = (
  ports: CorePorts,
  deps: { gateways: GatewayAdapters; transfers: Transfers; routeProvider: RouteProvider }
) => Loop[];
export type CreateRatesLoops = (ports: CorePorts, deps: { priceOracle: PriceOracle }) => Loop[];

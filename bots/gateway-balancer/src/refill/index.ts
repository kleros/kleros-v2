import type { CreateRefillLoops } from "../ports";
import { RefillLoop } from "./loop";

export { RefillLoop } from "./loop";
export { planRefill, shouldTrigger, capacityOf, type RefillPlan } from "./planner";

/** Refill lane: one HomeGateway refill loop per pair. */
export const createRefillLoops: CreateRefillLoops = (ports, { gateways, transfers, priceOracle }) =>
  ports.config.topology.pairs.map((pair) => {
    const treasury = gateways.treasuries.get(pair.id);
    const home = gateways.homeGateways.get(pair.id);
    if (!treasury || !home) throw new Error(`refill: no gateway adapters for pair ${pair.id}`);
    return new RefillLoop({ ports, pair, treasury, home, transfers, priceOracle });
  });

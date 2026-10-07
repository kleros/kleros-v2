import type { CreateRouteProvider, CreateTransfers } from "../ports";
import { LifiClient } from "./client";
import { LifiRouteProvider } from "./provider";
import { LifiTransfers } from "./transfers";
import { assertValidLifiConfig } from "./validate";

export { LifiClient, LifiAssets, type ParsedQuote, type QuoteDetails, type QuotedFee } from "./client";
export { evaluateQuote, type PolicyInput } from "./policy";
export { LifiRouteProvider } from "./provider";
export { LifiTransfers } from "./transfers";
export { validateLifiConfig } from "./validate";

/** Refill lane: LI.FI client, transaction policy validator, route provider and the persisted transfer step machine. */
export const createRouteProvider: CreateRouteProvider = (ports, { priceOracle }) => {
  assertValidLifiConfig(ports.config.lifi, ports.config.topology);
  return new LifiRouteProvider({
    client: new LifiClient({ fetch: ports.fetch, config: ports.config.lifi, chains: ports.config.topology.chains }),
    config: ports.config.lifi,
    priceOracle,
    ledger: ports.journal.ledger,
    clock: ports.clock,
    signer: ports.signer,
  });
};

export const createTransfers: CreateTransfers = (ports, { routeProvider, priceOracle }) => {
  assertValidLifiConfig(ports.config.lifi, ports.config.topology);
  return new LifiTransfers({ ports, config: ports.config.lifi, routeProvider, priceOracle });
};

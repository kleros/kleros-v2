import type { CreateGatewayAdapters, ForeignGatewayTreasury, HomeGatewayFunding } from "../ports";
import { ForeignGatewayTreasuryAdapter } from "./foreignGateway";
import { HomeGatewayFundingAdapter } from "./homeGateway";

export { ForeignGatewayTreasuryAdapter } from "./foreignGateway";
export { HomeGatewayFundingAdapter, unwrapTx, type DepositMethod } from "./homeGateway";

/** Refill lane: ForeignGateway treasury and HomeGateway funding adapters over the compiled contracts. */
export const createGatewayAdapters: CreateGatewayAdapters = (ports) => {
  const treasuries = new Map<string, ForeignGatewayTreasury>();
  const homeGateways = new Map<string, HomeGatewayFunding>();
  for (const pair of ports.config.topology.pairs) {
    const foreign = ports.chains.get(pair.foreignChainId);
    const home = ports.chains.get(pair.homeChainId);
    if (!foreign || !home) throw new Error(`pair ${pair.id}: no chain client for one of its chains`);
    treasuries.set(
      pair.id,
      new ForeignGatewayTreasuryAdapter(pair.id, foreign, pair.foreignGateway, pair.collectedAssets, ports.signer)
    );
    homeGateways.set(pair.id, new HomeGatewayFundingAdapter(pair.id, home, pair.homeGateway));
  }
  return { treasuries, homeGateways };
};

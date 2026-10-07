import type { CreateReporterLoops } from "../ports";
import { NativeTransferReporterFunding } from "./adapter";
import { ReporterFundingLoop } from "./loop";

export { NativeTransferReporterFunding } from "./adapter";
export { reporterConfigSchema, routeThresholds, type ReporterConfig, type RouteThresholds } from "./config";
export { ReporterFundingLoop, type ReporterLoopDeps } from "./loop";
export { planFunding, routeContext, type FundingPlan, type LegPlan } from "./planner";

/** Reporter lane: one funding loop per reporter route, independent of the HomeGateway refills. */
export const createReporterLoops: CreateReporterLoops = (ports, deps) => {
  const funding = new NativeTransferReporterFunding(ports.config.topology, ports.chains, ports.signer);
  const known = new Set(ports.config.topology.routes.map((route) => route.id));
  for (const routeId of Object.keys(ports.config.reporter.routes)) {
    if (!known.has(routeId)) ports.logger.warn("reporter settings for a route absent from the topology", { routeId });
  }
  return ports.config.topology.routes.map(
    (route) =>
      new ReporterFundingLoop(route, {
        ports,
        funding,
        treasury: deps.gateways.treasuries.get(route.pairId),
        transfers: deps.transfers,
        routeProvider: deps.routeProvider,
      })
  );
};

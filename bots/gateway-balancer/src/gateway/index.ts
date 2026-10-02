import type { CreateGatewayAdapters } from "../ports";

/** Refill lane: ForeignGateway treasury and HomeGateway funding adapters over the pending ABI fragments. */
export const createGatewayAdapters: CreateGatewayAdapters = () => ({
  treasuries: new Map(),
  homeGateways: new Map(),
});

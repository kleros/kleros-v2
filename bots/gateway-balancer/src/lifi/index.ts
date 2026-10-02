import type { CreateRouteProvider, CreateTransfers } from "../ports";

/** Refill lane: LI.FI client, transaction policy validator, route provider and the persisted transfer step machine. */
export const createRouteProvider: CreateRouteProvider = () => {
  throw new Error("refill lane: createRouteProvider is not implemented yet");
};

export const createTransfers: CreateTransfers = () => {
  throw new Error("refill lane: createTransfers is not implemented yet");
};

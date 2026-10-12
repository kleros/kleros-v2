import type { QueryClient } from "@tanstack/react-query";

/** Clients created by the current test; setup.ts waits for their in-flight requests before resetting handlers. */
export const activeQueryClients = new Set<QueryClient>();

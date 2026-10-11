import { setupServer } from "msw/node";

/** No default handlers: every test declares the network it expects with `server.use(...)`. */
export const server = setupServer();

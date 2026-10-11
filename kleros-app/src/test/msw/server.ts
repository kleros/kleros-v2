import { setupServer } from "msw/node";

// No default handlers: every test registers what it needs with `server.use(...)`.
export const server = setupServer();

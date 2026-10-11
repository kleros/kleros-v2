# kleros-sdk — agent guide

## Commands (from the repo root)

- All tests: `yarn workspace @kleros/kleros-sdk test` (`vitest run`; `test:run` is the same, kept for issue `verify:` lines)
- One file: `yarn workspace @kleros/kleros-sdk test test/populateTemplate.test.ts`
- One test: `yarn workspace @kleros/kleros-sdk test -t "rejects duplicate answer ids"`
- Watch: `yarn workspace @kleros/kleros-sdk test:watch`
- Coverage (thresholds enforced, per folder in `vitest.config.ts`): `yarn workspace @kleros/kleros-sdk test:coverage`
- Types (includes `test/`): `yarn workspace @kleros/kleros-sdk check-types`
- Lint (`src/` only): `yarn workspace @kleros/kleros-sdk check-style`
- Format: `yarn format` at the root (`yarn format:check` in CI)

With `CI` set, a JUnit report is written to `test-results/junit.xml`.

## Environment

Node 20, `environment: "node"`. No env vars and no network: MSW fails any request without a handler
(`onUnhandledRequest: "error"`), and RPC goes through a fake viem transport.

## Where things live

- `test/*.test.ts`, `test/actions/*.test.ts`: one file per module under `src/`
- `test/setup.ts`: MSW lifecycle (`listen` / `resetHandlers` / `close`)
- `test/msw/server.ts`: the shared `setupServer()`, no default handlers
- `test/helpers/rpc.ts`: `mockChain({ reads, logs })` configures the SDK with a viem `custom` transport that answers
  `eth_call` and event filters from fixtures, ABI-encoded so viem's real decoding runs. `createMockTransport` returns
  the `sdkConfig` without configuring.
- `test/helpers/subgraphs.ts`: `uniqueEndpoints()` and `serveSubgraphs()` for the core and DTR subgraph queries
- `test/fixtures/`: `aDispute()` / `aTemplate()` builders, Reality.eth logs, `readTemplateFile()` for
  `config/v2-disputetemplate/**`

## Adding a mock

- HTTP: `server.use(http.post(url, handler))` inside the test. Handlers reset after each test.
- Subgraph query: `graphql.link(endpoint).query("OperationName", handler)`. Use a fresh endpoint from
  `uniqueEndpoints()`: `src/requests/gqlClient.ts` caches one urql client, with a response cache, per URL.
- Contract read or event: pass `{ address, abi, result }` in `reads` or `{ address, event, args }` in `logs` to
  `mockChain`. An unmatched `eth_call` or RPC method throws.
- Module state: `src/sdk.ts` holds the public client. To test the unconfigured state, `vi.resetModules()` and
  `await import("../src/sdk.js")`.
- Do not `vi.mock` modules under `src/`; drive them through MSW and the fake transport.

## KNOWN BUG convention

A test that asserts the intended behaviour of code that is currently wrong is written as
`it.fails("KNOWN BUG: <intended behaviour>", ...)` with a one-line comment above it naming the workspace issue:
`// issue: 2026-10-09-kleros-v2-dev-sdk-populate-strict` (or `// issue: unfiled (<summary>)`).
`it.fails` passes while the assertion fails. When a fix lands, the test starts failing: turn it into `it(...)` in the
same change. Before committing one, run it as `it(...)` once and check it fails for the stated reason, not on setup.
List them: `grep -rn "KNOWN BUG" test`.

## Rules

- No real network, no sleeps. Time-dependent tests use `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })`
  and `vi.advanceTimersByTimeAsync`; restore real timers in `afterEach`.
- Each test sets up its own handlers and chain fixtures; no test relies on another's state.
- Prefer `it.each` tables for validation rules.

## Definition of done

New behaviour has a test that failed before the change · `test:coverage`, `check-types`, `check-style` green ·
root `yarn format:check` green · no new `it.skip` · KNOWN BUG tests whose bug you fixed are flipped to `it`.

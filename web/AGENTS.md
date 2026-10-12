# web: agent guide

Court app: Vite 5, React 18, HashRouter, wagmi v2 + Reown AppKit, react-query, graphql-request, styled-components.

## Prerequisite

Generated code must exist: `yarn ci:prepare` at the root (contracts dist, kleros-app dist, `src/generatedGitInfo.json`,
`src/graphql`, `src/hooks/contracts/generated.ts`). Missing-export type errors mean it has not run.

## Commands (from the repo root)

Unit and component tests (Vitest):

- All: `yarn workspace @kleros/kleros-v2-web test`
- One file / one test: `yarn workspace @kleros/kleros-v2-web test src/utils/date.test.ts -t "name"`
- Coverage with per-folder floors: `yarn workspace @kleros/kleros-v2-web test:coverage` (full run only; a filtered
  run misses the floors)
- With `CI` set, JUnit goes to `test-results/junit.xml`.

E2E (Playwright, mocked backend):

- All mocked specs: `yarn workspace @kleros/kleros-v2-web test:e2e`; one spec: append the path or `-g "title"`
- Server: Playwright starts `e2e:serve` (`vite build` + `vite preview` on :4173). Locally, run `e2e:serve` once and
  Playwright reuses it.
- Failures: `test-results/results.json`, plus a trace and `error-context.md` per failed test
  (`npx playwright show-trace <trace.zip>`). `E2E_DEBUG_RPC=1` logs every JSON-RPC call.
- Local chain + graph-node specs: `test:e2e:local-stack` with `yarn local-stack` running. Not run in PR CI.
- Visual: `test:e2e:visual`, baselines with `e2e:visual:update`. Both need docker; baselines are Linux-only.
- Subgraph schema snapshots: `e2e:schemas` (introspects devnet), then `check-types`.

Also `check-types`, `check-style`, and `yarn format:check` at the root.

## Unit tests: where things live

- Tests sit next to the code as `*.test.ts(x)`. Setup: `src/test/setup.ts`; fake env: `src/test/env.ts` (devnet,
  `http://subgraph.test/{core,drt}`, `http://atlas.test`, `TZ=UTC`).
- `renderWithProviders(ui, { route, path, account, reads, receiptStatus })` and `renderHookWithProviders`: fresh
  QueryClient, wagmi mock connector on Arbitrum Sepolia at `http://rpc.test` (multicall off), MemoryRouter, theme,
  GraphqlBatcher, i18n. Wallet connection is async: `waitFor` on `isConnected` before acting.
- MSW starts with no handlers and fails undeclared requests. `subgraphHandler({ dispute: (args) => … })` answers by
  top-level field (queries are merged by the batcher, so never by operationName); `.calls` records field and args.
  Contract reads go through `reads: [{ address, abi, functionName, result }]`; `rpcCalls` and `sentTransactions` are
  returned for assertions.
- Builders in `src/test/builders`, typed from codegen, fixed time `T0`: `aDisputeDetails`, `aCourtDetails`,
  `aClassicAppealDispute`, `aDraw`, …
- `vi.mock` only third-party side effects (`react-toastify` per file; Reown hooks are stubbed in setup). Never mock
  our own hooks.

## E2E: where things live

`src/tests/e2e/`: `specs/<area>/<flow>.spec.ts` (one flow per file), `fixtures/`, `mocks/`, `builders/`, `pages/`
(shared widgets only), `seed.spec.ts`, `specs-plans/*.md` (plans for Playwright's planner/generator agents).

Import `{ test, expect }` from `src/tests/e2e/fixtures`. Auto fixtures:

- `network`: any unmocked request fails the test and names it (e.g. `eth_call klerosCore.appealCost(4n)`).
- `subgraph`: schema-first mock over the snapshots in `mocks/schemas`. Edit `subgraph.world` with builders, or
  override a root field: `subgraph.use({ dispute: ({ id }) => aDispute({ id, period: "vote" }) })`.
  `subgraph.fail()` simulates an outage.
- `rpc`: `rpc.onCall(klerosCore, "arbitrationCost", () => 10n ** 16n)`; `throw new Revert("reason")` to revert;
  `rpc.sent(contract, "fn")` asserts writes. Multicall3 is decoded for you. Defaults in `mocks/rpc/defaults.ts`.
- `wallet.connect("alice", features?, chainId?)`, `atlas`, `ipfs`, and a clock pinned to `E2E_NOW`
  (`test.use({ now })`).

## Selectors

`getByRole` first, then label or text, then `getByTestId` with kebab-case ids. No CSS selectors or `nth` without a
comment saying why.

## Known bugs

Pin, don't skip: `it.fails("KNOWN BUG: …")` in Vitest, `test.fail(true, "KNOWN BUG: …")` in Playwright. When the fix
lands the test flips; make it a normal test in the same change. Never weaken an assertion to go green.
`grep -rn "KNOWN BUG" src`.

## Rules

No real network, no `waitForTimeout`, no `networkidle`, no shared state between tests. New e2e specs must pass
`--repeat-each=5`.

## Definition of done

`test:coverage`, `test:e2e`, `check-types`, `check-style`, root `yarn format:check` green.

# kleros-app: agent guide

## Commands (from the repo root)

- All tests: `yarn workspace @kleros/kleros-app test` (`vitest run`)
- One file: `yarn workspace @kleros/kleros-app test src/lib/atlas/providers/AtlasProvider.test.tsx`
- One test: `yarn workspace @kleros/kleros-app test -t "un-verifies the session when the token expires"`
- Watch: `yarn workspace @kleros/kleros-app test:watch`
- Coverage (thresholds enforced, per folder in `vitest.config.ts`): `yarn workspace @kleros/kleros-app test:coverage`
- Types (`tsconfig.check.json`, includes tests): `yarn workspace @kleros/kleros-app check-types`
- Lint: `yarn workspace @kleros/kleros-app check-style`
- Format: `yarn format` at the root (`yarn format:check` in CI)

With `CI` set, a JUnit report is written to `test-results/junit.xml`.

## Environment

Node 20, jsdom. No env vars and no network: MSW fails any request without a handler (`onUnhandledRequest: "error"`).
`tsconfig.json` excludes `*.test.ts(x)` so the library build emits no declarations for tests.

## Where things live

- Tests are colocated: `src/lib/**/Foo.test.ts(x)` next to `Foo.ts(x)`
- `src/test/setup.ts`: jest-dom matchers, MSW lifecycle, RTL `cleanup`, `sessionStorage.clear()` after each test
- `src/test/msw/server.ts`: the shared `setupServer()`, no default handlers
- `src/test/atlas.ts`: `ATLAS_URI`, `atlas` (MSW `graphql.link` for `${ATLAS_URI}/graphql`), `atlasClient()`,
  `aToken({ sub, exp })` (unsigned JWT, the provider only decodes), `graphqlError(message, code)`

## Adding a mock

- Atlas GraphQL: `server.use(atlas.mutation("AddUser", ({ variables }) => HttpResponse.json({ data: { ... } })))`.
  Atlas is not batched, so matching on the operation name is safe. Error shape: `graphqlError("msg", "UNAUTHENTICATED")`.
- Uploads: ``http.post(`${ATLAS_URI}/ipfs/file`, ...)``. jsdom `File` sent through Node's fetch arrives with the filename
  `blob`; assert on fields and content, not the multipart filename.
- Wallet: `AtlasProvider.test.tsx` mocks `wagmi` (`useAccount`, `useChainId`, `useSignMessage`) through a
  `vi.hoisted` `wallet` object; set `wallet.address` and call `rerender()` to switch accounts.
- Session: seed `sessionStorage.authToken` with `JSON.stringify(aToken(...))` before rendering.
- React Query: a new `QueryClient` with `retry: false` per render (`renderAtlas` does this).

## KNOWN BUG convention

A test that asserts the intended behaviour of code that is currently wrong is written as
`it.fails("KNOWN BUG: <intended behaviour>", ...)` with a one-line comment above it naming the workspace issue
(`// issue: <file name>` or `// issue: unfiled (<summary>)`). When a fix lands the test fails: flip it to `it(...)` in
the same change. Before committing one, run it as `it(...)` once and check it fails for the stated reason.
List them: `grep -rn "KNOWN BUG" src`.

## Rules

- No real network, no sleeps. Wait with `waitFor` / `findBy*`.
- Fake timers: `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] })`, plus `shouldAdvanceTime: true`
  when `waitFor` must poll. In `afterEach`, call `vi.restoreAllMocks()` before `vi.useRealTimers()`: a spy on the fake
  `setTimeout` restored afterwards reinstalls the fake globally.
- Do not `vi.mock` modules under `src/`; only third-party boundaries (`wagmi`).

## Definition of done

New behaviour has a test that failed before the change · `test:coverage`, `check-types`, `check-style` green ·
root `yarn format:check` green · no new `it.skip` · KNOWN BUG tests whose bug you fixed are flipped to `it`.

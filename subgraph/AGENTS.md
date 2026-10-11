# Subgraph: working notes for agents

Two subgraphs live here: `core/` (KlerosCore, dispute kits, sortition, evidence, policies, rates, leaderboard) and `dispute-template-registry/` (drt). Mappings are AssemblyScript 0.19, tested with Matchstick (matchstick-as 0.6.0).

## Commands

Run from `subgraph/` (or `yarn workspace @kleros/kleros-v2-subgraph <script>` from the root).

| Command                 | What it does                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `yarn test`             | Everything: sync ABIs, codegen core + drt, then run both suites with `-r` (forced recompile). CI runs this. |
| `yarn test:core`        | Core suite only, reusing compiled tests in `core/tests/.bin`. Needs a prior codegen.                        |
| `yarn test:core <name>` | One file: `<name>` is the file name without `.test.ts`, e.g. `yarn test:core dispute-kit-classic`.          |
| `yarn test:drt`         | drt suite only (`dispute-template-registry/matchstick.yaml`).                                               |
| `yarn codegen:core`     | Regenerate `core/generated/` after editing `schema.graphql`, the manifest or the ABIs.                      |
| `yarn build:core`       | Full `graph build`; the only real type check for mappings.                                                  |

`abis/` and `*/generated/` are gitignored. `scripts/test.sh` reads the network from `core/subgraph.yaml` (`../abis/<network>/`) and runs `scripts/sync-abis.sh <network>` before codegen, so a fresh clone needs nothing else. If tests fail with missing `generated/...` imports, run `yarn test` once.

`graph test -v 0.6.0` downloads the native matchstick binary once (no Docker). The full run spends most of its time compiling one wasm per test file.

## Test layout

- `core/tests/<area>.test.ts`: one file per mapping or helper module (`kleros-core-*.test.ts`, `dispute-kit-classic.test.ts`, `sortition-module.test.ts`, `datapoint.test.ts`, `entities.test.ts`, ...).
- `core/tests/lifecycle.test.ts`: end-to-end scenarios that drive handlers in on-chain event order.
- `core/tests/utils/`, shared by every file:
  - `events.ts`: one `createXEvent(...)` builder per event in the manifest, plus `at(event, timestamp)`. Events come from `CORE` (the matchstick default address), dispute-kit events from `DK_CLASSIC` unless an address is passed.
  - `mocks.ts`: `createMockedFunction` wrappers for every contract call the mappings make (`disputes`, `getRoundInfo` via the `RoundInfo` builder, `getNumberOfRounds`, `currentRuling`, `sortitionModule`, `getJurorBalance`, `core`, rates).
  - `entities.ts`: `seedCourt`, `seedDispute`, `seedRound`, `seedUser`, `seedClassicDispute`, `seedClassicRound`, `seedDisputeInCourt` and friends.
  - `assertions.ts`: `assertFieldUnset` for nullable fields; `constants.ts`; `extra-data.ts`.

Every `describe` ends with `afterEach(() => { clearStore(); })`, plus `dataSourceMock.resetValues()` when the test changes the data source.

## Mocking a contract call

An unmocked call aborts the test. Mock on the address the mapping binds to (`event.address` for KlerosCore, `SORTITION` for the sortition module):

```ts
mockDisputes(bi(0), bi(1)); // KlerosCore.disputes(0) -> court 1
mockRoundInfo(bi(0), bi(0), new RoundInfo().withVotes(3).withDisputeKit(1));
createMockedFunction(CORE, "fn", "fn(uint256):(uint256)").withArgs([...]).reverts(); // for try_ calls
```

The signature string must match the generated binding exactly (copy it from `core/generated/<DataSource>/<Contract>.ts`).

## KNOWN BUG convention

Mapping bugs are pinned, not fixed in the test PR. matchstick-as 0.6.0 has no `skip`, `only` or `todo`, so:

- Write the test for the **correct** behaviour, title it `KNOWN BUG: ...`, and pass `true` as the third argument of `test()` (`shouldFail`).
- Check that it fails on the assertion, not on an abort: matchstick prints the failed assertion under the test (e.g. `Expected field 'x' to equal '1', but was '0'`). An unmocked call or a missing entity also "passes" a `shouldFail` test.
- When you fix the bug, the test starts passing and matchstick reports it as failed. Remove the `true` and the `KNOWN BUG:` prefix in the same change.

The list of open bugs lives outside the repo; each one maps to a `KNOWN BUG:` test name.

## Gotchas

- AssemblyScript `===` on strings compares identity, not content. Use `==` for string comparison in mappings and tests.
- `@derivedFrom` fields are loaders: call `.load()`. `entity.derived.entries` is always empty.
- `assert.assertNull` on a `BigInt` crashes the compiler; use `assertFieldUnset`.
- AssemblyScript has no closures: callbacks passed to `test()`/`describe()` cannot capture local variables. Use module-level constants and functions.
- `clearStore()` does not clear mocked calls; a mock from an earlier test still answers. Re-mock in each test instead of relying on that.
- Matchstick rejects an entity saved without an `id` field even though graph-node fills it from the key.

## Definition of done

- `yarn test` is green from a clean checkout (delete `abis/`, `core/generated/`, `dispute-template-registry/generated/` to prove it).
- New handler behaviour has a test asserting the fields it writes (`assert.fieldEquals`) and what it must not create (`assert.entityCount` / `assert.notInStore`).
- `yarn build:core` succeeds and the root `yarn format:check` passes.

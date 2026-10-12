# kleros-v2 — agent guide

Kleros Court v2 monorepo: Solidity contracts, The Graph subgraphs, the court web app and its supporting packages. Yarn 4 workspaces (`nodeLinker: node-modules`), Node 20 (`.nvmrc`).

Each package with tests has its own `AGENTS.md`; read it before working in that package.

| Workspace       | What                                                          | Tests                                             |
| --------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| `contracts/`    | Hardhat + Foundry contracts, deployments, typechain           | `yarn workspace @kleros/kleros-v2-contracts test` |
| `subgraph/`     | Core and dispute-template-registry subgraphs (AssemblyScript) | Matchstick, see `subgraph/AGENTS.md`              |
| `kleros-sdk/`   | Dispute data: templates, data mappings, `getDispute`          | Vitest, see `kleros-sdk/AGENTS.md`                |
| `kleros-app/`   | Atlas client (SIWE auth, uploads) used by web                 | Vitest, see `kleros-app/AGENTS.md`                |
| `web/`          | Court app (Vite, React, wagmi, Reown AppKit)                  | Vitest + Playwright, see `web/AGENTS.md`          |
| `web-devtools/` | Next.js dev tools (template preview, ruler)                   | none; excluded from CI checks                     |

## Commands (repo root)

```bash
yarn install --immutable
yarn ci:prepare            # contracts compile + dist, kleros-app and kleros-sdk builds, web codegen (devnet; needs network)
yarn check-types           # every workspace
yarn check-style           # eslint, every workspace
yarn test                  # unit tests: kleros-sdk, kleros-app, web, subgraph
yarn format:check          # prettier over git-tracked files; `yarn format` writes
```

Generated code is gitignored (`contracts/typechain-types`, `contracts/dist`, `kleros-app/dist`, `web/src/graphql`, `*/src/hooks/contracts/generated.ts`, `subgraph/*/generated`). Type errors about missing generated exports mean `yarn ci:prepare` has not run, not that the source is wrong.

The web deployment (devnet, testnet, mainnet, local) is chosen by `web/scripts/runEnv.sh <deployment>`, which sources `web/.env.<deployment>.public`. Codegen output depends on it.

## Conventions

- Branches: `dev` is devnet, `master` is testnet/mainnet. They have diverged in the dispute kits.
- Commits: conventional commits, header ≤ 100 chars (commitlint).
- Formatting: prettier, `printWidth` 120. Lint: eslint, `max-len` 120.
- Known bugs are pinned by tests, not skipped: Vitest `it.fails("KNOWN BUG: …")`, Matchstick `test("KNOWN BUG: …", fn, true)`. When a fix lands the test starts failing; flip it to a normal test.
- Tests never touch the real network. Unhandled requests fail the test.

## Definition of done

`yarn format:check`, and in each package touched: `check-types`, `check-style`, `test`. CI (`.github/workflows/ci.yml`) runs the same commands.

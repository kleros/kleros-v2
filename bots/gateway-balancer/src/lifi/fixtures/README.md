# LI.FI fixtures

Recorded once on 2026-10-06 from LI.FI's public, keyless endpoints (`https://li.quest/v1`), with the placeholder
address `0x1000000000000000000000000000000000000001` as sender and recipient. Tests serve them through an injected
`fetch`; nothing in the test suite calls the network. No key, RPC URL or webhook is in any file.

| File | Request | Answer |
| --- | --- | --- |
| `quote-base-eth-to-arbitrum-eth.json` | `GET /quote` 0.05 ETH Base (8453) -> ETH Arbitrum (42161) | 200, layerswap |
| `quote-base-usdc-to-arbitrum-eth.json` | `GET /quote` 100 USDC Base -> ETH Arbitrum | 200, layerswap |
| `quote-base-usdc-to-base-eth.json` | `GET /quote` 100 USDC Base -> ETH Base (local conversion) | 200, okx |
| `quote-arc-usdc-to-arbitrum-eth.json` | `GET /quote` 100 USDC Arc mainnet (5042, token `0x3600…0000`) -> ETH Arbitrum | 200, gasZipBridge |
| `quote-arc-testnet-usdc-to-arbitrum-sepolia-eth.404.json` | `GET /quote` 100 USDC Arc testnet (5042002) -> ETH Arbitrum Sepolia | 404, code 1002 "No available quotes" |
| `status-pending.json` | `GET /status` of a public Base -> Arbitrum transfer in flight | 200, `PENDING` |
| `status-done-eth.json` | `GET /status` of a public Base ETH -> Arbitrum ETH transfer | 200, `DONE`/`COMPLETED` |
| `status-done-usdc.json` | `GET /status` of a public Base -> Arbitrum USDC transfer | 200, `DONE`/`COMPLETED` |
| `status-not-found.404.json` | `GET /status` of an unknown hash | 404, code 1003 |
| `status-failed.derived.json` | **Derived, not recorded**: `status-done-eth.json` with `status: FAILED` and no `receiving` (no public failed transfer was available to record) | `FAILED` |
| `tools.json` | `GET /tools`, **trimmed** to each tool's `key` and `name` (the full answer is 600 KB) | 200 |

Arc mainnet (5042) does have a route (gasZip) at recording time; the Arc testnet request reproduces the
specification's section 11 answer. The topology in `config/example.json` still carries the testnet id 5042002.

## Derived fixtures (launch-gate item)

LI.FI's public API offered no failed, partial or refunded transfer to record (decisions [L2]). Every fixture whose
name ends in `.derived.json` was written by hand from a recorded one and is **not** a LI.FI answer:

| File | Derived from | Why |
| --- | --- | --- |
| `status-failed.derived.json` | `status-done-eth.json` with `status: FAILED`, no `receiving` | No public `FAILED` transfer was available to record. |

`DONE` with substatus `PARTIAL` or `REFUNDED` has no fixture at all: `client.ts` maps `REFUNDED` to `failed` and a
`PARTIAL` delivery to `done` with the delivered (intermediate) asset, which `transfers.test.ts` exercises through the
fake route provider only. Recording real
`FAILED`, `PARTIAL` and `REFUNDED` answers (and replacing the derived file) is a launch-gate item of specification
test 15, operator work after the run.

## Calldata

The allowed LI.FI entry points of `calldata.ts` are the selectors of these recorded quotes' `transactionRequest.data`:
`0x4c279d6b` (LayerSwap, both Base quotes), `0x606326ff` (gas.zip, Arc) and `0x2c57e884` (GenericSwapFacet, Base USDC
to Base ETH). Re-recording a quote with another facet needs the entry point added there.

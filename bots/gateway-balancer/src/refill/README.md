# Refill lane: HomeGateway refills

One loop per gateway pair (`refill:<pairId>`). When a HomeGateway's available native ETH is **strictly below**
`lowWaterCases × referenceCaseCostEth`, the loop sweeps the pair's ForeignGateway **arbitration** balance of every
collected asset (Base: ETH and USDC), moves it to the home chain as native ETH through an approved LI.FI route
(`src/lifi`), and deposits exactly what arrived. Bridging fees are never touched: they belong to the reporter lane.

Code: `planner.ts` (pure trigger and sweep decision), `loop.ts` (the journaled operation), `config.ts` (this section's
schema). The gateway adapters are in `src/gateway`; their pending contract signatures are in `src/gateway/abi/`.

## One refill operation

Each refill is one journal operation (`kind: "refill"`), at most one open per pair. For each swept asset in turn:

1. `claim`: `Ledger.claim` on `fg:<pair>:arbitration:<chainId>:<asset>` against the balance just read.
2. `withdraw`: the ForeignGateway's privileged withdrawal of the arbitration category to the bot EOA
   (key `op:<id>:step:withdraw-<i>`). On confirmation the claim is settled and `arbitration:<pair>` is credited
   on the foreign chain (`eoa`).
3. `transfer`: `Transfers.run` with one allocation on `arbitration:<pair>`; `Transfers` owns every ledger move
   from there (`eoa` → `in-transit` → home-chain `eoa`) and unwraps WETH.
4. `deposit`: exactly the `receivedByScope` amount persisted in the step payload, as native ETH
   (key `op:<id>:step:deposit-<i>`). Never "the whole holding".

The operation completes once every asset is deposited (or skipped). Ledger writes are bracketed by step markers
(`withdraw:crediting`, `deposit:debiting`, `deposit:crediting`): a restart that finds a marker sets the operation to
`attention` instead of guessing, so a crash leaves money untracked, never counted twice. A confirmed deposit writes
the `deposit:recorded` marker (with `deposited` and the next item) before its `deposit` spend row: a restart there
warns that the row may be missing and moves on, never writing the row or counting the deposit twice. A `failed`
deposit is credited back only when the journal's record under its key is `failed` with no signed bytes or hash;
anything else is `attention`.

A `failed` deposit (never signed, `gas-reserve` refusals for want of operator gas included) is credited back and
retried on a later tick under `op:<id>:step:deposit-<i>:<attempt>` until it goes (top up the EOA's gas on that chain).
A `failed` withdrawal (a contract rejection in the simulation, such as a stale balance after another withdrawal, or a
`gas-reserve` refusal) releases its claim and skips the asset; the next operation re-reads the balances and sweeps it
again. A withdrawal whose `failed.error` starts with `aborted:` (the executor stopped before signing on shutdown or
an expired wait budget, decisions [L61]) is not a rejection: it keeps its claim and is retried on the next tick under
`op:<id>:step:withdraw-<i>:<attempt+1>`, with no skip, no notification and no suspension. The deposit and the
`Transfers` steps already retry every unsigned failure that way, so an `aborted:` one costs nothing beyond its key.
A `replaced`, `reverted` or `unknown` deposit or withdrawal is `attention`, never a retry.

## Configuration (`refill` section)

`"refill": {}` parses. See `example-config.json`.

| Field | Default | Meaning |
| --- | --- | --- |
| `referenceCaseCostEth` | none | ETH per reference case (three jurors). **Launch gate**: a pair without it never refills; its loop only records observations. |
| `lowWaterCases` | 20 | Trigger strictly below this many cases of available native ETH. |
| `targetCases` | 100 | Nominal capacity. A sweep expected to stay under it is a *partial refill*: it proceeds and notifies. |
| `economicMinimums` | `{ "ETH": "0.002", "USDC": "5" }` | Per collected-asset symbol, whole units: smaller withdrawable amounts are deferred. |
| `depositMethod` | `"function"` | `function`: the HomeGateway's payable deposit in `src/gateway/abi/homeGateway.ts` (pending). `nativeTransfer`: value with empty calldata, only for a gateway whose `receive()` is verified. |
| `maxAmbiguousDeferrals` | 10 | An ambiguous transfer deferral (`insufficient-holding:` or an unrecognised reason) is retried at most this many consecutive times, then the operation is `attention`. |
| `ambiguousDeferralMaxAgeSeconds` | 3600 | ...or for at most this long after the first such deferral, whichever comes first. |
| `pairs.<pairId>` | `{}` | Per-pair overrides of every field above, plus `enabled` (default `true`). |

## Observations

Recorded every tick: `capacity:<pair>` (available native, low-water, target, cases, reference cost) and
`withdrawable:<pair>:<symbol>` (total, arbitration and bridging balance of the ForeignGateway). `suspended:refill:<pair>`
holds the loop's suspension (`active`, `kind`, `reason`, `since`).

## Suspension

The loop suspends itself (initiates nothing new, keeps advancing its open operation, returns `suspended` only once
nothing is open) when:

- a refill operation of the pair is in `attention`; the suspension clears once none is left;
- `Transfers` reports a LI.FI policy violation (a `policy-rejected: …` deferral when the transfer starts, or an
  in-progress step `policy-rejected: …` when a requote of an open transfer is rejected). The open operation keeps
  retrying the transfer every tick; the suspension clears on its own as soon as a later quote of that transfer passes
  the policy (the transfer moves to `approve`, `send` or later: a daily limit whose window rolled, a budget or fee
  rejection after the market moved, prices back). It also clears when the `lifi` or `refill` configuration changes.
  A restart with the same configuration clears nothing by itself.

## Transfer deferrals

`Transfers` deferral reasons carry one of five codes (`src/lifi/README.md`); the loop decides by prefix:

| Code | Handling |
| --- | --- |
| `no-route:` | warning (once per operation and asset), retried every tick |
| `policy-rejected:` | policy suspension (above), retried every tick |
| `price-unavailable:` | warning (once per operation), retried every tick, never `attention` by count |
| `insufficient-holding:` or an unrecognised reason | warning (once per operation and asset), retried; `attention` after `maxAmbiguousDeferrals` consecutive deferrals or `ambiguousDeferralMaxAgeSeconds` |
| `allocations-mismatch:` | `attention` at once (a programming error) |

A LI.FI request that throws (an HTTP error other than "no route", a 30 s `ports.fetch` timeout) when a transfer is
first quoted is not a deferral: the tick fails and the scheduler backs off; the operation stays at `transfer` and the
next tick retries. A requote of an open transfer maps the same error to an `awaiting-route:` step instead.

## Notifications and operator actions

| Notification | Severity | Operator action |
| --- | --- | --- |
| `Refill <pair> needs attention` | critical | Inspect the operation's transactions and holdings (`status`), settle the funds by hand (where they are: foreign EOA, in transit, home EOA), then mark the operation resolved in the journal. The loop stays suspended until no refill operation of the pair is in attention. |
| `Refill <pair> suspended` | critical | For a policy violation: run `lifi-probe` and review the violation. A transient one (daily limit, budget, fee, prices) clears on its own once a later quote passes; otherwise adjust the `lifi` allowlists or limits and restart, only if the route is acceptable. For attention operations: see above. |
| `Refill <pair> resumed` | info | None. |
| `Partial refill of HomeGateway <pair>` | warning | None required; the bot refills what the ForeignGateway holds. Top up the HomeGateway manually if cases run short. |
| `HomeGateway <pair> below low water, nothing to sweep` | warning (daily) | None unless cases keep draining; the sweep starts as soon as arbitration fees accumulate. |
| `No approved LI.FI route for <asset> -> ETH (<pair>)` | warning (once per operation and asset) | Run `lifi-probe` for that route class; approve a route in the `lifi` allowlists if one is acceptable. The withdrawn funds wait in the EOA under `arbitration:<pair>`. |
| `Refill <pair> waits for prices` | warning (once per operation) | Check the price providers (`price:*` observations in `status`); nothing to do once they recover, the transfer is retried every tick. |
| `Refill <pair>: transfer deferred` | warning (once per operation and asset) | The ledger holds less under `arbitration:<pair>` on the foreign chain than the withdrawn amount (typically after a crash inside a ledger bracket). Compare the holding with the EOA balance; the operation goes to `attention` after the configured bound. |
| `Refill <pair>: deposit spend row may be missing` | warning (once per operation) | None for the funds: the deposit is confirmed and counted. The `deposit` spend history may lack that one row (deposit statistics under-report it). |
| `Refill <pair>: deposit exceeds the holding` | warning | Reconcile `arbitration:<pair>` with the EOA's home-chain balance; the deposit is retried every tick. |
| `HomeGateway <pair> refilled` | info | None. |

A transfer's own warnings (a delivery not yet visible in the EOA balance, a transfer waiting for the inbound slot of
its destination chain and asset, a pending transfer past its timeout) and its `attention` reasons (for example
`unverified delivery: …`, when an ERC20 delivery never showed in the EOA's token balance and nothing was credited)
are documented in `src/lifi/README.md`; a transfer in `attention` makes the refill operation `attention`.

# Rates lane (`src/rates`)

Maintains the keeper-maintained rates of a pair's ForeignGateway: `homeNativeRate` and a token's
`currencyRates` (v1 scope: those two; juror fees and oracle bridging costs are not maintained). Two parts:

- **Price oracle** (`createPriceOracle`): asks every enabled provider for a symbol's USD price, drops stale and
  failed observations, requires fresh observations from `minSources` independent source families, takes the median
  of the family values and refuses with `disagreement` when any observation is more than `maxSpreadBps` from it. No symbol is assumed pegged: USDC is aggregated like ETH.
- **Rate loops** (`createRatesLoops`, ids `rate:<pairId>:<target>`): one loop per pair and target named in
  `rates.pairs.<pairId>.targets`. Each cycle steps the contract's value toward the market in moves the contract's
  guardrails accept.

The contract owns the guardrails: `keeperMaxChangeBps` and `keeperCooldown`, which the governor can change at any
time, so the loop reads both every cycle. The bot never clamps a market price into a band of its own and has no
step limit in its configuration; it never calls a governor function (`changeKeeperGuardrails`, `changeKeeper`...).

## Configuration (`rates` section)

`"rates": {}` is valid: no provider is enabled, the oracle answers `insufficient-sources` without any network I/O
and the loops record the miss (and warn, then go critical, as below). `example-config.json` is a complete section
with three providers in two source families; it parses under the schema (`config.test.ts`). **Launch needs a
third independent family** (see "Independent source families" below): with the example as is and `minSources` 3,
every price is refused with `insufficient-sources`. Unknown fields and unknown provider ids are
configuration errors.

| Field                             | Default                   | Meaning                                                                                           |
| --------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| `providers`                       | `[]`                      | Price sources (below).                                                                            |
| `minSources`                      | `3`                       | Independent source families with a fresh observation required for a price (a family counts once). |
| `maxSpreadBps`                    | `200`                     | Refuse with `disagreement` when an observation is further than this from the median.              |
| `freshnessSeconds`                | `3600`                    | Default age limit of an observation; each provider, and each Chainlink feed, may override it.     |
| `updateTriggerBps`                | `500`                     | Propose an update when `abs(market - current) / current` is at least this (floored bps).          |
| `settleBps`                       | `50`                      | After a value was `updateTriggerBps` away, keep stepping until the distance is under this.        |
| `rejectionRetrySeconds`           | `3600`                    | Wait after a rejection the next cycle cannot fix (`decimals`, `invalid-rate`, `unauthorized`, `unknown`). |
| `rejectionsBeforeCritical`        | `3`                       | Consecutive rejections of one operation before one `critical`.                                    |
| `priceMissesBeforeWarning`        | `3`                       | Consecutive ticks without a price before one `warning`.                                           |
| `priceUnavailableCriticalSeconds` | `21600`                   | A price unavailable longer than this raises one `critical`.                                       |
| `pairs.<pairId>.targets`          | required, at least one    | `"homeNative"` and/or `{ "token": "<symbol>" }` (below). No target, no loop.                      |
| `pairs.<pairId>.quoteSymbol`      | the pair's `rateCurrency` | Symbol the `homeNative` rate is quoted in (see rate semantics).                                   |

### Targets

Targets come only from `rates.pairs.<pairId>.targets`, never from the topology: with `"rates": {}` there are no
loops. `"homeNative"` is `homeNativeRate`. `{ "token": "USDC" }` names a symbol of the pair's `collectedAssets`
(`currencyRates(token)`); an unknown symbol, a native asset or a target listed twice is a configuration error naming
`rates.pairs.<pairId>.targets`, raised when the loops are created (the topology is not visible to the section's
schema). Arc: `homeNative`. Base: the USDC token; its `homeNativeRate` stays 1e18 and has no loop.

### Providers

Each entry has an `id` (the provider seam: `chainlink` or `coingecko`; Pyth is deferred and would be a third id),
an optional `source` label (unique; it names the observations in `price:<symbol>`), `enabled` (default `true`) and
an optional `freshnessSeconds`.

- `chainlink`: `chainId` (a topology chain; its `ChainClient` reads the feed) and `feeds`, a USD aggregator per
  symbol: an address, or `{ "address": ..., "freshnessSeconds": ... }`. The provider reads `decimals` (once per
  feed) and `latestRoundData`, scales `answer` to 1e18 and marks the observation stale when `updatedAt` is older
  than the feed's limit (its own `freshnessSeconds`, else the provider's, else the section's). Several Chainlink
  entries on different chains are distinct observations of **one** family.
- `coingecko`: `GET <baseUrl>/api/v3/simple/price?ids=<coinId>&vs_currencies=usd&include_last_updated_at=true`
  through `ports.fetch`. `apiKeyEnv` names the environment variable holding the key (sent as `apiKeyHeader`:
  `x-cg-demo-api-key`, or `x-cg-pro-api-key` with `baseUrl` `https://pro-api.coingecko.com`); no key is sent when
  the variable is unset. The key never appears in logs or observations. `apiKeyEnv` may not name a reserved
  variable (`BALANCER_PRIVATE_KEY`, `GATEWAY_BALANCER_CONFIG`): the load fails naming
  `rates.providers[<i>].apiKeyEnv`, so the signing key is never sent to CoinGecko as an API key. A collision with a
  topology `rpcUrlEnv` is refused by the platform loader, which checks every `*Env` key of the whole configuration. `coinIds` maps symbols to CoinGecko ids
  (default `ETH: ethereum`, `USDC: usd-coin`).

### Per-feed freshness

Chainlink feeds update on a deviation threshold or, at the latest, on their heartbeat, and heartbeats differ per
feed: USDC/USD feeds have a 24 h heartbeat and a stablecoin rarely crosses its deviation threshold, so its
`updatedAt` is routinely many hours old. One limit for every feed (the earlier 3900 s) marked the USDC/USD feeds
stale most of the time, and every USDC-quoted pair reported `insufficient-sources`. Give each feed its own
`freshnessSeconds`: the feed's heartbeat plus a margin. The example uses 90000 s (24 h + 1 h) for USDC/USD and
3900 s (1 h + 5 min) for ETH/USD. **Operator action**: verify each feed's address and heartbeat on the Chainlink
data-feeds page (data.chain.link) before launch and set its limit to heartbeat plus margin; the ETH/USD values in
the example assume a 1 h heartbeat.

### Independent source families

Provider names do not guarantee independent data. Every Chainlink feed, on any chain, comes from one oracle
network, so one bad Chainlink value can show up on several feeds at once. The aggregator therefore groups fresh
observations by family (`chainlink`, `coingecko`, later `pyth`; the family is the provider id): each family
contributes the median of its own fresh observations, `minSources` counts families, and the price is the median of
the family values. The spread check still applies to every fresh observation, so a bad family is refused with
`disagreement` rather than averaged in. Consequence for the example: two Chainlink entries plus CoinGecko are two
families, short of the default `minSources` 3. Launch needs a third independent family (Pyth is the deferred
provider seam for it). Lowering `minSources` to 2 is possible but is the operator's explicit decision: with two
families a disagreement refuses the price rather than outvoting the bad source (specification 6.1).

## Units

- `homeNative`: foreign native currency (18 decimals) per 1 ETH at 18 decimals. The market value is
  `ETH/USD / quote/USD x 1e18`; the quote is `rates.pairs.<pairId>.quoteSymbol`, else the pair's `rateCurrency`
  (`USD` uses ETH/USD as is; another symbol divides by that symbol's USD median, so a depeg moves the rate). On Arc
  (native USDC, `quoteSymbol` `USDC` as in the example) it is USDC per ETH.
- `token`: KlerosCore's encoding. `rateInEth / 10^rateDecimals` is the token's price in ETH times
  `10^(18 - token decimals)`, i.e. wei per smallest token unit. Base USDC (6 decimals) at ETH 3000 USD and USDC 1 USD
  is `rateInEth` 333333333 with `rateDecimals` 0. The value **rises when ETH falls**. The loop keeps the stored
  `rateDecimals` (only the governor changes them) and refuses a `rateInEth` above `2^64 - 1` before submission.

## Stepping

Each cycle reads `keeperMaxChangeBps`, `keeperCooldown`, the value and `lastKeeperUpdate(key)` (keys
`keccak256(abi.encode("homeNativeRate"))` and `keccak256(abi.encode("currencyRate", token))`; `0` means never
updated). The next value is the market value clamped so that `|next - current| * 10000 <= current * maxChangeBps`
holds exactly in integers, and it is proposed no earlier than `lastKeeperUpdate + cooldown` (the bot's clock against
the chain's timestamp; a few seconds of skew show up as a `cooldown` rejection and are retried on the next cycle).

- A move starts when the market is at least `updateTriggerBps` from the value; the loop then keeps stepping on later
  cycles until the distance is under `settleBps`, so a 7 % move with a 5 % step limit does not stop 2 % short.
- A value of 0 cannot be moved by the keeper (the contract's change check is relative): one notification (until the value is non-zero again), nothing
  submitted; the governor sets the initial value.

## Loop behaviour

Per tick, for a target with no open operation: read the guardrails and the value, price ETH (and the quote symbol or
the token), record `price:<symbol>` and `rate:<pairId>:<target>` (market, current, change in bps, price-miss
counters), and when a step is due and past the cooldown journal a `rate-update` operation (payload `target`, scope
`gas` of the foreign chain), persist attempt 1 and submit under `op:<id>:step:update:<attempt>`. The executor only
ever receives that transaction. Operations, observations, suspension markers and dedup keys are per target, so two
targets of one pair never share state.

- `confirmed`: the operation completes; the next cycle steps again if the value is still more than `settleBps` away.
- `pending`: it waits; later ticks call `resolve`, never resubmit.
- `cooldown` or `max-change` rejection (`failed` simulation or `reverted`): the next cycle re-reads the guardrails,
  the value and `lastKeeperUpdate` and computes the step again. The same value from the same reads (guardrails, value, last update) is not
  resubmitted at once: it is held back `rejectionRetrySeconds` and re-evaluated. A `max-change` step stays held
  until a read changes; a `cooldown` step (typically clock skew, which no read shows) is held once, then
  resubmitted, so the rejection is counted and the critical can fire. `max-change` warns once; `cooldown` is only logged. Both count towards `rejectionsBeforeCritical`.
- `decimals`, `invalid-rate`, `unauthorized`, `unknown`: notify, and wait `rejectionRetrySeconds`.
- `failed` with an `error` starting with `aborted:` (shutdown or an expired wait budget before signing, decisions
  [L57]/[L61]) is not a rejection: nothing was signed, so the next tick retries under a new attempt key with no
  wait, no rejection counted and no notification.
- `replaced` or `unknown`: the operation goes to `attention`; the loop then suspends (`suspended:rate:<pairId>:<target>`)
  and proposes nothing for that target until the operator resolves the operation.
- A crash after the attempt is persisted resubmits under the same key (the executor never re-sends); a crash
  between the intent and the first attempt closes that operation as `failed` (nothing was sent).

## Notifications and operator actions

Dedup keys are `rate:<pair>:<target>:<suffix>`.

| Suffix                     | Severity | When                                                                   | Operator action                                                                     |
| -------------------------- | -------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `price-unavailable`        | warning  | `priceMissesBeforeWarning` consecutive ticks without a price           | Check providers: feed addresses, heartbeats/freshness, CoinGecko key, `maxSpreadBps`. |
| `price-unavailable-critical` | critical | No price for longer than `priceUnavailableCriticalSeconds`           | Restore a provider or enable another source; the contract keeps the last value.     |
| `max-change`               | warning  | The contract refused a step (limit changed or value moved meanwhile)   | None if the governor changed the limit; otherwise check the bot's arithmetic.       |
| `decimals`                 | warning  | `KeeperCannotChangeDecimals`                                           | Only the governor changes `rateDecimals`; the next attempt keeps the stored value.  |
| `invalid-rate`             | warning  | `InvalidRate` (zero `homeNativeRate`)                                  | Check the price sources.                                                            |
| `unauthorized`             | critical | `GovernorOrKeeperOnly`                                                 | Make the balancer EOA the gateway's keeper, or fix the configured address.          |
| `unknown-rejection`        | warning  | Unclassified failure (`revertData=none`, foreign error)                | Check the gateway address, the gas reserve and the RPC.                             |
| `rejected`                 | critical | `rejectionsBeforeCritical` consecutive rejections (once per operation) | Investigate; the gateway keeps charging with the stale rate.                        |
| `zero-value`               | warning  | The value is 0                                                         | The governor sets an initial value.                                                 |
| `no-step`                  | warning  | `keeperMaxChangeBps` allows no change from the value                   | Governance sets the value or raises the limit.                                      |
| `market-out-of-range`      | warning  | The market value is 0 or a `rateInEth` above `2^64 - 1`                | Check the sources and the stored `rateDecimals`.                                    |
| `attention:<op>`           | warning  | `replaced` or `unknown` outcome                                        | Check the transaction and the value, then mark the operation completed or failed.   |

`suspended:rate:<pair>:<target>` (warning) is raised while an `attention` operation exists; the loop clears its
suspension by itself once none remains. A restart clears nothing.

## Tests

`providers/chainlink.test.ts`, `providers/coingecko.test.ts`, `aggregator.test.ts`, `gatewayRates.test.ts`
(adapter on `FakeChainClient`), `loop.test.ts` (stepping against a simulation of the contract's checks),
`config.test.ts`; all on fakes and fixtures, no network. `gatewayRates.anvil.test.ts` deploys a ForeignGateway proxy
from `src/contracts/bytecode.json` on a local Anvil (governor and keeper are different accounts) and runs the loops
through the real executor. `fixtures/coingecko-simple-price.json` is the operator's recording of the public keyless
endpoint from 2026-10-06 (see `fixtures/README.md`).

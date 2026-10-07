# Rates lane (`src/rates`)

Maintains the ForeignGateway currency rate of every pair with a `rateCurrency` (v1 scope: the currency rate only;
bridging costs stay with governance). Two parts:

- **Price oracle** (`createPriceOracle`): asks every enabled provider for a symbol's USD price, drops stale and
  failed observations, requires fresh observations from `minSources` independent source families, takes the median
  of the family values and refuses with `disagreement` when any observation is more than `maxSpreadBps` from it. No symbol is assumed pegged: USDC is aggregated like ETH.
- **Rate loops** (`createRatesLoops`, ids `rate:<pairId>`): propose the market rate when it differs from the
  contract's rate by at least `updateTriggerBps`, and handle the contract's rejections without retry storms.

The contract owns every guardrail (25 percent maximum change, minimum interval, bounds). The bot only classifies
the rejection; it never clamps or adjusts a price to pass, and never calls a pause or governance function.

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
| `cooldownSeconds`                 | `3600`                    | Wait after a `cooldown` rejection. Set it to the contract's minimum update interval.              |
| `rejectionRetrySeconds`           | `3600`                    | Wait after any other rejection (`max-change`, `out-of-bounds`, `unauthorized`, `unknown`).        |
| `rejectionsBeforeCritical`        | `3`                       | Consecutive rejections of one operation before one `critical`.                                    |
| `priceMissesBeforeWarning`        | `3`                       | Consecutive ticks without a price before one `warning`.                                           |
| `priceUnavailableCriticalSeconds` | `21600`                   | A price unavailable longer than this raises one `critical`.                                       |
| `pairs.<pairId>.quoteSymbol`      | the pair's `rateCurrency` | Symbol the rate is quoted in (see rate semantics).                                                |

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

## Rate semantics

`rateE18` is units of the quote symbol per 1 ETH, scaled to 1e18. The quote symbol is
`rates.pairs.<pairId>.quoteSymbol`, else the pair's `rateCurrency`:

- `USD`: the rate is the ETH/USD median as is (the example topology's choice for both pairs).
- any other symbol, e.g. `USDC`: the rate is ETH/USD divided by that symbol's USD median, so a USDC depeg moves
  the rate. Use it when the ForeignGateway charges in USDC and should track USDC rather than the dollar.

The adapter converts 1e18 to the contract's scale (`RATE_DECIMALS`, floored) and back.

## Pending ABI

`abi/foreignGatewayRate.ts` holds every assumed signature in one place, marked PENDING: the `currencyRate()` view,
`updateCurrencyRate(uint256)`, `RATE_DECIMALS` and the custom errors with the guardrail each stands for
(`RateUpdateCooldown` → `cooldown`, `RateChangeTooLarge` → `max-change`, `RateOutOfBounds` → `out-of-bounds`,
`RateUpdaterUnauthorized` → `unauthorized`). Swap in the final ABI by editing that file alone.

`classifyRejection` reads only the executor's fixed suffix (`revertData=0x<hex>` or `revertData=none` at the end
of `failed.error` or `reverted.reason`), decodes the bytes with viem `decodeErrorResult` against the fragment and
maps the error name. Anything else (`none`, a foreign selector, a malformed string) is `unknown`. Free text is
never parsed.

## Loop behaviour

Per tick, for a pair with no open operation: read ETH (and the quote symbol), record `price:<symbol>`, read the
contract rate, record `rate:<pairId>` (market, current, change in bps, price-miss counters), and when the change is
at least the trigger journal a `rate-update` operation (scope `gas` of the foreign chain), persist attempt 1 and
submit the update under `op:<id>:step:update:<attempt>`. The executor only ever receives that transaction.

- `confirmed`: the operation completes. `pending`: it waits; later ticks call `resolve`, never resubmit.
- Rejection (`failed` simulation or `reverted`): the operation stays open in step `deferred` until the wait passes
  (`cooldownSeconds` for `cooldown`, `rejectionRetrySeconds` otherwise). After it, the loop re-reads the market:
  back within the trigger closes the operation (`superseded`), else the next attempt proposes the **current market
  rate, unadjusted**, under a new key.
- `failed` with an `error` starting with `aborted:` (shutdown or an expired wait budget before signing, decisions
  [L57]/[L61]) is not a rejection: nothing was signed, so the next tick retries under a new attempt key with no
  wait, no rejection counted and no notification.
- `replaced` or `unknown`: the operation goes to `attention`; the loop then suspends (`suspended:rate:<pairId>`)
  and proposes nothing for that pair until the operator resolves the operation.
- A crash after the attempt is persisted resubmits under the same key (the executor never re-sends); a crash
  between the intent and the first attempt closes that operation as `failed` (nothing was sent).

## Notifications and operator actions

| Dedup key                                | Severity | When                                                                   | Operator action                                                                                                          |
| ---------------------------------------- | -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `rate:<pair>:price-unavailable`          | warning  | `priceMissesBeforeWarning` consecutive ticks without a price           | Check providers: feed addresses, heartbeats/freshness, CoinGecko key and rate limit, `maxSpreadBps`.                     |
| `rate:<pair>:price-unavailable-critical` | critical | No price for longer than `priceUnavailableCriticalSeconds`             | Restore a provider or enable another source; the contract keeps the last accepted rate.                                  |
| `rate:<pair>:max-change`                 | warning  | Contract refused a change above its maximum                            | None if the market moved fast (later updates catch up within the limit); otherwise check the sources.                    |
| `rate:<pair>:out-of-bounds`              | warning  | Market rate outside the contract's bounds                              | Check the sources; if the market really is outside, the bounds are governance's decision.                                |
| `rate:<pair>:unauthorized`               | critical | Contract refused the caller                                            | Grant the balancer EOA the rate-updater role, or fix the configured ForeignGateway address.                              |
| `rate:<pair>:unknown-rejection`          | warning  | Unclassified failure (`revertData=none`, foreign error)                | Check the gateway address, the gas reserve, the RPC; the ABI fragment may be outdated.                                   |
| `rate:<pair>:rejected`                   | critical | `rejectionsBeforeCritical` consecutive rejections (once per operation) | Investigate; the gateway keeps charging with the stale rate.                                                             |
| `rate:<pair>:attention:<op>`             | warning  | `replaced` or `unknown` outcome                                        | Check the transaction and the contract's rate, then mark the operation completed or failed.                              |
| `suspended:rate:<pair>`                  | warning  | Suspended behind an `attention` operation                              | Same as above; the loop clears its suspension by itself once no `attention` operation remains. A restart clears nothing. |

A `cooldown` rejection is expected and only logged; it counts towards `rejectionsBeforeCritical`.

## Tests

`providers/chainlink.test.ts`, `providers/coingecko.test.ts`, `aggregator.test.ts`, `gatewayRate.test.ts`,
`loop.test.ts`, `config.test.ts`; all on fakes and fixtures, no network. `fixtures/coingecko-simple-price.json` is
the operator's recording of the public keyless endpoint from 2026-10-06 (see `fixtures/README.md`).

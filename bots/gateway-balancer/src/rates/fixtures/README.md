# Rates fixtures

Recorded HTTP answers parsed by the price providers. Tests serve them through a `ports.fetch` stub and never call
the network.

| File                          | Source                                                                                                                             | Recorded   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `coingecko-simple-price.json` | `GET https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd&include_last_updated_at=true` (keyless) | 2026-10-06 |

`coingecko-simple-price.json` is a verbatim copy of `features/gateway-balancer-bot/recorded/coingecko-simple-price.json`,
recorded by the operator from the public endpoint: ETH 2685.05 USD (`last_updated_at` 1791314540), USDC 0.999934 USD
(`last_updated_at` 1791314550). `providers/coingecko.test.ts` pins these values and runs its clock at 1791314600, just
after the recording, so the timestamps are fresh.

The provider adds `precision=full` to its requests; the recorded answer was taken without it, which only changes the
number of decimals CoinGecko returns, not the shape. To re-record, fetch the URL above (no key needed), replace the
file verbatim and update the values and date here and in `coingecko.test.ts`. A fixture never contains an API key.

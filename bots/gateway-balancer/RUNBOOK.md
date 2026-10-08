# Gateway balancer bot: operator runbook

How to take the bot from a checkout to a running instance, what must be true before it is allowed to move funds, and
what to do when it asks for you. The README documents the design and every configuration field; the lane READMEs
(`src/refill`, `src/lifi`, `src/reporter`, `src/rates`) document their sections and notifications. This file is the
checklist.

The bot has never run against a live chain. Its first deployment is a testnet one, and every step below applies there
as on mainnet.

## 1. What the bot needs from outside

Nothing in this list is the bot's own code. Until each item exists, the bot can start, read and report, but not move
funds.

| Item                                                                                                                                                                                    | Owner          | Where it goes                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| The new HomeGateway and ForeignGateway deployed on each chain, with `feeBalances`, `withdrawFees(category, token, recipient, amount)` and a payable `depositNative` (`src/gateway/abi`) | contracts team | `topology.pairs[].homeGateway` / `foreignGateway`    |
| Each pair's reporter addresses and how a reporter is funded (`nativeTransfer` today)                                                                                                    | contracts team | `topology.routes[]`                                  |
| The chains: ids, confirmations, explorer URLs, native symbol and decimals (Arc's USDC is 18 decimals natively, 6 in LI.FI)                                                              | you            | `topology.chains[]`, `lifi.nativeTokens`             |
| One RPC URL per chain, one EOA key, the Slack webhook                                                                                                                                   | you            | the environment (`.env.example`)                     |
| A gas float of the native token on every chain for that EOA (section 5)                                                                                                                 | you            | the EOA's balance                                    |
| Executable LI.FI quotes for every route class, and the tools, targets, spenders and fee wallet you approve                                                                              | you + LI.FI    | `lifi.allowed*`, `lifi.feeRecipients`, `lifi.limits` |
| Verified price feeds (Chainlink addresses and heartbeats, CoinGecko key) and the disagreement thresholds                                                                                | you            | `rates.providers[]`, `rates.maxSpreadBps`            |
| The economics: reference case cost, reporter cost per message, low-water and target levels, economic minimums                                                                           | you            | `refill.*`, `reporter.*`                             |

LI.FI quotes and bridges mainnet routes. If the testnet chains you pick have no LI.FI coverage (check with `lifi-probe`
against a testnet configuration), the testnet run exercises the contract side only: refill claims, deposits, reporter
funding and rate updates. The transfer legs then need a small-budget mainnet run (specification test 15) before an
unattended mainnet start.

## 2. Install and check

From the repository root:

```sh
bash features/_shared/web-setup.sh install          # or: yarn install
yarn workspace @kleros/gateway-balancer-bot check-types
yarn workspace @kleros/gateway-balancer-bot check-style
PATH=$HOME/.foundry/bin:$PATH yarn workspace @kleros/gateway-balancer-bot test   # needs anvil on PATH
```

Node 22.13 or newer (`node:sqlite`). Every test uses fakes or a local anvil; none reaches a network.

## 3. Configuration

One JSON file, `config/config.json` by default (`GATEWAY_BALANCER_CONFIG` names another). Build it from the examples;
they are not one file on purpose, because the lane examples record mainnet observations (LI.FI's Arc chain id 5042,
mainnet feed addresses) that do not belong in a testnet topology.

1. Copy `config/example.json`. Replace every zero address and placeholder chain id; `example.json` keeps the Arc
   testnet id the specification cites until the mainnet id is verified.
2. `platform`: start from `{}` (every default is spelled out in `config/platform.example.json`). Set
   `gas.minimumReserveWei` per chain (section 5) and, when the native token is not ETH, `gas.defaultMinimumReserveWei`.
   Enable Slack under `notifications.providers.slack`. Leave `health.host` on loopback unless the port is published
   behind your own proxy (`health.allowNonLoopback`).
3. `refill`: copy `src/refill/example-config.json`. A pair without `referenceCaseCostEth` never refills: its loop only
   records observations. That is the intended first state.
4. `lifi`: copy `src/lifi/example-config.json`, then edit it for your chains. With `"lifi": {}` every quote is rejected
   (nothing is approved by default). `feeRecipients` ships empty and must stay empty until LI.FI confirms its fee
   wallet per chain (see section 4). `limits` must name every source asset.
5. `reporter`: copy `src/reporter/example-config.json` (its `reporter` object is the section). Every route needs a
   `costPerMessage`; a route without one is suspended with a critical notification.
6. `rates`: copy `src/rates/example-config.json`. Verify each Chainlink feed address and heartbeat on data.chain.link
   for your chains and set `freshnessSeconds` to the heartbeat plus a margin.

The load refuses an invalid file and names the JSON path. Run it without secrets to check the file:

```sh
GATEWAY_BALANCER_CONFIG=config/config.json yarn workspace @kleros/gateway-balancer-bot status
```

`status` needs no key or RPC variable; a missing journal prints an empty status.

## 4. Launch gates

Specification section 13, in the order they can be closed. Every gate is operator work; none is closed by a test.

| #   | Gate                                                                                 | How to check                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Final gateway and reporter addresses and ABIs                                        | Compare `src/gateway/abi/*.ts` with the deployed ABIs: selectors, argument order, `depositNative` payable.                                                           |
| 2   | Reporter funding method and native-token representation per chain, Arc in particular | One manual native transfer to each reporter; `refill.depositMethod` stays `function` unless the gateway's `receive()` is verified.                                   |
| 3   | Executable LI.FI quotes for every route class                                        | `BALANCER_ADDRESS=0x… yarn workspace @kleros/gateway-balancer-bot lifi-probe` exits 0 with every class `APPROVED`; it reads no key and never signs.                  |
| 4   | Approved bridges, spenders, contracts, fee wallet                                    | Every address the probe prints (tools, targets, spenders, swap contracts, LayerSwap depositories, fee recipient) is verified with LI.FI and added to the allowlists. |
| 5   | Price feeds and thresholds                                                           | `status` shows a `price:*` observation per symbol from `rates.minSources` providers within `rates.maxSpreadBps`.                                                     |
| 6   | Reporter cost per message, trigger and target                                        | Set from a measured message; `status` shows `reporter:*` balances against the thresholds.                                                                            |
| 7   | Reference case cost and economic minimums                                            | `refill.referenceCaseCostEth` set per pair; `status` shows `capacity:*` per pair.                                                                                    |
| 8   | Fee caps, per-transfer and daily limits, slippage baseline                           | `lifi.limits`, `lifi.maxFeeBps`, `lifi.maxQuotedFeeBps`, `lifi.maxLossBps` reviewed against the probe's quotes.                                                      |
| 9   | Polling cadence, retry limits, confirmations, escalation                             | `platform.schedule`, `platform.executor`, `topology.chains[].confirmations`, `lifi.*Ticks`/`*Seconds` reviewed; Slack receives a test notification.                  |
| 10  | Operator gas float and minimum reserve                                               | Section 5 done on every chain; `status` shows `gas:<chainId>` with `low: false`.                                                                                     |
| 11  | The mainnet test budget and first transfers approved                                 | Explicit written approval; the first transfers are watched live (section 7).                                                                                         |

Two more items from the review record, closed by the first real run:

- The real delivery path (specification test 15): a bridge delivery is credited up to the quote's estimate and the
  balance delta is a warning, never a gate. Watch the first deliveries against the ledger.
- Fee recipients (decisions [L41]): the recorded quotes paid `0xC06e…264B`; that is an observation. Confirm the
  wallet with LI.FI before adding it.

## 5. The gas float

The EOA pays gas from its own native balance on every chain. The bot never tops up gas from fee funds and never
counts a top-up as fee funds: every amount the EOA holds for the gateways is a ledger holding, and the executor refuses
a transaction when `balance - holdings - in-flight value` cannot pay it (`gas-reserve:` critical).

Per chain, before start:

1. Fund the EOA with the native token: at least `gas.minimumReserveWei` plus a few transactions' gas at peak fees. On
   an OP-stack chain (Base) the reserve also covers the L1 data fee, which the executor reads from the GasPriceOracle.
2. Set `gas.minimumReserveWei[<chainId>]` so that a `gas-low` warning arrives well before a refusal.
3. After start, `status` shows `gas:<chainId>`: balance, ledger-held, in-flight, reserve, minimum, `low`.

Accepted v1 risk (README, "gas float"): money that has arrived on a chain but is not yet credited looks like operator
gas for a bounded window. Treat a `gas-low` warning as a request to top up, never as permission to spend fee funds.

## 6. Running it

### Docker (recommended)

From `bots/gateway-balancer`:

```sh
cp .env.example .env && chmod 600 .env             # fill in BALANCER_PRIVATE_KEY, the RPC URLs, SLACK_WEBHOOK_URL
docker compose build
docker compose run --rm gateway-balancer reconcile  # ownership, recovery, reconciliation, then exit
docker compose up -d
docker compose logs -f gateway-balancer
docker compose run --rm gateway-balancer status
```

The journal is the named volume `journal`; the configuration is bind-mounted read-only. The image runs the bot as the
`node` user with `tsx src/main.ts`, the same command as `yarn start`. `stop_grace_period` is 75 s, above
`schedule.stopTimeoutMs`; raise both together if you raise `executor.waitMs`.

### Without Docker

```sh
set -a; . ./.env; set +a
yarn workspace @kleros/gateway-balancer-bot reconcile
yarn workspace @kleros/gateway-balancer-bot start
```

Run it under a supervisor that sends `SIGTERM` and waits at least `schedule.stopTimeoutMs` before `SIGKILL`.

### One instance

The journal's `owner` row refuses a second `start` while the first heartbeats, and is taken over once the heartbeat is
older than `ownership.staleAfterMs`. Never run two instances against one journal on purpose; never copy a journal to
a second host and start there.

## 7. First transfers (watched)

Start with every lane disabled from moving funds (no `referenceCaseCostEth`, `lifi.limits` tiny, reporter targets at
their current balances) and raise one knob at a time:

1. `reconcile`, then `start`. `status` is `ok`, every chain's `gas:*` is `low: false`, prices and rates are observed.
2. Rates first: the rates loop writes the ForeignGateway currency rate. Watch one update confirm; it is the smallest
   transaction.
3. Reporter next, on a same-unit route (Base ETH for a Base reporter): claim, withdraw, fund. Watch the ledger
   (`holdings` in `status`) return to zero for the route.
4. One cross-asset or cross-chain transfer with `lifi.limits` at the test budget. Follow the operation in `status`
   through `quote`, `approve`, `send`, `bridging`, `unwrap`, `completed`; compare the `transfer-delta` observation
   with the explorer.
5. Refill last: set `referenceCaseCostEth` for one pair and watch a withdrawal, a bridge and a deposit.

Each step raises its own notifications; if any operation reaches `attention`, stop raising knobs and resolve it
(section 8) before continuing.

## 8. When the bot asks for you

Each notification names its action; the README ("Operator actions") and the lane READMEs have the detail. The ones
that stop the bot's own progress:

| Notification                                                                       | What it means                                                                             | What to do                                                                                                                               |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Out of operator gas on <chain>` (critical)                                        | The executor refused to sign; nothing was sent.                                           | Send native token to the EOA. The loop retries on its next tick.                                                                         |
| `Transaction stuck on <chain> at nonce <n>`                                        | Unconfirmed past `executor.stuckAfterMs`; later submits on that chain wait.               | README, "Stuck transaction procedure": wait out the fee spike or cancel at that nonce with a 0-value self-transfer from the EOA.         |
| `Operation <id> needs attention` (critical)                                        | A transaction is `unknown` or `replaced`, or a transfer step could not finish.            | Check the hashes on the explorer, correct the ledger to the chain, then close the operation (below). The bot never retries it by itself. |
| `LI.FI continuation swap abandoned: intermediate token left in the EOA` (critical) | A bridged intermediate token sits on the destination chain and the bot could not swap it. | Swap it by hand from the EOA; the ledger already holds it at `eoa`. Resuming the operation does not swap it.                             |
| `Balancer instance lost journal ownership`                                         | Another instance took the journal.                                                        | Stop the extra instance; start one.                                                                                                      |
| `Low gas reserve on <chain>` (warning)                                             | Below `gas.minimumReserveWei`.                                                            | Top up before it becomes a refusal.                                                                                                      |

**Closing an operation in attention.** Decide from the explorer what moved, then, with the bot stopped (the command
takes journal ownership like `reconcile`):

```sh
yarn workspace @kleros/gateway-balancer-bot close-operation <id> --as failed --note "tx 0x… reverted, nothing moved"
```

Use `--as completed` when the funds did move as planned. The command refuses an operation that is not in `attention`
and prints the closed record, what its scopes still hold in the ledger and any child operation left open (a refill's
transfer has its own id and its own decision). The ledger is never changed by the close: when the chain disagrees
with what it prints, write down the difference; there is no ledger edit command. Then `reconcile` and `start`. In
Docker: `docker compose stop`, `docker compose run --rm gateway-balancer close-operation <id> --as failed --note "…"`,
`docker compose start`.

**Notifications after a crash.** A dedup key recorded right before a crash can suppress the next occurrence for the
rest of `notifications.dedupWindowSeconds`. After any restart, read `status` rather than waiting for a notification.

## 9. Backups, upgrades, keys

- **Journal.** SQLite in WAL mode. Back it up with the bot stopped, or online with
  `sqlite3 data/journal.sqlite ".backup 'journal-$(date +%F).sqlite'"`. Never restore a backup over a journal that has
  since signed transactions: the nonces and idempotency keys would be reused.
- **Upgrade.** `docker compose build`, `docker compose run --rm gateway-balancer reconcile` with the new image, then
  `up -d`. Reconciliation on start resolves every non-final transaction before any loop ticks.
- **Key rotation.** Stop the bot with no open operation (`status`: `operations.open` empty). Move every holding the
  ledger lists, and the gas float, from the old EOA to the new one by hand. Start the bot with the new key against a
  fresh journal: the old journal's ledger and transaction records belong to the old signer, and the new instance would
  not see its holdings. Keep the old journal as the record of what moved.
- **Secrets.** `.env` is read by compose only, `chmod 600`, never in the image. Rotating an RPC URL or the webhook is
  a restart; nothing is persisted from them (they are redacted from logs and the journal).

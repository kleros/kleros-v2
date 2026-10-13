# Gateway balancer bot: operator runbook

How to take the bot from a checkout to a running instance, what must be true before it is allowed to move funds, and
what to do when it asks for you. The README documents the design and every configuration field; the lane READMEs
(`src/refill`, `src/lifi`, `src/reporter`, `src/rates`) document their sections and notifications. This file is the
checklist.

The bot has never run against a live chain. Its first deployment is the mainnet launch on the Veashi gateways (Base
foreign, Arbitrum home): section 10, "Mainnet launch", takes it from the gateway deploy to the first ruling. Sections
1 to 9 apply there too.

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

| Notification                                                                       | What it means                                                                             | What to do                                                                                                                                                                              |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Out of operator gas on <chain>` (critical)                                        | The executor refused to sign; nothing was sent.                                           | Send native token to the EOA. The loop retries on its next tick.                                                                                                                        |
| `Transaction stuck on <chain> at nonce <n>`                                        | Unconfirmed past `executor.stuckAfterMs`; later submits on that chain wait.               | README, "Stuck transaction procedure": wait out the fee spike or cancel at that nonce with a 0-value self-transfer from the EOA.                                                        |
| `Operation <id> needs attention` (critical)                                        | A transaction is `unknown` or `replaced`, or a transfer step could not finish.            | Check the hashes on the explorer, then close the operation with the corrections that match the chain (below). The bot never retries it by itself.                                       |
| `LI.FI continuation swap abandoned: intermediate token left in the EOA` (critical) | A bridged intermediate token sits on the destination chain and the bot could not swap it. | Swap it by hand from the EOA, then close the transfer as `completed` with `--debit` of the token and `--credit` of what the swap gave (below). Resuming the operation does not swap it. |
| `Ledger holds more <asset> than the EOA on <chain>` (critical)                     | Funds left the EOA without the ledger (a hand transaction, a hand swap).                  | Find the transaction; debit the scope that lost them with `close-operation` or `correct-ledger` (below). Native: the chain is blocked until fixed.                                      |
| `<asset> in the EOA that no scope holds on <chain>` (warning)                      | Tokens arrived that no scope holds, with no operation open.                               | Credit them to the operation they belong to with `correct-ledger`, or move them out by hand.                                                                                            |
| `Balancer instance lost journal ownership`                                         | Another instance took the journal.                                                        | Stop the extra instance; start one.                                                                                                                                                     |
| `Low gas reserve on <chain>` (warning)                                             | Below `gas.minimumReserveWei`.                                                            | Top up before it becomes a refusal.                                                                                                                                                     |

**Closing an operation in attention.** With the bot stopped (both commands take journal ownership like `reconcile`):

1. Decide from the explorer what moved. Make sure nothing of the operation can still land: a pending transaction at
   a free nonce must be cancelled first (README, "Stuck transaction procedure").
2. Compare with what `status` shows under `holdings` for the operation's scopes. Each difference is one correction,
   `<scope>@<chainId>:<asset>[:eoa|in-transit]=<amount in wei>`, on one of the operation's own scopes:
   `--credit` for funds the chain shows and the ledger lacks, `--debit` for the opposite.
3. Close it:

```sh
yarn workspace @kleros/gateway-balancer-bot close-operation <id> --as failed \
  --credit "arbitration:base-arbitrum@8453:native=1500000000000000" --note "withdrawal 0x… executed, credit was lost"
```

Use `--as completed` when the funds moved as planned, and no correction when the ledger already matches. The command
validates every correction before writing any (a debit never exceeds its holding), releases the operation's open
withdrawal claims, and prints the record, the corrections, the released claims, what the scopes now hold, any child
operation left open and a parent still in `attention` (close a transfer first, then its refill or funding operation).
Then `reconcile` and `start`. On the next `gas.intervalMs` the ledger audit compares the ledger with the chain again:
`status` shows `ledger:*` with `state: "ok"` when it matches. In Docker: `docker compose stop`,
`docker compose run --rm gateway-balancer close-operation …`, `docker compose start`.

**A released continuation token swapped by hand.** The transfer is in `attention` with the token at `eoa` (or
`in-transit`) under its scope. After the hand swap, close it as `completed` with `--debit` of the token and `--credit`
of the native amount the swap delivered, on the same scope.

**A correction after the close.** When the audit raises `ledger-over` or `ledger-untracked` later (a transaction that
landed after its operation was closed), apply the correction to that closed operation:

```sh
yarn workspace @kleros/gateway-balancer-bot correct-ledger <id> --credit "<spec>" --note "0x… landed in block …"
```

**Notifications after a crash.** A dedup key recorded right before a crash can suppress the next occurrence for the
rest of `notifications.dedupWindowSeconds`. After any restart, read `status` rather than waiting for a notification.

## 9. Backups, upgrades, keys

- **Journal.** SQLite in WAL mode. Back it up with the bot stopped, or online with
  `sqlite3 data/journal.sqlite ".backup 'journal-$(date +%F).sqlite'"`. Never restore a backup over a journal that has
  since signed transactions: the nonces and idempotency keys would be reused.
- **Upgrade.** `docker compose build`, `docker compose run --rm gateway-balancer reconcile` with the new image, then
  `up -d`. Reconciliation on start resolves every non-final transaction before any loop ticks.
- **Key rotation.** Keep the journal: the ledger's holdings belong to scopes, not to a key, and a fresh journal would
  lose every one of them (the moved fee funds would look like operator gas). Stop the bot with no open operation and
  no non-final transaction (`status`: `operations.open` and `transactions` empty). Move every amount the ledger lists
  at `eoa`, per chain and asset, and the gas float from the old EOA to the new one by hand. Start the bot with the new
  key on the same journal; the ledger audit then checks the new EOA against the ledger on its first run, and a
  `ledger-over` critical means something was not moved.
- **Secrets.** `.env` is read by compose only, `chmod 600`, never in the image. Rotating an RPC URL or the webhook is
  a restart; nothing is persisted from them (they are redacted from logs and the journal).

## 10. Mainnet launch

From nothing deployed to the first ruling on the Veashi gateways: ForeignGateway on Base (8453), HomeGateway on
Arbitrum One (42161), the mock arbitrator (a KlerosCoreRuler in manual mode) on Arbitrum, and the already-deployed,
pre-audit reporters and adapters of `@kleros/veashi-sdk` 0.1.0. Everything below is operator work on live chains; the
repository's tests only ran these scripts on the in-process hardhat network.

Run each step in order and stop at the first failure. Commands run from the repository root unless they `cd`.

### 10.1 Launch prerequisites

- **A Hashi executor for both directions** (decisions [O13]). The bot does not execute Hashi messages and nothing
  arrives without an external executor: the vea `relayer-cli` Hashi executor, running for **8453→42161** (disputes,
  Base to Arbitrum) and **42161→8453** (rulings, Arbitrum to Base). See 10.7. No executor, no launch.
- The deployer key (`PRIVATE_KEY`) funded with ETH on Base and Arbitrum for the deploy transactions.
- The bot's EOA (`BALANCER_PRIVATE_KEY`); its address is the ForeignGateway keeper (`VEASHI_KEEPER_ADDRESS`):
  `withdrawFees` always pays the keeper, and the bot refuses a withdrawal when it is not the keeper.
- The pre-deploy checklist (10.3) answered with the expected values on all six reporters.

### 10.2 Environment variables (names only; never commit or paste their values)

| Variable                | Used by                         | What                                                                                                         |
| ----------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `PRIVATE_KEY`           | contracts deploy (both chains)  | The deployer: governor of every deployed contract and the HomeGateway's ruler on the KlerosCoreRuler.          |
| `VEASHI_KEEPER_ADDRESS` | contracts deploy (all 3 steps)  | The bot's EOA address. The scripts refuse a live network before any transaction when it is missing, malformed (bad checksum included) or zero. |
| `BASE_RPC`              | contracts deploy                | Base RPC URL (default: Infura with `INFURA_API_KEY`).                                                          |
| `ARBITRUM_RPC`          | contracts deploy                | Arbitrum RPC URL (default: Infura with `INFURA_API_KEY`); step 3 also reads the HomeGateway through it.       |
| `INFURA_API_KEY`        | contracts deploy                | Only when `BASE_RPC`/`ARBITRUM_RPC` are unset.                                                                |
| `ETHERSCAN_API_KEY`     | contracts verify                | Etherscan v2 key, verifies on Basescan and Arbiscan.                                                         |
| `BALANCER_PRIVATE_KEY`  | bot                             | The bot's EOA key.                                                                                           |
| `BASE_RPC_URL`, `ARBITRUM_RPC_URL` | bot                  | The bot's RPC URLs (`topology.chains[].rpcUrlEnv`).                                                           |
| `COINGECKO_API_KEY`     | bot                             | CoinGecko key, the second price family (`rates.providers[].apiKeyEnv`). Not in `.env.example`: add the line. |
| `GATEWAY_BALANCER_CONFIG` | bot                           | `config/mainnet.json`.                                                                                       |
| `SLACK_WEBHOOK_URL`     | bot                             | When Slack is enabled.                                                                                       |

### 10.3 Read-only pre-deploy checklist (`cast call`)

Run before deploying anything (decisions [L4]). Only `eth_call`s: nothing is signed. The reporters are those of the SDK
getters (`yarn workspace @kleros/gateway-balancer-bot exec tsx src/mainnet/cli.ts --check --foreign-gateway
0x2222222222222222222222222222222222222223 --home-gateway 0x3333333333333333333333333333333333333334` prints them
without deploy output; the two gateway values there are dummies). SDK 0.1.0 resolves them to:

| Route                  | Bridge    | Reporter (chain)                                       | Its adapter on the other chain               |
| ---------------------- | --------- | ------------------------------------------------------ | -------------------------------------------- |
| `base->arbitrum:ccip`  | CCIP      | `0xDb364bDCbE89319A28dbaaD7B2225767316f845e` (Base)     | `0x55d6eE3D0ebbB82D58E7437FC905Fc19229Be424` |
| `base->arbitrum:lz`    | LayerZero | `0xafc2b3026d2D3eD1Fbfeb045AC69C1EF3fcfb8f7` (Base)     | `0xfFA5A8A87b81b7087039a6Df4A71d819db66fE54` |
| `base->arbitrum:axelar`| Axelar    | `0xB589ADAb067Fae921fAFdc1e8b724Bd798FD71B1` (Base)     | `0x8E217460313B3841BD712219D3907D189ED52993` |
| `arbitrum->base:ccip`  | CCIP      | `0xA6243C9DDf54de341De4D30F6955bdF50dE8e488` (Arbitrum) | `0xE8A05651c3C8a9fE1C8F07D4A4Bf9D225D7Ab6b3` |
| `arbitrum->base:lz`    | LayerZero | `0x40126673C226c4dc4329332E761993e0d7215cA4` (Arbitrum) | `0x9a8b9BE75F5811989a47b7b3749EAC3D95bbDD80` |
| `arbitrum->base:axelar`| Axelar    | `0x36fed3b8eaeB87ab8Bc7dB90FA394fD7a1279CfB` (Arbitrum) | `0xc8763f92fCf64b37dB9eC840406E22D01BBe0A29` |

The calls use the SDK reporters' ABI (`CCIPReporter.feeToken()`, `chainSelectors(uint256)`;
`LayerZeroReporter.endpointIds(uint256)`, `peers(uint32)`, `fee()`; `AxelarReporter.chainNames(uint256)`, `fee()`).

```sh
B=$BASE_RPC; A=$ARBITRUM_RPC
# CCIP: fees in native ETH (feeToken = 0x0) and a selector for the counterpart chain.
cast call --rpc-url $B 0xDb364bDCbE89319A28dbaaD7B2225767316f845e "feeToken()(address)"            # 0x0000000000000000000000000000000000000000
cast call --rpc-url $B 0xDb364bDCbE89319A28dbaaD7B2225767316f845e "chainSelectors(uint256)(uint64)" 42161  # 4949039107694359620
cast call --rpc-url $A 0xA6243C9DDf54de341De4D30F6955bdF50dE8e488 "feeToken()(address)"            # 0x0000000000000000000000000000000000000000
cast call --rpc-url $A 0xA6243C9DDf54de341De4D30F6955bdF50dE8e488 "chainSelectors(uint256)(uint64)" 8453   # 15971525489660198786
# LayerZero: endpoint id of the counterpart chain, and that endpoint's peer = the route's adapter, left-padded.
cast call --rpc-url $B 0xafc2b3026d2D3eD1Fbfeb045AC69C1EF3fcfb8f7 "endpointIds(uint256)(uint32)" 42161  # 30110
cast call --rpc-url $B 0xafc2b3026d2D3eD1Fbfeb045AC69C1EF3fcfb8f7 "peers(uint32)(bytes32)" 30110
#   0x000000000000000000000000ffa5a8a87b81b7087039a6df4a71d819db66fe54
cast call --rpc-url $A 0x40126673C226c4dc4329332E761993e0d7215cA4 "endpointIds(uint256)(uint32)" 8453   # 30184
cast call --rpc-url $A 0x40126673C226c4dc4329332E761993e0d7215cA4 "peers(uint32)(bytes32)" 30184
#   0x0000000000000000000000009a8b9be75f5811989a47b7b3749eac3d95bbdd80
cast call --rpc-url $B 0xafc2b3026d2D3eD1Fbfeb045AC69C1EF3fcfb8f7 "fee()(uint128)"
cast call --rpc-url $A 0x40126673C226c4dc4329332E761993e0d7215cA4 "fee()(uint128)"
# Axelar: Axelar's name of the counterpart chain, and a non-zero fixed fee.
cast call --rpc-url $B 0xB589ADAb067Fae921fAFdc1e8b724Bd798FD71B1 "chainNames(uint256)(string)" 42161   # "arbitrum"
cast call --rpc-url $B 0xB589ADAb067Fae921fAFdc1e8b724Bd798FD71B1 "fee()(uint256)"                       # > 0
cast call --rpc-url $A 0x36fed3b8eaeB87ab8Bc7dB90FA394fD7a1279CfB "chainNames(uint256)(string)" 8453    # "base"
cast call --rpc-url $A 0x36fed3b8eaeB87ab8Bc7dB90FA394fD7a1279CfB "fee()(uint256)"                       # > 0
# Balances: what anyone can already spend through Yaho (10.9).
for r in 0xDb364bDCbE89319A28dbaaD7B2225767316f845e 0xafc2b3026d2D3eD1Fbfeb045AC69C1EF3fcfb8f7 0xB589ADAb067Fae921fAFdc1e8b724Bd798FD71B1; do cast balance --rpc-url $B $r; done
for r in 0xA6243C9DDf54de341De4D30F6955bdF50dE8e488 0x40126673C226c4dc4329332E761993e0d7215cA4 0x36fed3b8eaeB87ab8Bc7dB90FA394fD7a1279CfB; do cast balance --rpc-url $A $r; done
```

Do not accept "any non-zero mapping": derive each expected value from its source and compare.

- CCIP chain selectors: Chainlink's CCIP directory (docs.chain.link/ccip/directory/mainnet), Arbitrum One and Base.
  The values in the comments were recorded from it; re-check them.
- LayerZero endpoint ids: LayerZero V2 deployed endpoints (docs.layerzero.network, "Deployed Endpoints"): Arbitrum
  `30110`, Base `30184` as recorded. The peer must be the route's LayerZero adapter on the other chain, i.e.
  `getAdapter(<reporter chain>, <other chain>, Bridges.LZ)`, as a bytes32 with 12 leading zero bytes.
- Axelar chain names: Axelar's GMP chain identifiers (docs.axelar.dev, mainnet chain names); the recorded names are
  `arbitrum` and `base`. A wrong name dispatches to nowhere; an empty one reverts `ChainIdNotSupported`, which
  reverts the whole dispute creation.
- Axelar `fee()`: the fixed amount the reporter pays Axelar's gas service per message. It must cover execution on
  the other chain at current gas prices, or the message is not executed there; set the route's `costPerMessage` to
  this value (10.4).

Any mismatch is a stop: a selected reporter that reverts reverts `relayDispute`, so every Lightbulb request reverts.

### 10.4 Parameters to review

Contracts, `contracts/deploy/utils/veashi/parameters.ts` (`MAINNET_DEFAULTS`):

- `oracles`: CCIP id 0, LayerZero id 1, Axelar id 2, registered in that order on both gateways; `bridgingCost` per
  oracle, the round trip (dispute leg on Base + ruling leg on Arbitrum) charged per dispute, in Base wei. Default
  0.0004 / 0.0002 / 0.0002 ETH, the sum of the two routes' `costPerMessage` below.
- `defaultOracleIds` `[0, 1, 2]` and `defaultThreshold` `2`. Every selected reporter dispatches and every selected
  bridging cost is charged on every dispute. Threshold 2 tolerates one *delivery* failure (a bridge that never
  delivers), not a dispatch revert or a drained reporter: those revert the dispute creation. Changing the defaults
  later (`setDefaultOracles`) does not change existing disputes, which keep the snapshot taken at creation.
- `court`: General court (1), 3 jurors, `feeForJuror` 0.0001 ETH. A Lightbulb case then costs the HomeGateway 0.0003
  ETH, which must equal the bot's `refill.pairs.base-arbitrum.referenceCaseCostEth` (a test compares them).
- `usdc`: native USDC on Base, `rateDecimals` 6, `rateInEth = 1e18 / USDC_PER_ETH`. **Set `USDC_PER_ETH` to the
  market price on deploy day**: the keeper then moves the rate at most `keeperMaxChangeBps` (5 %) per
  `keeperCooldown` (1 h), so a stale start takes hours to correct.
- `homeNativeRate`: 1e18, fixed (Base and Arbitrum both use ETH); the bot runs no loop for it.
- `ruler`: `{ kind: "deploy" }` (default) deploys a dedicated `VeashiKlerosCoreRuler` proxy, governor = deployer.
  `{ kind: "existing", address: "0xc0169e0B19aE02ac4fADD689260CF038726DFE13" }` (KlerosCoreRulerNeo) reuses a ruler:
  it is not redeployed, its fees are not ours (step 2 refuses when its `arbitrationCost` for the Lightbulb's extraData
  differs from `court.feeForJuror × court.minJurors`), and step 2 fails loudly if the HomeGateway's manual mode on it
  already belongs to someone else.
- The script validates all of these before any transaction: duplicate or unknown oracle IDs, a threshold outside
  1..selection length, a zero fee, cost or rate, a `homeNativeRate` other than 1e18.

Bot, `bots/gateway-balancer/src/mainnet/parameters.ts` (the generated configuration's values):

- `COST_PER_MESSAGE` per route (CCIP 0.0002, LayerZero 0.0001, Axelar 0.0001 ETH): measure one message per route
  (CCIP and LayerZero quote per message; Axelar pays its fixed `fee()`) and set the value from the measurement.
- `REPORTER_DEFAULTS`: low water 3, target 10, minimum top-up 2 messages per route (10.10).
- `REFERENCE_CASE_COST_ETH` 0.0003 and `REFILL` (low water 5, target 20 cases): the HomeGateway float.
- `CHAINLINK_FEEDS`: ETH/USD and USDC/USD on Arbitrum and Base. Verify each address, its 8 decimals and its heartbeat
  on Chainlink's data-feeds documentation (docs.chain.link/data-feeds/price-feeds/addresses) and keep
  `freshnessSeconds` at the heartbeat plus a margin.
- `COINGECKO` (key from `COINGECKO_API_KEY`) and `MIN_PRICE_SOURCES` 2 (10.11).
- `MINIMUM_GAS_RESERVE_WEI` and `LIFI_LIMITS` (a small test budget; tools, targets, spenders and fee wallets stay empty
  until `lifi-probe` and the LI.FI review of section 4).

### 10.5 Deploy

Always pass `--tags`: an untagged run executes every script in `contracts/deploy`. Never pass `--reset` (it deletes the
network's deployment records). The Veashi deployments are named `VeashiForeignGateway`, `VeashiGatewayLightbulb`,
`VeashiKlerosCoreRuler`, `VeashiHomeGateway`, so they never reuse or upgrade another artifact.

```sh
cd contracts
export VEASHI_KEEPER_ADDRESS=0x…   # the bot's EOA address
yarn build
# Step 1, Base: ForeignGateway proxy (home gateway placeholder = zero address) and GatewayLightbulb.
yarn deploy --network base --tags VeashiForeign
# Step 2, Arbitrum: VeashiKlerosCoreRuler, HomeGateway proxy (reads deployments/base/VeashiForeignGateway.json),
#         changeRulingModeToManual(HomeGateway) from the deployer, read-back of the HomeGateway and the ruler.
yarn deploy --network arbitrum --tags VeashiHome
# Step 3, Base: changeHomeGateway, changeCourtJurorFee, setOracleBridgingCost x3, changeAcceptedFeeTokens(USDC),
#         changeCurrencyRates(USDC), then the read-back of both gateways (reads the HomeGateway over ARBITRUM_RPC).
yarn deploy --network base --tags VeashiForeignConfigure
# Verification on Basescan and Arbiscan
yarn etherscan-verify --network base && yarn etherscan-verify --network arbitrum
```

Between step 1 and step 3 the ForeignGateway charges nothing (no juror fee, no bridging cost) and relays to the zero
address: do not announce it, and run step 3 right after step 2. Steps are idempotent: a re-run skips what is already
set. `initialize` is final (`changeYaho`, `changeYaru` and `setOracleEnabled` revert `NotImplemented`): a wrong Yaho,
Yaru or oracle means a new ForeignGateway.

### 10.6 Read-back

Step 2 fails unless the HomeGateway names the ForeignGateway, the ruler, the SDK's Yaho and Yaru for Arbitrum and the
expected oracles, and the ruler's mode for the HomeGateway is manual with the deployer as its ruler. Step 3 fails unless
the ForeignGateway matches every parameter (governor, keeper, home gateway and chain, Yaho, Yaru, oracles, defaults,
juror fee, bridging costs, USDC, `homeNativeRate`) and the two oracle lists mirror: same IDs in the same order, the
HomeGateway's inbound adapter of oracle i equal to the ForeignGateway's outbound adapter of oracle i and the other way
round. Nothing on-chain enforces the mirror; a mismatch makes `onMessage` revert on the other chain. To re-check by hand:

```sh
F=$(jq -r .address contracts/deployments/base/VeashiForeignGateway.json)
H=$(jq -r .address contracts/deployments/arbitrum/VeashiHomeGateway.json)
R=$(jq -r .address contracts/deployments/arbitrum/VeashiKlerosCoreRuler.json)
L=$(jq -r .address contracts/deployments/base/VeashiGatewayLightbulb.json)
for i in 0 1 2; do
  cast call --rpc-url $BASE_RPC $F "oracles(uint256)(address,address,address,bool)" $i
  cast call --rpc-url $ARBITRUM_RPC $H "oracles(uint256)(address,address,address)" $i
done
cast call --rpc-url $BASE_RPC $F "keeper()(address)"                 # the bot's EOA
cast call --rpc-url $BASE_RPC $F "homeGateway()(address)"            # $H
cast call --rpc-url $ARBITRUM_RPC $R "rulers(address)(address)" $H     # the deployer
cast call --rpc-url $ARBITRUM_RPC $R "arbitrationCost(bytes)(uint256)" $(cast call --rpc-url $BASE_RPC $L "arbitratorExtraData()(bytes)")  # 300000000000000
cast call --rpc-url $BASE_RPC $F "arbitrationCost(bytes)(uint256)" $(cast call --rpc-url $BASE_RPC $L "arbitratorExtraData()(bytes)")   # 0.0003 + 0.0008 ETH
```

### 10.7 The Hashi executor (not the bot)

Reporters only *dispatch*; a message is delivered when its adapters on the other chain store its hash, and it takes
effect only when someone executes it on that chain's Yaru. The bot never does that (decisions [O13]). Run the vea
`relayer-cli` Hashi executor for both routes; it must watch:

| Route                 | Carries  | Yaho (source)                                         | Yaru (destination)                                        |
| --------------------- | -------- | ----------------------------------------------------- | --------------------------------------------------------- |
| 8453 → 42161          | disputes | `0x88fAa01842E32beA05b167C679443009c3891183` on Base   | `0x7Be1C881942D196D5A5Fd258F6957E1E138aaF46` on Arbitrum  |
| 42161 → 8453          | rulings  | `0xD0375320591ff87797CEb03CBeE80C82fD61BC77` on Arbitrum | `0x8eF6a2C992fCAA06C9E4e08399fad407CAB2eDBF` on Base     |

These are `getYaho(8453, 42161)`, `getYaru(8453, 42161)`, `getYaho(42161, 8453)` and `getYaru(42161, 8453)` of SDK 0.1.0;
print them from the SDK if it changes (`cd contracts && node -e 'const s=require("@kleros/veashi-sdk");
console.log(s.getYaho(8453,42161), s.getYaru(8453,42161), s.getYaho(42161,8453), s.getYaru(42161,8453))'`).

Verify execution on the destination, not delivery: adapter hashes merely stored mean the bridges worked, not that
anything happened.

- Dispute leg executed: the HomeGateway emitted `CrossChainDisputeIncoming` and the ruler `DisputeCreation`;
  `getReceivedDispute(<disputeHash>)` on the HomeGateway returns `received = true` and the HomeGateway's balance
  dropped by the case cost.
- Ruling leg executed: the ForeignGateway emitted `Ruling`, `disputeHashtoDisputeData(<disputeHash>)` shows
  `ruled = true`, and the Lightbulb emitted `LightbulbSwitched`.

While the executor is down the bot sees fees arriving on Base and reporter balances dropping (dispatch happens on Base
when the dispute is relayed), but no HomeGateway capacity drop and therefore no refill. A `capacity:*` that never moves
while disputes are created means the executor is not running.

### 10.8 Funding

1. HomeGateway: a plain ETH transfer to its `receive()` (no calldata), at least `targetCases × referenceCaseCostEth`
   (20 × 0.0003 = 0.006 ETH by default): `cast send --rpc-url $ARBITRUM_RPC $H --value 0.006ether` from any account.
   Each incoming dispute pays the ruler its `arbitrationCost` from this balance; with too little the dispute leg
   reverts `InsufficientFunds` on Arbitrum and stays executable until funded.
2. Reporters: a plain ETH transfer to each of the six (their `receive()`), up to `targetMessages × costPerMessage`
   (10 × 0.0002 = 0.002 ETH for CCIP). The bot keeps them topped up afterwards; read 10.9 and 10.10 first.
3. The bot's gas on both chains: the bot EOA on Base and on Arbitrum, at least `gas.minimumReserveWei` (0.002 ETH)
   plus a few transactions (section 5).

### 10.9 Risks of the pre-audit reporters

The SDK 0.1.0 reporters and adapters are the build without the audit fixes (decisions [O3], accepted): their prefunded
balance can be spent by anyone through Yaho (any caller can dispatch through them) and they have no withdraw. Every
wei sent to a reporter is exposed until it is spent; keep balances at the small targets below. Moving to the audited
reporters needs new oracles, i.e. new gateways, since `setOracleEnabled`, `changeYaho` and `changeYaru` revert.

### 10.10 Per-route drain exposure and how to stop funding a route

With `lowWaterMessages` 3, `targetMessages` 10 and `minTopUpMessages` 2 (decisions [L3]):

- A refill near low water costs about `(targetMessages − lowWaterMessages) × costPerMessage`: 7 × 0.0002 = 0.0014 ETH
  (CCIP), 7 × 0.0001 = 0.0007 ETH (LayerZero, Axelar).
- A fully drained reporter costs `targetMessages × costPerMessage`: 0.002 ETH (CCIP), 0.001 ETH (LayerZero, Axelar).
- Repeated drains have **no cumulative cap**: someone dispatching through a reporter over and over makes the bot refill
  it every time it falls under low water.

To stop funding one route, remove its `costPerMessage` from `reporter.routes.<route>` in `config/mainnet.json` (or
from `src/mainnet/parameters.ts` and regenerate) and restart the bot: once the updated configuration is loaded the
route is suspended (`reporter:<route>:suspended`, critical) and nothing new is sent to it. Disputes keep dispatching
through it while it is in the default selection, so a drained, unfunded reporter then reverts every dispute creation;
to take a bridge out of service change the default selection on the ForeignGateway (`setDefaultOracles`, governor).

### 10.11 Prices: two families

The generated configuration requires both enabled families, Chainlink (ETH/USD and USDC/USD on Base and Arbitrum,
one family) and CoinGecko, for every price (`rates.minSources` 2, decisions [L9]). One provider outage therefore stops
rate updates (`price-unavailable`, then `price-unavailable-critical` after 6 h) instead of publishing a single-source
price; the contract keeps the last rate meanwhile. The bot adds no band of its own: the ForeignGateway's
`keeperMaxChangeBps` (5 % per step, one step per `keeperCooldown`) is the only limit on a step. `minSources` 2 is the
operator's accepted choice until a third family exists.

### 10.12 Start the bot

```sh
cd bots/gateway-balancer
# The configuration, from the deploy output and the SDK; validated before it is written; never commit it.
yarn workspace @kleros/gateway-balancer-bot exec tsx src/mainnet/cli.ts          # writes config/mainnet.json
export GATEWAY_BALANCER_CONFIG=config/mainnet.json
yarn workspace @kleros/gateway-balancer-bot status          # no key needed: checks the file
set -a; . ./.env; set +a                                   # BALANCER_PRIVATE_KEY, RPC URLs, COINGECKO_API_KEY
yarn workspace @kleros/gateway-balancer-bot reconcile
BALANCER_ADDRESS=0x… yarn workspace @kleros/gateway-balancer-bot lifi-probe
yarn workspace @kleros/gateway-balancer-bot start
```

In Docker, mount the file over the configuration path:
`docker compose run --rm -v "$PWD/config/mainnet.json:/app/bots/gateway-balancer/config/config.json:ro" gateway-balancer reconcile`
(and the same `-v` for `up` through a local compose override).

**`status` preflight before the first `requestSwitch`** (decisions [L4]): all six `reporter:*` routes must show an
accepted preflight: no `reporter:<route>:preflight-unavailable` and no `reporter:<route>:suspended:*`. A persistent
`preflight-unavailable` on a route means the deployed reporter does not answer the bot's preflight as the SDK build
does (`src/reporter/README.md`); do not launch with it, because the next dispatch through that route may revert the
dispute creation. Also check `gas:8453` and `gas:42161` with `low: false`, `capacity:base-arbitrum`, and a
`price:*` observation for ETH and USDC.

### 10.13 Test scenarios (watched, in order)

1. **Fees in.** `cast send --rpc-url $BASE_RPC $L "requestSwitch()" --value <arbitrationCost>` (any excess is
   refunded), then once with USDC: approve `arbitrationCost(extraData, USDC)` to the Lightbulb and call
   `requestSwitchWithToken(address)`. `availableFees(0x0)` and `availableFees(USDC)` on the ForeignGateway show the
   fees split into juror fees (0.0003 ETH per case) and bridging fees (0.0008 ETH per case); `status` shows them.
2. **Dispute leg and refill.** The executor delivers the dispute: the ruler has a new dispute, the HomeGateway's balance
   dropped by 0.0003 ETH. Repeat (or lower `refill.pairs.base-arbitrum.lowWaterCases`) until capacity is under low
   water: the bot withdraws fees on Base, bridges them with LI.FI and deposits on the HomeGateway (section 7, step 5).
3. **Reporter funding.** Each dispute made every Base reporter dispatch; when one is under low water the bot claims
   bridging fees, withdraws and funds it (`reporter:*` balance back to the target).
4. **Ruling leg.** From the deployer (the ruler):
   `cast send --rpc-url $ARBITRUM_RPC $R "executeRuling(uint256,uint256,bool,bool)" <disputeID> 1 false false`. The
   HomeGateway dispatches through the three Arbitrum reporters; after the executor, the Lightbulb is on
   (`lightbulbIsOn(<requester>)`) and the ForeignGateway shows `ruled = true`. The Arbitrum reporters' balances drop:
   the bot funds them (step 3, Arbitrum side). `execute(<disputeID>, 0)` on the ruler pays the case fee to the ruler.
5. **Restart drill.** Stop the bot while an operation is open (`status`: `operations.open`), start it again:
   `reconcile` resolves the in-flight transactions and the operation resumes without a second transfer.

After the first ruling leg succeeded, and only then, hand governance over (decisions [O12]; each is irreversible):
`changeGovernor(<new>)` on the ForeignGateway (Base), the HomeGateway and the KlerosCoreRuler (Arbitrum), and
`changeRuler(<HomeGateway>, <new ruler>)` on the KlerosCoreRuler for the ruling role. The keeper stays the bot's EOA.

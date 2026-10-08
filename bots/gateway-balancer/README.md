# Gateway balancer bot

Unattended treasury and maintenance bot for Kleros gateway pairs that use Veashi messaging. It is not the message relayer; it never relays messages and never pauses a gateway contract.

Three independent responsibilities, each a loop per pair or route:

1. **HomeGateway refills.** When a HomeGateway's native ETH drops below the configured number of reference cases, sweep the ForeignGateway's withdrawable arbitration fees, move them to the home chain as native ETH through LI.FI, verify what arrived and deposit it.
2. **Reporter funding.** Keep every configured Veashi reporter funded in its chain's native gas token from the ForeignGateway's bridging fees, independently of the HomeGateway refills.
3. **Exchange-rate maintenance.** Propose a ForeignGateway currency-rate update when the median of several price sources moves by at least the configured threshold; the contract enforces its own guardrails.

## Layout

- `src/domain`: shared value types (assets, amounts, accounting scopes, operations, loops).
- `src/ports`: the interfaces the components are built against (journal and ledger, executor, chain clients, gateway and reporter adapters, routing, transfers, prices, notifier).
- `src/config`: the non-secret configuration schema; the topology (chains, pairs, reporter routes) and one section per component.
- `src/platform`: configuration and secrets, logging, the SQLite journal, chain clients, the transaction executor, startup reconciliation, scheduling, notifications, gas monitoring, health.
- `src/gateway`, `src/lifi`, `src/refill`: gateway adapters, LI.FI routing with the signing policy, the refill loop.
- `src/reporter`: reporter funding.
- `src/rates`: price aggregation and rate maintenance.
- `src/testing`: in-memory fakes of every port and the journal contract suite.
- `src/main.ts`: the composition root.
- `Dockerfile`, `compose.yaml`, `RUNBOOK.md`: the container image, one-instance compose file and operator checklist (see Deployment).

## Commands

```bash
yarn workspace @kleros/gateway-balancer-bot start       # run every loop
yarn workspace @kleros/gateway-balancer-bot status      # health from the journal (read-only)
yarn workspace @kleros/gateway-balancer-bot reconcile   # startup reconciliation only, prints its report
yarn workspace @kleros/gateway-balancer-bot lifi-probe  # quote-only route verification, never signs
yarn workspace @kleros/gateway-balancer-bot test
yarn workspace @kleros/gateway-balancer-bot check-types
yarn workspace @kleros/gateway-balancer-bot check-style
```

- `start` loads the configuration and secrets, builds every loop, then (at the start of `run`, so a loop factory that fails holds nothing) acquires single-instance ownership of the journal, runs startup reconciliation, then schedules every loop plus the gas monitor and serves `GET /healthz`. It exits 0 on `SIGTERM`/`SIGINT` once the in-flight tick finished, 1 when ownership was lost or the stop timeout expired.
- `status` needs only the configuration file and the journal path: no key, no RPC variable, no ownership. It opens the journal read-only (safe beside a running `start`) and prints the same JSON as `/healthz`. A missing journal prints an empty status. After a clean shutdown on a volume where the reader cannot create the `-shm` file (a read-only mount), it falls back to an `immutable=1` open; any other open error (corruption, a lock, a path that is not a database) is reported, not read around.
- `reconcile` does what `start` does before scheduling (ownership, `recover()`, reconciliation) and exits. It refuses to run while a `start` instance owns the journal.

Requires Node 22.13 or newer (`node:sqlite`). Tests need `anvil` (Foundry) on `PATH`; they spawn it on a free port and never touch a live chain.

## Configuration

Non-secret configuration is one JSON file named by `GATEWAY_BALANCER_CONFIG` (default `config/config.json`). Start from `config/example.json`: it holds the topology (chains, pairs, reporter routes, collected assets) and one section per component. Every section may be `{}`: each field has a default. Invalid values fail the load naming their JSON path (`topology.pairs[1].foreignGateway: ...`); cross-reference problems (unknown chain, duplicate id) fail it too.

Each lane documents its own section:

| Section    | Documentation            | Example                                        |
| ---------- | ------------------------ | ---------------------------------------------- |
| `platform` | this README              | `config/platform.example.json` (every default) |
| `refill`   | `src/refill/README.md`   | `src/refill/example-config.json`               |
| `lifi`     | `src/lifi/README.md`     | `src/lifi/example-config.json`                 |
| `reporter` | `src/reporter/README.md` | `src/reporter/example-config.json`             |
| `rates`    | `src/rates/README.md`    | `src/rates/example-config.json`                |

### The `platform` section

| Field                              | Default                     | Meaning                                                                                                                                                                                          |
| ---------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `journalPath`                      | `data/journal.sqlite`       | SQLite journal; put it on a persistent volume.                                                                                                                                                   |
| `schedule.defaultIntervalMs`       | `60000`                     | Tick interval of a loop with no entry below.                                                                                                                                                     |
| `schedule.intervalsMs`             | `{}`                        | Per loop id (`"refill:arc-arbitrum"`) or kind (`"refill"`, `"reporter"`, `"rate"`); the id wins.                                                                                                 |
| `schedule.suspendedIntervalMs`     | `900000`                    | Interval of a loop whose last tick returned `suspended`.                                                                                                                                         |
| `schedule.backoff`                 | `30000`, x2, max `1800000`  | Delay after a failed or throwing tick, doubling per consecutive failure.                                                                                                                         |
| `schedule.stopTimeoutMs`           | `60000`                     | How long shutdown waits for the in-flight tick. Must exceed `executor.waitMs`.                                                                                                                   |
| `executor.waitMs`                  | `45000`                     | How long a submit waits for confirmations before returning `pending` (see below).                                                                                                                |
| `executor.pollIntervalMs`          | `2000`                      | Receipt and nonce polling interval during that wait.                                                                                                                                             |
| `executor.stuckAfterMs`            | `900000`                    | Age after which an unconfirmed transaction raises one warning.                                                                                                                                   |
| `executor.baseFeeMultiplier`       | `2`                         | `maxFeePerGas = multiplier x latest base fee + priority fee`.                                                                                                                                    |
| `executor.gasLimitBufferPercent`   | `20`                        | Gas limit = simulated estimate x (1 + percent / 100), so a state change between estimate and inclusion does not run out of gas.                                                                  |
| `executor.replayMaxAttempts`       | `5`                         | An on-chain revert whose replay (to recover the revert bytes) is inconclusive stays `pending` and is replayed again; after this many inconclusive replays it is made final (see "Transactions"). |
| `executor.replayMaxAgeMs`          | `600000`                    | The same bound as the record's age since its `createdAt` (a non-archive node cannot replay an old block), once at least `executor.replayMinAttempts` replays were inconclusive. |
| `executor.replayMinAttempts`       | `2`                         | The inconclusive replays an old record needs before the age bound makes it final. A record that sat `broadcast` long before it was mined reaches the bound after this many calls. |
| `ownership.heartbeatMs`            | `15000`                     | Heartbeat of the journal's `owner` row.                                                                                                                                                          |
| `ownership.staleAfterMs`           | `180000`                    | An owner whose heartbeat is older is taken over. Must be at least 3 x `heartbeatMs` and above `executor.waitMs + schedule.stopTimeoutMs`; the load refuses anything less.                        |
| `gas.intervalMs`                   | `300000`                    | Gas monitor interval.                                                                                                                                                                            |
| `gas.minimumReserveWei`            | `{}`                        | Minimum gas reserve per chain id, decimal wei strings (`{"42161": "5000000000000000"}`).                                                                                                         |
| `gas.defaultMinimumReserveWei`     | `"5000000000000000"`        | Minimum for chains not listed. Set it per chain where the native token is not ETH (Arc's is USDC).                                                                                               |
| `notifications.minSeverity`        | `info`                      | Global floor: `info`, `warning` or `critical`.                                                                                                                                                   |
| `notifications.dedupWindowSeconds` | `3600`                      | A dedup key is delivered at most once per window. A notification that every enabled provider failed to deliver does not count: its next occurrence is sent again.                                |
| `notifications.providers.slack`    | disabled                    | `enabled`, `webhookUrlEnv` (default `SLACK_WEBHOOK_URL`), its own `minSeverity`.                                                                                                                 |
| `notifications.providers.telegram` | disabled                    | Not implemented yet; enabling it is refused.                                                                                                                                                     |
| `health.enabled`, `host`, `port`   | `true`, `127.0.0.1`, `8080` | The `/healthz` listener. Loopback only unless `health.allowNonLoopback` is set (see Health).                                                                                                     |
| `health.allowNonLoopback`          | `false`                     | Opt-in to bind `health.host` to a non-loopback address (`0.0.0.0` inside a container). The load refuses a non-loopback host without it.                                                          |
| `http.timeoutMs`                   | `30000`                     | Timeout of every outgoing HTTP request (LI.FI, prices, Slack).                                                                                                                                   |

**Latency knob: `executor.waitMs`.** Ticks run one at a time across the whole process (loops never overlap; the per-chain nonce lock is a second layer). A tick that submits a transaction may hold that single slot for up to `waitMs` while it waits for confirmations; past it the submit returns `pending` and the loop resumes on its next tick. Lower `waitMs` to let other loops run sooner, at the cost of more resumes. Keep it under 60 s.

**Stop timeout.** On `SIGTERM` the bot aborts the tick signal (the confirmation wait returns immediately), waits up to `schedule.stopTimeoutMs` for the in-flight tick, closes the journal and exits. Give the process longer than that before a hard kill: `docker stop -t 75` or `stop_grace_period: 75s` with the defaults (always more than `executor.waitMs` and `schedule.stopTimeoutMs`). A hard kill is safe for funds (every step is journaled first) but leaves work for the next start's reconciliation.

## Secrets

Secrets come from the environment only (see `.env.example`), never from the configuration file:

- `BALANCER_PRIVATE_KEY`: the one EOA that signs on every chain.
- One RPC URL per chain, in the variable named by that chain's `rpcUrlEnv` (`ARBITRUM_RPC_URL`, `BASE_RPC_URL`, `ARC_RPC_URL` in the example). URLs often embed API keys and are treated as secrets.
- `SLACK_WEBHOOK_URL` (or the name in `notifications.providers.slack.webhookUrlEnv`), required only when Slack is enabled.

`start` and `reconcile` refuse to run when one is missing and name the variable, never its value. The configuration load checks every key ending in `Env` in the whole configuration (`rpcUrlEnv`, `webhookUrlEnv`, a price provider's `apiKeyEnv`, ...) and refuses, naming its JSON path, one that names `BALANCER_PRIVATE_KEY`, `GATEWAY_BALANCER_CONFIG`, a chain's RPC variable or the Slack webhook variable (other than that key itself), so one secret is never sent where another is expected. The key, every RPC URL and the webhook are removed from every log line, every string stored in the journal and every notification (any URL at all is also replaced by `[redacted-url]` there). Matching ignores case, and a hex secret is also removed in its bare form without `0x`, so a library that prints a key upper-cased or unprefixed does not leak it. Keep `.env` out of the image and readable only by the bot's user. Signed raw transactions are not secrets and are stored so a crash can be recovered.

## Deployment

`Dockerfile` (build from the repository root: the bot is a Yarn workspace) and `compose.yaml` run one instance as the
`node` user with `tsx src/main.ts`, the journal on a named volume and `config/config.json` bind-mounted read-only;
secrets come from `.env` through compose only and are never in the image. `RUNBOOK.md` is the operator checklist:
what must exist outside the bot, how to assemble the configuration, the launch gates of specification section 13,
the gas float, the first watched transfers, and what to do when the bot asks for you.

## Health

`GET /healthz` (and `status`) return JSON read from the journal only. The endpoint is unauthenticated: it serves journal state only, never a key, RPC URL or webhook, but that state (balances, operations, addresses) is still operational detail, so it binds to `127.0.0.1` by default and the load refuses a non-loopback `health.host` unless `health.allowNonLoopback` is `true`. Expose it beyond the host only on a private network or behind your own authenticating proxy.

- `status`: `ok`, or `attention` when an operation needs the operator. The endpoint answers 200 either way (a restart would not fix an attention state) and 500 when the journal cannot be read.
- `observations`, grouped by prefix: `capacity` (HomeGateway capacity per pair), `withdrawable` (ForeignGateway balances per category), `reporter` (reporter balances), `price`, `rate`, `in-transit`, `transfer-delta` (received versus credited), `gas` (`gas:<chainId>`: block, balance, ledger-held, in-flight, reserve, minimum, `low`), `suspended` (loops that suspended themselves and why), and `other`.
- `holdings`: the ledger per scope, chain, asset and location (`eoa` or `in-transit`).
- `operations.open` and `operations.attention`, with step, attempts and `lastError`.
- `transactions`: every record not yet final (`prepared`, `signed`, `broadcast`, `unknown`) with nonce and hash.

`status` opens the journal read-only beside a running instance and takes no ownership. It waits up to 2 s on a transient lock (a checkpoint) and then reports the lock as an error; it never reads around a lock.

## Persistence and recovery

The journal (`node:sqlite`, WAL mode) is the only durable state. Every operation's intent is recorded before any side effect; every transaction record (with its nonce, hash and signed bytes) exists before the transaction is broadcast. Idempotency keys are `op:<operationId>:step:<step>`: a repeated submit returns the recorded result and never sends twice.

**Single instance.** The journal holds an `owner` row (random instance id, pid, start time, heartbeat). `start` and `reconcile` take it at the start of `run`, after every loop was built, in one `BEGIN IMMEDIATE` transaction; a second instance is refused while the heartbeat is fresh, and takes over once it is older than `ownership.staleAfterMs` (a crashed instance). Every journal write also re-checks the row inside its own transaction and fails with `lost ownership` when another instance holds it, so an instance that was paused (suspended VM, stopped container) and resumes after a takeover cannot write, reserve a nonce or sign beside its successor. An instance whose heartbeat finds another instance id in the row stops ticking, sends a `critical` notification ("Balancer instance lost journal ownership"; it is delivered although the journal refuses that instance's writes) and exits 1. Action: make sure exactly one bot runs against the volume; then restart the one you keep.

**Startup reconciliation** (`start` and `reconcile`):

1. `executor.recover()` re-reads every `prepared`, `signed` or `broadcast` transaction (an `unknown` one is only reported): confirmed or reverted from its receipt at the chain's `confirmations`; rebroadcast from its stored signed bytes when the node does not know it and its nonce is still free (the crash window between signing and broadcasting); `replaced` once its nonce was consumed `confirmations` blocks deep by a transaction it does not know and a second read still does not find it. A nonce consumed but not yet that deep, and any RPC error, leave the record as it is (`pending`) for the next attempt; the operation stays `open`. `unknown` is reserved for real ambiguity: a nonce consumed with the hash unknown, and a `signed` or `broadcast` record on a chain no longer in the topology, which `recover()` persists as `unknown` (`chain <id> is not configured`); `resolve()` and a repeated submit under its key answer the same. Every chain read here, as in any confirmation wait, is bounded by `executor.waitMs` and aborted by shutdown, so a slow RPC cannot stall startup. The rebroadcast transactions share one `executor.waitMs` for their confirmations (not one each), so the scheduler and the health endpoint start at most about one `waitMs` after the reads; what is still pending then is resolved by its loop's next tick.
2. Each open operation whose transactions include an `unknown` or `replaced` record goes to `attention` with `lastError` and one `critical` notification. Every other open operation stays `open`, untouched; its loop resumes it from its persisted step. Nothing is submitted and no balance is read during reconciliation. A record whose operation is no longer `open` (closed by the operator, or in `attention`) is still read for its receipt but never rebroadcast.

**Removing and re-adding a chain.** Before removing a chain from `topology.chains`, let its transactions settle (`status` lists none on it). A record left `signed` or `broadcast` there becomes `unknown` at the next start and its operation goes to `attention`. Re-adding the chain later does not bring it back: an `unknown` record is terminal for the executor (never re-inspected, never rebroadcast, also once the chain is configured again; `resolve()` and a repeated submit only report it), so check its hash on the explorer and close the `attention` operation by hand ("Operations in attention" below), correcting the ledger if funds moved. An `unknown` record keeps its nonce reserved: if its transaction never reached the chain, later transactions on that chain queue behind the gap, so cancel at that nonce as in "Stuck transaction" (step 2) and then set the record's status to `replaced` with `sqlite3` while the bot is stopped.

**Transactions.** Nonces are assigned per chain as `max(pending count, 1 + highest nonce held by a signed/broadcast/unknown record)`. The gas limit is the simulated estimate plus `executor.gasLimitBufferPercent` (20 percent by default); `maxFeePerGas` is `executor.baseFeeMultiplier` x the latest base fee plus the priority fee, and a chain without a base fee gets a legacy transaction at the node's gas price. A transaction that fails simulation, gas estimation or signing is `failed` and holds no nonce; its error ends with `revertData=0x<hex>` (or `revertData=none`). Once signed, a record is never `failed`: a broadcast error leaves it `signed` and the chain decides. The `signed` record (nonce, hash, signed bytes) is written to the journal before the broadcast. A submit returns `pending` whenever its record is still `signed` or `broadcast`: past `executor.waitMs`, after an RPC error while waiting, or while its nonce is consumed by an unknown transaction that is not yet `confirmations` deep; the loop resumes it next tick. An on-chain revert is recorded `reverted` with the revert bytes recovered by replaying the call at the receipt's block. Only a genuine revert of that replay (or a replay that does not revert) is conclusive; when the replay times out or fails on transport the record stays `broadcast` (`pending`) and is replayed again on later inspections, and after `executor.replayMaxAttempts` inconclusive replays (counted once per `submit`, `resolve` or `recover` call, not per polling round, in the journal observation `replay:<idempotency key>`, so a restart does not reset them), or once the record is `executor.replayMaxAgeMs` old from its `createdAt` with at least `executor.replayMinAttempts` inconclusive replays, it is made final `reverted` with `replay unavailable ... revertData=none`. Each chain read while waiting gets what is left of `executor.waitMs` as its deadline and is abandoned at once on shutdown, so one slow RPC call never holds the tick slot past `waitMs`; the record stays `pending`.

**One budget per submit, and `aborted:`.** A submit's simulation, gas estimate, fee and gas-reserve reads, nonce read and first broadcast share the submit's `executor.waitMs` with its confirmation wait, and each of them is abandoned at once on shutdown. Right before signing the executor checks the shutdown signal, the budget and the journal ownership again (a fenced journal write: an instance that lost the `owner` row throws `lost ownership` and signs nothing), and right before broadcasting the persisted `signed` record it checks the shutdown signal (a record signed but not sent is broadcast by the next start's recovery). A submit stopped before signing by shutdown, by the spent budget, or by any other RPC failure that is not a contract revert (an HTTP error, a refused connection, a timeout) in the simulation, gas estimate, fee or gas-reserve reads is `failed` with an error of the fixed form `aborted: <detail> revertData=none`: it is not a contract rejection, nothing was signed, and the loops retry it on a later tick under a new attempt key without counting it as a rejection. A `prepared` record a crash left behind (recorded, never signed) is failed the same way by `recover()` or `resolve()` (`aborted: interrupted before signing revertData=none`, with the chain named when it is no longer configured). The gas-reserve refusal (`gas-reserve: ...`) and `chain <id> is not configured` keep their own errors, and a contract revert keeps the plain form with its `revertData=`. A first broadcast that throws or stalls happens after signing: the record stays `signed` (`pending`) and the chain decides.

**Revert marker for lanes.** The read-only chain client every lane uses (`ports.chains`) rethrows a contract revert as a plain error ending in `revertData=0x<hex>`, or `revertData=none` when the revert carried no bytes (a contract without the called function, or without `receive()` for a value transfer); a transport error (unreachable node, timeout, HTTP error) and any other node error, even one carrying a hex `data` field (a rate limit, for example), carries no `revertData=` marker. Lanes tell the two apart by that marker only.

<a id="gas-reserve"></a>**Gas reserve.** Before assigning a nonce, under the per-chain lock, the executor reads the EOA's balance and transaction count at the same `latest` block and computes the operator reserve: balance, minus the native `eoa` holdings of the ledger on that chain, minus the value plus gas limit x fee cap of this chain's nonce-holding records whose nonce is not yet mined (a mined one is already in the balance). After the request's own value (already debited from its holding by the loop) it must cover the request's gas limit x fee cap; otherwise the request is `failed` before signing (no nonce) with an error starting `gas-reserve:` and ending `revertData=none`. On an OP-stack chain (`OP_STACK_CHAIN_IDS` in `src/platform/gas/l1DataFee.ts`: Base, Base Sepolia, OP Mainnet, OP Sepolia) a transaction also pays an L1 data fee that nothing it signs caps: the reserve counts twice the GasPriceOracle's `getL1Fee` quote, both for each unmined record and for the request about to be signed, and a fee that cannot be read fails the submit `aborted:`. That set is a literal: classify a chain there (and in `src/platform/gas/l1DataFee.test.ts`, which fails for an unclassified chain of `config/example.json`) before adding it to the topology, or an OP-stack chain gets no L1 data fee in the reserve. The gas monitor computes `gas:<chainId>` with the same function. A native fee a quote charges on top of the amount is part of the request's `value`, so it is checked here and never silently paid from the reserve.

<a id="gas-float"></a>**Operator gas float and the uncredited window (accepted risk, launch gate).** The reserve cannot see money that has arrived on a chain but is not yet credited to the ledger (a bridge delivery waiting for its confirmations or for the received-amount check of the LI.FI lane): during that window the arrived amount looks like operator gas, and transactions may spend from it. Nothing is credited without the lane's check, and a delivery that stays short ends in `attention`, so the window is bounded; the residual risk is accepted for v1. Keep a dedicated gas float on every chain, at least `gas.minimumReserveWei` plus a few transactions' gas at peak fees, and treat a `gas-low` warning as a request to top it up, never as permission to spend fee funds. Verify this behaviour with real deliveries at the launch gate (specification test 15).

## Operator actions

Notifications carry the pair or route, chain, operation id, explorer links (from `explorerTxUrl`) and the action. The platform raises these:

- **Low gas reserve on `<chain>`** (`warning`, `gas-low:<chainId>`). The EOA's reserve (native balance minus what the ledger assigns to arbitration and bridging scopes on that chain, minus what unmined transactions can still spend) is below the minimum. Send the chain's native token to the bot address. The bot never tops up gas from fee funds, and never counts your top-up as fee funds.
- **Out of operator gas on `<chain>`: transactions are refused** (`critical`, `gas-reserve:<chainId>`, one per chain per dedup window). The executor refused a transaction before signing because the reserve (see "Gas reserve") cannot pay its gas. Nothing was signed and no nonce is used; the loop that asked credits back what it debited and retries on each of its ticks under a new attempt key, and every retry is refused until the reserve covers it (loops may raise their own notification for the repeated refusals, for example the rates loop). Send the chain's native token to the bot address; the next tick proceeds.
- **Transaction stuck on `<chain>` at nonce `<n>`** (`warning`, `tx-stuck:<key>`). A transaction has not confirmed after `executor.stuckAfterMs`; the message gives the nonce and how many later transactions are queued behind it. Every later submit on that chain stays `pending` until this nonce clears, so other loops on that chain stall. <a id="stuck-transaction"></a>Stuck transaction procedure:
  1. Check the fee market: the stored transaction's `maxFeePerGas` is twice the base fee at signing; a base-fee spike above that keeps it out of blocks. The bot already rebroadcasts it while the nonce is free; if the fee spike passes, it confirms by itself.
  2. To cancel instead, send a 0-value transaction from the bot address to itself at the stuck nonce with a higher fee (for example `cast send --nonce <n> --priority-gas-price <higher> --gas-price <higher> <bot address> --value 0` with the bot key, on the chain's RPC). The bot then marks the original `replaced` once the cancel is `confirmations` deep, and its operation goes to `attention`.
  3. Resolve that operation (next item); later transactions then proceed.
- **Operation `<id>` needs attention after restart** (`critical`, `attention:<operationId>`). One of its transactions is `unknown` or `replaced`. <a id="operations-in-attention"></a>Operations in attention: look up the hashes on the explorer and the operation's step in `status`; if funds moved, correct the ledger to match the chain; then close the operation. There is no command for this yet: stop the bot and run, with `sqlite3` on the journal, `UPDATE operations SET status = 'failed', record = json_set(record, '$.status', 'failed') WHERE id = '<id>';` (or `completed`). The bot never retries an operation in attention by itself.
- **Balancer instance lost journal ownership** (`critical`). See "Single instance" above.

**Deduplication.** A dedup key is recorded in the journal when the notifier first attempts delivery to an enabled provider; if every provider then fails, the record is removed again so the next occurrence is sent. Rows older than `notifications.dedupWindowSeconds` are pruned at the next recorded notification, so the table stays small. Accepted crash window: if the process dies after the key is recorded and before any provider answered, that occurrence may be lost and later ones are suppressed for the rest of the window; `reconcile` re-raises nothing by itself. After a crash, read `status` (open and `attention` operations, `gas:*`, `suspended:*`) rather than relying on notifications having arrived.

Loops raise their own notifications (refill, reporter, rates); their actions are documented in each lane's README linked above.

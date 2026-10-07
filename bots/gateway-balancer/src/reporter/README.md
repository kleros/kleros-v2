# Reporter funding (`src/reporter`)

Keeps every Veashi reporter of `topology.routes` between its low-water and target balance in its chain's native gas
token, paid from the ForeignGateway **bridging** fees only, independently of the HomeGateway levels. One loop per
route (`reporter:<routeId>`).

## Configuration (`reporter` section)

See [`example-config.json`](./example-config.json). `"reporter": {}` parses; a route without `costPerMessage` is
suspended (critical notification) until it gets one.

| Field                                                                     | Default       | Meaning                                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lowWaterMessages`                                                        | `20`          | A route is topped up when its reporter holds less than this many messages.                                                                                                              |
| `targetMessages`                                                          | `100`         | A top-up brings the reporter up to this many messages, never past it. Must exceed `lowWaterMessages`.                                                                                   |
| `minTopUpMessages`                                                        | `5`           | Economic minimum: a top-up worth fewer messages is deferred.                                                                                                                            |
| `maxAmbiguousDeferrals`                                                   | `5`           | An operation whose transfer keeps deferring with an ambiguous reason goes to `attention` after this many consecutive deferrals (see Transfer deferrals).                                |
| `ambiguousDeferralMaxAgeMinutes`                                          | `60`          | ...or once the first of those deferrals is this old, whichever comes first.                                                                                                             |
| `routes.<routeId>.costPerMessage`                                         | none          | Estimated cost of one message, as a decimal string in whole native tokens of the reporter's chain (`"0.00002"` ETH, `"0.05"` USDC on Arc). Converted with the chain's `nativeDecimals`. |
| `routes.<routeId>.lowWaterMessages`, `targetMessages`, `minTopUpMessages` | the section's | Per-route overrides.                                                                                                                                                                    |

`lowWater = costPerMessage × lowWaterMessages`, `target = costPerMessage × targetMessages`, both in the reporter
chain's smallest native unit. The cost per message is configured in v1 (no fee-estimator query).

## Funding mechanism

One mechanism (`fundingMethod: "nativeTransfer"`): a plain native transfer with no calldata to the reporter, accepted
by the payable `receive()` of the LayerZero, DeBridge and CCIP reporters of `@kleros/veashi-sdk@0.1.0`. No ABI is
used. Every tick runs a preflight: the route must be in the topology, the address must have code, and an
`estimateGas` of a 1-wei transfer from the balancer EOA must succeed, and the reporter must not pay its fees in an
ERC20 token: when `feeToken()` returns a non-zero address (a CCIPReporter configured with an ERC20 `feeToken`) the
route is refused. A reporter returning the zero address passes. A failed `feeToken()` read is never taken as native
fees by itself: it passes only when the read **reverts** and the reporter's runtime bytecode cannot dispatch
`feeToken()` at all (no `PUSH4` of its selector and no `DELEGATECALL`, outside the Solidity metadata trailer), which
is the LayerZero and DeBridge case. The frozen `ChainClient` port carries only the platform's error message, so a
revert is recognised by the platform's fixed suffix marker alone (`revertData=0x<hex>` or `revertData=none`, decisions
[L42]), never by the word "reverted"; any other failure (transport, timeout, empty return data, an unknown error)
is not a revert. The preflight is
**unavailable** when the `feeToken()` read fails without reverting, when it reverts on code that has the selector or
delegates (a proxy), when the code lookup fails, or when the transfer's `estimateGas` fails without reverting. Then
the tick defers with a `reporter:<route>:preflight-unavailable` warning, starts nothing, submits no funding, and
leaves the suspension state as it was; the next tick retries. Only an `estimateGas` that reverts refuses the route.
The `feeToken()` fragment in `adapter.ts` is marked pending with its assumed signature. A VeaReporter (no
`receive()`) fails the transfer simulation. A failing preflight suspends that route only, with a critical
notification.

Suspension and preflight are evaluated **before** an open operation advances, so a reporter that turned ERC20-fee,
lost its code or became unavailable while a bridge was in flight is never funded natively. Sourcing (claim,
withdraw, transfer) keeps advancing; the funding gate applies before the debit:

- **Suspended:** the operation closes `failed` at step `funding-blocked` before any debit; what it sourced stays in
  `bridging:<route>` and the first operation after the suspension clears funds from it. A resume at the `funding`
  marker whose submit never happened (no executor record under `op:<op>:step:fund`) credits the debit back through
  the `crediting` bracket (`refunded`, `failed`). A funding already submitted is only resolved, never abandoned.
- **Unavailable:** the operation waits at its current step, nothing debited or submitted.

## Sourcing

Each funding operation is journaled before its first claim and goes through these steps:

1. **Own holding first.** The route's `bridging:<route>` `eoa` holding of native token on the reporter's chain
   covers as much of `target - balance` as it can.
2. **Pool share.** The rest comes from the pair's ForeignGateway bridging balance. For each collected asset, the
   route gets a share proportional to its **message shortfall**, `(target - balance - holding) / costPerMessage`,
   among the pair's competing routes. A route competes when it is below its low-water or has an open operation.
   Suspended routes without an open operation do not compete. A route with an open operation weighs the shortfall
   its operation planned with, not its current holding (which holds what that operation already withdrew), so each
   amount counts once: in the pool. A sibling whose balance cannot be read weighs as an empty reporter (its largest
   shortfall), never as absent, so a failed read never enlarges the planning route's share. The pool of an asset is its on-chain bridging balance
   plus what the pair's open operations already withdrew from it. A route planning after another one still gets its
   proportional share, not the remainder. Claims stay bounded by the on-chain balance minus the open claims
   (`fg:<pair>:bridging:<asset>`). Routes of other pairs never share the pool.
3. **Claim, withdraw, credit.** The route claims its share, withdraws it to the EOA (`withdraw:<i>` step) and
   credits `bridging:<route>` on the foreign chain.
4. **Convert or bridge.** When the asset is not the reporter's native token on its chain, the operation calls
   `Transfers` with one allocation on `bridging:<route>`. This covers Base USDC to Base ETH (same chain) and any
   foreign asset to Arbitrum ETH for a home-chain reporter. `Transfers` owns the ledger moves. A cross-asset claim
   (pool asset in another unit than the reporter's native token) is sized from one `RouteProvider.quote`, whose
   `estimatedOutput` is persisted in the operation payload. That quote's input is the route's need, not its whole
   share: the share is quoted first only as a rate probe (a probe the policy rejects still carries its rate), the
   input is reduced to the need at that rate and quoted again, so a small top-up is never refused by the
   per-transfer or daily limit a share-sized quote would exceed. Same-unit claims (Base ETH for Arbitrum ETH) need no
   quote.
5. **Fund.** The operation computes `min(holding, target - balance)` and persists it in the `debiting` marker. It
   debits that amount, writes the `funding` marker, then sends the native transfer (`fund` step). The amount sent
   is exactly the persisted one, never the whole holding. When the funding `failed` or `reverted`, nothing reached
   the reporter and the amount is credited back, bracketed like the debit: the `crediting` marker records the outcome
   and the holding before the credit, then the credit, then the terminal `refunded` marker. A resume at `crediting`
   credits when the holding is unchanged, only closes the operation when it already rose by exactly the amount, and
   goes to `attention` otherwise. A `failed` funding is credited back only when it was never signed: when the
   executor's record under `op:<op>:step:fund` shows a hash, a signed raw transaction or a status other than
   `failed`, nothing is credited and the operation goes to `attention`. A `failed` whose error starts with `aborted:`
   (shutdown or an expired wait budget before signing, never a contract rejection) is credited back the same way but
   raises no notification and no suspension; the next tick retries from the holding under a new operation, so a new
   key (`op:<new op>:step:fund`), with no attempt budget. An `aborted:` withdrawal likewise releases its claim and is
   retried under a new operation's key, logged at `info`.

Every submit uses the idempotency key `op:<operationId>:step:<step>`. A restart resumes from the last marker and
never re-sends.

When the pool covers less than a route's need, the route is funded partially (`reporter:<route>:partial` warning).
When nothing is available, or the top-up would be under the economic minimum, the loop defers and sends a
`reporter:<route>:short` warning. Arbitration and gas holdings are never debited.

## Transfer deferrals

A `Transfers` deferral reason starts with one of five codes (`src/lifi/README.md`); the loop decides by prefix:

| Code                                                  | Handling                                                                                                                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `price-unavailable:`, `no-route:`, `policy-rejected:` | Transient. One warning per operation (`reporter:<route>:transfer-deferred:<op>`); retried every tick, never `attention` by count.                                                                   |
| `insufficient-holding:`, or any unrecognised reason   | Ambiguous: a credit the operation expects is missing (a crash between the withdrawal marker and its credit). Warned per operation, then `attention` after `maxAmbiguousDeferrals` or the age limit. |
| `allocations-mismatch:`                               | A programming error: `attention` at once.                                                                                                                                                           |

Only consecutive ambiguous deferrals count: a transient deferral or an `in-progress` transfer resets the counter
and its age.

An operation in `attention` no longer counts in its pair's pool and suspends its route until the operator closes it.

## Observations

- `reporter:<routeId>`: `balance`, `lowWater`, `target`, `costPerMessage`, `holding` (the route-native bridging
  holding), `suspended`, `reason` and `openOperation`, written every tick.
- `suspended:reporter:<routeId>`: `{ suspended, reason, since }`. Written when a suspension starts or its reason
  changes, and with `suspended: false` when it clears.

## Notifications and operator actions

| Dedup key                                  | Severity | Meaning                                                                                                                                                                                                                                                                                                                                                                                                      | Operator action                                                                                                                                                                                                                                                      |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reporter:<route>:suspended:<reason>`      | critical | Missing `costPerMessage`, failing preflight, an operation of the route in `attention`, a missing ForeignGateway adapter, or an unexpected asset. Open operations keep advancing; nothing new starts.                                                                                                                                                                                                         | Fix the cause. The loop clears the suspension itself once the reason no longer holds (`reporter:<route>:resumed`, info).                                                                                                                                             |
| `reporter:<route>:attention:<op>`          | critical | The operation is ambiguous: a withdrawal or funding was `replaced` or `unknown`, a resume found the `debiting` marker or an inconsistent `crediting` marker, a credit is missing after a crash (including a transfer deferred ambiguously past the bound, or `allocations-mismatch:`), a transfer needs attention, or the funding reverted. The route stays suspended while the operation is in `attention`. | Check the transactions of the operation on the chain. Reconcile the `bridging:<route>` holding against the EOA balance (a crash between two journal writes leaves money untracked, never doubled), then set the operation to `completed` or `failed` in the journal. |
| `reporter:<route>:partial`                 | warning  | The pair's bridging funds cover less than its reporters' shortfalls; shared proportionally.                                                                                                                                                                                                                                                                                                                  | None. The rest is funded as fees accrue. Check message volume and `costPerMessage` if it persists.                                                                                                                                                                   |
| `reporter:<route>:short`                   | warning  | Low reporter, but no bridging funds, or a top-up under the economic minimum.                                                                                                                                                                                                                                                                                                                                 | Same as above. Never fund it from arbitration funds or operator gas.                                                                                                                                                                                                 |
| `reporter:<route>:holding-short`           | warning  | The debit found less than the persisted amount in the holding. The operation fails without funding.                                                                                                                                                                                                                                                                                                          | Reconcile the holding.                                                                                                                                                                                                                                               |
| `reporter:<route>:funding-failed`          | warning  | The funding never broadcast (simulation failed; never sent for an `aborted:` failure). The amount was credited back and the next tick retries from the holding.                                                                                                                                                                                                                                              | None, unless it repeats. Then check the reporter's `receive()`.                                                                                                                                                                                                      |
| `reporter:<route>:funding-reverted`        | critical | The reporter's `receive()` reverted. The amount was credited back and the operation set to `attention`.                                                                                                                                                                                                                                                                                                      | Verify the reporter still accepts native transfers, then close the operation.                                                                                                                                                                                        |
| `reporter:<route>:withdraw-reverted`       | warning  | The bridging withdrawal reverted on-chain. The claim was released.                                                                                                                                                                                                                                                                                                                                           | Check the balancer's withdrawal permission on the ForeignGateway.                                                                                                                                                                                                    |
| `reporter:<route>:transfer-failed`         | warning  | A conversion or bridge failed. The funds stay a `bridging:<route>` holding on the foreign chain.                                                                                                                                                                                                                                                                                                             | None. The next operation moves them as a holding leg.                                                                                                                                                                                                                |
| `reporter:<route>:transfer-deferred:<op>`  | warning  | A conversion or bridge did not start for a transient reason (price, route, signing policy). Retried every tick.                                                                                                                                                                                                                                                                                              | None while transient. Check LI.FI routes and price sources if it persists.                                                                                                                                                                                           |
| `reporter:<route>:transfer-ambiguous:<op>` | warning  | A transfer deferred with `insufficient-holding:` or an unknown reason. The operation goes to `attention` past the bound.                                                                                                                                                                                                                                                                                     | Reconcile the route's bridging holding on the foreign chain against the EOA balance; credit the withdrawal if it is missing.                                                                                                                                         |
| `reporter:<route>:preflight-unavailable`   | warning  | The preflight could not be evaluated (code lookup or `feeToken()` read failed on a reporter that can answer it). Nothing new starts; retried every tick.                                                                                                                                                                                                                                                     | Check the RPC of the reporter's chain if it persists, and verify the reporter pays native fees.                                                                                                                                                                      |
| `reporter:<route>:funding-blocked:<op>`    | warning  | The route was suspended when its open operation was ready to fund. The operation closed before its debit; its sourced funds stay in `bridging:<route>`. A resume past the debit credits it back (`funding-not-submitted`).                                                                                                                                                                                   | Fix the suspension cause; the next operation funds the reporter from the holding.                                                                                                                                                                                    |
| `reporter:<route>:funded:<op>`             | info     | A top-up confirmed.                                                                                                                                                                                                                                                                                                                                                                                          | None.                                                                                                                                                                                                                                                                |

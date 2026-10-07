# LI.FI routing (refill lane)

LI.FI is the only bridge and swap integration (specification section 5). This directory holds:

- `client.ts`: the REST client (`GET /v1/quote`, `/v1/status`, `/v1/tools`) through `ports.fetch`; never the
  `@lifi/sdk`. Responses are validated with zod; the bot encodes ERC20 approvals itself (bounded to the input) and
  never signs API-provided approval calldata.
- `policy.ts`: the signing policy every quote passes before anything is signed. Every violation is listed together.
- `calldata.ts`: decodes the LI.FI Diamond calldata the bot signs (part of the policy).
- `slippage.ts`: the operation-level loss budget.
- `provider.ts`: the `RouteProvider` (quote + policy, status).
- `transfers.ts`: the persisted transfer step machine (`Transfers`).
- `probe.ts`: the quote-only launch-gate tool.
- `fixtures/`: the recorded LI.FI answers the tests use (see `fixtures/README.md`).

## Signing policy

A quote is rejected when any of these holds (violation prefixes in brackets):

- a chain outside `allowedChains`, a quote for other chains than requested, or a step on a third chain (`chain:`, `route:`);
- an input or output asset outside `allowedAssets`, or not the requested one; LI.FI's `fromToken`/`toToken` address,
  chain or decimals differing from the configured asset (checked before any amount is scaled: a misreported
  `toToken.decimals` would inflate the minimum output by 1e12) (`asset:`);
- any tool of the route (including LI.FI's `feeCollection` step) outside `allowedTools` (`tool:`);
- a transaction target outside `allowedTargets`, or an approval not on the input token (`target:`);
- a spender outside `allowedSpenders` (`spender:`);
- a sender, recipient or transaction `from` other than the bot EOA (`recipient:`);
- a native value other than the input (native input) or zero (ERC20 input), plus only fees LI.FI reports as paid on top (`value:`);
- an approval without a bound or above the input, or an ERC20 input whose quote names no `approvalAddress`
  (`approval:`); an input other than requested (`amount:`);
- the per-transfer limit, or no limit configured for the asset (`limit:`); the rolling 24-hour limit computed from
  `Ledger.spentSince(category "transfer")` (`daily-limit:`). A continuation leg of a bridge-then-swap (its input is
  the intermediate token this operation's bridge delivered, LI.FI `PARTIAL`) needs no limit entry of its own
  (decisions [L43]): the parent leg's limit entry is checked against the parent's input, and the operation's daily
  spend was counted once, by the parent leg (the continuation records no second `transfer` row). It is exempt from
  the limit entry only (decisions [L50]): its input must be in `allowedAssets` (list there every intermediate token
  you accept, Base USDC for instance) and must equal the parent bridge step's declared output token (`bridgeOutput`
  of the parent quote); a continuation whose parent declared no output token is rejected (`asset:`);
- a minimum output that, with its normalized fees, is under the operation's budget (`budget:`); quoted fees above
  `maxQuotedFeeBps` (`fee:`);
- calldata that disagrees with the quote or cannot be decoded (`calldata:`, below).

## Calldata

The reported quote fields are not trusted alone: `transactionRequest.data` is decoded with viem
`decodeFunctionData` against the entry points in `calldata.ts` before anything is signed. Only the selectors found in
the recorded fixtures are allowed; an unknown selector, a truncated payload or data that does not decode is a
rejection, never a pass:

| Selector | Entry point | Fixture |
| --- | --- | --- |
| `0x4c279d6b` | `swapAndStartBridgeTokensViaLayerSwap(BridgeData, SwapData[], LayerSwapData)` | `quote-base-eth-to-arbitrum-eth.json`, `quote-base-usdc-to-arbitrum-eth.json` |
| `0x606326ff` | `swapAndStartBridgeTokensViaGasZip(BridgeData, SwapData[], GasZipData)` | `quote-arc-usdc-to-arbitrum-eth.json` |
| `0x2c57e884` | `swapTokensMultipleV3ERC20ToNative(transactionId, integrator, referrer, receiver, minAmountOut, SwapData[])` (GenericSwapFacet, same chain) | `quote-base-usdc-to-base-eth.json` |

Bridge entry points (`ILiFi.BridgeData` first): the facet must belong to the quote's `tool` (decisions [L44]: the
LayerSwap selector only with tool `layerswap`, GasZip only with `gasZipBridge`; the tool itself is in
`allowedTools`) and `BridgeData.bridge` must name that tool; `receiver` must be the bot EOA, `destinationChainId` the route's
destination, `hasDestinationCall` false. Without source swaps `sendingAssetId` and `minAmount` must be the quote's
input token and amount; with `hasSourceSwaps` (LI.FI's fee collection is a source swap in every recorded quote)
`SwapData[0]` must spend the input token and amount, the last swap must deliver `BridgeData.sendingAssetId`, and that
asset and `minAmount` must equal the quote's bridge step input (the post-swap amount). Facet data with its own
receiver is checked too: `LayerSwapData.receiver` must be the bot EOA and `nonEVMReceiver` zero;
`GasZipData.receiverAddress` must be the bot EOA (left-aligned in the bytes32, as recorded) and
`destinationChains` gas.zip's id of the destination (only Arbitrum, 57, is known; another destination is rejected).
LayerSwap's `depositoryReceiver` must be in `layerSwapDepositories` for the source chain: the quote reports the
depository only inside the calldata, and the facet's guarantee is its check of LayerSwap's signature over the request,
so the operator's allowlist is the bot's own pin on top (recorded depositories: `0x2Fc6…befe` for ETH,
`0x08b0…1e65` for USDC on Base; verify them with LayerSwap before launch).

Every `SwapData` item is checked, not only the ends: `callTo` and `approveTo` must be in `allowedSwapContracts` for
the source chain; only the first item has `requiresDeposit` (it pulls the input; a later deposit would pull more);
each item's `receivingAssetId` is the next item's `sendingAssetId`; and the items match the quote's own
source-chain `includedSteps` one to one (count, assets, `fromAmount`, and `approveTo` equal to that step's
`estimate.approvalAddress` when reported). The recorded quotes call LI.FI's fee collector (`0xCE40…8cbd` on Base,
`0xEDff…70da` on Arc) and, for the Base swap, the OKX router `0x67d0…81df` with its approval proxy `0x57df…114E`.

Each item's own `callData` is decoded too (decisions [L34]), against the entry points the recorded quotes use
(`SWAP_CALL_ABI` in `calldata.ts`); any other selector, data that does not decode, or bytes appended beyond the ABI
encoding (an OKX-style commission suffix) is rejected:

| Selector | Entry point | Checks | Recorded in |
| --- | --- | --- | --- |
| `0x0e8ae67f` | `forwardNativeFees((address recipient, uint256 amount)[])` (LI.FI fee forwarder) | the item moves the native token; every non-zero payment goes to `feeRecipients` of the chain, the signer or the Diamond; the total equals the fee step's `fromAmount - toAmount` in the quote (a quote that reports no such step is rejected) and is at most `maxFeeBps` of the item's input | Base ETH → Arbitrum ETH, Arc USDC → Arbitrum ETH |
| `0x332d746b` | `forwardERC20Fees(address token, (address, uint256)[])` | as above, and `token` is the item's asset | Base USDC → Arbitrum ETH, Base USDC → Base ETH |
| `0x0c307f76` | OKX `dagSwapTo(orderId, receiver, BaseRequest, RouterPath[])` | `receiver` is the Diamond or the signer; `fromToken`, `toToken` (`0xEeee…` is native) and `fromTokenAmount` match the item; `minReturnAmount` is at least the step's `toAmountMin` | Base USDC → Base ETH |

The OKX `RouterPath[]` (adapters, pools, raw path data) is not interpreted: the router pays `receiver` and enforces
`minReturnAmount`, and the outer entry point enforces the operation's minimum output.

**Fee recipients (decisions [L41], launch gate).** Every recorded quote pays a fee wallet through the fee forwarder,
so the literal "signer or Diamond only" rule would reject all real quotes. The deviation: the forwarder may also pay
an address in `feeRecipients` of the source chain, the forwarded total must equal the quote's own fee step, and it
is bounded by `maxFeeBps` (default 100, 1 percent) of the forwarding item's input; the recorded quotes forward 25
bps. `feeRecipients` is empty by default and **the shipped `example-config.json` ships it empty**, so `lifi-probe`
reports every recorded class `REJECTED` (`calldata: SwapData[0].callData fee 0 pays … not an allowed fee
recipient`) until the operator adds it. The recorded payee is `0xC06ebbefD94032B85424D51906e2A335EFAe264B` on Base
and Arc: that is an observation from the fixtures, not a verified address. Launch gate (specification test 15):
verify LI.FI's fee wallet with LI.FI for every source chain, then add it per chain; the fixture tests set the
recorded wallet in their own test configuration (`testSupport.ts`, `approvingLifiConfig`).

Same-chain swap entry points: `receiver` must be the bot EOA, `minAmountOut` at least the quote's minimum output,
`SwapData[0]` the input token and amount, the last swap the output token. A bridge selector on a same-chain route,
or a swap selector on a cross-chain one, is rejected. Amounts are compared in the chain's units (Arc's 18-decimal
native USDC, not LI.FI's 6).

A new LI.FI route (another facet) needs its fixture recorded and its entry point added to `calldata.ts`; until then
`lifi-probe` reports it `REJECTED` with `calldata: selector … is not an allowed LI.FI entry point`.

Chain switching is never requested (`allowSwitchChain=false`) and a quote that touches another chain is rejected.

## Loss budget

Per operation, not per step. When a transfer starts, `Transfers` converts the input into the output asset at the
price oracle's USD prices (the *baseline*) and persists it with `minimumAcceptable = baseline − maxLossBps`. A quote
passes when `minimumOutput + fees deducted from the input − fees paid on top (included: false) + the same of
earlier legs ≥ minimumAcceptable`, every fee normalized into the output asset at oracle prices. A fee paid on top
reduces the net proceeds, so it is subtracted, never added to the budget; the fee cap (`maxQuotedFeeBps`) counts both
kinds. A fee LI.FI reports without an `included` flag is treated as paid on top (decisions [L49]): it is subtracted,
and when it is in the source chain's native token the transaction's value must carry it (`value:` otherwise). Requotes (a stale quote before sending, or the swap after a bridge delivered an intermediate
asset) are measured against the persisted baseline, never a fresh one. An unavailable price defers the transfer
before anything starts.

## Transfers step machine

`Transfers.run(intent)` finds its child operation by (parent, tag) in every status and performs at most one step or
one status poll per call; it never sleeps. Steps: quote → `approve` (ERC20) → `send` → `bridging` (status polls no
more often than `pollIntervalSeconds`) → `unwrap` (WETH delivery) → `completed`. If the bridge delivers an
intermediate asset on the destination chain (LI.FI `PARTIAL`), it stays `in-transit` and a destination swap is
requoted against the original baseline; a second bridge is never started.

Ledger moves are owned here: on send each allocation moves from the source `eoa` holding to `in-transit`; on receipt
`in-transit` is debited and the destination `eoa` holding is credited per `receivedByScope` (the verified credit
below, split pro-rata), once the receiving transaction is confirmed successful on the destination chain. A native
fee LI.FI charges on top of the input (the part of the send's value beyond a native input) is debited in the same
`send:debiting` bracket from the scopes' native `eoa` holdings on the leg's chain, split like the input, and credited
back (inside `send:crediting`) whenever the send is undone with nothing signed; operator gas never pays it. A fee those
holdings cannot cover is rejected as `policy-rejected: value: …` (when quoting, and again before the bracket). Once
the send is signed the fee is never credited back automatically: every `attention` after that point (a reverted,
replaced or unknown send, a signed `failed` record, a LI.FI failure, a status unknown past the timeout) names the
debited fee per scope, to be credited back by hand if the transaction did not spend it (a revert spends none; a LI.FI
refund may return it).
`in-transit:<operationId>` tracks what is in flight. Every ledger write sits between step markers; a resume at a
marker is `attention`.

Arc's native USDC has 18 decimals on chain but 6 in LI.FI: a quote covers the amount rounded down to LI.FI's unit,
and the remainder (under 10⁻⁶ USDC) stays in the scope's `eoa` holding.

The daily limit is checked when quoting and again when a (possibly cached) quote is sent, against the spends recorded
so far: two operations quoted before either sends cannot both pass the same allowance. A send over the limit stays at
`send` with an in-progress step `policy-rejected: daily-limit: …` and goes once the window allows. The `transfer`
spend row is written inside the `send:debiting` bracket, before the submit and before the `send:submit` marker, once
per leg: a crash before the marker resumes to `attention` and never appends a second row, and a retry after a send
that failed before signing adds none (the limit over-counts that attempt, never under-counts).

A persisted quote that has not been signed is re-evaluated against the **current** policy (decisions [L44]) before
its approval and before its send (also a `send:submit` resume with nothing recorded under the key): a target,
spender, tool, asset, limit or budget the operator tightened since the quote blocks it. The leg goes back to
`requote` with the in-progress step `policy-rejected: …` (the refill loop suspends on it as for any requote
rejection); a fresh quote then passes the provider's policy again. The daily limit is left to the send-time check
below, which knows whether the leg's own spend is already counted.

Every parent leg that has not signed yet is checked at send time. A leg whose own spend row is still inside the window is
already counted; a leg whose row aged out (a retry more than 24 hours after a send that failed before signing) adds
its input again and, when it goes, gets a fresh row.

A resume at `send:submit` with no transaction recorded under the key (a crash between the `send:debiting` bracket
and the submit) has signed nothing, so the full current policy decides again before signing (decisions [L51]): the
quote's age (`quoteMaxAgeSeconds`; the facet data carries a deadline), the policy's re-evaluation and the daily
limit. A leg any of them blocks is moved back: inside a `send:crediting` marker its `in-transit` amounts return to the
source `eoa` holdings (so a native input counts as operator gas again only through its holding, never as money in
transit), the attempt counter moves on (the next send uses `send-<leg>:<attempt+1>`), and the leg goes to `requote`
(in-progress step `policy-rejected: …` when the policy blocked it). The frozen `Ledger` cannot release a spend row and
none is ever written negative (decisions [L58]): the moved-back leg keeps its one `transfer` row and the requote's
send reuses it (`spendReserved`), so exactly one row exists and `spentSince` does not grow; when the row ages out of
the 24-hour window the next send adds a fresh one, as for any retry. A continuation leg's input is the intermediate
this operation delivered and stays booked in transit while it is requoted, up to a bound (decisions [L64]): every
tick the policy blocks a continuation leg (its first quote, a requote, the re-evaluation before approval or send, a
`send:submit` resume), LI.FI has no route for it (`awaiting-route:`), its quote request fails (`awaiting-route: quote
failed: …`: a LI.FI error or timeout, or a ledger read error while quoting) or the scopes' native holding cannot pay
its fee paid on top (`policy-rejected: value: the fee of …`), raises a warning (dedup per operation, one per cause) and
requotes; after `continuationBlockedMaxTicks` blocked ticks or `statusTimeoutSeconds` from the first one, the booking
moves (inside a `release:crediting` marker) from `in-transit` to the `eoa` holding of that token on the destination
chain under the operation's own scope, the step becomes `release`, the transfer goes to `attention` and one
`critical` is raised. A failed quote request is no evidence of a missing route: it starts the time but adds no blocked
tick, so only `statusTimeoutSeconds` ends an outage of LI.FI. The counter is never reset by a passing quote: a quote the
provider accepts can still be blocked by the re-evaluation before send, and a reset there would never reach the tick
bound. A resume at step `release` (a crash before the `attention` write, or an operator reopening the operation) raises
the same `attention` and `critical` and never requotes. Nothing stays booked in transit after that `attention`. A recorded transaction is always resolved
under its key, never requoted. A `failed` submit credits `in-transit` back
to `eoa` only when the journal's record under the key is `failed` with no signed bytes and no hash; anything else
is `attention` with the funds left in transit. An approval, send or unwrap that fails before signing, an `aborted:`
failure included (the executor's shutdown or expired wait budget, decisions [L61]), is retried on the next run under
the next attempt key, with no notification and no attempt budget: the step machine never counts failures, and its
caller sees only an in-progress step.

`LifiTransfers` refuses at construction a route provider without `recheck` (decisions [L55]): the re-evaluation of a
persisted quote is never silently skipped. `createRouteProvider` returns the LI.FI provider, which has it.

`start` checks the source holdings before the price (decisions [L25]): a credit lost in a crash yields
`insufficient-holding:` even while prices are unavailable (pinned by `transfers.test.ts`).

### Verified credit (decisions [L39])

The destination credit waits until the receiving transaction is `success` and the destination chain's configured
`confirmations` deep (topology); until then the transfer stays at `bridging`. A failing `getTransactionReceipt` or
`getBlockNumber` read keeps it there too (in-progress step `bridging: receipt read failed: …`); the time of the first
DONE answer is persisted as `doneSeenAt`, and a read still failing more than `statusTimeoutSeconds` after it (never
measured from the send, so a bridge that finished late survives one failing read) is `attention`, which frees the
inbound slot (decisions [L67]). The other waits after that first DONE are bounded from `doneSeenAt` too: a DONE
without a receiving hash yet, a receiving transaction not found yet, and an `unknown` status. The credit is `min(LI.FI's reported
amount, the quote's estimated output)`: an over-reported status never inflates a holding, and raises a warning. Then:

- **ERC20 delivery** (WETH for a native destination, a token destination, or an intermediate asset): a gate. At send
  the transfer records, in its step payload (`baselines`), the EOA's destination balance of every asset it may be
  checked against: the planned asset, the wrapped native for every native-destination leg (decisions [L54], also
  when the quote does not say it delivers wrapped, so an unexpected WETH delivery is verified and unwrapped instead of
  ending in `attention`), and the bridge step's own output token. On delivery the balance of the asset actually delivered must exceed its own baseline by at least the
  amount to credit; otherwise nothing is credited (never a partial credit), one warning is raised, and after
  `creditCheckMaxTicks` failed checks (one per poll) or `creditCheckMaxAgeSeconds` the transfer goes to `attention`.
  A missing baseline (the balance could not be read at send) cannot be verified and ends the same way. An
  intermediate delivery is also capped at the bridge step's own estimate when the quote reported it.
- **Native delivery**: capped at the estimate; the balance delta net of this transfer's own gas there (`gasUsed *
  effectiveGasPrice` of its receipts) is recorded as `transfer-delta:<operationId>` and a short delta only warns. The
  bot's other gas outflows on that chain cannot be attributed with the frozen ports, so an over-reported native
  delivery is credited up to the quote's estimate: accepted for v1, a launch-gate item (specification test 15).

Inbound legs are serialized per destination chain over every asset a delivery can leave there (decisions [L44]): the
planned asset, the wrapped native of a native delivery (LI.FI may deliver WETH), each leg's bridge output (an
intermediate token) and every asset whose baseline it recorded. A first leg is not sent while another open transfer
whose set overlaps its own has been sent and has neither completed (its unwrap included) nor gone to `attention`.
Each leg records its baselines at its own send, so a continuation's WETH delivery is measured from the continuation's
send, not from the first bridge's. The waiting leg stays at `send` with the in-progress step `awaiting-inbound-slot: <operationId>` and
raises one warning naming the blocking transfer. A leg in `attention` releases the slot, so one stuck transfer never
stalls later refills; its own alert is raised by its caller. This keeps one transfer per balance window; the
one-tick-at-a-time scheduler is unchanged.

### Approvals

Before a send the bot reads the token's on-chain `allowance(signer, spender)` (decisions [L35]) instead of
remembering an earlier approval: it approves (bounded to the input) only when the allowance is under the input.
Several transfers of one token share one spender (the Diamond), so another transfer's send may spend an allowance
this one saw; the transfer then approves again under the next attempt's key (`approve-<leg>-<quote>:<n>`), never by
replaying a recorded approval; that re-approval is re-evaluated against the current policy before its new key is
signed (decisions [L67]), so a revoked spender or target blocks it. The approval keeps its own counter (decisions [L44]): a confirmed approval never
resets the send's attempt counter, so a send that failed before signing is retried under `send-<leg>:<n+1>`, never
under the failed key again. A requote of a leg whose send failed before signing keeps the leg's own `transfer`
spend row; when the provider's daily-limit check (which counts that row plus the requoted input) is the only
violation, the send-time check, which counts the row once, decides.

Outcomes the callers act on: `completed`, `attention`, `in-progress` (its `step` starts with `policy-rejected:` when a
requote of an open transfer, or the send-time daily-limit check, was rejected; `awaiting-route:` when a requote found
no route; `awaiting-inbound-slot:` while another leg holds the destination's slot; `bridging: delivery not verified`
while the ERC20 credit gate fails), and `deferred` (nothing started). A deferral `reason` is exactly one of five codes followed by free text
(decisions [L20]; pinned by `transfers.test.ts`):

| Code | Meaning |
| --- | --- |
| `price-unavailable:` | the oracle cannot price the baseline (transient) |
| `insufficient-holding:` | an allocation's source `eoa` holding is short (ambiguous, e.g. after a crash) |
| `no-route:` | LI.FI has no quote for the route class (a legitimate steady state, e.g. Arc USDC → Arbitrum ETH) |
| `policy-rejected:` | the signing policy refused the quote |
| `allocations-mismatch:` | the allocation vector does not sum to the amount (a programming error) |

Only the quote endpoint's HTTP 404 with LI.FI code 1002 ("no available quotes") is a route gap (decisions [L49]); a
404 without that code (a wrong `endpoint` path) or code 1002 under another status is an error. A LI.FI request that
throws (an HTTP error other than "no route", or the `ports.fetch` timeout) while a transfer is
first quoted is not a deferral: `run` throws and the caller's tick fails into the scheduler's backoff.

## Configuration (`lifi` section)

`"lifi": {}` parses and approves nothing: every allowlist is empty and no asset has a limit. See `example-config.json`.

| Field | Default | Meaning |
| --- | --- | --- |
| `endpoint` | `https://li.quest/v1` | LI.FI REST base URL. |
| `integrator` | none | LI.FI `integrator` parameter. |
| `requestSlippage` | 0.005 | LI.FI's per-request slippage parameter; not the budget. |
| `maxLossBps` | 500 | Operation-level loss budget against the oracle baseline. |
| `maxQuotedFeeBps` | 300 | Cap on normalized quoted fees (included and on top) as a share of the gross output. |
| `maxFeeBps` | 100 | The most LI.FI's fee forwarder may pay inside one transaction, as a share of the forwarding `SwapData` item's input (decisions [L41]). |
| `allowedChains`, `allowedTools`, `allowedAssets`, `allowedTargets`, `allowedSpenders` | `[]` | Allowlists (assets, targets and spenders per chain). |
| `allowedSwapContracts` | `[]` | Per chain: every `SwapData.callTo`/`approveTo` the Diamond may call or approve inside a transaction (fee collector, DEX router, approval proxy). Empty rejects every quote with a source swap. |
| `layerSwapDepositories` | `[]` | Per source chain: allowed `LayerSwapData.depositoryReceiver` addresses. Empty rejects every LayerSwap quote. |
| `feeRecipients` | `[]` | Per source chain: who LI.FI's fee forwarder may pay inside a `SwapData.callData`, besides the signer and the Diamond. Empty (the default and the shipped example) rejects every quote with a fee step that pays a third party (all recorded quotes do); add LI.FI's fee wallet only after verifying it with LI.FI (launch gate above). |
| `creditCheckMaxTicks` | 10 | Failed checks (one per poll) of an ERC20 delivery's balance increase before the transfer goes to `attention`. |
| `creditCheckMaxAgeSeconds` | 1800 | ...or this long after the first failed check. |
| `continuationBlockedMaxTicks` | 20 | Blocked ticks (by the policy, for lack of a LI.FI route, or for lack of native to pay a fee paid on top; a failed quote request adds none) of a continuation leg (its input already on the destination chain) before its booking moves from `in-transit` to the `eoa` holding of that token and the transfer goes to `attention` (decisions [L64]); also after `statusTimeoutSeconds` from the first block. |
| `limits` | `[]` | Per source chain and asset: `decimals`, `perTransfer`, `daily` in whole units. `decimals` must equal the topology's (the chain's `nativeDecimals` for `native`, the collected asset's for a token): `createRouteProvider`, `createTransfers` and `lifi-probe` refuse a mismatch, an unknown chain or an asset outside the topology, naming `lifi.limits[i]` (decisions [L36]). |
| `nativeTokens` | `[]` | LI.FI's token for a chain's native asset when it is not the zero address (Arc: `0x3600…0000`, 6 decimals). |
| `priceSymbols` | `WETH→ETH`, `USDC.e→USDC`, `USDbC→USDC` | Token symbol to price-oracle symbol. |
| `quoteMaxAgeSeconds` | 120 | A quote older than this is requoted before the send. |
| `pollIntervalSeconds` | 30 | Minimum time between two status polls of one transfer. |
| `statusTimeoutSeconds` | 7200 | Past this an `unknown` status (or a `done` without a confirmed receiving transaction) is `attention`; a `pending` one keeps being polled with one warning. Once LI.FI has reported the leg `done`, every later wait (no receiving hash yet, receipt not found or not readable, `unknown`) is measured from that first report (`doneSeenAt`), never from the send. |
| `routeClasses` | `[]` | What `lifi-probe` quotes; derived from the topology when empty. |

## `lifi-probe` (launch gates)

```bash
GATEWAY_BALANCER_CONFIG=config/production.json BALANCER_ADDRESS=0x… \
  yarn workspace @kleros/gateway-balancer-bot lifi-probe
```

Quote only, never signs, never reads the key. For every route class it prints the quote's tools and steps (targets,
spenders, bounded approvals, native value), estimated and minimum output, each fee, fees normalized into the
output, the budget minimum and the policy verdict. Prices in the probe are the ones LI.FI reports (the bot itself
uses its price oracle). Exit code 0 when every class has an approved quote, 1 when any has none, 2 on a usage error. Under the shipped example every recorded class is `REJECTED` on the fee recipient until LI.FI's fee wallet is
verified and added to `feeRecipients` (above).

## Notifications and operator actions

| Notification | Severity | Operator action |
| --- | --- | --- |
| `LI.FI transfer still pending past its timeout` | warning (once per transfer) | Check the transfer on scan.li.fi and the bridge's explorer. The bot keeps polling and never starts a second bridge. |
| `LI.FI reports more than the quote promised` | warning (once per transfer) | Compare the receiving transaction with the quote. The bot credited the quote's estimate; any excess stays in the EOA as untracked balance (it raises the gas reserve) until reconciled by hand. |
| `Transfer credited more than the balance delta` | warning | Native deliveries only. Compare the receiving transaction with the EOA's balance history (other activity on the EOA can explain it); reconcile the holdings if funds are really short. |
| `LI.FI delivery not visible in the EOA balance` | warning (once per transfer) | An ERC20 delivery that LI.FI reports `DONE` did not raise the EOA's token balance by the amount: nothing is credited. Check the receiving transaction and the token balance; if the funds did not arrive the transfer goes to `attention` (`unverified delivery: …`) after `creditCheckMaxTicks` checks or `creditCheckMaxAgeSeconds`, and the funds stay `in-transit` in the ledger until resolved by hand. |
| `LI.FI continuation swap blocked by the policy` | warning (dedup per transfer) | The bridge delivered an intermediate token whose swap the policy rejects (for instance not in `allowedAssets`, or not the bridge's declared output). Add the token to `lifi.allowedAssets` if you accept it; otherwise the transfer goes to `attention` after `continuationBlockedMaxTicks` blocked ticks or `statusTimeoutSeconds`. |
| `LI.FI continuation swap has no route` | warning (dedup per transfer) | The bridge delivered an intermediate token and LI.FI finds no route for its swap (or the quote request fails). Run `lifi-probe` for that swap; the transfer is requoted every tick and goes to `attention` after `continuationBlockedMaxTicks` blocked ticks or `statusTimeoutSeconds` (a failed quote request counts toward the time only). |
| `LI.FI continuation swap cannot pay its fee` | warning (dedup per transfer) | The continuation's quote carries a LI.FI fee paid on top in native that the scope's native `eoa` holding on that chain does not cover (the body names the amounts). Fund that holding; otherwise the transfer goes to `attention` after `continuationBlockedMaxTicks` blocked ticks or `statusTimeoutSeconds`. |
| `LI.FI continuation swap abandoned: intermediate token left in the EOA` | critical (once per transfer) | The named token and amount are booked in the operation scope's `eoa` holding on the named chain and the operation is in `attention` (step `release`). Swap it by hand. Resuming the operation does not swap it: it raises the same `attention` again. |
| `LI.FI transfer waiting for an inbound slot` | warning (once per blocking transfer) | Another transfer to the same chain and asset is in flight. Nothing to do unless the named transfer is stuck; it ends in `attention` on its own (timeout) and then frees the slot. |

A transfer in `attention` is reported by its caller (the refill or reporter loop) with the transfer's reason:
unknown status past the timeout, LI.FI `FAILED` or `REFUNDED`, a reverted receiving transaction, an unexpected
delivered asset, a receipt under the quoted minimum, an unverified ERC20 delivery, a replaced or reverted
transaction, or a restart inside a ledger bracket. Resolve the funds by hand (source EOA, bridge, destination EOA) before resolving the operation.

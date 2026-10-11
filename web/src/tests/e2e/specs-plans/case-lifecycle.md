# Plan: a classic dispute through its periods

Seed: `src/tests/e2e/seed.spec.ts`. Default world: dispute N is in period `PERIODS[(N - 1) % 5]`
(1 evidence, 2 commit, 3 vote, 4 appeal, 5 execution), `lastPeriodChange` two hours before `E2E_NOW`.
Specs: `specs/cases/{case-periods,evidence,vote,appeal-funding}.spec.ts`.

## Scenarios

1. **Overview per period** (`case-periods`). For each period open `/#/cases/<id>/overview`: title from the dispute
   template, "Case in progress" until execution then "Case closed"; the Appeal tab is enabled from the appeal
   period on.
2. **Evidence** (`evidence`). Seed `world.evidences` with `anEvidence`; list shows them; searching "delay" leaves
   only the matching one and issues an `evidenceSearch` query. Submitting signs in to Atlas (GetNonce, Login),
   then sends `evidenceModule.submitEvidence(1, json)` with `{ name, description, fileURI }`.
3. **Vote** (`vote`). `drawJuror(world, "3", ALICE, 4)`; justification + "Yes" + "Confirm vote" sends
   `disputeKitClassic.castVote(3, [4], 1, 0, justification)` and shows "Thanks for voting".
4. **Commit** (`vote`). Hidden votes on dispute 2: "No" + confirm should send `castCommit(2, [1], hash)`.
   The RPC mock answers `eth_accounts` with the connected key, which the mock connector needs for its account.
5. **Appeal funding** (`appeal-funding`). Dispute 4 local round: winner choice 1 paid 0.005 ETH, choice 2 funded.
   With appealCost 0.01 ETH and multipliers 100% / 200%: "0.005 out of 0.02 ETH required.", "Fully funded!",
   "0 out of 0.03 ETH required.". Selecting "Yes" pre-fills 0.02; Fund sends `fundAppeal(4, 1)` with 0.02 ETH.
   A balance of 0.001 ETH shows "Insufficient balance" and disables Fund.

## Not covered

- Reveal period and Shutter/gated dispute kits.
- Maintenance buttons (pass period, draw, execute).

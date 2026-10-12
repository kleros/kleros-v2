# Plan: staking PNK in a court

Seed: `src/tests/e2e/seed.spec.ts` (all fixtures active; wallet `alice` holds 10,000 PNK by default).
Spec: `specs/courts/stake-pnk.spec.ts`.

## Preconditions

- Court 1 "General Court" has `minStake` 200 PNK (`mocks/subgraph/world.ts`).
- `pnk.balanceOf` returns 10,000 PNK, `pnk.allowance` 0, `sortitionModule.getJurorBalance` all zeros
  (`mocks/rpc/defaults.ts`).

## Scenarios

1. **Over-balance amount is rejected.** Open `/#/courts/1`, connect `alice`, type 20000 in "Amount to stake".
   Expect "Insufficient balance to stake this amount" and the stake button (`stake-withdraw-button`) disabled.
2. **Below-minimum amount is rejected.** Type 100. Expect "Min Stake in court is: 200 PNK", button disabled.
3. **Approve then stake.** Make `allowance` follow sent `increaseAllowance` transactions, mock `setStake`.
   Type 1000 and click Stake. Expect "You successfully staked"; `rpc.sent(pnk, "increaseAllowance")` is
   `[klerosCore, 1000e18]` and `rpc.sent(klerosCore, "setStake")` is `[1n, 1000e18]`.
4. **Simulation revert.** `setStake` throws `Revert("Staking is paused")`. Expect the reason under the input and no
   transaction. Currently fails: `utils/parseWagmiError.ts` shows viem's "Contract Call:" header.

## Not covered

- Withdraw tab (same component with `ActionType.withdraw`).
- Delayed stakes during the drawing phase.

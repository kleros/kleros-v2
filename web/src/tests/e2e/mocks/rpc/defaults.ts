import { disputeKitClassic, klerosCore, pnk, pnkFaucet, sortitionModule } from "../../contracts";

import type { RpcServer } from "./server";

const PNK = 10n ** 18n;

/** Chain state the default handlers report; tests change it with `rpc.onCall` overrides. */
export const DEFAULT_CHAIN_STATE = {
  /** PNK held by any connected test account. */
  pnkBalance: 10_000n * PNK,
  faucetBalance: 1_000_000n * PNK,
  faucetAmount: 10_000n * PNK,
  appealCost: 10n ** 16n,
  arbitrationCost: 3n * 10n ** 15n,
  /** Basis points, as in DisputeKitClassic. */
  winnerStakeMultiplier: 10_000n,
  loserStakeMultiplier: 20_000n,
  loserAppealPeriodMultiplier: 5_000n,
} as const;

/** Contract reads the pages issue on load. Registered first, so any test `onCall` takes precedence. */
export const installDefaultCalls = (rpc: RpcServer) => {
  const s = DEFAULT_CHAIN_STATE;
  rpc.onCall(pnk, "balanceOf", ([account]) =>
    account.toLowerCase() === pnkFaucet.address.toLowerCase() ? s.faucetBalance : s.pnkBalance
  );
  rpc.onCall(pnk, "allowance", () => 0n);
  // The stake panel simulates the approval as soon as an amount is typed.
  rpc.onCall(pnk, "increaseAllowance", () => true);
  rpc.onCall(pnkFaucet, "amount", () => s.faucetAmount);
  rpc.onCall(pnkFaucet, "withdrewAlready", () => true);
  rpc.onCall(sortitionModule, "getJurorBalance", () => [0n, 0n, 0n, 0n] as const);
  rpc.onCall(klerosCore, "appealCost", () => s.appealCost);
  // arbitrationCost is overloaded; viem types its return as the intersection of both overloads.
  rpc.onCall(klerosCore, "arbitrationCost", () => s.arbitrationCost as never);
  rpc.onCall(klerosCore, "currentRuling", () => [1n, false, false] as const);
  rpc.onCall(disputeKitClassic, "isVoteActive", () => false);
  rpc.onCall(disputeKitClassic, "WINNER_STAKE_MULTIPLIER", () => s.winnerStakeMultiplier);
  rpc.onCall(disputeKitClassic, "LOSER_STAKE_MULTIPLIER", () => s.loserStakeMultiplier);
  rpc.onCall(disputeKitClassic, "LOSER_APPEAL_PERIOD_MULTIPLIER", () => s.loserAppealPeriodMultiplier);
};

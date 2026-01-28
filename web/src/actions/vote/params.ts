import { DisputeKits } from "src/consts";

interface BaseVoteParams {
  disputeId: bigint;
  voteIds: bigint[];
  choice: bigint;
  salt: bigint;
  justification: string;
  type: DisputeKits;
}

export interface ClassicVoteParams extends BaseVoteParams {
  type: DisputeKits.Classic;
}

export type VoteParams = ClassicVoteParams;

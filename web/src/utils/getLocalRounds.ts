import { VotingHistoryQuery } from "queries/useVotingHistory";
import { ClassicAppealQuery } from "queries/useClassicAppealQuery";

type IVotingHistoryLocalRounds = NonNullable<
  NonNullable<VotingHistoryQuery["dispute"]>["disputeKitDispute"]
>["localRounds"];

type IClassicAppealQueryLocalRounds = NonNullable<
  NonNullable<ClassicAppealQuery["dispute"]>["disputeKitDispute"]
>["localRounds"];

type ILocalRounds = IClassicAppealQueryLocalRounds | IVotingHistoryLocalRounds;

interface IDisputeKitDisputes {
  localRounds: ILocalRounds;
}

export const getLocalRounds = (disputeKitDisputes: IDisputeKitDisputes | undefined | null) => {
  return disputeKitDisputes?.reduce<ILocalRounds>((acc: ILocalRounds, { localRounds }) => acc.concat(localRounds), []);
};

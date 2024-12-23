import { VotingHistoryQuery } from "src/graphql/graphql";

type IVotingHistoryRounds = NonNullable<NonNullable<VotingHistoryQuery["dispute"]>["rounds"][number]["drawnJurors"]>;
export type DrawnJuror = IVotingHistoryRounds[number] & {
  voteCount: number;
  transactionHash?: string;
  timestamp?: string;
};

export const getDrawnJurorsWithCount = (drawnJurors: IVotingHistoryRounds) =>
  drawnJurors?.reduce<DrawnJuror[]>((acc, current) => {
    const jurorId = current.juror.id;

    const existingJuror = acc.find((item) => item.juror.id === jurorId);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    existingJuror
      ? existingJuror.voteCount++
      : acc.push({
          juror: { id: jurorId },
          voteCount: 1,
          vote: current.vote,
          transactionHash: current.vote?.justification?.transactionHash,
          timestamp: current.vote?.justification?.timestamp,
        });
    return acc;
  }, []);

import { Hash } from "viem";

import { VotingHistoryQuery } from "src/graphql/graphql";

type IVotingHistoryRounds = NonNullable<NonNullable<VotingHistoryQuery["dispute"]>["rounds"][number]["drawnJurors"]>;
export type DrawnJuror = IVotingHistoryRounds[number] & {
  voteCount: number;
  transactionHash?: Hash;
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
          //once the subgraph schema for ClassicJustification.transactionHash changes from String! to Bytes!
          //it will automattically resolve to 0xstring and we can remove this cast
          transactionHash: current.vote?.justification?.transactionHash as Hash | undefined,
          timestamp: current.vote?.justification?.timestamp,
        });
    return acc;
  }, []);

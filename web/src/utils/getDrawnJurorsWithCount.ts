import { VotingHistoryQuery } from "src/graphql/graphql";

type IVotingHistoryRounds = NonNullable<NonNullable<VotingHistoryQuery["dispute"]>["rounds"][number]["drawnJurors"]>;
export type DrawnJuror = IVotingHistoryRounds[number] & { voteCount: number };

export const getDrawnJurorsWithCount = (drawnJurors: IVotingHistoryRounds) =>
  drawnJurors &&
  drawnJurors.reduce<DrawnJuror[]>((acc, current) => {
    const jurorId = current.juror.id;

    const existingJuror = acc.find((item) => item.juror.id === jurorId);
    if (existingJuror) {
      existingJuror.voteCount++;
    } else {
      acc.push({
        juror: { id: jurorId },
        voteCount: 1,
        vote: current.vote,
      });
    }
    return acc;
  }, []);

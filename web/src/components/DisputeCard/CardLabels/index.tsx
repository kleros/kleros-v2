import React, { useMemo } from "react";
import styled from "styled-components";
import Label from "./Label";
import EvidenceIcon from "svgs/label-icons/evidence.svg";
import NotDrawnIcon from "svgs/label-icons/minus-circle.svg";
import CanVoteIcon from "svgs/label-icons/vote.svg";
import VotedIcon from "svgs/label-icons/voted.svg";
import ForgotToVoteIcon from "svgs/label-icons/forgot-vote.svg";
import AppealIcon from "svgs/label-icons/appeal.svg";
import FundedIcon from "svgs/label-icons/funded.svg";
import WonIcon from "svgs/label-icons/rewards-won.svg";
import LostIcon from "svgs/label-icons/rewards-lost.svg";
import { useAccount } from "wagmi";
import { useLabelInfoQuery } from "hooks/queries/useLabelInfoQuery";
import { isUndefined } from "utils/index";
import { formatEther, formatUnits } from "viem";
import RewardsAndFundLabel from "./RewardsAndFundLabel";
import Skeleton from "react-loading-skeleton";
import { getLocalRounds } from "utils/getLocalRounds";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;
interface ICardLabels {
  disputeId: string;
  round: number;
}
const LabelArgs = {
  EvidenceTime: { text: "Evidence Time", icon: EvidenceIcon, color: "blue" },
  NotDrawn: { text: "Not Drawn", icon: NotDrawnIcon, color: "grey" },
  CanVote: { text: "Time to vote", icon: CanVoteIcon, color: "blue" },
  Voted: { text: "I voted", icon: VotedIcon, color: "purple" },
  DidNotVote: { text: "Forgot to vote", icon: ForgotToVoteIcon, color: "purple" },
  CanFund: { text: "I can fund the appeal", icon: AppealIcon, color: "lightPurple" },
  Funded: { text: "I funded", icon: FundedIcon, color: "lightPurple" },
  Won: { text: "Won", icon: WonIcon, color: "green" },
  Lost: { text: "Lost", icon: LostIcon, color: "red" },
};
const CardLabel: React.FC<ICardLabels> = ({ disputeId, round }) => {
  const { address } = useAccount();
  const { data: labelInfo, isLoading } = useLabelInfoQuery(address?.toLowerCase(), disputeId);
  const localRounds = getLocalRounds(labelInfo?.dispute?.disputeKitDispute);
  const rounds = labelInfo?.dispute?.rounds;
  const currentRound = rounds?.[round];

  const period = labelInfo?.dispute?.period!;
  const hasVotedCurrentRound = !isUndefined(currentRound?.drawnJurors?.[0]?.vote);
  const isDrawnCurrentRound = currentRound?.drawnJurors.length !== 0;
  const hasVotedInDispute = rounds?.some((item) => !isUndefined(item.drawnJurors?.[0]?.vote));
  const isDrawnInDispute = rounds?.some((item) => item?.drawnJurors.length);
  const funded = localRounds?.[round]?.contributions.length !== 0; //if funded in current round
  const fundAmount = localRounds?.[round]?.contributions?.[0]?.amount; //current round's fund amount
  const shifts = labelInfo?.dispute?.shifts;
  console.log({
    labelInfo,
    isDrawnCurrentRound,
    hasVotedCurrentRound,
    isDrawnInDispute,
    hasVotedInDispute,
    funded,
    shifts,
    fundAmount,
  });

  const labelData = useMemo(() => {
    if (period === "evidence") return LabelArgs.EvidenceTime;
    if (!isDrawnCurrentRound && period === "appeal" && !funded) return LabelArgs.CanFund;
    if (!isDrawnCurrentRound && ["appeal", "execution"].includes(period) && funded) return LabelArgs.Funded; //plus amount if funded
    if (period === "execution" && isDrawnInDispute && hasVotedInDispute) return LabelArgs.Voted;
    if (period === "execution" && isDrawnInDispute && !hasVotedInDispute) return LabelArgs.DidNotVote;
    if (!isDrawnCurrentRound) return LabelArgs.NotDrawn;

    if (["commit", "vote"].includes(period) && !hasVotedCurrentRound) return LabelArgs.CanVote;
    if (["vote", "appeal", "execution"].includes(period) && hasVotedCurrentRound) return LabelArgs.Voted; //plus rewards if execution
    if (["appeal", "execution"].includes(period) && !hasVotedCurrentRound) return LabelArgs.DidNotVote; //plus rewards if execution
    return LabelArgs.NotDrawn;
  }, [labelInfo]);

  const rewardsData = useMemo(() => {
    return shifts?.reduce(
      (acc, val) => {
        acc.ethShift += Number(formatEther(val.ethAmount));
        acc.pnkShift += Number(formatUnits(val.pnkAmount, 18));
        return acc;
      },
      { ethShift: 0, pnkShift: 0 }
    );
  }, [labelData, labelInfo]);
  const isWon = Number(rewardsData?.pnkShift) > 0;

  return isLoading ? (
    <Skeleton width={180} height={14} />
  ) : (
    <Container>
      {" "}
      <Label {...labelData} />
      {/* {!isUndefined(rewardsData) ? <>{isWon ? <Label {...LabelArgs.Won} /> : <Label {...LabelArgs.Lost} />}</> : null} */}
      {!isUndefined(rewardsData) ? (
        <>
          <RewardsAndFundLabel value={rewardsData.ethShift.toString()} unit="ETH" />
          <RewardsAndFundLabel value={rewardsData.pnkShift.toString()} unit="PNK" />
        </>
      ) : null}
      {!isUndefined(fundAmount) ? <RewardsAndFundLabel value={formatUnits(fundAmount, 18)} unit="ETH" isFund /> : null}
    </Container>
  );
};

export default CardLabel;

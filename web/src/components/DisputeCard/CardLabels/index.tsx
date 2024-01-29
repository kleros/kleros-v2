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
import { useAccount } from "wagmi";
import { useLabelInfoQuery } from "hooks/queries/useLabelInfoQuery";
import { isUndefined } from "utils/index";
import { formatEther, formatUnits } from "viem";
import RewardsAndFundLabel from "./RewardsAndFundLabel";
import Skeleton from "react-loading-skeleton";
import { getLocalRounds } from "utils/getLocalRounds";
import { ClassicContribution } from "src/graphql/graphql";

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
};

const getFundingRewards = (contributions: ClassicContribution[], closed: boolean) => {
  if (isUndefined(contributions) || contributions.length === 0) return 0;
  const contribution = contributions.reduce((acc, val) => {
    if (isUndefined(val?.rewardAmount) && isUndefined(val?.amount)) return acc;
    if (closed) {
      acc += val.rewardAmount === null ? -1 * Number(val.amount) : Number(val.rewardAmount) - Number(val.amount);
    } else {
      acc += Number(val.amount);
    }
    return acc;
  }, 0);
  return Number(formatUnits(BigInt(contribution), 18));
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
  const hasFundedCurrentRound = localRounds?.[round]?.contributions.length !== 0; //if hasFundedCurrentRound in current round
  const currentRoundFund = getFundingRewards(localRounds?.[round]?.contributions, period === "execution"); //current round's fund amount
  const shifts = labelInfo?.dispute?.shifts;

  const contributions = useMemo(
    () =>
      localRounds?.reduce((acc, val) => {
        acc.push(...val.contributions);
        return acc;
      }, []),
    [localRounds]
  );

  const contributionRewards = useMemo(() => getFundingRewards(contributions, true), [contributions]);
  const hasFundedDispute = contributions?.length !== 0; //if ever funded the dispute in any round

  const labelData = useMemo(() => {
    if (period === "evidence") return LabelArgs.EvidenceTime;
    if (!isDrawnCurrentRound && period === "appeal" && !hasFundedCurrentRound) return LabelArgs.CanFund;

    if (!isDrawnCurrentRound && period === "execution" && hasFundedDispute) return LabelArgs.Funded;
    if (!isDrawnCurrentRound && period === "appeal" && hasFundedCurrentRound) return LabelArgs.Funded; //plus amount
    if (period === "execution" && isDrawnInDispute && hasVotedInDispute) return LabelArgs.Voted;
    if (period === "execution" && isDrawnInDispute && !hasVotedInDispute) return LabelArgs.DidNotVote;
    if (!isDrawnCurrentRound) return LabelArgs.NotDrawn;

    if (["commit", "vote"].includes(period) && !hasVotedCurrentRound) return LabelArgs.CanVote;
    if (["vote", "appeal", "execution"].includes(period) && hasVotedCurrentRound) return LabelArgs.Voted; //plus rewards if execution
    if (["appeal", "execution"].includes(period) && !hasVotedCurrentRound) return LabelArgs.DidNotVote; //plus rewards if execution
    return LabelArgs.NotDrawn;
  }, [labelInfo]);

  const rewardsData = useMemo(() => {
    const shift = shifts?.reduce(
      (acc, val) => {
        acc.ethShift += Number(formatEther(val.ethAmount));
        acc.pnkShift += Number(formatUnits(val.pnkAmount, 18));
        return acc;
      },
      { ethShift: 0, pnkShift: 0 }
    );
    if (isUndefined(shift)) return undefined;
    shift.ethShift += contributionRewards;
    return shift;
  }, [labelData, labelInfo, contributionRewards]);

  return isLoading ? (
    <Skeleton width={180} height={14} />
  ) : (
    <Container>
      {" "}
      <Label {...labelData} />
      {!isUndefined(rewardsData) && period === "execution" ? (
        <>
          <RewardsAndFundLabel value={rewardsData.ethShift.toString()} unit="ETH" />
          <RewardsAndFundLabel value={rewardsData.pnkShift.toString()} unit="PNK" />
        </>
      ) : null}
      {!isUndefined(currentRoundFund) && period === "appeal" ? (
        <RewardsAndFundLabel value={currentRoundFund.toString()} unit="ETH" isFund />
      ) : null}
    </Container>
  );
};

export default CardLabel;

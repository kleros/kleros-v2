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

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;
interface ICardLabels {
  disputeId: string;
  localRoundId: string;
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
const CardLabel: React.FC<ICardLabels> = ({ disputeId, localRoundId }) => {
  const { address } = useAccount();
  const { data: labelInfo, isLoading } = useLabelInfoQuery(address?.toLowerCase(), disputeId, localRoundId);
  const period = labelInfo?.dispute?.period!;
  const hasVoted = !isUndefined(labelInfo?.dispute?.currentRound?.drawnJurors?.[0]?.vote);
  const isDrawn = labelInfo?.dispute?.currentRound.drawnJurors.length !== 0;
  const funded = labelInfo?.classicRound?.contributions.length !== 0;
  const fundAmount = labelInfo?.classicRound?.contributions?.[0]?.amount;
  const rewards = labelInfo?.dispute?.shifts?.[0];
  console.log({ labelInfo, isDrawn, hasVoted, funded, rewards, fundAmount });
  const labelData = useMemo(() => {
    if (period === "evidence") return LabelArgs.EvidenceTime;
    if (!isDrawn && period === "appeal" && !funded) return LabelArgs.CanFund;
    if (!isDrawn && ["appeal", "execution"].includes(period) && funded) return LabelArgs.Funded; //plus amount if funded
    if (!isDrawn) return LabelArgs.NotDrawn;

    if (["commit", "vote"].includes(period) && !hasVoted) return LabelArgs.CanVote;
    if (["vote", "appeal", "execution"].includes(period) && hasVoted) return LabelArgs.Voted; //plus rewards if execution
    if (["appeal", "execution"].includes(period) && !hasVoted) return LabelArgs.DidNotVote; //plus rewards if execution
    return LabelArgs.NotDrawn;
  }, [labelInfo]);

  const rewardsData = useMemo(() => {
    const ethShift = formatEther(rewards?.ethAmount ?? "");
    const pnkShift = formatUnits(rewards?.pnkAmount ?? "", 18);
    return { ethShift, pnkShift };
  }, [labelData, labelInfo]);
  const isWon = Number(rewardsData.pnkShift) > 0;

  return isLoading ? (
    <Skeleton width={180} height={14} />
  ) : (
    <Container>
      {" "}
      <Label {...labelData} />
      {!isUndefined(rewards) ? <>{isWon ? <Label {...LabelArgs.Won} /> : <Label {...LabelArgs.Lost} />}</> : null}
      {!isUndefined(rewards) ? (
        <>
          <RewardsAndFundLabel value={rewardsData.ethShift} unit="ETH" />
          <RewardsAndFundLabel value={rewardsData.pnkShift} unit="PNK" />
        </>
      ) : null}
      {!isUndefined(fundAmount) ? <RewardsAndFundLabel value={formatUnits(fundAmount, 18)} unit="ETH" isFund /> : null}
    </Container>
  );
};
export default CardLabel;

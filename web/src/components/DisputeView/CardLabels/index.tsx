import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { formatEther, formatUnits } from "viem";
import { useAccount } from "wagmi";

import AppealIcon from "svgs/label-icons/appeal.svg";
import EvidenceIcon from "svgs/label-icons/evidence.svg";
import ForgotToVoteIcon from "svgs/label-icons/forgot-vote.svg";
import FundedIcon from "svgs/label-icons/funded.svg";
import NotDrawnIcon from "svgs/label-icons/minus-circle.svg";
import CanVoteIcon from "svgs/label-icons/vote.svg";
import VotedIcon from "svgs/label-icons/voted.svg";

import { useLabelInfoQuery } from "hooks/queries/useLabelInfoQuery";
import { getLocalRounds } from "utils/getLocalRounds";
import { isUndefined } from "utils/index";

import { ClassicContribution } from "src/graphql/graphql";

import Label, { IColors } from "./Label";
import RewardsAndFundLabel from "./RewardsAndFundLabel";

const Container = styled.div<{ isList: boolean; isOverview: boolean }>`
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: end;

  ${({ isList }) =>
    !isList &&
    css`
      margin-top: 24px;
      width: 100%;
      flex-wrap: wrap;
      flex-direction: row;
      align-items: center;
    `}

  ${({ isOverview }) =>
    isOverview &&
    css`
      margin-top: 0;
      flex-direction: row;
      width: auto;
    `}
`;

const RewardsContainer = styled.div`
  display: flex;
  gap: 4px 8px;
  flex-wrap: wrap;
  justify-content: end;
`;
interface ICardLabels {
  disputeId: string;
  round: number;
  isList: boolean;
  isOverview?: boolean;
}

const getLabelArgs = (
  t: any
): Record<string, { text: string; icon: React.FC<React.SVGAttributes<SVGElement>>; color: IColors }> => ({
  EvidenceTime: { text: t("card_labels.evidence_time"), icon: EvidenceIcon, color: "blue" },
  NotDrawn: { text: t("card_labels.you_were_not_drawn"), icon: NotDrawnIcon, color: "grey" },
  CanVote: { text: t("card_labels.you_can_vote_now"), icon: CanVoteIcon, color: "blue" },
  Voted: { text: t("card_labels.you_voted"), icon: VotedIcon, color: "purple" },
  DidNotVote: { text: t("card_labels.you_did_not_vote"), icon: ForgotToVoteIcon, color: "purple" },
  CanFund: { text: t("card_labels.appeal_possible"), icon: AppealIcon, color: "lightPurple" },
  Funded: { text: t("card_labels.you_funded_appeal"), icon: FundedIcon, color: "lightPurple" },
});

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

const CardLabel: React.FC<ICardLabels> = ({ disputeId, round, isList, isOverview = false }) => {
  const { t } = useTranslation();
  const { address } = useAccount();
  const { data: labelInfo, isLoading } = useLabelInfoQuery(address?.toLowerCase(), disputeId);
  const localRounds = getLocalRounds(labelInfo?.dispute?.disputeKitDispute);
  const rounds = labelInfo?.dispute?.rounds;
  const currentRound = rounds?.[round];

  const period = labelInfo?.dispute?.period;
  const hasVotedCurrentRound = !isUndefined(currentRound?.drawnJurors?.[0]?.vote?.choice);
  const isDrawnCurrentRound = currentRound?.drawnJurors.length !== 0;
  const hasVotedInDispute = rounds?.some((item) => !isUndefined(item.drawnJurors?.[0]?.vote?.choice));
  const isDrawnInDispute = rounds?.some((item) => item?.drawnJurors.length);
  const hasFundedCurrentRound = localRounds?.[round]?.contributions.length !== 0;
  const currentRoundFund = getFundingRewards(localRounds?.[round]?.contributions, period === "execution");
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
  const hasFundedDispute = contributions?.length !== 0; // if ever funded the dispute in any round

  const LabelArgs = getLabelArgs(t);

  const labelData = useMemo(() => {
    if (period === "evidence") return LabelArgs.EvidenceTime;
    if (!isDrawnCurrentRound && period === "appeal")
      return hasFundedCurrentRound ? LabelArgs.Funded : LabelArgs.CanFund;

    if (!isDrawnCurrentRound && period === "execution" && hasFundedDispute) return LabelArgs.Funded;
    if (period === "execution" && hasVotedInDispute) return LabelArgs.Voted;
    if (period === "execution" && isDrawnInDispute && !hasVotedInDispute) return LabelArgs.DidNotVote;
    if (!isDrawnCurrentRound) return LabelArgs.NotDrawn;

    if (["commit", "vote"].includes(period ?? "") && !hasVotedCurrentRound) return LabelArgs.CanVote;
    if (hasVotedCurrentRound) return LabelArgs.Voted; // plus rewards if execution
    return LabelArgs.DidNotVote; // plus rewards if execution
  }, [
    hasFundedCurrentRound,
    hasVotedCurrentRound,
    hasFundedDispute,
    hasVotedInDispute,
    isDrawnCurrentRound,
    isDrawnInDispute,
    period,
    LabelArgs,
  ]);

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
  }, [contributionRewards, shifts]);

  return (
    <Container {...{ isList, isOverview }}>
      {isLoading ? (
        <Skeleton width={130} height={14} />
      ) : (
        <>
          <Label {...labelData} />
          <RewardsContainer>
            {" "}
            {!isUndefined(rewardsData) && period === "execution" ? (
              <>
                <RewardsAndFundLabel value={rewardsData.ethShift.toString()} unit="ETH" />
                <RewardsAndFundLabel value={rewardsData.pnkShift.toString()} unit="PNK" />
              </>
            ) : null}
            {!isUndefined(currentRoundFund) && period === "appeal" ? (
              <RewardsAndFundLabel value={currentRoundFund.toString()} unit="ETH" isFund />
            ) : null}
          </RewardsContainer>
        </>
      )}
    </Container>
  );
};

export default CardLabel;

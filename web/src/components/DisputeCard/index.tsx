import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";
import Skeleton from "react-loading-skeleton";
import { Card } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { DisputeDetailsFragment } from "queries/useCasesQuery";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";
import { isUndefined } from "utils/index";

const StyledCard = styled(Card)`
  max-width: 380px;
  min-width: 312px;
  width: auto;
  height: 260px;
`;

const Container = styled.div`
  height: 215px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  h3 {
    margin: 0;
  }
`;

export const getPeriodEndTimestamp = (
  lastPeriodChange: string,
  currentPeriodIndex: number,
  timesPerPeriod: string[]
) => {
  const durationCurrentPeriod = parseInt(timesPerPeriod[currentPeriodIndex]);
  return parseInt(lastPeriodChange) + durationCurrentPeriod;
};

const DisputeCard: React.FC<DisputeDetailsFragment> = ({ id, arbitrated, period, lastPeriodChange, court }) => {
  const currentPeriodIndex = Periods[period];
  const rewards = `≥ ${formatEther(court.feeForJuror)} ETH`;
  const date =
    currentPeriodIndex === 4
      ? lastPeriodChange
      : getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, court.timesPerPeriod);
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrated.id as `0x${string}`);
  const title = isUndefined(disputeTemplate) ? (
    <Skeleton />
  ) : (
    disputeTemplate?.title ?? "The dispute's template is not correct please vote refuse to arbitrate"
  );
  const { data: courtPolicy } = useCourtPolicy(court.id);
  const courtName = courtPolicy?.name;
  const category = disputeTemplate ? disputeTemplate.category : undefined;
  const navigate = useNavigate();
  return (
    <StyledCard hover onClick={() => navigate(`/cases/${id.toString()}`)}>
      <PeriodBanner id={parseInt(id)} period={currentPeriodIndex} />
      <Container>
        <h3>{title}</h3>
        <DisputeInfo
          courtId={court?.id}
          court={courtName}
          period={currentPeriodIndex}
          {...{ category, rewards, date }}
        />
      </Container>
    </StyledCard>
  );
};

export default DisputeCard;

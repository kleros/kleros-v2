import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";
import { StyledSkeleton } from "components/StyledSkeleton";
import { Card } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useFiltersContext } from "context/FilterProvider";
import { CasesPageQuery } from "queries/useCasesQuery";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";
import { isUndefined } from "utils/index";

const StyledCard = styled(Card)`
  max-width: 380px;
  min-width: 312px;
  width: 380px;
  height: 260px;
`;
const StyledListItem = styled(Card)`
  display: flex;
  width: 100%;
  height: 64px;
`;

const CardContainer = styled.div`
  height: 215px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  h3 {
    margin: 0;
  }
`;
const ListContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  width: 100%;
  margin-right: 2%;
  h3 {
    margin: 0;
  }
`;

const ListTitle = styled.div`
  display: flex;
  height: 100%;
  justify-content: start;
  align-items: center;
  min-width: 40vw;
`;

export const getPeriodEndTimestamp = (
  lastPeriodChange: string,
  currentPeriodIndex: number,
  timesPerPeriod: string[]
) => {
  const durationCurrentPeriod = parseInt(timesPerPeriod[currentPeriodIndex]);
  return parseInt(lastPeriodChange) + durationCurrentPeriod;
};

const DisputeCard: React.FC<CasesPageQuery["disputes"][number]> = ({
  id,
  arbitrated,
  period,
  lastPeriodChange,
  court,
}) => {
  const { isList } = useFiltersContext();
  const currentPeriodIndex = Periods[period];
  const rewards = `≥ ${formatEther(court.feeForJuror)} ETH`;
  const date =
    currentPeriodIndex === 4
      ? lastPeriodChange
      : getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, court.timesPerPeriod);
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrated.id as `0x${string}`);
  const title = isUndefined(disputeTemplate) ? (
    <StyledSkeleton />
  ) : (
    disputeTemplate?.title ?? "The dispute's template is not correct please vote refuse to arbitrate"
  );
  const { data: courtPolicy } = useCourtPolicy(court.id);
  const courtName = courtPolicy?.name;
  const category = disputeTemplate ? disputeTemplate.category : undefined;
  const navigate = useNavigate();
  return (
    <>
      {!isList ? (
        <StyledCard hover onClick={() => navigate(`/cases/${id.toString()}`)}>
          <PeriodBanner id={parseInt(id)} period={currentPeriodIndex} />
          <CardContainer>
            <h3>{title}</h3>
            <DisputeInfo
              courtId={court?.id}
              court={courtName}
              period={currentPeriodIndex}
              {...{ category, rewards, date }}
            />
          </CardContainer>
        </StyledCard>
      ) : (
        <StyledListItem hover onClick={() => navigate(`/cases/${id.toString()}`)}>
          <PeriodBanner isCard={false} id={parseInt(id)} period={currentPeriodIndex} />
          <ListContainer>
            <ListTitle>
              <h3>{title}</h3>
            </ListTitle>
            <DisputeInfo
              courtId={court?.id}
              court={courtName}
              period={currentPeriodIndex}
              {...{ category, rewards, date }}
            />
          </ListContainer>
        </StyledListItem>
      )}
    </>
  );
};

export default DisputeCard;

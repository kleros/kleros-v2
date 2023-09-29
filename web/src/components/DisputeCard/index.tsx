import React from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";
import { StyledSkeleton } from "components/StyledSkeleton";
import { Card } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useFiltersContext } from "context/FilterProvider";
import { landscapeStyle } from "styles/landscapeStyle";
import { CasesPageQuery } from "queries/useCasesQuery";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";
import { isUndefined } from "utils/index";
import { useVotingHistory } from "hooks/queries/useVotingHistory";

const StyledCard = styled(Card)`
  width: 312px;
  height: 260px;
  ${landscapeStyle(
    () =>
      css`
        width: 380px;
      `
  )}
`;
const StyledListItem = styled(Card)`
  display: flex;
  flex-grow: 1;
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
  width: 100%;
  margin-right: 8px;

  h3 {
    margin: 0;
  }
`;

const ListTitle = styled.div`
  display: flex;
  height: 100%;
  justify-content: start;
  align-items: center;
  width: calc(30vw + (40 - 30) * ((100vw - 300px) / (1250 - 300)));
`;

export const getPeriodEndTimestamp = (
  lastPeriodChange: string,
  currentPeriodIndex: number,
  timesPerPeriod: string[]
) => {
  const durationCurrentPeriod = parseInt(timesPerPeriod[currentPeriodIndex]);
  return parseInt(lastPeriodChange) + durationCurrentPeriod;
};

const TruncatedTitle = ({ text, maxLength }) => {
  const truncatedText = text.length <= maxLength ? text : text.slice(0, maxLength) + "…";
  return <h3>{truncatedText}</h3>;
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
  const { data: votingHistory } = useVotingHistory(id);
  const localRounds = votingHistory?.dispute?.disputeKitDispute?.localRounds;
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
              round={localRounds?.length}
              {...{ category, rewards, date }}
            />
          </CardContainer>
        </StyledCard>
      ) : (
        <StyledListItem hover onClick={() => navigate(`/cases/${id.toString()}`)}>
          <PeriodBanner isCard={false} id={parseInt(id)} period={currentPeriodIndex} />
          <ListContainer>
            <ListTitle>
              <TruncatedTitle
                text={disputeTemplate?.title ?? "The dispute's template is not correct please vote refuse to arbitrate"}
                maxLength={50}
              />
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

import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";
import { StyledSkeleton } from "components/StyledSkeleton";
import { Card } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useIsList } from "context/IsListProvider";
import { DisputeDetailsFragment } from "queries/useCasesQuery";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";
import { isUndefined } from "utils/index";
import { responsiveSize } from "styles/responsiveSize";
import { INVALID_DISPUTE_DATA_ERROR, RPC_ERROR } from "consts/index";
import { useAccount } from "wagmi";

const StyledCard = styled(Card)`
  width: 100%;
  height: ${responsiveSize(280, 335)};
`;

const StyledListItem = styled(Card)`
  display: flex;
  flex-grow: 1;
  width: 100%;
  height: 82px;
`;

const CardContainer = styled.div`
  height: calc(100% - 45px);
  padding: ${responsiveSize(20, 24)};
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
  margin-right: 8px;
  flex-grow: 1;
  h3 {
    margin: 0;
  }
`;

const ListTitle = styled.div<{ isLabel?: boolean }>`
  display: flex;
  height: 100%;
  justify-content: start;
  align-items: center;
  width: ${({ isLabel }) => (isLabel ? responsiveSize(150, 340, 900) : "fit-content")};
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

interface IDisputeCard extends DisputeDetailsFragment {
  overrideIsList?: boolean;
}

const DisputeCard: React.FC<IDisputeCard> = ({
  id,
  currentRoundIndex,
  arbitrated,
  period,
  lastPeriodChange,
  court,
  overrideIsList,
}) => {
  const { isList } = useIsList();
  const { isDisconnected } = useAccount();
  const currentPeriodIndex = Periods[period];
  const rewards = `≥ ${formatEther(court.feeForJuror)} ETH`;
  const date =
    currentPeriodIndex === 4
      ? lastPeriodChange
      : getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, court.timesPerPeriod);
  const { data: disputeDetails, isError } = usePopulatedDisputeData(id, arbitrated.id as `0x${string}`);

  const { data: courtPolicy } = useCourtPolicy(court.id);
  const courtName = courtPolicy?.name;
  const category = disputeDetails?.category;
  const navigate = useNavigate();
  const errMsg = isError ? RPC_ERROR : INVALID_DISPUTE_DATA_ERROR;
  return (
    <>
      {!isList || overrideIsList ? (
        <StyledCard hover onClick={() => navigate(`/cases/${id.toString()}`)}>
          <PeriodBanner id={parseInt(id)} period={currentPeriodIndex} />
          <CardContainer>
            {isUndefined(disputeDetails) ? (
              <StyledSkeleton />
            ) : (
              <TruncatedTitle text={disputeDetails?.title ?? errMsg} maxLength={100} />
            )}
            <DisputeInfo
              disputeID={id}
              courtId={court?.id}
              court={courtName}
              period={currentPeriodIndex}
              round={parseInt(currentRoundIndex) + 1}
              showLabels
              {...{ category, rewards, date, overrideIsList }}
            />
          </CardContainer>
        </StyledCard>
      ) : (
        <StyledListItem hover onClick={() => navigate(`/cases/${id.toString()}`)}>
          <PeriodBanner isCard={false} id={parseInt(id)} period={currentPeriodIndex} />
          <ListContainer>
            <ListTitle isLabel={!isDisconnected}>
              <TruncatedTitle text={disputeDetails?.title ?? errMsg} maxLength={50} />
            </ListTitle>
            <DisputeInfo
              disputeID={id}
              courtId={court?.id}
              court={courtName}
              period={currentPeriodIndex}
              round={parseInt(currentRoundIndex) + 1}
              {...{ category, rewards, date }}
              showLabels
            />
          </ListContainer>
        </StyledListItem>
      )}
    </>
  );
};

export default DisputeCard;

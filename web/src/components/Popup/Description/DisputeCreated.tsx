import React, { useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import { isUndefined } from "utils/index";
import { formatDate, getCurrentTime } from "utils/date";
import { useCourtDetails } from "hooks/queries/useCourtDetails";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const StyledTitle = styled.div`
  margin-left: ${responsiveSize(8, 44, 300)};
  margin-right: ${responsiveSize(8, 44, 300)};
  color: ${({ theme }) => theme.secondaryText};
  text-align: center;
`;

const StyledDateContainer = styled.span`
  color: ${({ theme }) => theme.primaryText};
`;

const StyledSubtitle = styled(StyledTitle)`
  margin-top: 24px;
  color: ${({ theme }) => theme.primaryText};
`;
interface IDisputeCreated {
  courtId: string;
}

const DisputeCreated: React.FC<IDisputeCreated> = ({ courtId }) => {
  const { data: courtDetails } = useCourtDetails(courtId);

  const date = useMemo(
    () =>
      !isUndefined(courtDetails?.court?.timesPerPeriod)
        ? calculateMinResolveTime(courtDetails?.court.timesPerPeriod)
        : undefined,
    [courtDetails]
  );

  return (
    <Container>
      <StyledTitle>
        🎉 Your case was successfully submitted to Kleros. A pool of jurors will be drawn to evaluate the case and vote
        at most{" "}
        {isUndefined(date) ? (
          <Skeleton width={60} height={20} />
        ) : (
          <StyledDateContainer>{formatDate(date)}</StyledDateContainer>
        )}
        . 🎉
      </StyledTitle>
      <StyledSubtitle>Now, it’s time to submit evidence to support the case.</StyledSubtitle>
    </Container>
  );
};

const calculateMinResolveTime = (timesPerPeriod: string[]) =>
  timesPerPeriod.reduce((acc, val) => acc + parseInt(val), 0) + getCurrentTime();

export default DisputeCreated;

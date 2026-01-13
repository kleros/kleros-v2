import React, { useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { formatDate, getCurrentTime } from "utils/date";
import { isUndefined } from "utils/index";

import { responsiveSize } from "styles/responsiveSize";

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
  const { t, i18n } = useTranslation();
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
        {t("popups.dispute_created_full_message_part1")}{" "}
        {isUndefined(date) ? (
          <Skeleton width={60} height={20} />
        ) : (
          <StyledDateContainer>{formatDate(date, false, i18n.language)}</StyledDateContainer>
        )}
        .
      </StyledTitle>
      <StyledSubtitle>{t("popups.submit_evidence_now")}</StyledSubtitle>
    </Container>
  );
};

const calculateMinResolveTime = (timesPerPeriod: string[]) =>
  timesPerPeriod.reduce((acc, val) => acc + parseInt(val), 0) + getCurrentTime();

export default DisputeCreated;

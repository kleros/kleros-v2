import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { Periods } from "consts/periods";
import { useDisputeKitInfo } from "hooks/useDisputeKitInfo";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { isUndefined } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import InfoCard from "components/InfoCard";

import AppealHistory from "./AppealHistory";

const Container = styled.div`
  padding: 16px;

  ${landscapeStyle(
    () => css`
      padding: 32px;
    `
  )}
`;

export const AppealHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 12px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )}
`;

export const StyledTitle = styled.h1`
  margin: 0;
  font-size: ${responsiveSize(18, 24)};
`;

const Appeal: React.FC<{ currentPeriodIndex: number }> = ({ currentPeriodIndex }) => {
  const { t } = useTranslation();
  const [isAppealMiniGuideOpen, toggleAppealMiniGuide] = useToggle(false);
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const disputeKitAddress = disputeData?.dispute?.currentRound?.disputeKit?.address ?? undefined;
  const disputeKitInfo = useDisputeKitInfo({ disputeKitAddress });

  if (isUndefined(disputeKitInfo)) {
    return (
      <Container>
        {isUndefined(disputeKitAddress) ? (
          <Skeleton height={200} />
        ) : (
          <InfoCard msg={t("alerts.unsupported_dispute_kit")} />
        )}
      </Container>
    );
  }

  return (
    <Container>
      {Periods.appeal === currentPeriodIndex ? (
        <disputeKitInfo.AppealComponent
          isAppealMiniGuideOpen={isAppealMiniGuideOpen}
          toggleAppealMiniGuide={toggleAppealMiniGuide}
          disputeKitId={disputeKitInfo.id}
        />
      ) : (
        <AppealHistory isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
      )}
    </Container>
  );
};

export default Appeal;

import React from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { Periods } from "consts/periods";
import { useDisputeKitInfo } from "hooks/useDisputeKitInfo";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { isUndefined } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

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
  const [isAppealMiniGuideOpen, toggleAppealMiniGuide] = useToggle(false);
  const { id } = useParams();
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const disputeKitAddress = disputeData?.dispute?.currentRound?.disputeKit?.address ?? undefined;
  const disputeKitInfo = useDisputeKitInfo({ disputeKitAddress });
  // TODO: return a proper message
  if (isUndefined(disputeKitInfo)) return <>Unable to load dispute kit</>;

  const AppealComponent = disputeKitInfo.AppealComponent;
  return (
    <Container>
      {Periods.appeal === currentPeriodIndex ? (
        <>
          <AppealComponent
            isAppealMiniGuideOpen={isAppealMiniGuideOpen}
            toggleAppealMiniGuide={toggleAppealMiniGuide}
            disputeKitId={disputeKitInfo.id}
          />
        </>
      ) : (
        <AppealHistory isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
      )}
    </Container>
  );
};

export default Appeal;

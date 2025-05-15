import React from "react";
import styled, { css } from "styled-components";

import { useToggle } from "react-use";
import { useParams } from "react-router-dom";

import { Periods } from "consts/periods";
import { getDisputeKitName } from "consts/index";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import AppealHistory from "./AppealHistory";
import Classic from "./Classic";
import Shutter from "./Shutter";

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
  const disputeKitId = disputeData?.dispute?.currentRound?.disputeKit?.id;
  const disputeKitName = disputeKitId ? getDisputeKitName(Number(disputeKitId))?.toLowerCase() : "";
  const isClassicDisputeKit = disputeKitName?.includes("classic") ?? false;
  const isShutterDisputeKit = disputeKitName?.includes("shutter") ?? false;

  return (
    <Container>
      {Periods.appeal === currentPeriodIndex ? (
        <>
          {isClassicDisputeKit && (
            <Classic isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
          )}
          {isShutterDisputeKit && (
            <Shutter isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
          )}
        </>
      ) : (
        <AppealHistory isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
      )}
    </Container>
  );
};

export default Appeal;

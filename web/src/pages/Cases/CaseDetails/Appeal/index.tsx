import React from "react";
import styled from "styled-components";
import Classic from "./Classic";
import { Periods } from "consts/periods";
import AppealHistory from "./AppealHistory";
import { ClassicAppealProvider } from "hooks/useClassicAppealContext";

const Container = styled.div`
  padding: calc(16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Appeal: React.FC<{ currentPeriodIndex: number }> = ({ currentPeriodIndex }) => {
  return (
    <ClassicAppealProvider>
      <Container>{Periods.appeal === currentPeriodIndex ? <Classic /> : <AppealHistory />}</Container>
    </ClassicAppealProvider>
  );
};

export default Appeal;

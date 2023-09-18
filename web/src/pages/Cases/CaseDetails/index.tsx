import React from "react";
import styled from "styled-components";
import { Route, Routes, useParams, Navigate } from "react-router-dom";
import { Card } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import Appeal from "./Appeal";
import Evidence from "./Evidence";
import Overview from "./Overview";
import Tabs from "./Tabs";
import Timeline from "./Timeline";
import Voting from "./Voting";

const Container = styled.div``;

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
  min-height: 100px;
  padding: calc(16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Header = styled.h1`
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const CaseDetails: React.FC = () => {
  const { id } = useParams();
  const { data } = useDisputeDetailsQuery(id);
  const dispute = data?.dispute;
  const currentPeriodIndex = dispute ? Periods[dispute.period] : 0;
  const arbitrable = dispute?.arbitrated.id as `0x${string}`;

  return (
    <Container>
      <Header>Case #{id}</Header>
      <Tabs />
      <Timeline {...{ currentPeriodIndex, dispute }} />
      <StyledCard>
        <Routes>
          <Route
            path="overview"
            element={
              <Overview currentPeriodIndex={currentPeriodIndex} courtID={dispute?.court.id} {...{ arbitrable }} />
            }
          />
          <Route path="evidence" element={<Evidence {...{ arbitrable }} />} />
          <Route path="voting" element={<Voting {...{ arbitrable, currentPeriodIndex }} />} />
          <Route path="appeal" element={<Appeal {...{ currentPeriodIndex }} />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </StyledCard>
    </Container>
  );
};

export default CaseDetails;

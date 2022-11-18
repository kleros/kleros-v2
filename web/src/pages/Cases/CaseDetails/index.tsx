import React from "react";
import styled from "styled-components";
import { Routes, Route, useParams, Navigate } from "react-router-dom";
import { Card } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import Tabs from "./Tabs";
import Timeline from "./Timeline";
import Overview from "./Overview";
import Evidence from "./Evidence";
import Voting from "./Voting";

const CaseDetails: React.FC = () => {
  const { id } = useParams();
  const { data } = useDisputeDetailsQuery(id);
  const dispute = data?.dispute;
  const currentPeriodIndex = dispute ? Periods[dispute.period] : 0;
  return (
    <Container>
      <h1>Case #{id}</h1>
      <Tabs />
      <Timeline {...{ currentPeriodIndex, dispute }} />
      <StyledCard>
        <Routes>
          <Route
            path="overview"
            element={
              <Overview
                arbitrable={dispute?.arbitrated}
                courtID={dispute?.subcourtID.id}
              />
            }
          />
          <Route
            path="evidence"
            element={<Evidence arbitrable={dispute?.arbitrated} />}
          />
          <Route
            path="voting"
            element={<Voting arbitrable={dispute?.arbitrated} />}
          />
          <Route path="*" element={<Navigate to="overview" />} />
        </Routes>
      </StyledCard>
    </Container>
  );
};

const Container = styled.div``;

const StyledCard = styled(Card)`
  margin-top: 16px;
  width: 100%;
  height: auto;
  min-height: 100px;
`;

export default CaseDetails;

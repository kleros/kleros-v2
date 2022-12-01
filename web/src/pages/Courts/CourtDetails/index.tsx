import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { Card, Button } from "@kleros/ui-components-library";
import { useCourtPolicy } from "queries/useCourtPolicy";
import StakeModal from "./StakeModal";
import Stats from "./Stats";
import Description from "./Description";

const CourtDetails: React.FC = () => {
  const [stakeOpen, setStakeOpen] = useState(false);
  const { id } = useParams();
  const { data: policy } = useCourtPolicy(id);
  return (
    <Container>
      <StakeModal isOpen={stakeOpen} close={() => setStakeOpen(false)} />
      <h1>{policy ? policy.name : "Loading..."}</h1>
      <StyledCard>
        <Stats />
        <hr />
        <Button text="Stake" onClick={() => setStakeOpen(true)} />
      </StyledCard>
      <StyledCard>
        <Description />
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

export default CourtDetails;

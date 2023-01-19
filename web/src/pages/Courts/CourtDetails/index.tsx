import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { Card, Button } from "@kleros/ui-components-library";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useConnect } from "hooks/useConnect";
import { useWeb3 } from "hooks/useWeb3";
import StakeModal from "./StakeModal";
import Stats from "./Stats";
import Description from "./Description";

const CourtDetails: React.FC = () => {
  const [stakeOpen, setStakeOpen] = useState(false);
  const { id } = useParams();
  const { data: policy } = useCourtPolicy(id);
  const { account } = useWeb3();
  const { activate, connecting } = useConnect();
  return (
    <Container>
      <StakeModal isOpen={stakeOpen} close={() => setStakeOpen(false)} />
      <h1>{policy ? policy.name : "Loading..."}</h1>
      <StyledCard>
        <Stats />
        <hr />
        <Button
          text={account ? "Stake" : "Connect to Stake"}
          onClick={account ? () => setStakeOpen(true) : activate}
          disabled={connecting}
        />
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

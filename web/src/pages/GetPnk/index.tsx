import { Card } from "@kleros/ui-components-library";
import React, { useState } from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import HeroImage from "components/HeroImage";
import Header from "./Header";
import Swap from "./Swap";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 72)} ${responsiveSize(24, 132)} ${responsiveSize(76, 96)};
  max-width: 1780px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;
const StyledCard = styled(Card)`
  width: ${responsiveSize(300, 500)};
  height: fit-content;
  padding: 27px;
`;

const GetPnk: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <>
      <HeroImage />
      <Container>
        <StyledCard>
          <Header isSettings={settingsOpen} openSettings={setSettingsOpen} />
          {settingsOpen ? <></> : <Swap />}
        </StyledCard>
      </Container>
    </>
  );
};

export default GetPnk;

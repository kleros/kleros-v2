import { Card } from "@kleros/ui-components-library";
import React from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import HeroImage from "components/HeroImage";
import Header from "./Header";
import Swap from "./Swap";
import Settings from "./Settings";
import { useToggle } from "react-use";
import ClaimPnkButton from "components/ClaimPnkButton";
import { LifiProvider } from "context/LiFiProvider";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 72)} ${responsiveSize(12, 132)} ${responsiveSize(76, 96)};
  max-width: 1780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;
const StyledCard = styled(Card)`
  width: ${responsiveSize(360, 500)};
  height: fit-content;
  padding: 27px;
`;

const GetPnk: React.FC = () => {
  const [settingsOpen, toggleSettings] = useToggle(false);
  return (
    <LifiProvider>
      <HeroImage />
      <Container>
        <ClaimPnkButton />
        <StyledCard>
          <Header isSettings={settingsOpen} toggleSettings={toggleSettings} />
          {settingsOpen ? <Settings /> : <Swap />}
        </StyledCard>
      </Container>
    </LifiProvider>
  );
};

export default GetPnk;

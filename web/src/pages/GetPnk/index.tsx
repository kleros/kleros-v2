import React from "react";
import styled from "styled-components";

import { useToggle } from "react-use";

import { Card } from "@kleros/ui-components-library";

import { isProductionDeployment } from "consts/index";

import { responsiveSize } from "styles/responsiveSize";

import ClaimPnkButton from "components/ClaimPnkButton";
import HeroImage from "components/HeroImage";

import Header from "./Header";
import Settings from "./Settings";
import Swap from "./Swap";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 72)} ${responsiveSize(24, 132)} ${responsiveSize(76, 96)};
  max-width: 1780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;
const StyledCard = styled(Card)`
  width: ${responsiveSize(300, 500)};
  height: fit-content;
  padding: 27px;
`;

const GetPnk: React.FC = () => {
  const [settingsOpen, toggleSettings] = useToggle(false);
  return (
    <>
      <HeroImage />
      <Container>
        {!isProductionDeployment() && <ClaimPnkButton />}
        <StyledCard>
          <Header isSettings={settingsOpen} toggleSettings={toggleSettings} />
          {settingsOpen ? <Settings /> : <Swap />}
        </StyledCard>
      </Container>
    </>
  );
};

export default GetPnk;

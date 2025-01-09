import React from "react";
import styled, { useTheme } from "styled-components";

import { StatusBanner } from "subgraph-status";

import { getGraphqlUrl } from "utils/getGraphqlUrl";

import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: sticky;
  z-index: 10;
  top: 0;
  width: 100%;
  background-color: ${({ theme }) => (theme.name === "dark" ? `${theme.lightBlue}A6` : theme.primaryPurple)};
  backdrop-filter: ${({ theme }) => (theme.name === "dark" ? "blur(12px)" : "none")};
  -webkit-backdrop-filter: ${({ theme }) => (theme.name === "dark" ? "blur(12px)" : "none")}; // Safari support
`;

const HeaderContainer = styled.div`
  width: 100%;
  padding: 0px 24px;
`;

const StyledBanner = styled(StatusBanner)`
  position: sticky !important;
  .status-text {
    h2 {
      margin: 0;
      line-height: 24px;
    }
  }
`;

const Header: React.FC = () => {
  const theme = useTheme();

  return (
    <Container>
      <StyledBanner
        autoHide
        watcherOptions={{ threshold: 5000, interval: 60_000 }} // 5000 blocks threshold, 60 sec interval check
        theme={{
          colors: {
            main: theme.whiteBackground,
            primary: theme.primaryText,
            secondary: theme.secondaryText,
          },
        }}
        subgraphs={[
          { name: "Kleros Core", url: getGraphqlUrl(false) },
          { name: "Dispute Template Registry", url: getGraphqlUrl(true) },
        ]}
      />
      <HeaderContainer>
        <DesktopHeader />
        <MobileHeader />
      </HeaderContainer>
    </Container>
  );
};

export default Header;

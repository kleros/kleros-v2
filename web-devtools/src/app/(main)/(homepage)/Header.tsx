import React from "react";
import styled from "styled-components";

import Typewriter from "typewriter-effect";

import { responsiveSize } from "styles/responsiveSize";

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledH1 = styled.h1`
  display: flex;
  gap: 8px;
  font-size: ${responsiveSize(21, 24)};
  font-weight: 500;
  margin-bottom: 48px;
  letter-spacing: 1px;
`;

const TypewriterContainer = styled.div`
  .typewriter-text {
    color: ${({ theme }) => theme.klerosUIComponentsSecondaryPurple};
  }
`;

const Header: React.FC = () => {
  const Phrases = ["Manage Courts", "Get Insights", "Edit Dispute Templates", "Get PNK Faucets", "Boost productivity"];

  return (
    <StyledHeader>
      <StyledH1>
        Developer Toolkit:
        <TypewriterContainer>
          <Typewriter
            options={{
              strings: Phrases,
              autoStart: true,
              loop: true,
              wrapperClassName: "typewriter-text",
            }}
          />
        </TypewriterContainer>
      </StyledH1>
    </StyledHeader>
  );
};

export default Header;

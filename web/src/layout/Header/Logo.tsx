import React from "react";
import styled from "styled-components";

import { Link } from "react-router-dom";

import KlerosCourtLogo from "svgs/header/kleros-court.svg";

import { hoverShortTransitionTiming } from "styles/commonStyles";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const StyledKlerosCourtLogo = styled(KlerosCourtLogo)`
  ${hoverShortTransitionTiming}
  max-height: 40px;
  width: auto;

  &:hover {
    path {
      fill: ${({ theme }) => theme.white}BF;
    }
  }
`;

const Logo: React.FC = () => (
  <Container>
    <Link to={"/"}>
      <StyledKlerosCourtLogo />
    </Link>
  </Container>
);

export default Logo;

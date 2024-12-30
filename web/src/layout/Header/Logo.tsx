import React, { useMemo } from "react";
import styled, { Theme } from "styled-components";

import { hoverShortTransitionTiming } from "styles/commonStyles";

import { Link } from "react-router-dom";

import { ArbitratorTypes, getArbitratorType } from "consts/index";

import { isUndefined } from "utils/index";

import KlerosCourtLogo from "svgs/header/kleros-court.svg";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const BadgeContainer = styled.div<{ backgroundColor: keyof Theme }>`
  transform: skewX(-15deg);
  background-color: ${({ theme, backgroundColor }) => theme[backgroundColor]};
  border-radius: 3px;
  padding: 1px 8px;
  height: fit-content;
`;

const BadgeText = styled.label`
  color: ${({ theme }) => theme.darkPurple};
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

const CourtBadge: React.FC = () => {
  const { text, color } = useMemo<{ text?: string; color?: keyof Theme }>(() => {
    switch (getArbitratorType()) {
      case ArbitratorTypes.neo:
        return { text: "Beta", color: "paleCyan" };
      case ArbitratorTypes.university:
        return { text: "Uni", color: "limeGreen" };
    }
    return {};
  }, []);

  return !isUndefined(color) ? (
    <BadgeContainer {...{ backgroundColor: color }}>
      <BadgeText>{text}</BadgeText>
    </BadgeContainer>
  ) : null;
};

const Logo: React.FC = () => (
  <Container>
    {" "}
    <Link to={"/"}>
      <StyledKlerosCourtLogo />
    </Link>
    <CourtBadge />
  </Container>
);

export default Logo;

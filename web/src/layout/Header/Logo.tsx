import React, { useMemo } from "react";
import styled, { Theme } from "styled-components";

import { Link } from "react-router-dom";

import KlerosCourtLogo from "svgs/header/kleros-court.svg";

import { ArbitratorTypes, getArbitratorType } from "consts/index";
import { isUndefined } from "utils/index";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const StyledLink = styled(Link)`
  min-height: 48px;
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

const CourtBadge: React.FC = () => {
  const { text, color } = useMemo<{ text?: string; color?: keyof Theme }>(() => {
    switch (getArbitratorType()) {
      case ArbitratorTypes.neo:
        return { text: "Neo", color: "paleCyan" };
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
    <StyledLink to={"/"}>
      <KlerosCourtLogo />
    </StyledLink>
    <CourtBadge />
  </Container>
);

export default Logo;

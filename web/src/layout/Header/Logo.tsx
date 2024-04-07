import React from "react";
import { Link } from "react-router-dom";
import styled, { Theme, useTheme } from "styled-components";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";

const arbitratorType = process.env.REACT_APP_ARBITRATOR_TYPE;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const StyledLink = styled(Link)`
  min-height: 48px;
`;

const BadgeContainer = styled.div<{ backgroundColor: string }>`
  transform: skewX(-15deg);
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 3px;
  padding: 1px 8px;
  height: fit-content;
`;

const BadgeText = styled.label`
  color: #220050;
`;

const Badge: React.FC<{ text: string; color: keyof Theme }> = ({ text, color }) => {
  const theme = useTheme();
  return (
    <BadgeContainer {...{ backgroundColor: theme[color] }}>
      <BadgeText>{text}</BadgeText>
    </BadgeContainer>
  );
};

const Logo: React.FC = () => {
  let CourtBadge: JSX.Element | null = null;
  switch (arbitratorType) {
    case "neo":
      CourtBadge = <Badge text="Neo" color="paleCyan" />;
      break;
    case "university":
      CourtBadge = <Badge text="Uni" color="limeGreen" />;
      break;
    default:
      break;
  }

  return (
    <Container>
      {" "}
      <StyledLink to={"/"}>
        <KlerosCourtLogo />
      </StyledLink>
      {CourtBadge}
    </Container>
  );
};

export default Logo;

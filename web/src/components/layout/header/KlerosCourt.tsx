import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";

const StyledLink = styled(Link)`
  min-height: 48px;
`;

const KlerosCourt: React.FC = () => (
  <StyledLink to={"/"}>
    <KlerosCourtLogo />
  </StyledLink>
);

export default KlerosCourt;

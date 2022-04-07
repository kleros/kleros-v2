import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import SecuredByKlerosLogo from "svgs/footer/secured-by-kleros.svg";

const StyledLink = styled(Link)`
  min-height: 24px;
`;

const SecuredByKleros: React.FC = () => (
  <StyledLink to={"https://kleros.io"} target="_blank" rel="noopener">
    <SecuredByKlerosLogo />
  </StyledLink>
);

export default SecuredByKleros;

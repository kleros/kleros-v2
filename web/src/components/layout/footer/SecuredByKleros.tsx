import React from "react";
import styled from "styled-components";
import SecuredByKlerosLogo from "svgs/footer/secured-by-kleros.svg";

const StyledLink = styled.a`
  min-height: 24px;
`;

const SecuredByKleros: React.FC = () => (
  <StyledLink href={"https://kleros.io"} target="_blank" rel="noopener">
    <SecuredByKlerosLogo />
  </StyledLink>
);

export default SecuredByKleros;

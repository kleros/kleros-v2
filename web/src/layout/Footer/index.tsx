import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { hoverShortTransitionTiming } from "styles/commonStyles";

import SecuredByKlerosLogo from "svgs/footer/secured-by-kleros.svg";

import { socialmedia } from "consts/socialmedia";

import LightButton from "components/LightButton";
import { ExternalLink } from "components/ExternalLink";

const Container = styled.div`
  height: 114px;
  width: 100%;
  background-color: ${({ theme }) => (theme.name === "dark" ? theme.lightBlue : theme.primaryPurple)};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      height: 64px;
      flex-direction: row;
      justify-content: space-between;
      padding: 0 32px;
    `
  )}
`;

const StyledSecuredByKlerosLogo = styled(SecuredByKlerosLogo)`
  ${hoverShortTransitionTiming}
  min-height: 24px;

  path {
    fill: ${({ theme }) => theme.white}BF;
  }

  :hover path {
    fill: ${({ theme }) => theme.white};
  }
`;

const StyledSocialMedia = styled.div`
  display: flex;

  .button-svg {
    margin-right: 0;
  }
`;

const SecuredByKleros: React.FC = () => (
  <ExternalLink to="https://kleros.io" target="_blank" rel="noreferrer">
    <StyledSecuredByKlerosLogo />
  </ExternalLink>
);

const SocialMedia = () => (
  <StyledSocialMedia>
    {Object.values(socialmedia).map((site, i) => (
      <ExternalLink key={site.url} to={site.url} target="_blank" rel="noreferrer">
        <LightButton Icon={site.icon} text="" />
      </ExternalLink>
    ))}
  </StyledSocialMedia>
);

const Footer: React.FC = () => (
  <Container>
    <SecuredByKleros />
    <SocialMedia />
  </Container>
);

export default Footer;

import React from "react";
import styled, { css } from "styled-components";

import SecuredByKlerosLogo from "svgs/footer/secured-by-kleros.svg";

import { socialmedia } from "consts/socialmedia";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { ExternalLink } from "components/ExternalLink";
import LightButton from "components/LightButton";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => (theme.name === "dark" ? theme.lightBlue : theme.primaryPurple)};
  display: flex;
  justify-content: center;
`;

const Inner = styled.div`
  width: 100%;
  max-width: ${MAX_WIDTH_LANDSCAPE};
  min-height: 114px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      min-height: 64px;
      flex-direction: row;
      justify-content: space-between;
      padding: 0 ${responsiveSize(0, 132)};
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

  ${landscapeStyle(
    () => css`
      margin-right: -8px;
    `
  )}
`;

const SecuredByKleros: React.FC = () => (
  <ExternalLink to="https://kleros.io" target="_blank" rel="noreferrer">
    <StyledSecuredByKlerosLogo />
  </ExternalLink>
);

const SocialMedia = () => (
  <StyledSocialMedia>
    {Object.values(socialmedia).map((site) => (
      <ExternalLink key={site.url} to={site.url} target="_blank" rel="noreferrer">
        <LightButton Icon={site.icon} text="" />
      </ExternalLink>
    ))}
  </StyledSocialMedia>
);

const Footer: React.FC = () => (
  <Container>
    <Inner>
      <SecuredByKleros />
      <SocialMedia />
    </Inner>
  </Container>
);

export default Footer;

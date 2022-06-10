import React from "react";
import styled from "styled-components";
import SecuredByKlerosLogo from "svgs/footer/secured-by-kleros.svg";
import { socialmedia } from "consts/socialmedia";

const Container = styled.div`
  height: 80px;
  width: 100%;
  background-color: ${({ theme }) => theme.primaryPurple};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  .secured-by-kleros {
    min-height: 24px;
  }

  .socialmedia {
    display: flex;
    gap: 16px;
    justify-content: center;

    a {
      display: inline-block;
      svg {
        height: 16px;
        width: 16px;
        max-heigth: 16px;
        max-width: 16px;
        fill: white;
      }
    }
  }
`;

const SecuredByKleros: React.FC = () => (
  <a
    className="secured-by-kleros"
    href="https://kleros.io"
    target="_blank"
    rel="noreferrer"
  >
    <SecuredByKlerosLogo />
  </a>
);

const SocialMedia = () => (
  <div className="socialmedia">
    {Object.values(socialmedia).map((site, i) => (
      <a key={i} href={site.url} target="_blank" rel="noreferrer">
        {site.icon}
      </a>
    ))}
  </div>
);

const Footer: React.FC = () => (
  <Container>
    <SecuredByKleros />
    <SocialMedia />
  </Container>
);

export default Footer;

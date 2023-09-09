import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { useLockBodyScroll } from "react-use";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { useFocusOutside } from "hooks/useFocusOutside";
import Curate from "svgs/icons/curate-image.png";
import Resolver from "svgs/icons/dispute-resolver.svg";
import Escrow from "svgs/icons/escrow.svg";
import Governor from "svgs/icons/governor.svg";
import Court from "svgs/icons/kleros.svg";
import Linguo from "svgs/icons/linguo.svg";
import POH from "svgs/icons/poh-image.png";
import Vea from "svgs/icons/vea.svg";
import Tokens from "svgs/icons/tokens.svg";
import Product from "./Product";
import { Overlay } from "components/Overlay";

const Header = styled.h1`
  display: flex;
  padding-top: 32px;
  padding-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  line-height: 32.68px;
`;

const Container = styled.div`
  display: flex;
  position: absolute;
  max-height: 60vh;
  top: 100%;
  z-index: 10;
  flex-direction: column;
  align-items: center;

  width: calc(300px + (480 - 300) * (100vw - 375px) / (1250 - 375));
  max-width: 480px;
  min-width: 300px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  svg {
    visibility: visible;
  }

  ${smallScreenStyle(
    () => css`
      top: 5%;
      left: 50%;
      transform: translateX(-50%);
    `
  )}
`;

const ItemsDiv = styled.div`
  display: grid;
  overflow-y: auto;
  padding: 16px calc(8px + (24 - 8) * ((100vw - 480px) / (1250 - 480)));
  row-gap: 8px;
  column-gap: 2px;
  justify-items: center;
  max-width: 480px;
  min-width: 300px;
  width: calc(300px + (480 - 300) * (100vw - 375px) / (1250 - 375));
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
`;

interface IDappList {
  toggleSolution: () => void;
}

const ITEMS = [
  {
    text: "Court v1",
    Icon: Court,
    url: "https://court.kleros.io/",
  },
  {
    text: "Vea",
    Icon: Vea,
    url: "https://veascan.io",
  },
  {
    text: "Escrow",
    Icon: Escrow,
    url: "https://escrow.kleros.io",
  },
  {
    text: "POH",
    Icon: POH,
    url: "https://app.proofofhumanity.id",
  },
  {
    text: "Curate",
    Icon: Curate,
    url: "https://curate.kleros.io",
  },
  {
    text: "Tokens",
    Icon: Tokens,
    url: "https://tokens.kleros.io",
  },
  {
    text: "Resolver",
    Icon: Resolver,
    url: "https://resolve.kleros.io",
  },
  {
    text: "Linguo",
    Icon: Linguo,
    url: "https://linguo.kleros.io",
  },
  {
    text: "Governor",
    Icon: Governor,
    url: "https://governor.kleros.io",
  },
];

const DappList: React.FC<IDappList> = ({ toggleSolution }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => {
    toggleSolution();
  });
  useLockBodyScroll(true);

  return (
    <>
      <Overlay />
      <Container ref={containerRef}>
        <Header>Kleros Solutions</Header>
        <ItemsDiv>
          {ITEMS.map((item) => {
            return <Product {...item} key={item.text} />;
          })}
        </ItemsDiv>
      </Container>
    </>
  );
};
export default DappList;

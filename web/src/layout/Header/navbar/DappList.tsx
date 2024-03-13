import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";
import { useClickAway } from "react-use";
import Curate from "svgs/icons/curate-image.png";
import Resolver from "svgs/icons/dispute-resolver.svg";
import Escrow from "svgs/icons/escrow.svg";
import Governor from "svgs/icons/governor.svg";
import Court from "svgs/icons/kleros.svg";
import POH from "svgs/icons/poh-image.png";
import Vea from "svgs/icons/vea.svg";
import Product from "./Product";

const Header = styled.h1`
  padding-top: 32px;
  padding-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  line-height: 32.68px;
`;

const Container = styled.div`
  display: flex;
  position: absolute;
  max-height: 340px;
  top: 5%;
  left: 50%;
  transform: translate(-50%);
  z-index: 1;
  flex-direction: column;
  align-items: center;

  width: 86vw;
  max-width: 480px;
  min-width: 300px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  svg {
    visibility: visible;
  }

  ${landscapeStyle(
    () => css`
      margin-top: 64px;
      top: 0;
      left: 0;
      right: auto;
      transform: none;
      width: ${responsiveSize(300, 480)};
      max-height: 80vh;
    `
  )}
`;

const ItemsDiv = styled.div`
  display: grid;
  overflow-y: auto;
  padding: 16px ${responsiveSize(8, 24, 480)};
  row-gap: 8px;
  column-gap: 2px;
  justify-items: center;
  max-width: 480px;
  min-width: 300px;
  width: ${responsiveSize(300, 480)};
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
`;

const ITEMS = [
  {
    text: "Court V2",
    Icon: Court,
    url: "https://v2.kleros.builders/",
  },
  {
    text: "Curate V2",
    Icon: Curate,
    url: "https://curate-v2.netlify.app/",
  },
  {
    text: "Resolver V2",
    Icon: Resolver,
    url: "https://v2.kleros.builders/#/resolver",
  },
  {
    text: "Escrow V2",
    Icon: Escrow,
    url: "https://escrow-v2.kleros.builders/",
  },
  {
    text: "Court V1",
    Icon: Court,
    url: "https://court.kleros.io/",
  },
  {
    text: "Curate V1",
    Icon: Curate,
    url: "https://curate.kleros.io",
  },
  {
    text: "Resolver V1",
    Icon: Resolver,
    url: "https://resolve.kleros.io",
  },
  {
    text: "Escrow V1",
    Icon: Escrow,
    url: "https://escrow.kleros.io",
  },
  {
    text: "Vea",
    Icon: Vea,
    url: "https://veascan.io",
  },
  {
    text: "Perma Curate",
    Icon: Curate,
    url: "https://perma-curate.eth.limo/",
  },
  {
    text: "POH V1",
    Icon: POH,
    url: "https://app.proofofhumanity.id",
  },
  {
    text: "Governor",
    Icon: Governor,
    url: "https://governor.kleros.io",
  },
];

interface IDappList {
  toggleIsDappListOpen: () => void;
}

const DappList: React.FC<IDappList> = ({ toggleIsDappListOpen }) => {
  const containerRef = useRef(null);
  useClickAway(containerRef, () => toggleIsDappListOpen());

  return (
    <Container ref={containerRef}>
      <Header>Kleros Solutions</Header>
      <ItemsDiv>
        {ITEMS.map((item) => {
          return <Product {...item} key={item.text} />;
        })}
      </ItemsDiv>
    </Container>
  );
};
export default DappList;

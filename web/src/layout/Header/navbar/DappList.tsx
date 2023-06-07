import React, { useRef } from "react";
import styled from "styled-components";
import { useFocusOutside } from "~src/hooks/useFocusOutside";
import Curate from "svgs/icons/curate-image.png";
import Resolver from "svgs/icons/dispute-resolver.svg";
import Escrow from "svgs/icons/escrow.svg";
import Governor from "svgs/icons/governor.svg";
import Court from "svgs/icons/kleros.svg";
import Linguo from "svgs/icons/linguo.svg";
import POH from "svgs/icons/poh-image.png";
import Tokens from "svgs/icons/tokens.svg";
import Product from "./Product";

interface IDappList {
  toggleSolution: () => void;
  toggleLocked: (val: boolean) => void;
}

const ITEMS = [
  {
    text: "Court",
    Icon: Court,
    url: "",
  },
  {
    text: "Escrow",
    Icon: Escrow,
    url: "",
  },
  {
    text: "Tokens",
    Icon: Tokens,
    url: "",
  },
  {
    text: "POH",
    Icon: POH,
    url: "",
  },
  {
    text: "Curate",
    Icon: Curate,
    url: "",
  },
  {
    text: "Resolver",
    Icon: Resolver,
    url: "",
  },
  {
    text: "Linguo",
    Icon: Linguo,
    url: "",
  },
  {
    text: "Governor",
    Icon: Governor,
    url: "",
  },
];

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
  top: 5%;
  left: 50%;
  transform: translate(-50%, -5%);
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
`;

const ItemsDiv = styled.div`
  display: grid;
  padding: 10px 10px 32px 10px;
  row-gap: 8px;
  justify-items: center;
  max-width: 480px;
  min-width: 300px;
  width: calc(200px + (480 - 200) * (100vw - 375px) / (1250 - 375));
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
`;

const DappList: React.FC<IDappList> = ({ toggleSolution, toggleLocked }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => {
    toggleSolution();
    toggleLocked(false);
  });

  return (
    <Container ref={containerRef}>
      <Header>Kleros Solutions</Header>
      <ItemsDiv>
        {ITEMS.map((item, index) => {
          return <Product {...item} key={index} />;
        })}
      </ItemsDiv>
    </Container>
  );
};
export default DappList;

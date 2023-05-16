import React, { Dispatch, SetStateAction, useRef } from "react";
import styled from "styled-components";
import Curate from "svgs/icons/curate.svg";
import Resolver from "svgs/icons/dispute-resolver.svg";
import Escrow from "svgs/icons/escrow.svg";
import Governor from "svgs/icons/governor.svg";
import Court from "svgs/icons/kleros.svg";
import Linguo from "svgs/icons/linguo.svg";
import POH from "svgs/icons/poh.svg";
import Tokens from "svgs/icons/tokens.svg";
import { useFocusOutside } from "~src/hooks/useFocusOutside";
import Product from "./Product";

interface IDappList {
  setIsSolutionOpen: Dispatch<SetStateAction<boolean>>;
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
  z-index: 10;
  flex-direction: column;
  align-items: center;
  width: 480px;
  height: 400px;
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
  padding: 5px 10px;
  row-gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
`;

const DappList: React.FC<IDappList> = ({ setIsSolutionOpen }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsSolutionOpen(false));

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

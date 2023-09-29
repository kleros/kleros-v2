import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useFocusOutside } from "hooks/useFocusOutside";
import Book from "svgs/icons/book-open.svg";
import Guide from "svgs/icons/book.svg";
import Bug from "svgs/icons/bug.svg";
import ETH from "svgs/icons/eth.svg";
import Faq from "svgs/menu-icons/help.svg";
import Telegram from "svgs/socialmedia/telegram.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  max-height: 80vh;
  overflow-y: auto;
  width: auto;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  padding: 27px 10px;
  gap: 23px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  ${landscapeStyle(
    () => css`
      margin-top: 64px;
      width: 240px;
      top: 0;
      right: 0;
      left: auto;
      transform: none;
    `
  )}
`;

const ListItem = styled.a`
  display: flex;
  gap: 8px;
  padding: 0px 8px;
  cursor: pointer;
  :hover {
    transform: scale(1.02) translateZ(0);
    transition: 200ms;
    transition-timing-function: cubic-bezier(0.3, 0, 0.2, 1);
    backface-visibility: hidden;
  }

  small {
    font-size: 16px;
    font-weight: 400;
  }
`;
const Icon = styled.svg`
  display: inline-block;
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.secondaryPurple};
`;

const ITEMS = [
  {
    text: "Onboarding",
    Icon: Book,
    url: "",
  },
  {
    text: "Get Help",
    Icon: Telegram,
    url: "https://t.me/kleros",
  },
  {
    text: "Report a Bug",
    Icon: Bug,
    url: "https://github.com/kleros/kleros-v2/issues",
  },
  {
    text: "DApp Guide",
    Icon: Guide,
    url: "https://docs.kleros.io/products/court-v2",
  },
  {
    text: "Crypto Beginner's Guide",
    Icon: ETH,
    url: "https://ethereum.org/en/wallets/",
  },
  {
    text: "FAQ",
    Icon: Faq,
    url: "https://docs.kleros.io/kleros-faq",
  },
];

interface IHelp {
  toggleIsHelpOpen: () => void;
}

const Help: React.FC<IHelp> = ({ toggleIsHelpOpen }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => {
    toggleIsHelpOpen();
  });

  return (
    <Container ref={containerRef}>
      {ITEMS.map((item) => (
        <ListItem href={item.url} key={item.text} target="_blank">
          <Icon as={item.Icon} />
          <small>{item.text}</small>
        </ListItem>
      ))}
    </Container>
  );
};
export default Help;

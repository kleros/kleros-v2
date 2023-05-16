import React, { Dispatch, SetStateAction, useRef } from "react";
import styled from "styled-components";
import Book from "svgs/icons/book-open.svg";
import Guide from "svgs/icons/book.svg";
import Bug from "svgs/icons/bug.svg";
import ETH from "svgs/icons/eth.svg";
import Faq from "svgs/menu-icons/help.svg";
import Telegram from "svgs/socialmedia/telegram.svg";
import { useFocusOutside } from "~src/hooks/useFocusOutside";

const ITEMS = [
  {
    text: "Onboarding",
    Icon: Book,
    url: "",
  },
  {
    text: "Get Help",
    Icon: Telegram,
    url: "",
  },
  {
    text: "Report a Bug",
    Icon: Bug,
    url: "",
  },
  {
    text: "DApp Guide",
    Icon: Guide,
    url: "",
  },
  {
    text: "Crypto Beginner's Guide",
    Icon: ETH,
    url: "",
  },
  {
    text: "FAQ",
    Icon: Faq,
    url: "",
  },
];

interface IHelp {
  setIsHelpOpen: Dispatch<SetStateAction<boolean>>;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: calc(32%);
  z-index: 10;
  padding: 27px 10px;
  gap: 23px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);
`;

const ListItem = styled.div`
  display: flex;
  gap: 8px;
  padding: 0px 8px;
  cursor: pointer;
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

const Help: React.FC<IHelp> = ({ setIsHelpOpen }) => {
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsHelpOpen(false));

  return (
    <Container ref={containerRef}>
      {ITEMS.map((item, index) => (
        <ListItem key={index}>
          <Icon as={item.Icon} />
          <small>{item.text}</small>
        </ListItem>
      ))}
    </Container>
  );
};
export default Help;

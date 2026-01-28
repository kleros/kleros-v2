import React, { useRef } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useClickAway, useToggle } from "react-use";

import Book from "svgs/icons/book-open.svg";
import Guide from "svgs/icons/book.svg";
import Bug from "svgs/icons/bug.svg";
import Code from "svgs/icons/code.svg";
import ETH from "svgs/icons/eth.svg";
import Faq from "svgs/menu-icons/help.svg";
import Telegram from "svgs/socialmedia/telegram.svg";

import { getDevToolsUrl } from "consts/index";

import { landscapeStyle } from "styles/landscapeStyle";

import Onboarding from "components/Popup/MiniGuides/Onboarding";

import Debug from "../Debug";
import { IHelp } from "../index";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  max-height: 80vh;
  overflow-y: auto;
  width: 86vw;
  max-width: 444px;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  padding: 12px 12px 24px 12px;
  border: 1px solid ${({ theme }) => theme.stroke};
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);

  ${landscapeStyle(
    () => css`
      margin-top: 64px;
      width: 260px;
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
  padding: 12px 8px;
  cursor: pointer;
  transition: transform 0.2s;

  small {
    font-size: 16px;
    font-weight: 400;
  }

  :hover {
    transform: scale(1.02);
  }

  :hover small {
    transition: color 0.1s;
    color: ${({ theme }) => theme.secondaryPurple};
  }
`;

const Icon = styled.svg`
  display: inline-block;
  width: 16px;
  height: 16px;
  fill: ${({ theme }) => theme.secondaryPurple};
`;

const Help: React.FC<IHelp> = ({ toggleIsHelpOpen }) => {
  const { t } = useTranslation();
  const [isOnboardingMiniGuidesOpen, toggleIsOnboardingMiniGuidesOpen] = useToggle(false);

  const ITEMS = [
    {
      text: t("menu.onboarding"),
      Icon: Book,
    },
    {
      text: t("menu.get_help"),
      Icon: Telegram,
      url: "https://t.me/kleros",
    },
    {
      text: t("menu.report_a_bug"),
      Icon: Bug,
      url: "https://github.com/kleros/kleros-v2/issues",
    },
    {
      text: t("menu.dapp_guide"),
      Icon: Guide,
      url: "https://docs.kleros.io/products/court-v2",
    },
    {
      text: t("menu.crypto_beginners_guide"),
      Icon: ETH,
      url: "https://ethereum.org/en/wallets/",
    },
    {
      text: t("menu.faq"),
      Icon: Faq,
      url: "https://docs.kleros.io/kleros-faq",
    },
    {
      text: t("menu.developer_tools"),
      Icon: Code,
      url: getDevToolsUrl(),
    },
  ];

  const containerRef = useRef(null);
  useClickAway(containerRef, () => {
    if (!isOnboardingMiniGuidesOpen) toggleIsHelpOpen();
  });

  return (
    <>
      <Container ref={containerRef}>
        {ITEMS.map((item, index) => (
          <ListItem
            href={item.url}
            key={item.text}
            target="_blank"
            onClick={index === 0 ? () => toggleIsOnboardingMiniGuidesOpen() : undefined}
          >
            <Icon as={item.Icon} />
            <small>{item.text}</small>
          </ListItem>
        ))}
        <Debug />
      </Container>
      {isOnboardingMiniGuidesOpen && <Onboarding toggleMiniGuide={toggleIsOnboardingMiniGuidesOpen} />}
    </>
  );
};
export default Help;

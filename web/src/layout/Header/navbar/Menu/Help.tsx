import React, { useRef } from "react";

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
import { cn } from "utils/cn";

import Onboarding from "components/Popup/MiniGuides/Onboarding";

import Debug from "../Debug";
import { IHelp } from "../index";

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
      url: "https://docs.kleros.io/developers/products/court/overview#v2-arbitrum",
    },
    {
      text: t("menu.crypto_beginners_guide"),
      Icon: ETH,
      url: "https://ethereum.org/en/wallets/",
    },
    {
      text: t("menu.faq"),
      Icon: Faq,
      url: "https://docs.kleros.io/welcome/faq",
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
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col absolute max-h-[80vh] overflow-y-auto w-[86vw] max-w-[444px] top-[5%] left-[50%]",
          "[transform:translateX(-50%)] z-1 p-[12px_12px_24px_12px]",
          "border border-solid border-klerosUIComponentsStroke bg-klerosUIComponentsWhiteBackground rounded-[3px]",
          "[box-shadow:0px_2px_3px_rgba(0,_0,_0,_0.06)] lg:mt-16 lg:w-[260px] lg:top-0 lg:right-0 lg:left-auto",
          "lg:[transform:none]"
        )}
      >
        {ITEMS.map((item, index) => (
          <a
            href={item.url}
            key={item.text}
            target="_blank"
            onClick={index === 0 ? () => toggleIsOnboardingMiniGuidesOpen() : undefined}
            className={cn(
              "flex gap-2 p-[12px_8px] cursor-pointer [transition:transform_0.2s] [&_small]:text-[16px]",
              "[&_small]:font-normal [&:hover]:[transform:scale(1.02)] [&:hover_small]:[transition:color_0.1s]",
              "[&:hover_small]:text-klerosUIComponentsSecondaryPurple"
            )}
            rel="noreferrer"
          >
            <item.Icon className="inline-block size-4 fill-klerosUIComponentsSecondaryPurple" />
            <small>{item.text}</small>
          </a>
        ))}
        <Debug />
      </div>
      {isOnboardingMiniGuidesOpen && <Onboarding toggleMiniGuide={toggleIsOnboardingMiniGuidesOpen} />}
    </>
  );
};
export default Help;

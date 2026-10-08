import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToggle } from "react-use";
import { useAccount } from "wagmi";

import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { cn } from "utils/cn";

import ConnectWallet from "components/ConnectWallet";
import LightButton from "components/LightButton";
import { Overlay } from "components/Overlay";
import OverlayPortal from "components/OverlayPortal";

import { useOpenContext } from "../MobileHeader";

import DappList from "./DappList";
import Explore from "./Explore";
import Menu from "./Menu";
import Help from "./Menu/Help";
import Settings from "./Menu/Settings";
import { DisconnectWalletButton } from "./Menu/Settings/General";

export interface ISettings {
  toggleIsSettingsOpen: () => void;
  initialTab?: number;
}

export interface IHelp {
  toggleIsHelpOpen: () => void;
}

export interface IDappList {
  toggleIsDappListOpen: () => void;
}

const NavBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isConnected, chainId } = useAccount();
  const isDefaultChain = chainId === DEFAULT_CHAIN.id;
  const [isDappListOpen, toggleIsDappListOpen] = useToggle(false);
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(false);
  const [isSettingsOpen, toggleIsSettingsOpen] = useToggle(false);
  const { isOpen, toggleIsOpen } = useOpenContext();
  useLockOverlayScroll(isOpen);

  return (
    <>
      <div className={cn("absolute top-full left-0 z-[1] h-screen w-screen", isOpen ? "visible" : "invisible")}>
        <Overlay className="top-auto">
          <div
            className={cn(
              "absolute inset-x-0 top-0 z-[1] max-h-[calc(100vh-160px)] origin-top overflow-y-auto",
              "bg-klerosUIComponentsWhiteBackground p-6 shadow-[0px_2px_3px_var(--klerosUIComponentsDefaultShadow)]",
              "transition-[transform,visibility] duration-[var(--klerosUIComponentsTransitionSpeed)] ease-[ease]",
              "[&_hr]:my-6 [&_hr]:mx-0",
              isOpen ? "visible scale-y-100" : "invisible scale-y-0"
            )}
          >
            <LightButton
              isMobileNavbar={true}
              text={t("navigation.kleros_solutions")}
              onPress={() => {
                toggleIsDappListOpen();
              }}
              Icon={KlerosSolutionsIcon}
            />
            <hr />
            <Explore isMobileNavbar={true} />
            <hr />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div
                className="[&_label]:cursor-pointer"
                onClick={
                  isConnected && isDefaultChain
                    ? () => {
                        toggleIsOpen();
                        navigate("/profile/stakes/1");
                      }
                    : undefined
                }
              >
                <ConnectWallet />
              </div>
              {isConnected && (
                <div className="flex items-center">
                  <DisconnectWalletButton />
                </div>
              )}
            </div>
            <hr />
            <Menu {...{ toggleIsHelpOpen, toggleIsSettingsOpen }} isMobileNavbar={true} />
            <br />
          </div>
        </Overlay>
      </div>
      {(isDappListOpen || isHelpOpen || isSettingsOpen) && (
        <OverlayPortal>
          <Overlay>
            {isDappListOpen && <DappList {...{ toggleIsDappListOpen }} />}
            {isHelpOpen && <Help {...{ toggleIsHelpOpen }} />}
            {isSettingsOpen && <Settings {...{ toggleIsSettingsOpen }} />}
          </Overlay>
        </OverlayPortal>
      )}
    </>
  );
};

export default NavBar;

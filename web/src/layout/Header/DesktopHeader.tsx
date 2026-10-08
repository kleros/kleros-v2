import React, { useCallback, useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { useToggle } from "react-use";
import { useAccount } from "wagmi";

import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { cn } from "utils/cn";

import { responsiveSize } from "styles/responsiveSize";

import ConnectWallet from "components/ConnectWallet";
import LightButton from "components/LightButton";
import { Overlay } from "components/Overlay";
import OverlayPortal from "components/OverlayPortal";
import Appeal from "components/Popup/MiniGuides/Appeal";
import BinaryVoting from "components/Popup/MiniGuides/BinaryVoting";
import DisputeResolver from "components/Popup/MiniGuides/DisputeResolver";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";
import { MiniguideHashesType } from "components/Popup/MiniGuides/MainStructureTemplate";
import Onboarding from "components/Popup/MiniGuides/Onboarding";
import RankedVoting from "components/Popup/MiniGuides/RankedVoting";
import Staking from "components/Popup/MiniGuides/Staking";

import Logo from "./Logo";
import DappList from "./navbar/DappList";
import Explore from "./navbar/Explore";
import Menu from "./navbar/Menu";
import Help from "./navbar/Menu/Help";
import Settings from "./navbar/Menu/Settings";

const WhiteKlerosSolutionsIcon: React.FC<React.SVGAttributes<SVGElement>> = ({ className, ...props }) => (
  <KlerosSolutionsIcon {...props} className={cn("fill-white!", className)} />
);

const DesktopHeader: React.FC = () => {
  const [isDappListOpen, toggleIsDappListOpen] = useToggle(false);
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(false);
  const [isSettingsOpen, toggleIsSettingsOpen] = useToggle(false);
  const [isJurorLevelsMiniGuideOpen, toggleIsJurorLevelsMiniGuideOpen] = useToggle(false);
  const [isAppealMiniGuideOpen, toggleIsAppealMiniGuideOpen] = useToggle(false);
  const [isBinaryVotingMiniGuideOpen, toggleIsBinaryVotingMiniGuideOpen] = useToggle(false);
  const [isDisputeResolverMiniGuideOpen, toggleIsDisputeResolverMiniGuideOpen] = useToggle(false);
  const [isRankedVotingMiniGuideOpen, toggleIsRankedVotingMiniGuideOpen] = useToggle(false);
  const [isStakingMiniGuideOpen, toggleIsStakingMiniGuideOpen] = useToggle(false);
  const [isOnboardingMiniGuidesOpen, toggleIsOnboardingMiniGuidesOpen] = useToggle(false);
  const [initialTab, setInitialTab] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, chainId } = useAccount();
  const isDefaultChain = chainId === DEFAULT_CHAIN.id;
  // Under HashRouter the app URL is `/#/<path>#notifications`; Atlas emails link to `/#/#notifications`.
  const hasNotificationsPath = location.hash.includes("#notifications");
  // Closing Settings from the popup goes through here so the hash never outlives it
  // (it would reopen the popup on the next hash change). The gear button only toggles
  // after click-away has already run this.
  const closeSettings = useCallback(() => {
    toggleIsSettingsOpen(false);
    // `search` is passed explicitly: a partial `To` resolves it to "" otherwise.
    if (hasNotificationsPath) navigate({ search: location.search, hash: "" }, { replace: true });
  }, [toggleIsSettingsOpen, hasNotificationsPath, navigate, location.search]);
  const initializeFragmentURL = useCallback(() => {
    const hashIncludes = (hash: MiniguideHashesType) => location.hash.includes(hash);
    const hasJurorLevelsMiniGuidePath = hashIncludes("#jurorlevels-miniguide");
    const hasAppealMiniGuidePath = hashIncludes("#appeal-miniguide");
    const hasBinaryVotingMiniGuidePath = hashIncludes("#binaryvoting-miniguide");
    const hasDisputeResolverMiniGuidePath = hashIncludes("#disputeresolver-miniguide");
    const hasRankedVotingMiniGuidePath = hashIncludes("#rankedvoting-miniguide");
    const hasStakingMiniGuidePath = hashIncludes("#staking-miniguide");
    const hasOnboardingMiniGuidePath = hashIncludes("#onboarding-miniguide");
    toggleIsJurorLevelsMiniGuideOpen(hasJurorLevelsMiniGuidePath);
    toggleIsAppealMiniGuideOpen(hasAppealMiniGuidePath);
    toggleIsBinaryVotingMiniGuideOpen(hasBinaryVotingMiniGuidePath);
    toggleIsDisputeResolverMiniGuideOpen(hasDisputeResolverMiniGuidePath);
    toggleIsRankedVotingMiniGuideOpen(hasRankedVotingMiniGuidePath);
    toggleIsStakingMiniGuideOpen(hasStakingMiniGuidePath);
    toggleIsOnboardingMiniGuidesOpen(hasOnboardingMiniGuidePath);
    toggleIsAppealMiniGuideOpen(hasAppealMiniGuidePath);
    toggleIsSettingsOpen(hasNotificationsPath);
    setInitialTab(hasNotificationsPath ? 1 : 0);
  }, [
    toggleIsJurorLevelsMiniGuideOpen,
    toggleIsAppealMiniGuideOpen,
    toggleIsBinaryVotingMiniGuideOpen,
    toggleIsDisputeResolverMiniGuideOpen,
    toggleIsRankedVotingMiniGuideOpen,
    toggleIsStakingMiniGuideOpen,
    toggleIsOnboardingMiniGuidesOpen,
    toggleIsSettingsOpen,
    location.hash,
    hasNotificationsPath,
  ]);

  useEffect(initializeFragmentURL, [initializeFragmentURL]);

  useLockOverlayScroll(isDappListOpen || isHelpOpen || isSettingsOpen);

  return (
    <>
      <div className="absolute hidden h-16 lg:relative lg:flex lg:w-full lg:items-center lg:justify-between">
        <div className="-ml-2 flex gap-2">
          <div className="flex items-center">
            <LightButton
              text=""
              onPress={() => {
                toggleIsDappListOpen();
              }}
              Icon={WhiteKlerosSolutionsIcon}
            />
          </div>
          <Logo />
        </div>

        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2">
          <Explore />
        </div>

        <div className="mr-[-8px] ml-2 flex [&_canvas]:w-5" style={{ gap: responsiveSize(4, 8) }}>
          <div
            className="[&_label]:cursor-pointer [&_label]:text-white"
            onClick={isConnected && isDefaultChain ? () => navigate("/profile/stakes/1") : undefined}
          >
            <ConnectWallet />
          </div>
          <Menu {...{ toggleIsHelpOpen, toggleIsSettingsOpen }} />
        </div>
      </div>
      {(isDappListOpen || isHelpOpen || isSettingsOpen) && (
        <OverlayPortal>
          <Overlay>
            <div
              className="lg:mx-auto lg:w-full lg:max-w-[1400px] lg:px-[var(--header-padding)]"
              style={{ "--header-padding": responsiveSize(0, 132) } as React.CSSProperties}
            >
              <div className="lg:relative">
                {isDappListOpen && <DappList {...{ toggleIsDappListOpen, isDappListOpen }} />}
                {isHelpOpen && <Help {...{ toggleIsHelpOpen, isHelpOpen }} />}
                {isSettingsOpen && <Settings toggleIsSettingsOpen={closeSettings} {...{ initialTab }} />}
              </div>
            </div>
          </Overlay>
        </OverlayPortal>
      )}
      {isJurorLevelsMiniGuideOpen && <JurorLevels toggleMiniGuide={toggleIsJurorLevelsMiniGuideOpen} />}
      {isAppealMiniGuideOpen && <Appeal toggleMiniGuide={toggleIsAppealMiniGuideOpen} />}
      {isBinaryVotingMiniGuideOpen && <BinaryVoting toggleMiniGuide={toggleIsBinaryVotingMiniGuideOpen} />}
      {isDisputeResolverMiniGuideOpen && <DisputeResolver toggleMiniGuide={toggleIsDisputeResolverMiniGuideOpen} />}
      {isRankedVotingMiniGuideOpen && <RankedVoting toggleMiniGuide={toggleIsRankedVotingMiniGuideOpen} />}
      {isStakingMiniGuideOpen && <Staking toggleMiniGuide={toggleIsStakingMiniGuideOpen} />}
      {isOnboardingMiniGuidesOpen && <Onboarding toggleMiniGuide={toggleIsOnboardingMiniGuidesOpen} />}
    </>
  );
};
export default DesktopHeader;

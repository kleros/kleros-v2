import React, { useCallback, useEffect, useState } from "react";
import styled, { css } from "styled-components";

import { useLocation, useNavigate } from "react-router-dom";
import { useToggle } from "react-use";
import { useAccount } from "wagmi";

import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";

import { landscapeStyle } from "styles/landscapeStyle";
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

import JurorActionsIndicator from "./JurorActionsIndicator";
import Logo from "./Logo";
import DappList from "./navbar/DappList";
import Explore from "./navbar/Explore";
import Menu from "./navbar/Menu";
import Help from "./navbar/Menu/Help";
import Settings from "./navbar/Menu/Settings";
import { PopupAnchor, PopupAnchorInner } from "./PopupAnchor";

// Equal side tracks keep the nav centered; a wider side pushes it over instead of overlapping it.
// Content too wide for the header (e.g. the switch network button in a narrow window) spills into both side
// paddings, not past the right edge of the page.
const Container = styled.div`
  display: none;
  position: absolute;
  height: 64px;

  ${landscapeStyle(
    () => css`
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      justify-content: center;
      align-items: center;
      width: 100%;
      position: relative;
    `
  )};
`;

const LeftSide = styled.div`
  display: flex;
  gap: 8px;
  margin-left: -8px;
`;

const MiddleSide = styled.div`
  display: flex;
  white-space: nowrap;
`;

const RightSide = styled.div`
  display: flex;
  justify-self: end;
  gap: ${responsiveSize(4, 8)};

  margin-left: 8px;
  margin-right: -8px;
  canvas {
    width: 20px;
  }
`;

const LightButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledKlerosSolutionsIcon = styled(KlerosSolutionsIcon)`
  fill: ${({ theme }) => theme.white} !important;
`;

const ConnectWalletContainer = styled.div<{ isConnected: boolean; isDefaultChain: boolean }>`
  label {
    color: ${({ theme }) => theme.white};
    cursor: pointer;
  }
`;

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
      <Container>
        <LeftSide>
          <LightButtonContainer>
            <LightButton
              text=""
              onPress={() => {
                toggleIsDappListOpen();
              }}
              Icon={StyledKlerosSolutionsIcon}
            />
          </LightButtonContainer>
          <Logo />
        </LeftSide>

        <MiddleSide>
          <Explore />
        </MiddleSide>

        <RightSide>
          <JurorActionsIndicator />
          <ConnectWalletContainer
            {...{ isConnected, isDefaultChain }}
            onClick={isConnected && isDefaultChain ? () => navigate("/profile/stakes/1") : undefined}
          >
            <ConnectWallet />
          </ConnectWalletContainer>
          <Menu {...{ toggleIsHelpOpen, toggleIsSettingsOpen }} />
        </RightSide>
      </Container>
      {(isDappListOpen || isHelpOpen || isSettingsOpen) && (
        <OverlayPortal>
          <Overlay>
            <PopupAnchor>
              <PopupAnchorInner>
                {isDappListOpen && <DappList {...{ toggleIsDappListOpen, isDappListOpen }} />}
                {isHelpOpen && <Help {...{ toggleIsHelpOpen, isHelpOpen }} />}
                {isSettingsOpen && <Settings toggleIsSettingsOpen={closeSettings} {...{ initialTab }} />}
              </PopupAnchorInner>
            </PopupAnchor>
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

import React, { useCallback, useEffect, useState } from "react";
import styled, { css } from "styled-components";

import { useLocation } from "react-router-dom";
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

import Logo from "./Logo";
import DappList from "./navbar/DappList";
import Explore from "./navbar/Explore";
import Menu from "./navbar/Menu";
import Help from "./navbar/Menu/Help";
import Settings from "./navbar/Menu/Settings";

const Container = styled.div`
  display: none;
  position: absolute;
  height: 64px;

  ${landscapeStyle(
    () => css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      position: relative;
    `
  )};
`;

const LeftSide = styled.div`
  display: flex;
  gap: 8px;
`;

const MiddleSide = styled.div`
  display: flex;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const RightSide = styled.div`
  display: flex;
  gap: ${responsiveSize(4, 8)};

  margin-left: 8px;
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
  const { isConnected, chainId } = useAccount();
  const isDefaultChain = chainId === DEFAULT_CHAIN.id;
  const initializeFragmentURL = useCallback(() => {
    const hashIncludes = (hash: MiniguideHashesType | "#notifications") => location.hash.includes(hash);
    const hasJurorLevelsMiniGuidePath = hashIncludes("#jurorlevels-miniguide");
    const hasAppealMiniGuidePath = hashIncludes("#appeal-miniguide");
    const hasBinaryVotingMiniGuidePath = hashIncludes("#binaryvoting-miniguide");
    const hasDisputeResolverMiniGuidePath = hashIncludes("#disputeresolver-miniguide");
    const hasRankedVotingMiniGuidePath = hashIncludes("#rankedvoting-miniguide");
    const hasStakingMiniGuidePath = hashIncludes("#staking-miniguide");
    const hasOnboardingMiniGuidePath = hashIncludes("#onboarding-miniguide");
    const hasNotificationsPath = hashIncludes("#notifications");
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
              onClick={() => {
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
          <ConnectWalletContainer
            {...{ isConnected, isDefaultChain }}
            onClick={isConnected && isDefaultChain ? toggleIsSettingsOpen : undefined}
          >
            <ConnectWallet />
          </ConnectWalletContainer>
          <Menu {...{ toggleIsHelpOpen, toggleIsSettingsOpen }} />
        </RightSide>
      </Container>
      {(isDappListOpen || isHelpOpen || isSettingsOpen) && (
        <OverlayPortal>
          <Overlay>
            {isDappListOpen && <DappList {...{ toggleIsDappListOpen, isDappListOpen }} />}
            {isHelpOpen && <Help {...{ toggleIsHelpOpen, isHelpOpen }} />}
            {isSettingsOpen && <Settings {...{ toggleIsSettingsOpen, isSettingsOpen, initialTab }} />}
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

import React from "react";
import styled, { css } from "styled-components";

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useToggle } from "react-use";
import { useAccount } from "wagmi";

import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import ConnectWallet from "components/ConnectWallet";
import EnsureAuth from "components/EnsureAuth";
import HeroImage from "components/HeroImage";
import HowItWorks from "components/HowItWorks";
import Resolver from "components/Popup/MiniGuides/DisputeResolver";
import ScrollTop from "components/ScrollTop";

import Description from "./Briefing/Description";
import Title from "./Briefing/Title";
import Category from "./Parameters/Category";
import Court from "./Parameters/Court";
import Jurors from "./Parameters/Jurors";
import NotablePersons from "./Parameters/NotablePersons";
import VotingOptions from "./Parameters/VotingOptions";
import Policy from "./Policy";
import Preview from "./Preview";
import Timeline from "./Timeline";

const Wrapper = styled.div`
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(24, 32)};
  padding-top: ${responsiveSize(24, 28)};
  padding-bottom: ${responsiveSize(76, 96)};
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;
`;

const ConnectWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.primaryText};
`;

const StyledEnsureAuth = styled(EnsureAuth)`
  align-self: center;
`;

const HowItWorksAndTimeline = styled.div`
  display: none;

  ${landscapeStyle(
    () => css`
      display: flex;
      flex-direction: column;
      position: absolute;
      left: 2%;
      gap: 40px;
    `
  )}
`;

const MiddleContentContainer = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const DisputeResolver: React.FC = () => {
  const location = useLocation();
  const [isDisputeResolverMiniGuideOpen, toggleDisputeResolverMiniGuide] = useToggle(false);
  const { isConnected } = useAccount();
  const isPreviewPage = location.pathname.includes("/preview");

  return (
    <Wrapper>
      <HeroImage />
      <Container>
        {isConnected ? (
          <StyledEnsureAuth>
            <MiddleContentContainer>
              {isConnected && !isPreviewPage ? (
                <HowItWorksAndTimeline>
                  <HowItWorks
                    isMiniGuideOpen={isDisputeResolverMiniGuideOpen}
                    toggleMiniGuide={toggleDisputeResolverMiniGuide}
                    MiniGuideComponent={Resolver}
                  />
                  <Timeline />
                </HowItWorksAndTimeline>
              ) : null}
              <Routes>
                <Route index element={<Navigate to="title" replace />} />
                <Route path="/title/*" element={<Title />} />
                <Route path="/description/*" element={<Description />} />
                <Route path="/court/*" element={<Court />} />
                <Route path="/category/*" element={<Category />} />
                <Route path="/jurors/*" element={<Jurors />} />
                <Route path="/voting-options/*" element={<VotingOptions />} />
                <Route path="/notable-persons/*" element={<NotablePersons />} />
                <Route path="/policy/*" element={<Policy />} />
                <Route path="/preview/*" element={<Preview />} />
              </Routes>
            </MiddleContentContainer>
          </StyledEnsureAuth>
        ) : (
          <ConnectWalletContainer>
            To create a new dispute, connect first
            <hr />
            <ConnectWallet />
          </ConnectWalletContainer>
        )}
      </Container>
      <ScrollTop />
    </Wrapper>
  );
};

export default DisputeResolver;

import React from "react";
import styled, { css } from "styled-components";

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import ConnectWallet from "components/ConnectWallet";
import { EnsureAuth } from "components/EnsureAuth";
import HeroImage from "components/HeroImage";

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
  max-width: 1780px;
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

const MiddleContentContainer = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const StyledLabel = styled.label`
  display: none;

  ${landscapeStyle(
    () => css`
      display: flex;
      color: ${({ theme }) => theme.secondaryPurple};
      margin-bottom: 20px;
      padding-left: ${responsiveSize(25, 65)};
    `
  )}
`;

const DisputeResolver: React.FC = () => {
  const location = useLocation();

  const { isConnected } = useAccount();
  const isPreviewPage = location.pathname.includes("/preview");
  return (
    <Wrapper>
      <HeroImage />
      <Container>
        {isConnected && !isPreviewPage ? <StyledLabel>Start a case</StyledLabel> : null}
        {isConnected ? (
          <StyledEnsureAuth>
            <MiddleContentContainer>
              {isConnected && !isPreviewPage ? <Timeline /> : null}
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
    </Wrapper>
  );
};

export default DisputeResolver;

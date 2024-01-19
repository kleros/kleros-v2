import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import { useAccount } from "wagmi";
import ConnectWallet from "components/ConnectWallet";
import Timeline from "./Timeline";
import HeroImage from "components/HeroImage";
import Title from "./Briefing/Title";
import { landscapeStyle } from "styles/landscapeStyle";
import Description from "./Briefing/Description";
import Court from "./Parameters/Court";
import Category from "./Parameters/Category";
import Jurors from "./Parameters/Jurors";
import VotingOptions from "./Parameters/VotingOptions";
import NotablePersons from "./Parameters/NotablePersons";
import Policy from "./Policy";
import Preview from "./Preview";

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
    <>
      <HeroImage />
      <Container>
        {isConnected && !isPreviewPage ? <StyledLabel>Start a case</StyledLabel> : null}
        {isConnected ? (
          <MiddleContentContainer>
            {isConnected && !isPreviewPage ? <Timeline /> : null}
            <Routes>
              <Route index element={<Navigate to="title" replace />} />
              <Route path="/title/*" element={<Title />} />
              <Route path="/description/*" element={<Description />} />
              <Route path="/court/*" element={<Court />} />
              <Route path="/category/*" element={<Category />} />
              <Route path="/jurors/*" element={<Jurors />} />
              <Route path="/votingoptions/*" element={<VotingOptions />} />
              <Route path="/notablepersons/*" element={<NotablePersons />} />
              <Route path="/policy/*" element={<Policy />} />
              <Route path="/preview/*" element={<Preview />} />
            </Routes>
          </MiddleContentContainer>
        ) : (
          <ConnectWalletContainer>
            To create a new dispute, connect first
            <hr />
            <ConnectWallet />
          </ConnectWalletContainer>
        )}
      </Container>
    </>
  );
};

export default DisputeResolver;

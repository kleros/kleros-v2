import React, { useEffect, useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate, useSearchParams, useLocation, Navigate } from "react-router-dom";
import { useAccount } from "wagmi";

import { Tabs as TabsComponent } from "@kleros/ui-components-library";

import DocIcon from "svgs/icons/doc.svg";
import PnkIcon from "svgs/icons/pnk.svg";
import VotedIcon from "svgs/icons/voted-ballot.svg";

import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import ConnectWallet from "components/ConnectWallet";
import FavoriteCases from "components/FavoriteCases";
import ScrollTop from "components/ScrollTop";

import Cases from "./Cases";
import JurorCard from "./JurorCard";
import Stakes from "./Stakes";
import Votes from "./Votes";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px 16px 40px;
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;

  ${landscapeStyle(
    () => css`
      padding: 48px ${responsiveSize(0, 132)} 60px;
    `
  )}
`;

const StyledTabs = styled(TabsComponent)`
  width: 100%;
  margin-top: ${responsiveSize(16, 32)};
  > * {
    display: flex;
    flex-wrap: wrap;
    font-size: ${responsiveSize(14, 16)};
    > svg {
      margin-right: 8px !important;
    }
  }
`;

const ConnectWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.primaryText};
`;

const TAB_PATHS = ["stakes/1", "cases/1/desc/all", "votes/1/desc/all"];

const getTabIndex = (currentPath: string) => {
  return TAB_PATHS.findIndex((path) => currentPath.includes(path.split("/")[0]));
};

const Profile: React.FC = () => {
  const { t } = useTranslation();

  const TABS = useMemo(
    () => [
      { text: t("profile.my_stakes"), value: 0, Icon: PnkIcon, path: TAB_PATHS[0] },
      { text: t("navigation.cases"), value: 1, Icon: DocIcon, path: TAB_PATHS[1] },
      { text: t("stats.votes"), value: 2, Icon: VotedIcon, path: TAB_PATHS[2] },
    ],
    [t]
  );
  const { isConnected, address: connectedAddress } = useAccount();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const searchParamAddress = searchParams.get("address")?.toLowerCase();

  useEffect(() => {
    if (isConnected && !searchParamAddress && connectedAddress) {
      navigate(`${pathname}?address=${connectedAddress.toLowerCase()}`, { replace: true });
    }
  }, [isConnected, searchParamAddress, connectedAddress, pathname, navigate]);

  const handleTabChange = (tabIndex: number) => {
    const selectedTab = TABS[tabIndex];
    const basePath = `/profile/${selectedTab.path}`;
    const queryParam = searchParamAddress ? `?address=${searchParamAddress}` : "";
    navigate(`${basePath}${queryParam}`);
  };

  return (
    <Container>
      {searchParamAddress ? (
        <>
          <JurorCard {...{ searchParamAddress }} />
          <StyledTabs
            currentValue={getTabIndex(pathname)}
            items={TABS}
            callback={(tabIndex: number) => handleTabChange(tabIndex)}
          />
          <Routes>
            <Route path="stakes/:page" element={<Stakes {...{ searchParamAddress }} />} />
            <Route path="cases/:page/:order/:filter" element={<Cases {...{ searchParamAddress }} />} />
            <Route path="votes/:page/:order/:filter" element={<Votes {...{ searchParamAddress }} />} />
            <Route
              path="*"
              element={
                <Navigate
                  to={`${searchParamAddress ? `stakes/1?address=${searchParamAddress}` : "stakes/1"}`}
                  replace
                />
              }
            />
          </Routes>
        </>
      ) : !isConnected ? (
        <ConnectWalletContainer>
          {t("profile.to_see_profile_connect")}
          <hr />
          <ConnectWallet />
        </ConnectWalletContainer>
      ) : null}
      <FavoriteCases />
      <ScrollTop />
    </Container>
  );
};

export default Profile;

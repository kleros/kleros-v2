import React, { useEffect, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate, useSearchParams, useLocation, Navigate } from "react-router-dom";
import { isAddress } from "viem";
import { useAccount } from "wagmi";

import { Tabs as TabsComponent } from "@kleros/ui-components-library";

import DocIcon from "svgs/icons/doc.svg";
import PnkIcon from "svgs/icons/pnk.svg";
import VotedIcon from "svgs/icons/voted-ballot.svg";

import ConnectWallet from "components/ConnectWallet";
import FavoriteCases from "components/FavoriteCases";
import ScrollTop from "components/ScrollTop";

import Cases from "./Cases";
import JurorCard from "./JurorCard";
import Stakes from "./Stakes";
import Votes from "./Votes";

const TAB_PATHS = ["stakes/1", "cases/1/desc/all", "votes/1/desc/all"];

const getTabIndex = (currentPath: string) => {
  return TAB_PATHS.findIndex((path) => currentPath.includes(path.split("/")[0]));
};

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { isConnected, address: connectedAddress } = useAccount();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const rawAddress = searchParams.get("address")?.toLowerCase();
  const searchParamAddress = rawAddress && isAddress(rawAddress) ? rawAddress : undefined;

  const TABS = useMemo(
    () => [
      { id: 0, text: t("navigation.stakes"), value: 0, Icon: PnkIcon, path: TAB_PATHS[0], content: null },
      { id: 1, text: t("navigation.cases"), value: 1, Icon: DocIcon, path: TAB_PATHS[1], content: null },
      { id: 2, text: t("stats.votes"), value: 2, Icon: VotedIcon, path: TAB_PATHS[2], content: null },
    ],
    [t]
  );

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
    <div className="w-full bg-klerosUIComponentsLightBackground p-[32px_16px_40px] max-w-[1400px] m-[0_auto] lg:p-[48px_calc(0px_+_(132_-_0)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))_60px]">
      {searchParamAddress ? (
        <>
          <JurorCard {...{ searchParamAddress }} />
          <TabsComponent
            selectedKey={getTabIndex(pathname)}
            items={TABS}
            callback={(_key, value) => handleTabChange(value)}
            className={
              'tabs-selected-underline w-full mt-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] [&_>_*]:flex [&_>_*]:flex-wrap [&_[role="tab"]_span]:text-[calc(14px_+_(16_-_14)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] [&_[role="tab"]_svg]:mr-2'
            }
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
        <div className="flex flex-col justify-center items-center text-klerosUIComponentsPrimaryText">
          {t("profile.to_see_profile_connect")}
          <hr />
          <ConnectWallet />
        </div>
      ) : null}
      <FavoriteCases />
      <ScrollTop />
    </div>
  );
};

export default Profile;

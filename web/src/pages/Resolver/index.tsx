import React from "react";

import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useToggle } from "react-use";
import { useAccount } from "wagmi";

import { useAtlasProvider } from "@kleros/kleros-app";

import ConnectWallet from "components/ConnectWallet";
import EnsureAuth from "components/EnsureAuth";
import HeroImage from "components/HeroImage";
import HowItWorks from "components/HowItWorks";
import Resolver from "components/Popup/MiniGuides/DisputeResolver";
import ScrollTop from "components/ScrollTop";

import Description from "./Briefing/Description";
import Title from "./Briefing/Title";
import Landing from "./Landing";
import Category from "./Parameters/Category";
import Court from "./Parameters/Court";
import Jurors from "./Parameters/Jurors";
import NotablePersons from "./Parameters/NotablePersons";
import VotingOptions from "./Parameters/VotingOptions";
import Policy from "./Policy";
import Preview from "./Preview";
import Timeline from "./Timeline";

const DisputeResolver: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isDisputeResolverMiniGuideOpen, toggleDisputeResolverMiniGuide] = useToggle(false);
  const { isVerified } = useAtlasProvider();
  const { isConnected } = useAccount();
  const isPreviewPage = location.pathname.includes("/preview");

  return (
    <div className="w-full">
      <HeroImage />
      <div className="flex flex-col gap-8 w-full bg-klerosUIComponentsLightBackground p-[calc(24px_+_(32_-_24)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] pt-[calc(24px_+_(28_-_24)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] pb-[calc(76px_+_(96_-_76)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] max-w-[1400px] m-[0_auto]">
        {!isConnected || !isVerified ? (
          <>
            <h1 className="m-0 text-[24px] font-semibold text-klerosUIComponentsPrimaryText text-center">
              {t("resolver.justice_as_service")}
            </h1>
            <p className="p-0 m-0 text-[16px] text-center text-klerosUIComponentsSecondaryText">
              {t("resolver.send_disputes_get_decisions")}
            </p>
          </>
        ) : null}
        {isConnected ? (
          <EnsureAuth buttonText={t("wallet.sign_in_to_start")} className="self-center">
            <div className="flex justify-center relative">
              {isConnected && !isPreviewPage ? (
                <div className="hidden lg:flex lg:flex-col lg:absolute lg:left-[2%] lg:gap-10">
                  <HowItWorks
                    isMiniGuideOpen={isDisputeResolverMiniGuideOpen}
                    toggleMiniGuide={toggleDisputeResolverMiniGuide}
                    MiniGuideComponent={Resolver}
                  />
                  <Timeline />
                </div>
              ) : null}
              <Routes>
                <Route index element={<Navigate to="create" replace />} />
                <Route path="/create/*" element={<Landing />} />
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
            </div>
          </EnsureAuth>
        ) : (
          <div className="flex flex-col items-center text-center text-klerosUIComponentsPrimaryText">
            {t("resolver.to_create_dispute_connect")}
            <hr />
            <ConnectWallet />
          </div>
        )}
      </div>
      <ScrollTop />
    </div>
  );
};

export default DisputeResolver;

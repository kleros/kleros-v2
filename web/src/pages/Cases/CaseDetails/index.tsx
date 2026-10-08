import React from "react";

import { useTranslation } from "react-i18next";
import { Route, Routes, useParams, Navigate } from "react-router-dom";
import type { Address } from "viem";

import { Card } from "@kleros/ui-components-library";

import { Periods } from "consts/periods";
import { ClassicAppealProvider } from "hooks/useClassicAppealContext";
import { VotingContextProvider } from "hooks/useVotingContext";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import CaseStarButton from "components/CaseStarButton";
import ScrollTop from "components/ScrollTop";

import Appeal from "./Appeal";
import Evidence from "./Evidence";
import MaintenanceButtons from "./MaintenanceButtons";
import Overview from "./Overview";
import Tabs from "./Tabs";
import Timeline from "./Timeline";
import Voting from "./Voting";

const CaseDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data } = useDisputeDetailsQuery(id);
  const dispute = data?.dispute;
  const currentPeriodIndex = (dispute ? Periods[dispute.period] : 0) as number;
  const arbitrable = dispute?.arbitrated.id as Address;

  return (
    <VotingContextProvider>
      <ClassicAppealProvider>
        <div>
          <div className="w-full flex items-center -mt-0.5 mb-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
            <h1 className="flex text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] items-center flex-1 gap-[calc(8px_+_(12_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] m-0">
              {t("misc.case")} #{id} {id ? <CaseStarButton id={id} /> : null}
            </h1>

            <MaintenanceButtons />
          </div>
          <Timeline {...{ currentPeriodIndex, dispute }} />
          <Tabs />
          <Card className="w-full h-auto min-h-[100px] rounded-[0_0_3px_3px]">
            <Routes>
              <Route
                path="overview"
                element={
                  <Overview currentPeriodIndex={currentPeriodIndex} courtID={dispute?.court.id} {...{ arbitrable }} />
                }
              />
              <Route path="evidence" element={<Evidence />} />
              <Route path="voting" element={<Voting {...{ arbitrable, currentPeriodIndex, dispute }} />} />
              <Route path="appeal" element={<Appeal {...{ currentPeriodIndex }} />} />
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Routes>
          </Card>
          <ScrollTop />
        </div>
      </ClassicAppealProvider>
    </VotingContextProvider>
  );
};

export default CaseDetails;

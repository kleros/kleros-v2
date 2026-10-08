import React from "react";

import { useTranslation } from "react-i18next";

import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";
import { Card } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { useCourtPolicy } from "queries/useCourtPolicy";

import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import DisputeInfo from "components/DisputeView/DisputeInfo";
import { Divider } from "components/Divider";

import NavigationButtons from "../NavigationButtons";

import BatchCreationCard from "./BatchCreationCard";

const Preview: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, disputeTemplate } = useNewDisputeContext();
  const { data: courtPolicy } = useCourtPolicy(disputeData.courtId);
  const courtName = courtPolicy?.name;

  return (
    <div className="w-full p-[0px_calc(10px_+_(130_-_10)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] flex flex-col items-center gap-4">
      <h2 className="mb-8 w-[84vw] text-center text-klerosUIComponentsSecondaryPurple lg:w-auto">
        {t("timeline.preview")}
      </h2>
      <Card className="w-full h-auto min-h-[100px] relative">
        <div className="w-full h-full absolute top-0 left-0 z-2" />
        <div className="w-full h-auto flex flex-col gap-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] p-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {/*IDisputeTemplate is a subset of DisputeDetails. 
          This cast happens elsewhere, but types should be consolidated. */}
          <DisputeContext disputeDetails={disputeTemplate as DisputeDetails} />
          <Divider />

          <DisputeInfo
            isOverview={true}
            courtId={disputeData.courtId}
            court={courtName}
            round={1}
            {...{ category: disputeData.category }}
          />
        </div>
        <Policies disputePolicyURI={disputeTemplate.policyURI} courtId={disputeData.courtId} />
      </Card>
      <BatchCreationCard />
      <NavigationButtons prevRoute="/resolver/policy" />
    </div>
  );
};

export default Preview;

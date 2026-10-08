import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { AlertMessage } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { rootCourtToItems, useCourtTree } from "hooks/queries/useCourtTree";
import { isUndefined } from "utils/index";

import { LabeledDropdownCascader } from "components/LabeledDropdown";
import { StyledSkeleton } from "components/StyledSkeleton";
import Header from "pages/Resolver/Header";

import NavigationButtons from "../../NavigationButtons";

import FeatureSelection from "./FeatureSelection";

const Court: React.FC = () => {
  const { t } = useTranslation();
  const { disputeData, setDisputeData, setSelectedFeatures } = useNewDisputeContext();
  const { data: courtTree } = useCourtTree();
  const items = useMemo(
    () => (!isUndefined(courtTree?.court) ? [rootCourtToItems(courtTree.court)] : false),
    [courtTree]
  );

  const handleCourtChange = (courtId: string) => {
    if (disputeData.courtId !== courtId) {
      setDisputeData({ ...disputeData, courtId, disputeKitId: undefined, disputeKitData: undefined });
      setSelectedFeatures([]);
    }
  };

  return (
    <div className="flex flex-col items-center lg:pb-28.75">
      <Header text={t("headers.select_court_to_arbitrate")} />
      {items ? (
        <LabeledDropdownCascader
          ariaLabel={t("aria_labels.select_court")}
          items={items}
          callback={(item) => typeof item.itemValue === "string" && handleCourtChange(item.itemValue.split("/").pop()!)}
          placeholder={t("forms.placeholders.select_court")}
          selectedKey={`/courts/${disputeData.courtId}`}
          className="w-[84vw] lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))] [&_>_button]:w-full"
        />
      ) : (
        <StyledSkeleton width={240} height={42} />
      )}

      <div className="w-[84vw] lg:w-[calc(442px_+_(700_-_442)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))] mt-6 [&_h2]:m-0">
        <AlertMessage
          title={t("alerts.check_courts_beforehand")}
          msg={t("alerts.kleros_different_courts")}
          variant="info"
        />
      </div>
      {isUndefined(disputeData.courtId) ? null : <FeatureSelection />}
      <NavigationButtons prevRoute="/resolver/description" nextRoute="/resolver/category" />
    </div>
  );
};

export default Court;

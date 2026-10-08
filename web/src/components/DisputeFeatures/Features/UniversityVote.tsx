import React, { Fragment } from "react";

import { useTranslation } from "react-i18next";

import { useReadDisputeKitClassicUniversityInstructor } from "hooks/contracts/generated";
import { shortenAddress } from "utils/shortenAddress";

import { Features } from "src/dispute-kits/types";
import { getAddressExplorerLink } from "src/utils";

import { ExternalLink } from "components/ExternalLink";
import NewTabIcon from "components/StyledIcons/NewTabIcon";
import { StyledSkeleton } from "components/StyledSkeleton";
import WithHelpTooltip from "components/WithHelpTooltip";

import { FeatureRadio, RadioInput } from "./FeatureRadio";

const UniversityVote: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();

  const { data: instructorAddress, isLoading: isLoadingInstructor } = useReadDisputeKitClassicUniversityInstructor({
    query: { enabled: props.checked },
  });

  return (
    <Fragment key={Features.UniversityVote}>
      <WithHelpTooltip tooltipMsg={t("features.university_vote_tooltip")}>
        <FeatureRadio {...props} label={t("features.university_vote")} />
      </WithHelpTooltip>
      {props.checked && isLoadingInstructor ? (
        <div className="pl-8 mt-2 flex items-center gap-2 text-[14px] text-klerosUIComponentsSecondaryText">
          <span className="text-klerosUIComponentsPrimaryText">{t("features.university_instructor")}:</span>
          <StyledSkeleton width="120px" height="16px" />
        </div>
      ) : null}
      {props.checked && instructorAddress ? (
        <div className="pl-8 mt-2 flex items-center gap-2 text-[14px] text-klerosUIComponentsSecondaryText">
          <span className="text-klerosUIComponentsPrimaryText">{t("features.university_instructor")}:</span>
          <ExternalLink to={getAddressExplorerLink(instructorAddress)} target="_blank" rel="noopener noreferrer">
            {shortenAddress(instructorAddress)} <NewTabIcon className="w-[14px] h-[14px]" />
          </ExternalLink>
        </div>
      ) : null}
    </Fragment>
  );
};

export default UniversityVote;

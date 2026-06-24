import React, { Fragment } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import NewTabIcon from "svgs/icons/new-tab.svg";

import { useReadDisputeKitClassicUniversityInstructor } from "hooks/contracts/generated";
import { shortenAddress } from "utils/shortenAddress";

import { Features } from "src/dispute-kits/types";
import { getAddressExplorerLink } from "src/utils";

import { ExternalLink } from "components/ExternalLink";
import { StyledSkeleton } from "components/StyledSkeleton";
import WithHelpTooltip from "components/WithHelpTooltip";

import { RadioInput, StyledRadio } from ".";

const InstructorContainer = styled.div`
  padding-left: 32px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
`;

const InstructorLabel = styled.span`
  color: ${({ theme }) => theme.primaryText};
`;

const StyledNewTabIcon = styled(NewTabIcon)`
  width: 14px;
  height: 14px;
`;

const UniversityVote: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();

  const { data: instructorAddress, isLoading: isLoadingInstructor } = useReadDisputeKitClassicUniversityInstructor({
    query: { enabled: props.checked },
  });

  return (
    <Fragment key={Features.UniversityVote}>
      <WithHelpTooltip tooltipMsg={t("features.university_vote_tooltip")}>
        <StyledRadio label={t("features.university_vote")} small {...props} />
      </WithHelpTooltip>
      {props.checked && isLoadingInstructor ? (
        <InstructorContainer>
          <InstructorLabel>{t("features.university_instructor")}:</InstructorLabel>
          <StyledSkeleton width="120px" height="16px" />
        </InstructorContainer>
      ) : null}
      {props.checked && instructorAddress ? (
        <InstructorContainer>
          <InstructorLabel>{t("features.university_instructor")}:</InstructorLabel>
          <ExternalLink to={getAddressExplorerLink(instructorAddress)} target="_blank" rel="noopener noreferrer">
            {shortenAddress(instructorAddress)} <StyledNewTabIcon />
          </ExternalLink>
        </InstructorContainer>
      ) : null}
    </Fragment>
  );
};

export default UniversityVote;

import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

const FieldWrapper = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const SeparatorLabel = styled.label`
  margin: 0 8px;
  color: ${({ theme }) => theme.primaryText};
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
`;

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <FieldWrapper>
    <StyledLabel>{label}</StyledLabel>
    <small>{value}</small>
  </FieldWrapper>
);

const Separator: React.FC = () => <SeparatorLabel>|</SeparatorLabel>;

export interface IStats {
  totalVotes: number;
  votesPending: number;
  resolvedVotes: number;
}

const Stats: React.FC<IStats> = ({ totalVotes, votesPending, resolvedVotes }) => {
  const { t } = useTranslation();
  const casesInProgress = (totalVotes - resolvedVotes).toString();

  const fields = [
    { label: t("profile.total"), value: totalVotes.toString() },
    { label: t("profile.vote_pending"), value: votesPending },
    { label: t("profile.case_in_progress"), value: casesInProgress },
    { label: t("profile.resolved"), value: resolvedVotes.toString() },
  ];

  return (
    <div>
      {fields.map(({ label, value }, i) => (
        <React.Fragment key={i}>
          <Field {...{ label, value }} />
          {i + 1 < fields.length ? <Separator /> : null}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stats;

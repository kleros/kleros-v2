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
  totalDisputes: number;
  closedDisputes: number;
}

const Stats: React.FC<IStats> = ({ totalDisputes, closedDisputes }) => {
  const { t } = useTranslation();
  const inProgressDisputes = (totalDisputes - closedDisputes).toString();

  const fields = [
    { label: t("forms.labels.total"), value: totalDisputes.toString() },
    { label: t("filters.in_progress"), value: inProgressDisputes },
    { label: t("filters.closed"), value: closedDisputes.toString() },
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

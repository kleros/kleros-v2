import React from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";

import { isUndefined } from "utils/index";

const FieldWrapper = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.primaryText};
`;

const ValueAndExtraLabel = styled.div`
  display: flex;
  gap: 4px;
`;

const Field: React.FC<{ label: string; value?: number; extraLabel?: string }> = ({ label, value, extraLabel }) => (
  <FieldWrapper>
    <StyledLabel>{label}</StyledLabel>
    <ValueAndExtraLabel>
      <small>{!isUndefined(value) ? value : <Skeleton width={16} />}</small>
      {extraLabel ? <small>{extraLabel}</small> : null}
    </ValueAndExtraLabel>
  </FieldWrapper>
);

export interface IStats {
  totalJurors?: number;
}

const Stats: React.FC<IStats> = ({ totalJurors }) => {
  const value = !isUndefined(totalJurors) ? totalJurors : undefined;
  return <Field label="Total" value={value} extraLabel="Jurors" />;
};

export default Stats;

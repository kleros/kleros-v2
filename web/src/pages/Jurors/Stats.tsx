import React from "react";
import styled from "styled-components";

const FieldWrapper = styled.div`
  display: inline-flex;
  gap: 8px;
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

export interface IStats {
  totalJurors: number;
}

const Stats: React.FC<IStats> = ({ totalJurors }) => {
  return <Field label="Total" value={`${totalJurors} Jurors`} />;
};

export default Stats;

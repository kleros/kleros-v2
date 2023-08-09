import React from "react";
import styled from "styled-components";
import { useAllCasesQuery } from "hooks/queries/useAllCasesQuery";

const FieldWrapper = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <FieldWrapper>
    <label>{label}</label>
    <small>{value}</small>
  </FieldWrapper>
);

const SeparatorLabel = styled.label`
  margin-left: 8px;
  margin-right: 8px;
`;

const Separator: React.FC = () => <SeparatorLabel>|</SeparatorLabel>;

const Stats: React.FC = () => {
  const { data } = useAllCasesQuery();

  const fields = [
    { label: "Total", value: data?.counter?.cases ?? "0" },
    { label: "In Progress", value: data?.counter?.cases - data?.counter?.casesRuled ?? "0" },
    { label: "Closed", value: data?.counter?.casesRuled ?? "0" },
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

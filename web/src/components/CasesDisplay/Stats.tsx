import React from "react";
import styled from "styled-components";
import { useAllCasesQuery } from "hooks/queries/useAllCasesQuery";

const FieldWrapper = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const SeparatorLabel = styled.label`
  margin-left: 8px;
  margin-right: 8px;
`;

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <FieldWrapper>
    <label>{label}</label>
    <small>{value}</small>
  </FieldWrapper>
);

const Separator: React.FC = () => <SeparatorLabel>|</SeparatorLabel>;

const Stats: React.FC = () => {
  const { data } = useAllCasesQuery();

  const totalDisputes = data?.counter?.cases;
  const closedDisputes = data?.counter?.casesRuled;
  const inProgressDisputes = (totalDisputes - closedDisputes).toString();

  const fields = [
    { label: "Total", value: totalDisputes ?? "0" },
    { label: "In Progress", value: inProgressDisputes ?? "0" },
    { label: "Closed", value: closedDisputes ?? "0" },
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

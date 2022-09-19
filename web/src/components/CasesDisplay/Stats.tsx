import React from "react";
import styled from "styled-components";

const FieldWrapper = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const Field: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
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

const fields = [
  { label: "Total", value: "600" },
  { label: "In Progress", value: "50" },
  { label: "Closed", value: "550" },
];

const Stats: React.FC = () => (
  <div>
    {fields.map(({ label, value }, i) => (
      <React.Fragment key={i}>
        <Field {...{ label, value }} />
        {i + 1 < fields.length ? <Separator /> : null}
      </React.Fragment>
    ))}
  </div>
);

export default Stats;

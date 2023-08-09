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

const calculateDisputeSituation = (data) => {
  if (data) {
    let inProgressCount = 0;
    let closedCount = 0;

    data.forEach((dispute) => {
      if (dispute.period === "execution") {
        closedCount++;
      } else {
        inProgressCount++;
      }
    });
    const totalCases = data.length;
    return {
      inProgress: inProgressCount.toString(),
      closed: closedCount.toString(),
      total: totalCases.toString(),
    };
  }
};

const Stats: React.FC = () => {
  const { data } = useAllCasesQuery();

  const caseStats = calculateDisputeSituation(data?.disputes);

  const fields = [
    { label: "Total", value: caseStats?.total || "0" },
    { label: "In Progress", value: caseStats?.inProgress || "0" },
    { label: "Closed", value: caseStats?.closed || "0" },
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

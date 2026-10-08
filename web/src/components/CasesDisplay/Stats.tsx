import React from "react";

import { useTranslation } from "react-i18next";

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="inline-flex gap-2">
    <label className="text-klerosUIComponentsPrimaryText">{label}</label>
    <small>{value}</small>
  </div>
);

const Separator: React.FC = () => <label className="m-[0_8px] text-klerosUIComponentsPrimaryText">|</label>;

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

import React from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import { isUndefined } from "utils/index";

const Field: React.FC<{ label: string; value?: number; extraLabel?: string }> = ({ label, value, extraLabel }) => (
  <div className="inline-flex gap-2">
    <label className="text-klerosUIComponentsPrimaryText">{label}</label>
    <div className="flex gap-1">
      <small>{!isUndefined(value) ? value : <Skeleton width={16} />}</small>
      {extraLabel ? <small>{extraLabel}</small> : null}
    </div>
  </div>
);

export interface IStats {
  totalJurors?: number;
}

const Stats: React.FC<IStats> = ({ totalJurors }) => {
  const { t } = useTranslation();
  const value = !isUndefined(totalJurors) ? totalJurors : undefined;
  return <Field label={t("forms.labels.total")} value={value} extraLabel={t("forms.labels.jurors")} />;
};

export default Stats;

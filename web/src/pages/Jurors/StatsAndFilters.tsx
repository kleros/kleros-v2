import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import type { SelectItem } from "utils/uiComponentsTypes";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

import { LabeledDropdownSelect } from "components/LabeledDropdown";

import Stats, { IStats } from "./Stats";

const StatsAndFilters: React.FC<IStats> = ({ totalJurors }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { order, filter } = useParams();
  const location = useRootPath();
  const { ...filterObject } = decodeURIFilter(filter ?? "all");
  const [searchParams] = useSearchParams();

  const handleOrderChange = (item: SelectItem) => {
    const encodedFilter = encodeURIFilter({ ...filterObject });
    navigate(`${location}/1/${item.itemValue}/${encodedFilter}?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-[calc(12px_+_(13_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] mb-[calc(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] justify-between">
      <Stats {...{ totalJurors }} />
      <LabeledDropdownSelect
        ariaLabel={t("aria_labels.sort_order")}
        smallButton
        simpleButton
        items={[
          { id: "desc", itemValue: "desc", text: t("sorting.first_to_last") },
          { id: "asc", itemValue: "asc", text: t("sorting.last_to_first") },
        ]}
        defaultSelectedKey={order}
        callback={handleOrderChange}
      />
    </div>
  );
};

export default StatsAndFilters;

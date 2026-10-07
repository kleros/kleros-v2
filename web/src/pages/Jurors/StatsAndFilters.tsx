import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import type { SelectItem } from "utils/uiComponentsTypes";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

import { responsiveSize } from "styles/responsiveSize";

import { LabeledDropdownSelect } from "components/LabeledDropdown";

import Stats, { IStats } from "./Stats";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: ${responsiveSize(12, 13)};
  margin-bottom: ${responsiveSize(16, 32)};
  justify-content: space-between;
`;

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
    <Container>
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
    </Container>
  );
};

export default StatsAndFilters;

import React from "react";
import styled, { useTheme } from "styled-components";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import type { SelectItem } from "utils/uiComponentsTypes";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

import { LabeledDropdownSelect } from "components/LabeledDropdown";

const Container = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
  width: fit-content;
`;

const Filters: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { order, filter } = useParams();
  const { ruled, period, ...filterObject } = decodeURIFilter(filter ?? "all");
  const navigate = useNavigate();
  const location = useRootPath();
  const [searchParams] = useSearchParams();

  const handleStatusChange = (item: SelectItem) => {
    const parsedValue = JSON.parse(item.itemValue as string);
    const encodedFilter = encodeURIFilter({ ...filterObject, ...parsedValue });
    navigate(`${location}/1/${order}/${encodedFilter}?${searchParams.toString()}`);
  };

  const handleOrderChange = (item: SelectItem) => {
    const encodedFilter = encodeURIFilter({ ruled, period, ...filterObject });
    navigate(`${location}/1/${item.itemValue}/${encodedFilter}?${searchParams.toString()}`);
  };

  return (
    <Container>
      <LabeledDropdownSelect
        ariaLabel={t("aria_labels.filter_by_status")}
        smallButton
        simpleButton
        items={[
          {
            id: JSON.stringify({}),
            itemValue: JSON.stringify({}),
            text: t("profile.all_votes"),
            dot: theme.primaryText,
          },
          {
            id: JSON.stringify({ ruled: false }),
            itemValue: JSON.stringify({ ruled: false }),
            text: t("profile.case_in_progress"),
            dot: theme.primaryBlue,
          },
          {
            id: JSON.stringify({ ruled: true }),
            itemValue: JSON.stringify({ ruled: true }),
            text: t("filters.closed"),
            dot: theme.primaryPurple,
          },
        ]}
        defaultSelectedKey={JSON.stringify({ ruled, period })}
        callback={handleStatusChange}
      />
      <LabeledDropdownSelect
        ariaLabel={t("aria_labels.sort_order")}
        smallButton
        simpleButton
        items={[
          { id: "desc", itemValue: "desc", text: t("filters.newest") },
          { id: "asc", itemValue: "asc", text: t("filters.oldest") },
        ]}
        defaultSelectedKey={order}
        callback={handleOrderChange}
      />
    </Container>
  );
};

export default Filters;

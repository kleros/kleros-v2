import React, { useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { Searchbar } from "@kleros/ui-components-library";

import { isEmpty, isUndefined } from "utils/index";
import type { CascaderItem } from "utils/uiComponentsTypes";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

import { rootCourtToItems, useCourtTree } from "queries/useCourtTree";

import { LabeledDropdownCascader } from "components/LabeledDropdown";

const Search: React.FC = () => {
  const { t } = useTranslation();
  const { page, order, filter } = useParams();
  const location = useRootPath();
  const decodedFilter = decodeURIFilter(filter ?? "all");
  const { id: searchValue, ...filterObject } = decodedFilter;
  const [search, setSearch] = useState(searchValue ?? "");
  const initialRenderRef = useRef(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useDebounce(
    () => {
      if (initialRenderRef.current && isEmpty(search)) {
        initialRenderRef.current = false;
        return;
      }
      initialRenderRef.current = false;
      const newFilters = isEmpty(search) ? { ...filterObject } : { ...filterObject, id: search };
      const encodedFilter = encodeURIFilter(newFilters);
      navigate(`${location}/${page}/${order}/${encodedFilter}?${searchParams.toString()}`);
    },
    500,
    [search]
  );

  const { data: courtTreeData } = useCourtTree();
  const items = useMemo<CascaderItem[] | undefined>(() => {
    if (!isUndefined(courtTreeData?.court)) {
      const courts = [rootCourtToItems(courtTreeData.court, "id")];
      courts.push({ label: t("filters.all_courts"), itemValue: "all", id: "all" });
      return courts;
    }
    return undefined;
  }, [courtTreeData, t]);

  return (
    <div className="flex flex-col gap-[calc(8px_+_(16_-_8)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] lg:flex-row">
      {items ? (
        <LabeledDropdownCascader
          ariaLabel={t("aria_labels.select_court")}
          items={items}
          placeholder={t("forms.placeholders.select_court")}
          callback={(item) => {
            const { court: _, ...filterWithoutCourt } = decodedFilter;
            const newFilter =
              item.itemValue === "all" ? filterWithoutCourt : { ...decodedFilter, court: item.itemValue.toString() };
            navigate(`${location}/${page}/${order}/${encodeURIFilter(newFilter)}?${searchParams.toString()}`);
          }}
        />
      ) : (
        <Skeleton width={240} height={42} />
      )}
      <div className="w-full flex flex-wrap gap-2 mb-1.25 z-0">
        <Searchbar
          dir="auto"
          type="text"
          aria-label={t("forms.placeholders.search_by_id")}
          placeholder={t("forms.placeholders.search_by_id")}
          value={search}
          onChange={setSearch}
          className="flex-1 [flex-basis:310px] [&_input]:text-[16px]! [&_input]:h-[45px] [&_input]:pt-0 [&_input]:pb-0"
        />
      </div>
    </div>
  );
};

export default Search;

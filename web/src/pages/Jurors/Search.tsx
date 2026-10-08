import React, { useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { Searchbar } from "@kleros/ui-components-library";

import { isEmpty } from "utils/index";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

const Search: React.FC = () => {
  const { t } = useTranslation();
  const { order, filter } = useParams();
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
      navigate(`${location}/1/${order}/${encodedFilter}?${searchParams.toString()}`);
    },
    500,
    [search]
  );

  return (
    <Searchbar
      dir="auto"
      type="text"
      aria-label={t("forms.placeholders.search_by_address")}
      placeholder={t("forms.placeholders.search_by_address")}
      value={search}
      onChange={setSearch}
      className="w-full [&_input]:text-[16px]! [&_input]:h-[45px] [&_input]:pt-0 [&_input]:pb-0"
    />
  );
};

export default Search;

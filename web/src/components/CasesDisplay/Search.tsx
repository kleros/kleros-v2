import React, { useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { Searchbar, DropdownCascader } from "@kleros/ui-components-library";

import { isEmpty, isUndefined } from "utils/index";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

import { rootCourtToItems, useCourtTree } from "queries/useCourtTree";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${responsiveSize(8, 16)};

  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )}
`;

const SearchBarContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 5px;
  z-index: 0;
`;

const StyledSearchbar = styled(Searchbar)`
  flex: 1;
  flex-basis: 310px;

  input {
    font-size: 16px;
    height: 45px;
    padding-top: 0px;
    padding-bottom: 0px;
  }
`;

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
  const items = useMemo(() => {
    if (!isUndefined(courtTreeData?.court)) {
      const courts = [rootCourtToItems(courtTreeData.court, "id")];
      courts.push({ label: t("filters.all_courts"), value: "all" });
      return courts;
    }
    return undefined;
  }, [courtTreeData, t]);

  return (
    <Container>
      {items ? (
        <DropdownCascader
          items={items}
          placeholder={t("forms.placeholders.select_court")}
          onSelect={(value) => {
            const { court: _, ...filterWithoutCourt } = decodedFilter;
            const newFilter = value === "all" ? filterWithoutCourt : { ...decodedFilter, court: value.toString() };
            navigate(`${location}/${page}/${order}/${encodeURIFilter(newFilter)}?${searchParams.toString()}`);
          }}
        />
      ) : (
        <Skeleton width={240} height={42} />
      )}
      <SearchBarContainer>
        <StyledSearchbar
          dir="auto"
          type="text"
          placeholder={t("forms.placeholders.search_by_id")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBarContainer>
    </Container>
  );
};

export default Search;

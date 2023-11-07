import React, { useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useNavigate, useParams } from "react-router-dom";
import { useDebounce } from "react-use";
import Skeleton from "react-loading-skeleton";
import { Searchbar, DropdownCascader } from "@kleros/ui-components-library";
import { rootCourtToItems, useCourtTree } from "queries/useCourtTree";
import { isUndefined } from "utils/index";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  ${landscapeStyle(
    () =>
      css`
        flex-direction: row;
        gap: calc(4px + (24 - 4) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
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

const StyledDropdownCascader = styled(DropdownCascader)`
  [class*="dropdown-container"] {
    width: 240px;
  }
  [class*="cascader"] {
    overflow: auto;
  }
`;

const Search: React.FC = () => {
  const { page, order, filter } = useParams();
  const location = useRootPath();
  const decodedFilter = decodeURIFilter(filter ?? "all");
  const { id: searchValue, ...filterObject } = decodedFilter;
  const [search, setSearch] = useState(searchValue ?? "");
  const navigate = useNavigate();
  useDebounce(
    () => {
      const newFilters = search === "" ? { ...filterObject } : { ...filterObject, id: search };
      const encodedFilter = encodeURIFilter(newFilters);
      navigate(`${location}/${page}/${order}/${encodedFilter}`);
    },
    500,
    [search]
  );
  const { data: courtTreeData } = useCourtTree();
  const items = useMemo(() => {
    if (!isUndefined(courtTreeData)) {
      const courts = [rootCourtToItems(courtTreeData.court!, "id")];
      courts.push({ label: "All Courts", value: "all" });
      return courts;
    }
    return undefined;
  }, [courtTreeData]);

  return (
    <Container>
      <SearchBarContainer>
        <StyledSearchbar
          type="text"
          placeholder="Search By ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchBarContainer>
      {items ? (
        <StyledDropdownCascader
          items={items}
          placeholder={"Select Court"}
          onSelect={(value) => {
            const { court: _, ...filterWithoutCourt } = decodedFilter;
            const newFilter = value === "all" ? filterWithoutCourt : { ...decodedFilter, court: value.toString() };
            navigate(`${location}/${page}/${order}/${encodeURIFilter(newFilter)}`);
          }}
        />
      ) : (
        <Skeleton width={240} height={42} />
      )}
    </Container>
  );
};

export default Search;

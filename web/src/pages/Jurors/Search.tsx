import React, { useRef, useState } from "react";
import styled, { css } from "styled-components";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDebounce } from "react-use";
import { Searchbar } from "@kleros/ui-components-library";

import { isEmpty } from "utils/index";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

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

  return (
    <Container>
      <StyledSearchbar
        dir="auto"
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </Container>
  );
};

export default Search;

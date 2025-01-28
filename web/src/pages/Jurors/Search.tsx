import React, { useRef, useState } from "react";
import styled from "styled-components";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDebounce } from "react-use";
import { Searchbar } from "@kleros/ui-components-library";

import { isEmpty } from "utils/index";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

const StyledSearchbar = styled(Searchbar)`
  width: 100%;

  input {
    font-size: 16px;
    height: 45px;
    padding-top: 0px;
    padding-bottom: 0px;
  }
`;

const Search: React.FC = () => {
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
    <StyledSearchbar
      dir="auto"
      type="text"
      placeholder="Search by address"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
};

export default Search;

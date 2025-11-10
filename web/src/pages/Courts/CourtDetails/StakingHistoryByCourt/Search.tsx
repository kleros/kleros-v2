import React, { useState } from "react";
import styled from "styled-components";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { Searchbar } from "@kleros/ui-components-library";

import { isEmpty } from "utils/index";

const Container = styled.div`
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
    padding-top: 0;
    padding-bottom: 0;
  }
`;

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initial = searchParams.get("stakeSearch") ?? "";
  const [value, setValue] = useState(initial);
  useDebounce(
    () => {
      const params = new URLSearchParams(searchParams);
      if (isEmpty(value)) {
        params.delete("stakeSearch");
      } else {
        params.set("stakeSearch", value);
      }
      navigate(`${pathname}?${params.toString()}`, { replace: true });
    },
    500,
    [value]
  );
  return (
    <Container>
      <StyledSearchbar
        dir="auto"
        type="text"
        placeholder="Search by address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Container>
  );
};

export default Search;

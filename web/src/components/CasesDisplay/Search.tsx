import React from "react";
import styled from "styled-components";
import { Searchbar, DropdownCascader } from "@kleros/ui-components-library";
import { useFiltersContext } from "context/FilterProvider";
const Container = styled.div`
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
  const { search, setSearch, setCourtFilter } = useFiltersContext();

  return (
    <div>
      <Container>
        <StyledSearchbar
          type="text"
          placeholder="Search By ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Container>
      <DropdownCascader
        placeholder={"Select Court"}
        onSelect={setCourtFilter}
        items={[
          {
            label: "General Court",
            value: 0,
            children: [
              {
                label: "Blockchain",
                value: 1,
                children: [
                  {
                    label: "Technical",
                    value: 2,
                  },
                  {
                    label: "Non-technical",
                    value: 3,
                  },
                  {
                    label: "Other",
                    value: 4,
                  },
                ],
              },
              {
                label: "Marketing Services",
                value: 5,
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default Search;

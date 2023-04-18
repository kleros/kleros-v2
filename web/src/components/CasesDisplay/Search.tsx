import React, { SetStateAction } from "react";
import styled from "styled-components";
import { Searchbar, DropdownCascader } from "@kleros/ui-components-library";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

interface SearchProps {
  getDisputeId: (value: SetStateAction<string>) => void;
}

const Search = ({ getDisputeId }: SearchProps) => {
  const handleChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    getDisputeId(e.target.value);
  };

  return (
    <Container>
      <StyledSearchbar onChange={handleChange} />
      <DropdownCascader
        placeholder={"Select Court"}
        onSelect={() => {
          // Called with the item value when select is clicked
        }}
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
    </Container>
  );
};

export default Search;

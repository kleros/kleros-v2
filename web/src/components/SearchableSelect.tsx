import React, { useState } from "react";
import { DropdownSelect, ISelect, Searchbar } from "@kleros/ui-components-library";
import { _IItem1 } from "@kleros/ui-components-library";
import styled from "styled-components";

const Container = styled.div``;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 26px;
  gap: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.stroke};
`;

const DropdownMenuContainer = styled.div`
  padding: 26px;
`;

const StlyedSearchBar = styled(Searchbar)`
  width: 100%;
  margin-top: 6px;
`;

const StyledDropdown = styled(DropdownSelect)`
  button {
    display: none;
  }
  > div {
    border: none;
    visibility: visible;
    transform: scaleY(1);
    position: relative;
    width: 100%;
    > div {
      width: 100%;
      .simplebar-content {
        > div {
          width: 100%;
          padding-top: 0px;
        }
      }
    }
  }
`;

const HiglightedItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
`;

const HighlightedItem = styled.button`
  border: none;
  display: flex;
  align-items: center;
  padding: 6.5px 16px;
  background-color: ${({ theme }) => theme.mediumBlue};
  border-radius: 300px;
  cursor: pointer;
`;

const ItemText = styled.h3`
  margin: 0px;
  font-weight: 400;
`;

const StyledLabel = styled.label`
  display: flex;
  margin-top: 24px;
  width: 100%;
`;

interface ISearchableSelect extends ISelect {
  highlightedItems: _IItem1[];
  className?: string;
}

const SearchableSelect: React.FC<ISearchableSelect> = ({
  items,
  highlightedItems,
  defaultValue,
  callback,
  className,
}) => {
  const [search, setSearch] = useState("");

  const filteredItems =
    search === ""
      ? items
      : items.filter((item) => {
          return (
            item.text.toLowerCase().includes(search.toLowerCase()) ||
            item.value.toString().toLowerCase().includes(search.toLowerCase())
          );
        });

  return (
    <Container {...{ className }}>
      <SearchContainer>
        <StlyedSearchBar
          placeholder="Select token by name or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <HiglightedItemsContainer>
          {highlightedItems.map((item) => {
            const { icon, Icon } = item;
            return (
              <HighlightedItem key={item.text} onClick={() => callback(item.value)}>
                {icon ?? (Icon && <Icon />)}
                <ItemText>{item.text}</ItemText>
              </HighlightedItem>
            );
          })}
        </HiglightedItemsContainer>
      </SearchContainer>
      <DropdownMenuContainer>
        {filteredItems.length !== 0 ? (
          <StyledDropdown {...{ items: filteredItems, defaultValue, callback }} />
        ) : (
          <StyledLabel>No item found</StyledLabel>
        )}
      </DropdownMenuContainer>
    </Container>
  );
};

export default SearchableSelect;

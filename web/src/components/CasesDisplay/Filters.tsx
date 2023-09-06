import React from "react";
import styled, { useTheme } from "styled-components";
import { DropdownSelect } from "@kleros/ui-components-library";
import { useFiltersContext } from "context/FilterProvider";
import ListIcon from "svgs/icons/list.svg";
import GridIcon from "svgs/icons/grid.svg";

const Container = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
  width: fit-content;
`;

const StyledGridIcon = styled(GridIcon)<{ isList: boolean }>`
  cursor: pointer;
  transition: fill 0.2s ease;
  fill: ${({ theme, isList }) => (isList ? theme.secondaryText : theme.primaryBlue)};
  width: 16px;
  height: 16px;
`;

const IconsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;

const StyledListIcon = styled(ListIcon)<{ isList: boolean }>`
  cursor: pointer;
  transition: fill 0.2s ease;
  fill: ${({ theme, isList }) => (isList ? theme.primaryBlue : theme.secondaryText)};
  width: 16px;
  height: 17px;
`;

const Filters: React.FC = () => {
  const theme = useTheme();
  const { isList, setIsList } = useFiltersContext();

  return (
    <Container>
      <DropdownSelect
        smallButton
        simpleButton
        items={[
          { value: 0, text: "All Cases", dot: theme.primaryText },
          { value: 1, text: "In Progress", dot: theme.primaryBlue },
          { value: 2, text: "Closed", dot: theme.primaryPurple },
          { value: 3, text: "Appeal", dot: theme.tint },
        ]}
        defaultValue={0}
        callback={() => {}}
      />
      <DropdownSelect
        smallButton
        simpleButton
        items={[
          { value: 0, text: "Newest" },
          { value: 1, text: "Oldest" },
        ]}
        defaultValue={0}
        callback={() => {}}
      />
      <IconsContainer>
        <StyledGridIcon isList={isList} onClick={() => setIsList(false)} />
        <StyledListIcon isList={isList} onClick={() => setIsList(true)} />
      </IconsContainer>
    </Container>
  );
};

export default Filters;

import React from "react";
import styled, { useTheme, css } from "styled-components";
import { useWindowSize } from "react-use";
import { DropdownSelect } from "@kleros/ui-components-library";
import { useFiltersContext } from "context/FilterProvider";
import { BREAKPOINT_LANDSCAPE } from "styles/landscapeStyle";
import ListIcon from "svgs/icons/list.svg";
import GridIcon from "svgs/icons/grid.svg";

const Container = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
  width: fit-content;
`;

const glowingEffect = css`
  filter: drop-shadow(0 0 4px ${({ theme }) => theme.klerosUIComponentsSecondaryPurple});
`;

const StyledGridIcon = styled(GridIcon)<{ isList: boolean }>`
  cursor: pointer;
  transition: filter 0.2s ease;
  fill: ${({ theme }) => theme.primaryBlue};
  width: 16px;
  height: 16px;
  overflow: hidden;
  ${({ isList }) => !isList && glowingEffect}
`;

const IconsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;

const StyledListIcon = styled(ListIcon)<{ isList: boolean; isScreenBig: boolean }>`
  cursor: pointer;
  display: ${({ isScreenBig }) => (isScreenBig ? "block" : "none")};
  transition: filter 0.2s ease;
  fill: ${({ theme }) => theme.primaryBlue};
  width: 16px;
  height: 16px;
  overflow: hidden;
  ${({ isList }) => isList && glowingEffect}
`;

const Filters: React.FC = () => {
  const theme = useTheme();
  const { width } = useWindowSize();
  const { isList, setIsList } = useFiltersContext();
  const screenIsBig = width > BREAKPOINT_LANDSCAPE;

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
        <StyledListIcon
          isList={isList}
          isScreenBig={screenIsBig}
          onClick={() => {
            if (screenIsBig) {
              setIsList(true);
            }
          }}
        />
      </IconsContainer>
    </Container>
  );
};

export default Filters;

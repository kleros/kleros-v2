import React, { useState, useMemo } from "react";
import styled, { css } from "styled-components";

import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useNavigate, useParams } from "react-router-dom";

import { Card, DropdownCascader, Searchbar } from "@kleros/ui-components-library";

import { isUndefined } from "utils/index";

import { useCourtTree, rootCourtToItems } from "queries/useCourtTree";

import { isKlerosUniversity } from "src/consts";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { StyledSkeleton } from "components/StyledSkeleton";

import StakeMaintenanceButtons from "../StakeMaintenanceButton";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px 16px;
  flex-wrap: wrap;
`;

const StyledDropdownCascader = styled(DropdownCascader)`
  width: ${responsiveSize(200, 240)};
  > button {
    width: 100%;
  }
`;

const SearchBarContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: relative;
  ${landscapeStyle(
    () => css`
      flex: 1;
    `
  )}
`;

const StyledSearchbar = styled(Searchbar)`
  width: 100%;
  input {
    font-size: 16px;
    height: 45px;
    padding-top: 0px;
    padding-bottom: 0px;
  }
`;

const SearchResultsContainer = styled(OverlayScrollbarsComponent)`
  position: absolute;
  margin-top: 45px;
  max-height: 400px;
  border: 1px solid ${({ theme }) => theme.stroke};
  width: 100%;
  flex-direction: column;
  border-radius: 4px;
  overflow-y: auto;
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`;

const StyledCard = styled(Card)<{ selected: boolean; keyboardSelected: boolean }>`
  ${hoverShortTransitionTiming}
  height: auto;
  width: 100%;
  padding: ${({ selected, keyboardSelected }) => (selected || keyboardSelected ? "16px 13px" : "16px")};
  cursor: pointer;
  border: none;
  border-left: ${({ selected, keyboardSelected, theme }) =>
    selected || keyboardSelected ? `3px solid ${theme.primaryBlue}` : "none"};
  background-color: ${({ selected, keyboardSelected, theme }) =>
    selected || keyboardSelected ? theme.mediumBlue : "transparent"};
  border-radius: 0;

  :hover {
    background-color: ${({ theme }) => theme.mediumBlue};
  }
`;

const CourtParentSpan = styled.span`
  color: ${({ theme }) => theme.secondaryText}EE;
`;

const CourtNameSpan = styled.span`
  color: ${({ theme }) => theme.primaryText};
`;

function flattenCourts(court: any, parent: any = null) {
  const current = {
    ...court,
    parentName: parent?.name ?? null,
  };
  const children = (court.children || []).flatMap((child) => flattenCourts(child, current));
  return [current, ...children];
}

const TopSearch: React.FC = () => {
  const { data } = useCourtTree();
  const navigate = useNavigate();
  const { id: currentCourtId } = useParams();
  const items = useMemo(() => !isUndefined(data?.court) && [rootCourtToItems(data.court)], [data]);
  const isUniversity = isKlerosUniversity();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCourts = useMemo(() => {
    if (!data?.court) return [];
    const courts = flattenCourts(data.court).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    const selectedCourt = courts.find((c) => c.id === currentCourtId);
    if (!selectedCourt) return courts;

    return [selectedCourt, ...courts.filter((c) => c.id !== currentCourtId)];
  }, [data, search, currentCourtId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!search || filteredCourts.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCourts.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev - 1;
          return newIndex < 0 ? filteredCourts.length - 1 : newIndex;
        });
        break;
      case "Enter":
        navigate(`/courts/${filteredCourts[selectedIndex].id}`);
        setSearch("");
        setSelectedIndex(0);
        break;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelectedIndex(0);
  };

  const handleCourtClick = (courtId: string) => {
    navigate(`/courts/${courtId}`);
    setSearch("");
    setSelectedIndex(0);
  };

  return (
    <Container>
      {items ? (
        <>
          <StyledDropdownCascader
            items={items}
            onSelect={(path) => navigate(path.toString())}
            placeholder="Select Court"
          />
          <SearchBarContainer>
            <StyledSearchbar
              dir="auto"
              type="text"
              placeholder="Search"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            {search && filteredCourts.length > 0 && (
              <SearchResultsContainer>
                {filteredCourts.map((court, index) => (
                  <StyledCard
                    key={court.id}
                    selected={selectedIndex === 0 && court.id === currentCourtId}
                    keyboardSelected={index === selectedIndex}
                    onClick={() => handleCourtClick(court.id)}
                  >
                    {court.parentName && <CourtParentSpan>{court.parentName} / </CourtParentSpan>}
                    <CourtNameSpan>{court.name}</CourtNameSpan>
                  </StyledCard>
                ))}
              </SearchResultsContainer>
            )}
          </SearchBarContainer>
        </>
      ) : (
        <StyledSkeleton width={240} height={42} />
      )}
      {isUniversity ? null : <StakeMaintenanceButtons />}
    </Container>
  );
};

export default TopSearch;

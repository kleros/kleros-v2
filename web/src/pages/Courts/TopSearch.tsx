import React, { useState, useMemo } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Card, DropdownCascader, Searchbar } from "@kleros/ui-components-library";
import { isUndefined } from "utils/index";
import { useCourtTree, rootCourtToItems } from "queries/useCourtTree";
import { responsiveSize } from "styles/responsiveSize";
import { landscapeStyle } from "styles/landscapeStyle";
import { StyledSkeleton } from "components/StyledSkeleton";
import StakeMaintenanceButtons from "./StakeMaintenanceButton";
import { isKlerosUniversity } from "src/consts";

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

const SearchResultsContainer = styled.div`
  position: absolute;
  margin-top: 45px;
  max-height: 400px;
  width: 100%;
  flex-direction: column;
  border-radius: 4px;
  overflow-y: auto;
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
`;

const StyledCard = styled(Card)`
  height: auto;
  width: 100%;
  padding: 16px;
  color: ${({ theme }) => theme.primaryText};
  cursor: pointer;
`;

function flattenCourts(court) {
  return court ? [court, ...(court.children || []).flatMap(flattenCourts)] : [];
}

const TopSearch: React.FC = () => {
  const { data } = useCourtTree();
  const navigate = useNavigate();
  const items = useMemo(() => !isUndefined(data) && [rootCourtToItems(data.court)], [data]);
  const isUniversity = isKlerosUniversity();
  const [search, setSearch] = useState("");
  const filteredCourts = useMemo(
    () =>
      data?.court ? flattenCourts(data.court).filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : [],
    [data, search]
  );

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
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && filteredCourts.length > 0 && (
              <SearchResultsContainer>
                {filteredCourts.map((court) => (
                  <StyledCard
                    hover
                    key={court.id}
                    onClick={() => {
                      navigate(`/courts/${court.id}`);
                      setSearch("");
                    }}
                  >
                    {court.name}
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

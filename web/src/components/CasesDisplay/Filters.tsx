import React from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { DropdownSelect } from "@kleros/ui-components-library";
import { useIsList } from "context/IsListProvider";
import useIsDesktop from "hooks/useIsDesktop";
import ListIcon from "svgs/icons/list.svg";
import GridIcon from "svgs/icons/grid.svg";
import { decodeURIFilter, encodeURIFilter, useRootPath } from "utils/uri";

const Container = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
  width: fit-content;
`;

const StyledGridIcon = styled(GridIcon)`
  cursor: pointer;
  transition: filter 0.2s ease;
  fill: ${({ theme }) => theme.primaryBlue};
  width: 16px;
  height: 16px;
  overflow: hidden;
`;

const IconsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;

const StyledListIcon = styled(ListIcon)`
  cursor: pointer;
  transition: filter 0.2s ease;
  fill: ${({ theme }) => theme.primaryBlue};
  width: 16px;
  height: 16px;
  overflow: hidden;
`;

const Filters: React.FC = () => {
  const theme = useTheme();
  const { order, filter } = useParams();
  const { ruled, period, ...filterObject } = decodeURIFilter(filter ?? "all");
  const navigate = useNavigate();
  const location = useRootPath();

  const handleStatusChange = (value: string | number) => {
    const parsedValue = JSON.parse(value as string);
    const encodedFilter = encodeURIFilter({ ...filterObject, ...parsedValue });
    navigate(`${location}/1/${order}/${encodedFilter}`);
  };

  const handleOrderChange = (value: string | number) => {
    const encodedFilter = encodeURIFilter({ ruled, period, ...filterObject });
    navigate(`${location}/1/${value}/${encodedFilter}`);
  };

  const { isList, setIsList } = useIsList();
  const isDesktop = useIsDesktop();

  return (
    <Container>
      <DropdownSelect
        smallButton
        simpleButton
        items={[
          { value: JSON.stringify({}), text: "All Cases", dot: theme.primaryText },
          { value: JSON.stringify({ ruled: false }), text: "In Progress", dot: theme.primaryBlue },
          { value: JSON.stringify({ period: "appeal" }), text: "Appeal", dot: theme.tint },
          { value: JSON.stringify({ ruled: true }), text: "Closed", dot: theme.primaryPurple },
        ]}
        defaultValue={JSON.stringify({ ruled, period })}
        callback={handleStatusChange}
      />
      <DropdownSelect
        smallButton
        simpleButton
        items={[
          { value: "desc", text: "Newest" },
          { value: "asc", text: "Oldest" },
        ]}
        defaultValue={order}
        callback={handleOrderChange}
      />
      {isDesktop ? (
        <IconsContainer>
          {isList ? (
            <StyledGridIcon onClick={() => setIsList(false)} />
          ) : (
            <StyledListIcon
              onClick={() => {
                if (isDesktop) {
                  setIsList(true);
                }
              }}
            />
          )}
        </IconsContainer>
      ) : null}
    </Container>
  );
};

export default Filters;

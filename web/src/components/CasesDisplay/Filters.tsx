import React from "react";
import styled, { useTheme } from "styled-components";
import { DropdownSelect } from "@kleros/ui-components-library";
import { useFiltersContext } from "~src/context/FilterProvider";

const Container = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
  width: fit-content;
`;

const Filters: React.FC = () => {
  const theme = useTheme();
  const { setTimeFilter, setStatusFilter } = useFiltersContext();

  const handleStatusChange = (value: string | number) => {
    setStatusFilter(Number(value));
  };

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
        callback={handleStatusChange}
      />
      <DropdownSelect
        smallButton
        simpleButton
        items={[
          { value: 0, text: "Newest" },
          { value: 1, text: "Oldest" },
        ]}
        defaultValue={0}
        callback={setTimeFilter}
      />
    </Container>
  );
};

export default Filters;

import React from "react";
import styled, { useTheme } from "styled-components";
import { DropdownSelect } from "@kleros/ui-components-library";

const Container = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
  width: fit-content;
`;

const Filters: React.FC = () => {
  const theme = useTheme();
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
    </Container>
  );
};

export default Filters;

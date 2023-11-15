import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Breadcrumb } from "@kleros/ui-components-library";

const Container = styled.div`
  width: 100%;
  justify-content: flex-start;

  small {
    height: 100%;
    font-weight: 600;
  }

  ${landscapeStyle(
    () =>
      css`
        width: auto;
      `
  )}
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  display: flex;
  align-items: center;
  height: 100%;
`;

interface ICourtName {
  name: string;
}

const CourtName: React.FC<ICourtName> = ({ name }) => {
  return (
    <Container>
      <StyledBreadcrumb items={[{ text: name, value: 0 }]} />
    </Container>
  );
};
export default CourtName;

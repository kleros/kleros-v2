import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Breadcrumb } from "@kleros/ui-components-library";

const CourtName = styled.div`
  small {
    height: 100%;
  }

  ${landscapeStyle(() => css``)}
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  display: flex;
  align-items: center;
  height: 100%;
`;

interface ICourtBranch {
  name: string;
}

const CourtBranch: React.FC<ICourtBranch> = ({ name }) => {
  return (
    <CourtName>
      <StyledBreadcrumb items={[{ text: name, value: 0 }]} />
    </CourtName>
  );
};
export default CourtBranch;

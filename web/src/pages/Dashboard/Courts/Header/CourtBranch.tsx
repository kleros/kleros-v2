import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

const CourtName = styled.div`
  width: 100%;

  ${landscapeStyle(() => css``)}
`;

const CourtBranch: React.FC = () => {
  return (
    <CourtName>
      <label>Court Name</label>
    </CourtName>
  );
};
export default CourtBranch;

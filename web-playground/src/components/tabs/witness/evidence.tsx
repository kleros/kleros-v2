import React from "react";
import styled from "styled-components";
import { Textarea } from "@kleros/ui-components-library";
import Title from "../../title";

const Wrapper = styled.div`
  height: auto;
  width: auto;
  display: flex;
  align-items: flex-start;
`;

const StyledTitle = styled(Title)`
  width: 200px;
  margin-top: 0;
`;

const DisputeID = () => (
  <Wrapper>
    <StyledTitle>Evidence:</StyledTitle>
    <Textarea placeholder="Evidence explanation..." />
  </Wrapper>
);

export default DisputeID;

import React from "react";
import styled from "styled-components";
import { DropdownSelect } from "@kleros/ui-components-library";
import Title from "./title";

const Wrapper = styled.div`
  height: auto;
  width: auto;
  display: flex;
  align-items: center;
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

const StyledDropdown = styled(DropdownSelect)`
  width: 210px;
  input {
    padding: 0 16px;
  }
`;

interface IDisputeID {
  items: { text: string; value: any }[];
  callback: (value: any) => void;
}

const DisputeID: React.FC<IDisputeID> = ({ items, callback }) => {
  return (
    <Wrapper>
      <StyledTitle>DisputeID:</StyledTitle>
      <StyledDropdown simpleButton {...{ items, callback }} />
    </Wrapper>
  );
};

export default DisputeID;

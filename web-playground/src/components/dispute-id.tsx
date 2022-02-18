import React from "react";
import styled from "styled-components";
import { DropdownSelect } from "@kleros/ui-components-library";

const Wrapper = styled.div`
  height: auto;
  width: auto;
  display: flex;
  align-items: center;
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
      <StyledDropdown
        simpleButton
        placeholder={{ text: "DisputeID" }}
        {...{ items, callback }}
      />
    </Wrapper>
  );
};

export default DisputeID;

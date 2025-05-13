import React from "react";

import styled from "styled-components";

import DocIcon from "svgs/icons/doc.svg";

import { BlueIconTextButtonContainer } from "./BlueIconTextButtonContainer";
import { InternalLink } from "./InternalLink";

const StyledDocIcon = styled(DocIcon)`
  width: 16px;
  height: 16px;
`;

const AllCasesButton: React.FC = () => {
  return (
    <InternalLink to={"/cases/display/1/desc/all"}>
      <BlueIconTextButtonContainer>
        <StyledDocIcon />
        <label>All Cases</label>
      </BlueIconTextButtonContainer>
    </InternalLink>
  );
};

export default AllCasesButton;

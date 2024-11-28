import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import { Link } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import Bookmark from "svgs/icons/bookmark.svg";

const StyledHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0 12px;
  margin-bottom: ${responsiveSize(16, 0)};
`;

const StyledH1 = styled.h1`
  font-size: ${responsiveSize(21, 24)};
`;

const Header: React.FC = () => {
  return (
    <StyledHeader>
      <StyledH1>Court Overview</StyledH1>
      <Link to={"/resolver"}>
        <Button small Icon={Bookmark} text="Create a Case" />
      </Link>
    </StyledHeader>
  );
};

export default Header;

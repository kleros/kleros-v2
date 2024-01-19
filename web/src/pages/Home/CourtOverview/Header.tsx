import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import Bookmark from "svgs/icons/bookmark.svg";
import { useNavigate } from "react-router-dom";
import { responsiveSize } from "styles/responsiveSize";

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledH1 = styled.h1`
  font-size: ${responsiveSize(21, 24)};
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  return (
    <StyledHeader>
      <StyledH1>Court Overview</StyledH1>
      <Button small Icon={Bookmark} text="Create a Case" onClick={() => navigate("/resolver")} />
    </StyledHeader>
  );
};

export default Header;

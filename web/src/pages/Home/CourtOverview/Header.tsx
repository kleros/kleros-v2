import React from "react";
import styled from "styled-components";

import { Button } from "@kleros/ui-components-library";

import Bookmark from "svgs/icons/bookmark.svg";

import { isMaintenanceMode } from "consts/index";

import { responsiveSize } from "styles/responsiveSize";

import { InternalLink } from "components/InternalLink";

const StyledHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  margin-bottom: ${responsiveSize(12, 20)};
`;

const StyledH1 = styled.h1`
  font-size: ${responsiveSize(20, 24)};
  margin: 0;
`;

const StyledInternalLink = styled(InternalLink)`
  height: 34px;
`;

const Header: React.FC = () => {
  const maintenanceMode = isMaintenanceMode();

  return (
    <StyledHeader>
      <StyledH1>Court Overview</StyledH1>
      <StyledInternalLink to={maintenanceMode ? "#" : "/resolver"}>
        <Button small Icon={Bookmark} text="Create a Case" disabled={maintenanceMode} />
      </StyledInternalLink>
    </StyledHeader>
  );
};

export default Header;

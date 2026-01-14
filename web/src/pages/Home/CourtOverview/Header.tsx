import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { Button } from "@kleros/ui-components-library";

import Bookmark from "svgs/icons/bookmark.svg";

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
  const { t } = useTranslation();

  return (
    <StyledHeader>
      <StyledH1>{t("misc.court_overview")}</StyledH1>
      <StyledInternalLink to={"/resolver"}>
        <Button small Icon={Bookmark} text={t("buttons.create_a_case")} />
      </StyledInternalLink>
    </StyledHeader>
  );
};

export default Header;

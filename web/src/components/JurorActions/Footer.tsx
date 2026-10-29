import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { useAtlasProvider } from "@kleros/kleros-app";

import NotificationsIcon from "svgs/menu-icons/notifications.svg";

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.stroke};
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  line-height: 20px;

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  &:hover {
    color: ${({ theme }) => theme.secondaryBlue};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primaryBlue};
    outline-offset: 2px;
  }
`;

/** The juror already gets Atlas emails. Unknown, so false, until they sign in to Atlas. */
export const useHasEmailReminders = () => useAtlasProvider().user?.isEmailVerified === true;

/** Opens Settings › Notifications, like the links in Atlas emails. */
export const RemindersLink: React.FC<{ onClick?: React.MouseEventHandler<HTMLAnchorElement> }> = ({ onClick }) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  return (
    <StyledLink to={{ search, hash: "#notifications" }} {...{ onClick }}>
      <NotificationsIcon aria-hidden />
      {t("juror_actions.get_reminders")}
    </StyledLink>
  );
};

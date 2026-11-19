import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import CloseIcon from "svgs/icons/close.svg";

import { useJurorActions } from "hooks/useJurorActions";

import { responsiveSize } from "styles/responsiveSize";

import ActionList from "components/JurorActions/ActionList";
import { Footer, RemindersLink, useHasEmailReminders } from "components/JurorActions/Footer";
import Header, { IconButton } from "components/JurorActions/Header";
import { SrOnly } from "components/SrOnly";

import { useDismissal } from "./useDismissal";

const VISIBLE_ROWS = 3;

const Container = styled.section`
  margin-bottom: ${responsiveSize(24, 32)};
  padding: ${responsiveSize(16, 24)} ${responsiveSize(16, 24)} 12px;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-left: 5px solid ${({ theme }) => theme.primaryBlue};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.whiteBackground};
  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}
`;

const TextButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.primaryBlue};

  &:hover {
    color: ${({ theme }) => theme.secondaryBlue};
  }

  &[aria-disabled="true"] {
    cursor: default;
    color: ${({ theme }) => theme.secondaryText};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.primaryBlue};
    outline-offset: 2px;
  }
`;

const ErrorMessage = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  margin: 0 0 ${responsiveSize(24, 32)};
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.secondaryText};
`;

const JurorActionsBanner: React.FC<{ juror: string }> = ({ juror }) => {
  const { t } = useTranslation();
  const { actions, dueActions, isError, isRetrying, retry, isIndicatorVisible } = useJurorActions();
  const { isDismissed, dismiss } = useDismissal(juror, dueActions);
  const hasEmailReminders = useHasEmailReminders();
  const [isExpanded, setIsExpanded] = useState(false);
  // `id` remounts the message, so the same text twice is announced twice.
  const [announcement, setAnnouncement] = useState({ id: 0, text: "" });
  const isRetryingByUser = useRef(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const listId = useId();

  const isVisible = !!actions?.length && !isDismissed;
  const isCollapsible = !!actions && actions.length > VISIBLE_ROWS;
  const announce = useCallback((text: string) => setAnnouncement(({ id }) => ({ id: id + 1, text })), []);

  // Changes to the list are announced on every page by the header's announcer.
  useEffect(() => {
    if (isError) announce(t("juror_actions.load_error"));
  }, [isError, announce, t]);

  // A successful retry removes the focused Retry button: keep focus in the banner.
  useEffect(() => {
    if (!actions || !isRetryingByUser.current) return;
    isRetryingByUser.current = false;
    if (document.activeElement === document.body)
      (headingRef.current ?? regionRef.current)?.focus({ preventScroll: true });
  }, [actions]);

  // A retry that failed: a later background success must not take the focus.
  useEffect(() => {
    if (!isRetrying && !actions) isRetryingByUser.current = false;
  }, [isRetrying, actions]);

  const handleDismiss = () => {
    dismiss();
    const countStays = isIndicatorVisible ? ` ${t("juror_actions.announce_count_in_header")}` : "";
    announce(`${t("juror_actions.announce_dismissed")}${countStays}`);
    regionRef.current?.focus({ preventScroll: true });
  };

  const handleRetry = () => {
    if (isRetrying) return;
    isRetryingByUser.current = true;
    retry();
  };

  return (
    <>
      <SrOnly role="status">
        <span key={announcement.id}>{announcement.text}</span>
      </SrOnly>
      {/* Always mounted while connected: where focus lands after dismissing. */}
      <div ref={regionRef} tabIndex={-1}>
        {isError ? (
          <ErrorMessage>
            {t("juror_actions.load_error")}
            {/* aria-disabled, not disabled: the button keeps the focus while a retry runs. */}
            <TextButton type="button" aria-disabled={isRetrying} onClick={handleRetry}>
              {t("juror_actions.retry")}
            </TextButton>
          </ErrorMessage>
        ) : null}
        {isVisible && actions ? (
          <Container aria-labelledby={headingId}>
            <Header headingAs="h1" {...{ headingId, headingRef, actions }}>
              <IconButton
                type="button"
                aria-label={t("juror_actions.dismiss")}
                title={t("juror_actions.dismiss_hint")}
                onClick={handleDismiss}
              >
                <CloseIcon aria-hidden />
              </IconButton>
            </Header>
            <ActionList id={listId} actions={isExpanded ? actions : actions.slice(0, VISIBLE_ROWS)} />
            {isCollapsible || !hasEmailReminders ? (
              <Footer>
                {isCollapsible ? (
                  <TextButton
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={listId}
                    onClick={() => setIsExpanded((expanded) => !expanded)}
                  >
                    {isExpanded ? t("juror_actions.show_less") : t("juror_actions.show_all", { count: actions.length })}
                  </TextButton>
                ) : null}
                {hasEmailReminders ? null : <RemindersLink />}
              </Footer>
            ) : null}
          </Container>
        ) : null}
      </div>
    </>
  );
};

/** The connected juror's due commits, votes and reveals. Renders nothing while loading or when nothing is due. */
const JurorActions: React.FC = () => {
  const { address } = useAccount();
  // One instance per account, so dismissal and announcements never carry over to another juror.
  return address ? <JurorActionsBanner key={address} juror={address} /> : null;
};

export default JurorActions;

import React, { useEffect, useId, useRef } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import CloseIcon from "svgs/icons/close.svg";

import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import type { JurorAction } from "utils/jurorActions";

import { customScrollbar } from "styles/customScrollbar";
import { landscapeStyle } from "styles/landscapeStyle";

import ActionList from "components/JurorActions/ActionList";
import { Footer, RemindersLink, useHasEmailReminders } from "components/JurorActions/Footer";
import Header, { IconButton } from "components/JurorActions/Header";
import { Overlay } from "components/Overlay";

import { PopupAnchor, PopupAnchorInner } from "./PopupAnchor";

// Replaces react-modal's classes, so the global modal backdrop gives way to the header popups' Overlay.
const NO_CLASS_NAMES = { base: "", afterOpen: "", beforeClose: "" };

// Above the header popups' OverlayPortal (9999), like the app's other react-modal dialogs.
const StyledOverlay = styled(Overlay)`
  z-index: 10000;
`;

const Empty = styled.p`
  margin: 0;
  padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.stroke};
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
`;

// Below the header: full width on mobile, under its right side on desktop like Settings and Help.
const Panel = styled.div`
  position: absolute;
  top: 64px;
  left: 16px;
  right: 16px;
  max-height: calc(100vh - 80px);
  max-height: calc(100dvh - 80px);
  overflow-y: auto;
  padding: 16px 16px 12px;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.06);
  ${customScrollbar}

  ${landscapeStyle(
    () => css`
      left: auto;
      right: 0;
      width: 440px;
    `
  )}
`;

interface IJurorActionsPopup {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onAfterClose: () => void;
  actions: readonly JurorAction[];
}

// A modified click opens the link in a new tab: the list stays open here.
const isPlainClick = (event: React.MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/** The juror's due actions over the current page. A dialog: focus stays inside, Escape closes it. */
const JurorActionsPopup: React.FC<IJurorActionsPopup> = ({ id, isOpen, onClose, onAfterClose, actions }) => {
  const { t } = useTranslation();
  const headingId = useId();
  const hasEmailReminders = useHasEmailReminders();
  const panelRef = useRef<HTMLDivElement | null>(null);
  useLockOverlayScroll(isOpen);

  // A focused row can go away while open (sent from another tab, commit turning into reveal). Focus then drops to
  // the page, out of reach of Escape and the focus trap: bring it back to the dialog.
  useEffect(() => {
    if (isOpen && document.activeElement === document.body) panelRef.current?.focus({ preventScroll: true });
  }, [isOpen, actions]);

  return (
    <Modal
      {...{ id, isOpen }}
      onRequestClose={onClose}
      {...{ onAfterClose }}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      aria={{ labelledby: headingId }}
      contentRef={(panel) => {
        panelRef.current = panel;
      }}
      overlayClassName={NO_CLASS_NAMES}
      className={NO_CLASS_NAMES}
      overlayElement={(props, content) => (
        <StyledOverlay {...props}>
          <PopupAnchor>
            <PopupAnchorInner>{content}</PopupAnchorInner>
          </PopupAnchor>
        </StyledOverlay>
      )}
      contentElement={(props, children) => <Panel {...props}>{children}</Panel>}
    >
      <Header headingAs="h2" {...{ headingId, actions }}>
        <IconButton type="button" aria-label={t("buttons.close")} onClick={onClose}>
          <CloseIcon aria-hidden />
        </IconButton>
      </Header>
      {/* Stays open when the last action goes away (period passed, vote indexed) instead of vanishing mid-use. */}
      {actions.length > 0 ? (
        <ActionList {...{ actions }} isCompact onLinkClick={(event) => isPlainClick(event) && onClose()} />
      ) : (
        <Empty>{t("juror_actions.nothing_due")}</Empty>
      )}
      {hasEmailReminders ? null : (
        <Footer>
          <RemindersLink onClick={(event) => isPlainClick(event) && onClose()} />
        </Footer>
      )}
    </Modal>
  );
};

export default JurorActionsPopup;

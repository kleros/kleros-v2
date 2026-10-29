import React, { useEffect, useId, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAccount } from "wagmi";

import HourglassIcon from "svgs/icons/hourglass.svg";
import BallotIcon from "svgs/icons/voted-ballot.svg";

import { useJurorActions } from "hooks/useJurorActions";

import { BREAKPOINT_LANDSCAPE } from "styles/landscapeStyle";

import JurorActionsPopup from "./JurorActionsPopup";

const Trigger = styled.button<{ $isUrgent: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  align-self: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 300px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.white};
  background-color: ${({ theme }) => theme.whiteLowOpacityStrong};
  transition:
    background-color 0.1s,
    color 0.1s;

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  &:hover {
    background-color: ${({ theme }) => theme.white}40;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.white};
    outline-offset: 2px;
  }

  ${({ $isUrgent, theme }) =>
    $isUrgent &&
    css`
      color: ${theme.black};
      background-color: ${theme.warning};

      &:hover {
        background-color: ${theme.warning}CC;
      }
    `}
`;

// An hourglass next to a bare number reads like time left, not a count of cases. Hidden only where the header has
// no room: the narrowest phones (against the logo) and the narrowest desktops (against the nav).
const Label = styled.span`
  @media (max-width: 359px), (min-width: ${BREAKPOINT_LANDSCAPE}px) and (max-width: 999px) {
    display: none;
  }
`;

/**
 * Count of the juror's due commits, votes and reveals, opening the list of them.
 * Hidden when nothing is due, and on another network, where switching is the one thing to do.
 */
const JurorActionsIndicator: React.FC<{ onOpen?: () => void }> = ({ onOpen }) => {
  const { t } = useTranslation();
  const { pathname, search, hash } = useLocation();
  const { address } = useAccount();
  const { actions, dueActions, urgentCount, isIndicatorVisible } = useJurorActions();
  const [isOpen, setIsOpen] = useState(false);
  // From opening until focus leaves the pill after closing: the list must not vanish mid-use, and the pill must
  // still be there to take the focus back, even once nothing is due.
  const [isPinned, setIsPinned] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupId = useId();

  // Going to another page closes it. Its links close it themselves, also when they point to the page shown.
  useEffect(() => setIsOpen(false), [pathname, search, hash, address]);

  if (!isOpen && !isPinned && !isIndicatorVisible) return null;

  const isUrgent = urgentCount > 0;
  const urgent = t("juror_actions.urgent_count", { count: urgentCount });
  const due = `${dueActions.length} ${t("juror_actions.pill_label")}`;
  // Starts with the visible text, so voice control users can say what they see.
  const name = isUrgent ? t("juror_actions.due_and_urgent", { due, urgent }) : due;
  const Icon = isUrgent ? HourglassIcon : BallotIcon;

  return (
    <>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popupId : undefined}
        aria-label={name}
        title={name}
        $isUrgent={isUrgent}
        onClick={() => {
          onOpen?.();
          setIsPinned(true);
          setIsOpen(true);
        }}
        onBlur={() => {
          if (!isOpen) setIsPinned(false);
        }}
      >
        <Icon aria-hidden />
        {dueActions.length}
        <Label>{t("juror_actions.pill_label")}</Label>
      </Trigger>
      <JurorActionsPopup
        id={popupId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        // After react-modal returns the focus: unpin unless it came back here (Safari clicks don't focus buttons).
        onAfterClose={() => {
          if (document.activeElement !== triggerRef.current) setIsPinned(false);
        }}
        actions={actions ?? []}
      />
    </>
  );
};

export default JurorActionsIndicator;

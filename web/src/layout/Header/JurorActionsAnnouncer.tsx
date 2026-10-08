import React, { useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { useJurorActions } from "hooks/useJurorActions";
import { getJurorActionChanges, type JurorAction } from "utils/jurorActions";

import { SrOnly } from "components/SrOnly";

const Announcer: React.FC = () => {
  const { t } = useTranslation();
  const { actions, dueActions, isError } = useJurorActions();
  // `id` remounts the message, so the same text twice is announced twice.
  const [announcement, setAnnouncement] = useState({ id: 0, text: "" });
  const previousDueActions = useRef<readonly JurorAction[]>();
  const hadError = useRef(false);

  useEffect(() => {
    if (isError) hadError.current = true;
  }, [isError]);

  // Rows added, removed or turning urgent, never the countdown ticks. The first load only after an error.
  useEffect(() => {
    if (!actions) return;
    const previous = previousDueActions.current ?? (hadError.current ? [] : undefined);
    previousDueActions.current = dueActions;
    if (!previous) return;
    const { added, becameUrgent, removed } = getJurorActionChanges(previous, dueActions);
    const messages = [
      ...added.map(({ disputeId }) => t("juror_actions.announce_added", { id: disputeId })),
      ...becameUrgent.map(({ disputeId }) => t("juror_actions.announce_urgent", { id: disputeId })),
      ...removed.map(({ disputeId }) => t("juror_actions.announce_removed", { id: disputeId })),
    ];
    if (messages.length > 0) setAnnouncement(({ id }) => ({ id: id + 1, text: messages.join(". ") }));
  }, [actions, dueActions, t]);

  // Outside the app root, which dialogs hide from screen readers while open, like the juror actions list.
  return createPortal(
    <SrOnly role="status">
      <span key={announcement.id}>{announcement.text}</span>
    </SrOnly>,
    document.body
  );
};

/** Tells screen reader users, on any page, when a case starts or stops needing their vote. */
const JurorActionsAnnouncer: React.FC = () => {
  const { address } = useAccount();
  // One instance per account, so another juror's list never counts as changes.
  return address ? <Announcer key={address} /> : null;
};

export default JurorActionsAnnouncer;

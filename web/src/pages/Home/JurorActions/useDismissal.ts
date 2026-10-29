import { useCallback, useState } from "react";

import { getDismissal, isDismissed, type JurorAction, type JurorActionsDismissal } from "utils/jurorActions";

const readDismissal = (storageKey: string): JurorActionsDismissal | undefined => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    return Array.isArray(stored?.keys) && Array.isArray(stored?.urgentKeys) ? stored : undefined;
  } catch {
    return undefined;
  }
};

/** Remembers, per juror, which due actions the banner was dismissed for. */
export const useDismissal = (juror: string, dueActions: readonly JurorAction[]) => {
  const storageKey = `jurorActionsDismissal-${juror.toLowerCase()}`;
  const [dismissal, setDismissal] = useState(() => readDismissal(storageKey));

  const dismiss = useCallback(() => {
    const next = getDismissal(dueActions);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage unavailable: dismissed until the page reloads.
    }
    setDismissal(next);
  }, [dueActions, storageKey]);

  return { isDismissed: isDismissed(dismissal, dueActions), dismiss };
};

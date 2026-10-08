import { useSyncExternalStore } from "react";

import { getCurrentTime } from "utils/date";
import type { JurorActionKind } from "utils/jurorActions";

const STORAGE_KEY = "jurorActionSubmissions";
const MAX_AGE = 24 * 60 * 60;

/**
 * Block that included the commit, vote or reveal: compared with the chain's blocks, not the device clock.
 * `at` is only for pruning.
 */
interface Submission {
  block: string;
  at: number;
}
type Submissions = Record<string, Submission>;

const isSubmission = (value: unknown): value is Submission =>
  /^\d+$/.test(String((value as Submission)?.block)) && typeof (value as Submission)?.at === "number";

const listeners = new Set<() => void>();
let submissions: Submissions | undefined;

const readStoredSubmissions = (): Submissions => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    return Object.fromEntries(Object.entries(stored ?? {}).filter(([, value]) => isSubmission(value))) as Submissions;
  } catch {
    return {};
  }
};

const readSubmissions = () => {
  if (!submissions) submissions = readStoredSubmissions();
  return submissions;
};

const notify = () => listeners.forEach((listener) => listener());

// An action sent from another tab (e.g. a case opened in a new tab): show it as confirming here too.
const onStorage = (event: StorageEvent) => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  submissions = readStoredSubmissions();
  notify();
};

const subscribe = (listener: () => void) => {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
};

export const getSubmissionKey = (juror: string, disputeId: string, kind: JurorActionKind) =>
  `${juror.toLowerCase()}-${disputeId}-${kind}`;

/** Remembers, for a day and in every tab, that the juror sent an action the subgraph may not have indexed yet. */
export const markJurorActionSubmitted = (
  juror: string,
  disputeId: bigint | string,
  kind: JurorActionKind,
  block: bigint
) => {
  const now = getCurrentTime();
  // Read storage again: another tab may have written since, unseen if nothing here was listening.
  const latest = { ...readSubmissions(), ...readStoredSubmissions() };
  const recent = Object.entries(latest).filter(([, { at }]) => now - at < MAX_AGE);
  submissions = {
    ...Object.fromEntries(recent),
    [getSubmissionKey(juror, disputeId.toString(), kind)]: { block: block.toString(), at: now },
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch {
    // Storage unavailable: still remembered until the page reloads.
  }
  notify();
};

export const useJurorActionSubmissions = () => useSyncExternalStore(subscribe, readSubmissions);

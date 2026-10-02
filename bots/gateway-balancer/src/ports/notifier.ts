import type { Notification } from "../domain";

/**
 * Provider-independent notifications. The platform's implementation applies severity filters, per-provider
 * toggles and journal-backed deduplication, and logs every notification durably even when no provider is enabled.
 */
export interface Notifier {
  notify(notification: Notification): Promise<void>;
}

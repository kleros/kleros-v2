import type { Notification } from "../domain";
import type { Notifier } from "../ports";

export class FakeNotifier implements Notifier {
  readonly sent: Notification[] = [];

  async notify(notification: Notification): Promise<void> {
    this.sent.push({ ...notification });
  }

  bySeverity(severity: Notification["severity"]): Notification[] {
    return this.sent.filter((n) => n.severity === severity);
  }
}

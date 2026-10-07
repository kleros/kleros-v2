import type { Topology } from "../../config/schema";
import type { Notification, Severity } from "../../domain";
import type { NotificationProvider } from "./notifier";

const ICON: Record<Severity, string> = {
  info: ":information_source:",
  warning: ":warning:",
  critical: ":rotating_light:",
};

/** Explorer links for the notification's transactions, from the chain's `explorerTxUrl` template. */
export function explorerLinks(topology: Topology, notification: Notification): string[] {
  const chain = topology.chains.find((c) => c.id === notification.chainId);
  if (!chain?.explorerTxUrl) return [];
  return (notification.txHashes ?? []).map((hash) => chain.explorerTxUrl!.replace("{hash}", hash));
}

/** The Slack message for a (redacted) notification: title, body, context fields, links and the operator action. */
export function slackPayload(topology: Topology, notification: Notification): Record<string, unknown> {
  const chain = topology.chains.find((c) => c.id === notification.chainId);
  const fields: string[] = [];
  if (notification.pairId) fields.push(`*Pair:* ${notification.pairId}`);
  if (notification.routeId) fields.push(`*Route:* ${notification.routeId}`);
  if (notification.chainId !== undefined) {
    fields.push(`*Chain:* ${chain ? `${chain.name} (${chain.id})` : notification.chainId}`);
  }
  if (notification.operationId) fields.push(`*Operation:* ${notification.operationId}`);
  const links = explorerLinks(topology, notification);
  const hashes = notification.txHashes ?? [];
  const txLines = links.length ? links.map((l) => `<${l}>`) : hashes;
  const title = `${ICON[notification.severity]} [${notification.severity.toUpperCase()}] ${notification.title}`;
  const blocks: Array<Record<string, unknown>> = [
    { type: "header", text: { type: "plain_text", text: title.slice(0, 150) } },
    { type: "section", text: { type: "mrkdwn", text: notification.body || "(no details)" } },
  ];
  if (fields.length) blocks.push({ type: "section", fields: fields.map((text) => ({ type: "mrkdwn", text })) });
  if (txLines.length) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Transactions:*\n${txLines.join("\n")}` } });
  }
  if (notification.action) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Action:* ${notification.action}` } });
  }
  return { text: `${title}\n${notification.body}`, blocks };
}

export class SlackProvider implements NotificationProvider {
  readonly name = "slack";

  constructor(
    readonly enabled: boolean,
    readonly minSeverity: Severity,
    private readonly webhookUrl: string | null,
    private readonly topology: Topology,
    private readonly fetch: typeof globalThis.fetch
  ) {}

  async send(notification: Notification): Promise<void> {
    if (!this.webhookUrl) throw new Error("no webhook URL configured");
    let response: Response;
    try {
      response = await this.fetch(this.webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(slackPayload(this.topology, notification)),
      });
    } catch (error) {
      // Never surface the transport's message: it may quote the webhook URL.
      throw new Error(`request failed (${error instanceof Error ? error.name : "error"})`);
    }
    if (!response.ok) throw new Error(`Slack responded ${response.status}`);
  }
}

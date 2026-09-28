import { getStore } from "@netlify/blobs";

type Connection = { address: string; timestamp: string };

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { address, timestamp } = await req.json().catch(() => ({}));
  const time = new Date(timestamp);
  if (
    typeof address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(address) ||
    typeof timestamp !== "number" ||
    isNaN(time.getTime())
  ) {
    return new Response("Expected { address, timestamp }", { status: 400 });
  }

  // One key per wallet, so concurrent calls from different wallets never write the same key.
  const key = address.toLowerCase();
  const store = getStore({ name: "connected-wallets", consistency: "strong" });
  const existing: Connection | null = await store.get(key, { type: "json" });
  if (!existing || Date.parse(existing.timestamp) < timestamp) {
    await store.setJSON(key, { address, timestamp: time.toISOString() });
  }
  return new Response(null, { status: 204 });
};

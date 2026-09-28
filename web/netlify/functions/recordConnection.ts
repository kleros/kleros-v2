import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { address, timestamp } = await req.json().catch(() => ({}));
  if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address) || typeof timestamp !== "number") {
    return new Response("Expected { address, timestamp }", { status: 400 });
  }

  // One key per connection: Blobs has no locking, so concurrent writes to a shared list key would lose entries.
  const key = `${address.toLowerCase()}/${timestamp}-${crypto.randomUUID()}`;
  await getStore("wallet-connections").setJSON(key, { address, timestamp });
  return new Response(null, { status: 204 });
};

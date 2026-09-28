import { getStore } from "@netlify/blobs";

type Connection = { address: string; timestamp: string };

export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const store = getStore("connected-wallets");
  const { blobs } = await store.list();
  const connections: (Connection | null)[] = await Promise.all(
    blobs.map(({ key }) => store.get(key, { type: "json" }))
  );

  return Response.json(
    connections
      .filter((c): c is Connection => c !== null)
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  );
};

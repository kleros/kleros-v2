import { getStore } from "@netlify/blobs";

type Connection = { address: string; timestamp: number };

export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const store = getStore("wallet-connections");
  const { blobs } = await store.list();
  const connections: (Connection | null)[] = await Promise.all(
    blobs.map(({ key }) => store.get(key, { type: "json" }))
  );

  return Response.json(
    connections.filter((c): c is Connection => c !== null).sort((a, b) => a.timestamp - b.timestamp)
  );
};

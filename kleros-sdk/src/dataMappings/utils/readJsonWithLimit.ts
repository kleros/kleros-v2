import { RequestError } from "../../errors";

// Counts bytes after fetch has applied Content-Encoding, so the limit holds for compressed responses too.
export const readJsonWithLimit = async (response: Response, maxBytes: number, endpoint: string): Promise<unknown> => {
  if (!response.body) return response.json();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RequestError("Response size is too large", endpoint);
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
};

import { http, HttpResponse } from "msw";
import { decodeFunctionData, encodeFunctionResult, numberToHex, type Abi, type Address, type Hex } from "viem";

export const TEST_RPC_URL = "http://rpc.test";

export interface ReadMock {
  address: Address;
  abi: Abi;
  functionName: string;
  /** Return the decoded result, or throw to make the call revert. */
  result: (args: readonly unknown[]) => unknown;
}

interface JsonRpcRequest {
  id: number;
  jsonrpc: "2.0";
  method: string;
  params?: unknown[];
}

const revert = (id: number, message: string) => ({
  id,
  jsonrpc: "2.0",
  error: { code: 3, message: `execution reverted: ${message}`, data: "0x" },
});

const answerEthCall = (id: number, to: Address, data: Hex, reads: ReadMock[]) => {
  for (const read of reads.filter((r) => r.address.toLowerCase() === to.toLowerCase())) {
    let decoded;
    try {
      decoded = decodeFunctionData({ abi: read.abi, data });
    } catch {
      continue;
    }
    if (decoded.functionName !== read.functionName) continue;
    try {
      const value = read.result(decoded.args ?? []);
      const result = encodeFunctionResult({ abi: read.abi, functionName: read.functionName, result: value });
      return { id, jsonrpc: "2.0", result };
    } catch (error) {
      return revert(id, (error as Error).message);
    }
  }
  throw new Error(`unmocked eth_call to ${to} selector ${data.slice(0, 10)}`);
};

/**
 * JSON-RPC handler for viem reads. Assumes `batch.multicall: false` (renderWithProviders sets it),
 * so each contract read arrives as a plain `eth_call`.
 */
export const rpcHandler = ({
  reads = [],
  chainId,
  accounts = [],
  url = TEST_RPC_URL,
}: {
  reads?: ReadMock[];
  chainId: number;
  accounts?: Address[];
  url?: string;
}) => {
  const calls: { method: string; to?: Address }[] = [];
  const handler = http.post(url, async ({ request }) => {
    const body = (await request.json()) as JsonRpcRequest | JsonRpcRequest[];
    const answer = (req: JsonRpcRequest) => {
      switch (req.method) {
        case "eth_chainId":
          calls.push({ method: req.method });
          return { id: req.id, jsonrpc: "2.0", result: numberToHex(chainId) };
        case "eth_accounts":
          calls.push({ method: req.method });
          return { id: req.id, jsonrpc: "2.0", result: accounts };
        case "eth_blockNumber":
          calls.push({ method: req.method });
          return { id: req.id, jsonrpc: "2.0", result: "0x1" };
        case "eth_call": {
          const [{ to, data }] = req.params as [{ to: Address; data: Hex }];
          calls.push({ method: req.method, to });
          return answerEthCall(req.id, to, data, reads);
        }
        default:
          throw new Error(`unmocked JSON-RPC method ${req.method}`);
      }
    };
    return HttpResponse.json(Array.isArray(body) ? body.map(answer) : answer(body));
  });
  return { handler, calls };
};

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

export interface SentTransaction {
  from: Address;
  to: Address;
  data?: Hex;
  value?: Hex;
}

/** Signature the mock wallet returns for every typed-data request. */
export const MOCK_TYPED_DATA_SIGNATURE: Hex = `0x${"ab".repeat(64)}1b`;

/** Receipts are mined in block 1 and the chain head is far enough ahead for any confirmation count. */
const HEAD_BLOCK = 16;

const txHash = (n: number): Hex => numberToHex(n, { size: 32 });

const receipt = (hash: Hex, tx: SentTransaction, status: "success" | "reverted") => ({
  transactionHash: hash,
  transactionIndex: "0x0",
  blockHash: numberToHex(1, { size: 32 }),
  blockNumber: "0x1",
  from: tx.from,
  to: tx.to,
  cumulativeGasUsed: "0x5208",
  gasUsed: "0x5208",
  effectiveGasPrice: "0x1",
  contractAddress: null,
  logs: [],
  logsBloom: `0x${"0".repeat(512)}`,
  status: status === "success" ? "0x1" : "0x0",
  type: "0x2",
});

// Reported as pending: viem would otherwise count confirmations from the tx's block, not the head.
const pendingTransaction = (hash: Hex, tx: SentTransaction) => ({
  hash,
  blockHash: null,
  blockNumber: null,
  transactionIndex: null,
  from: tx.from,
  to: tx.to,
  input: tx.data ?? "0x",
  value: tx.value ?? "0x0",
  nonce: "0x0",
  gas: "0x5208",
  maxFeePerGas: "0x1",
  maxPriorityFeePerGas: "0x1",
  type: "0x2",
  chainId: "0x1",
  v: "0x0",
  r: "0x1",
  s: "0x1",
});

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
  receiptStatus = "success",
  url = TEST_RPC_URL,
}: {
  reads?: ReadMock[];
  chainId: number;
  accounts?: Address[];
  /** Status of the receipt returned for every transaction sent through the mock wallet. */
  receiptStatus?: "success" | "reverted";
  url?: string;
}) => {
  const calls: { method: string; to?: Address }[] = [];
  const sent: SentTransaction[] = [];
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
          return { id: req.id, jsonrpc: "2.0", result: numberToHex(HEAD_BLOCK) };
        case "eth_call": {
          const [{ to, data }] = req.params as [{ to: Address; data: Hex }];
          calls.push({ method: req.method, to });
          return answerEthCall(req.id, to, data, reads);
        }
        case "eth_signTypedData_v4":
          calls.push({ method: req.method });
          return { id: req.id, jsonrpc: "2.0", result: MOCK_TYPED_DATA_SIGNATURE };
        case "eth_sendTransaction": {
          const [tx] = req.params as [SentTransaction];
          calls.push({ method: req.method, to: tx.to });
          sent.push(tx);
          return { id: req.id, jsonrpc: "2.0", result: txHash(sent.length) };
        }
        case "eth_getTransactionByHash": {
          const [hash] = req.params as [Hex];
          calls.push({ method: req.method });
          const tx = sent[Number(BigInt(hash)) - 1];
          if (!tx) return { id: req.id, jsonrpc: "2.0", result: null };
          return { id: req.id, jsonrpc: "2.0", result: pendingTransaction(hash, tx) };
        }
        case "eth_getTransactionReceipt": {
          const [hash] = req.params as [Hex];
          calls.push({ method: req.method });
          const index = Number(BigInt(hash)) - 1;
          const tx = sent[index];
          if (!tx) return { id: req.id, jsonrpc: "2.0", result: null };
          return { id: req.id, jsonrpc: "2.0", result: receipt(hash, tx, receiptStatus) };
        }
        default:
          throw new Error(`unmocked JSON-RPC method ${req.method}`);
      }
    };
    return HttpResponse.json(Array.isArray(body) ? body.map(answer) : answer(body));
  });
  return { handler, calls, sent };
};

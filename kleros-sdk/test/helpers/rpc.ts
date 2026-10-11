import {
  custom,
  decodeFunctionData,
  encodeAbiParameters,
  encodeEventTopics,
  encodeFunctionResult,
  numberToHex,
  pad,
  parseAbiItem,
  type AbiEvent,
  type AbiFunction,
  type Address,
  type Hex,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import { configureSDK } from "../../src/sdk";

export type ReadMock = {
  address: Address;
  abi: string;
  result: (args: readonly unknown[]) => unknown;
};

export type LogMock = {
  address: Address;
  event: string;
  args: Record<string, unknown>;
};

type FilterParams = { address?: Address; topics?: (Hex | Hex[] | null)[]; fromBlock?: string; toBlock?: string };
type RpcLog = { address: Address; topics: Hex[] };

const sameHex = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const encodeLog = (log: LogMock, logIndex: number) => {
  const event = parseAbiItem(log.event) as AbiEvent;
  const indexedArgs = Object.fromEntries(
    event.inputs.filter((input) => input.indexed).map((input) => [input.name, log.args[input.name!]])
  );
  const nonIndexed = event.inputs.filter((input) => !input.indexed);
  return {
    address: log.address,
    topics: encodeEventTopics({ abi: [event], eventName: event.name, args: indexedArgs } as never) as Hex[],
    data: encodeAbiParameters(
      nonIndexed,
      nonIndexed.map((input) => log.args[input.name!])
    ),
    blockNumber: "0x1",
    blockHash: pad("0x1"),
    transactionHash: pad("0x2"),
    transactionIndex: "0x0",
    logIndex: numberToHex(logIndex),
    removed: false,
  };
};

const matchesFilter = (filter: FilterParams, log: RpcLog) => {
  if (filter.address && !sameHex(filter.address, log.address)) return false;
  return (filter.topics ?? []).every((topic, i) => {
    if (topic === null || topic === undefined) return true;
    const actual = log.topics[i];
    if (!actual) return false;
    return Array.isArray(topic) ? topic.some((t) => sameHex(t, actual)) : sameHex(topic, actual);
  });
};

type ChainFixtures = { reads?: ReadMock[]; logs?: LogMock[] };

/**
 * A viem `custom` transport that answers eth_call and event filters from fixtures,
 * so viem's real ABI encoding and decoding run.
 */
export const createMockTransport = ({ reads = [], logs = [] }: ChainFixtures = {}) => {
  const requests: { method: string; params: unknown }[] = [];
  const filters = new Map<Hex, FilterParams>();
  const encodedLogs = logs.map(encodeLog);

  const request = async ({ method, params }: { method: string; params?: unknown }) => {
    requests.push({ method, params });
    switch (method) {
      case "eth_chainId":
        return numberToHex(arbitrumSepolia.id);
      case "eth_call": {
        const [{ to, data }] = params as [{ to: Address; data: Hex }];
        for (const read of reads.filter((r) => sameHex(r.address, to))) {
          const fn = parseAbiItem(read.abi) as AbiFunction;
          try {
            const decoded = decodeFunctionData({ abi: [fn], data });
            return encodeFunctionResult({
              abi: [fn],
              functionName: fn.name,
              result: read.result(decoded.args ?? []),
            } as never);
          } catch {
            continue;
          }
        }
        throw new Error(`unmocked eth_call to ${to} selector ${data.slice(0, 10)}`);
      }
      case "eth_newFilter": {
        const id = numberToHex(filters.size + 1);
        filters.set(id, (params as [FilterParams])[0]);
        return id;
      }
      case "eth_getFilterLogs": {
        const filter = filters.get((params as [Hex])[0]);
        if (!filter) throw new Error("unknown filter id");
        return encodedLogs.filter((log) => matchesFilter(filter, log));
      }
      default:
        throw new Error(`unmocked RPC method ${method}`);
    }
  };

  return {
    // retryCount 0: viem retries failed requests with backoff delays by default
    sdkConfig: { client: { chain: arbitrumSepolia, transport: custom({ request }, { retryCount: 0 }) } },
    requests,
    filters: () => [...filters.values()],
  };
};

/** Configures the SDK's module-level public client with {@link createMockTransport}. */
export const mockChain = (fixtures: ChainFixtures = {}) => {
  const chain = createMockTransport(fixtures);
  configureSDK(chain.sdkConfig);
  return chain;
};

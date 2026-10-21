import { createPublicClient, defineChain, getAddress, http, parseAbi, type Address } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const CORE = "0x5AB37F38778Bc175852fA353056591D91c744ce6" as const;
export const PNK = "0x34B944D42cAcfC8266955D07A80181D2054aa225" as const;
export const FAUCET = "0x7EFE468003Ad6A858b5350CDE0A67bBED58739dD" as const;
export const COURT_ID = 1n;

const sortitionAbi = parseAbi([
  "function getJurorBalance(address,uint96) view returns (uint256,uint256,uint256,uint256)",
]);
const coreAbi = parseAbi(["function sortitionModule() view returns (address)"]);
const erc20Abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);
const faucetAbi = parseAbi(["function withdrewAlready(address) view returns (bool)"]);

export const rpcUrl = () => `https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

export const publicClient = () =>
  createPublicClient({ chain: defineChain({ ...arbitrumSepolia }), transport: http(rpcUrl()) });

export const snapshot = async (address: Address) => {
  const client = publicClient();
  const sortition = await client.readContract({ address: CORE, abi: coreAbi, functionName: "sortitionModule" });
  const [stake, eth, pnk, claimed] = await Promise.all([
    client.readContract({
      address: sortition,
      abi: sortitionAbi,
      functionName: "getJurorBalance",
      args: [getAddress(address), COURT_ID],
    }),
    client.getBalance({ address }),
    client.readContract({ address: PNK, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
    client
      .readContract({ address: FAUCET, abi: faucetAbi, functionName: "withdrewAlready", args: [address] })
      .catch(() => undefined),
  ]);
  return { stake: stake[0], eth, pnk, claimed };
};

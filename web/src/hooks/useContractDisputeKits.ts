import {
  disputeKitClassicConfig,
  disputeKitGatedConfig,
  disputeKitGatedShutterConfig,
  disputeKitShutterConfig,
} from "hooks/contracts/generated";
import { DisputeKits } from "src/consts";
import { DEFAULT_CHAIN, getChain } from "src/consts/chains";
import { useWallet, WalletProviderHook } from "src/context/walletProviders";
import { Address, Chain } from "viem";

type FunctionParamsTypes = number | string | bigint | number[] | string[] | bigint[] | FunctionParamsTypes[];

export const useDisputeKit = (disputeKit: DisputeKits | Address | undefined) => {
  if (disputeKit === undefined)
    return {
      callCommit: () => Promise.resolve("" as `0x${string}`),
      callVote: () => Promise.resolve("" as `0x${string}`),
    };
  const { writeContract, chainId, account } = useWallet();
  const chain = getChain(chainId!);
  const disputeKitType =
    typeof disputeKit === "string" ? getDKTypeFromAddress(disputeKit as `0x${string}`) : disputeKit;

  const callCommit: (functionParams: FunctionParamsTypes) => Promise<`0x${string}`> = (functionParams) => {
    return writeContractDisputeKits({
      disputeKit: disputeKitType,
      functionName: hasShutter(disputeKitType) ? "castCommitShutter" : "castCommit",
      functionParams,
      account: account!,
      writeContract,
      chain: chain!,
    });
  };

  const callVote: (functionParams: FunctionParamsTypes) => Promise<`0x${string}`> = (functionParams) => {
    return writeContractDisputeKits({
      disputeKit: disputeKitType,
      functionName: hasShutter(disputeKitType) ? "castVoteShutter" : "castVote",
      functionParams,
      account: account!,
      writeContract,
      chain: chain!,
    });
  };
  return { callCommit, callVote };
};

const hasShutter = (disputeKit: DisputeKits): boolean => {
  return disputeKit.toLowerCase().includes("shutter");
};

export const getDKTypeFromAddress = (address: Address, chainId: number = DEFAULT_CHAIN): DisputeKits => {
  switch (address.toLowerCase()) {
    case disputeKitClassicConfig.address[chainId].toLowerCase():
      return DisputeKits.Classic;
    case disputeKitGatedConfig.address[chainId].toLowerCase():
      return DisputeKits.Gated;
    case disputeKitShutterConfig.address[chainId].toLowerCase():
      return DisputeKits.Shutter;
    case disputeKitGatedShutterConfig.address[chainId].toLowerCase():
      return DisputeKits.GatedShutter;
    default:
      throw new Error(`Invalid dispute kit ${address}`);
  }
};

const writeContractDisputeKits = ({
  disputeKit,
  functionName,
  functionParams,
  account,
  writeContract,
  chain,
}: {
  disputeKit: DisputeKits;
  functionName: string;
  functionParams: FunctionParamsTypes;
  account: `0x${string}`;
  writeContract: WalletProviderHook["writeContract"];
  chain: Chain;
}): Promise<`0x${string}`> => {
  console.log("Write contract disputeKit", disputeKit, "functionName", functionName, "functionParams", functionParams);
  let contractConfig: {
    address: Record<number, `0x${string}`>;
    abi: readonly any[];
  };
  switch (disputeKit) {
    case DisputeKits.Classic:
      contractConfig = disputeKitClassicConfig;
      break;
    case DisputeKits.Gated:
      contractConfig = disputeKitGatedConfig;
      break;
    case DisputeKits.Shutter:
      contractConfig = disputeKitShutterConfig;
      break;
    case DisputeKits.GatedShutter:
      contractConfig = disputeKitGatedShutterConfig;
      break;
    default:
      throw new Error(`Invalid dispute kit: ${disputeKit}`);
  }
  return writeContract({
    account: account!,
    address: contractConfig.address[chain.id],
    functionName,
    args: functionParams as unknown[],
    value: BigInt(0),
    abi: contractConfig.abi,
    chain,
  });
};

import { createPublicClient, http, getContract } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { disputeKitClassicConfig } from "../deployments/devnet.viem";
import { AbiFunction, AbiParametersToPrimitiveTypes, ExtractAbiFunction, FormatAbiItem } from "abitype";

const main = async () => {
  const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  const disputeKit = getContract({
    address: disputeKitClassicConfig.address[arbitrumSepolia.id],
    abi: disputeKitClassicConfig.abi,
    publicClient: client,
  });

  await disputeKit.read.governor().then(console.log);

  // --------------------------------------------------

  // Working around the "unknown tuple types" issue
  // https://viem.sh/docs/faq.html#why-are-contract-function-args-with-fully-named-inputs-represented-as-unnamed-tuple-types-instead-of-object-types

  // Not human-readable
  type DelayedStakesFunction = ExtractAbiFunction<typeof disputeKit.abi, "disputes">;
  type Result = AbiParametersToPrimitiveTypes<DelayedStakesFunction["outputs"]>;
  // -> readonly [bigint, boolean, `0x${string}`]
  // Ideally we would get an object instead of a tuple

  // Human-readable
  type FormattedFunction = FormatAbiItem<DelayedStakesFunction>;
  // -> "function disputes(uint256) view returns (uint256 numberOfChoices, bool jumped, bytes extraData)"

  const getFunctionReturnParameterNames = (abi: AbiFunction[], name: string): string[] => {
    const f = abi.filter((abi: AbiFunction) => abi.type === "function" && abi.name === name)[0]; // WARNING: overloaded functions confusion
    return f.outputs.map((item) => item.name).filter(String) as string[];
  };

  const createObject = (keys: string[], values: any[]) => Object.fromEntries(keys.map((k, i) => [k, values[i]]));

  const disputes = await disputeKit.read.disputes([BigInt(0)]);
  const disputeParamNames = getFunctionReturnParameterNames(disputeKit.abi as unknown as AbiFunction[], "disputes"); // such type hack
  const disputeObject = createObject(disputeParamNames, [...disputes]);
  console.log("disputes: %O", disputeObject);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

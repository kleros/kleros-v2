import { createPublicClient, http, getContract, AbiFunction } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { disputeKitClassicConfig } from "../deployments/devnet.viem";

const main = async () => {
  const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  const disputeKit = getContract({
    address: disputeKitClassicConfig.address[arbitrumSepolia.id],
    abi: disputeKitClassicConfig.abi,
    client: client,
  });

  await disputeKit.read.owner().then(console.log);

  // --------------------------------------------------

  const getFunctionReturnParameterNames = (abi: AbiFunction[], name: string): string[] => {
    const f = abi.filter((abi: AbiFunction) => abi.type === "function" && abi.name === name)[0]; // WARNING: overloaded functions confusion
    return f.outputs.map((item) => item.name).filter(String) as string[];
  };

  const createObject = (keys: string[], values: unknown[]) => Object.fromEntries(keys.map((k, i) => [k, values[i]]));

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

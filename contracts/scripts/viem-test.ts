import { createPublicClient, http, getContract } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { disputeKitClassicConfig } from "../deployments/arbitrumSepoliaDevnet.viem";

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
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

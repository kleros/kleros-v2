import { createPublicClient, http, getContract } from "viem";
import { arbitrumGoerli } from "viem/chains";
import { homeGatewayToGnosisConfig } from "../viem/generated";

const main = async () => {
  const client = createPublicClient({
    chain: arbitrumGoerli,
    transport: http(),
  });

  const homeGateway = getContract({
    address: homeGatewayToGnosisConfig.address[arbitrumGoerli.id],
    abi: homeGatewayToGnosisConfig.abi,
    publicClient: client,
  });

  await homeGateway.read.governor().then(console.log);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

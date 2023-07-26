import { Config, ContractConfig, defineConfig } from "@wagmi/cli";
import { arbitrumGoerli, gnosisChiado } from "wagmi/chains";
import HomeGatewayToGnosis from "@kleros/kleros-v2-contracts/deployments/arbitrumGoerli/HomeGatewayToGnosis.json" assert { type: "json" };
import IHomeGateway from "@kleros/kleros-v2-contracts/artifacts/src/gateway/interfaces/IHomeGateway.sol/IHomeGateway.json" assert { type: "json" };
import { Abi } from "viem";

type ArtifactPartial = {
  abi: Abi;
};

const getAbi = (artifact: any) => {
  return (artifact as ArtifactPartial).abi;
};

const getConfig = async (): Promise<Config> => {
  return {
    out: "viem/generated.ts",
    contracts: [
      {
        name: "HomeGatewayToGnosis",
        address: {
          [arbitrumGoerli.id]: HomeGatewayToGnosis.address as `0x{string}`,
        },
        abi: getAbi(HomeGatewayToGnosis),
      },
      {
        name: "IHomeGateway",
        abi: getAbi(IHomeGateway),
      },
    ],
  };
};

export default defineConfig(getConfig);

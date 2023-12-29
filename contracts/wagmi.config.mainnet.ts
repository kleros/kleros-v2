import { Config, defineConfig } from "@wagmi/cli";
import IHomeGateway from "@kleros/kleros-v2-contracts/artifacts/src/gateway/interfaces/IHomeGateway.sol/IHomeGateway.json" assert { type: "json" };
import { getAbi, readArtifacts, merge } from "./scripts/wagmiHelpers";

const getConfig = async (): Promise<Config> => {
  const arbitrumContracts = await readArtifacts("arbitrum");
  arbitrumContracts.forEach((c) => console.log("✔ Found arbitrum artifact: %s", c.name));
  let contracts = arbitrumContracts;

  const gnosisContracts = await readArtifacts("gnosis", "gnosischain");
  gnosisContracts.forEach((c) => console.log("✔ Found gnosis artifact: %s", c.name));
  contracts = merge(contracts, gnosisContracts);

  const mainnetContracts = await readArtifacts("mainnet");
  mainnetContracts.forEach((c) => console.log("✔ Found mainnet artifact: %s", c.name));
  contracts = merge(contracts, mainnetContracts);

  return {
    out: "deployments/mainnet.viem.ts",
    contracts: [
      ...contracts,
      {
        name: "IHomeGateway",
        abi: getAbi(IHomeGateway),
      },
    ],
  };
};

export default defineConfig(getConfig);

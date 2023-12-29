import { Config, defineConfig } from "@wagmi/cli";
import IHomeGateway from "@kleros/kleros-v2-contracts/artifacts/src/gateway/interfaces/IHomeGateway.sol/IHomeGateway.json" assert { type: "json" };
import { getAbi, readArtifacts, merge } from "./scripts/wagmiHelpers";

const getConfig = async (): Promise<Config> => {
  const arbitrumSepoliaContracts = await readArtifacts("arbitrumSepolia");
  arbitrumSepoliaContracts.forEach((c) => console.log("✔ Found arbitrumSepolia artifact: %s", c.name));
  let contracts = arbitrumSepoliaContracts;

  const chiadoContracts = await readArtifacts("gnosisChiado", "chiado"); // renaming the Hardhat network improves this but breaks many other scripts
  chiadoContracts.forEach((c) => console.log("✔ Found chiado artifact: %s", c.name));
  contracts = merge(contracts, chiadoContracts);

  const sepoliaContracts = await readArtifacts("sepolia");
  sepoliaContracts.forEach((c) => console.log("✔ Found sepolia artifact: %s", c.name));
  contracts = merge(contracts, sepoliaContracts);

  return {
    out: "deployments/testnet.viem.ts",
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

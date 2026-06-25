import { Config, defineConfig } from "@wagmi/cli";
import { getAbi, readArtifacts, merge, readArtifactJson } from "./scripts/wagmiHelpers.mjs";

const getConfig = async (): Promise<Config> => {
  const artifact = await readArtifacts("localhost");
  artifact.forEach((c) => console.log("✔ Found localhost artifact: %s", c.name));
  let contracts = artifact;

  // renaming the Hardhat network improves this but breaks many other scripts
  const chiadoContracts = await readArtifacts("gnosisChiado", "chiadoDevnet");
  chiadoContracts.forEach((c) => console.log("✔ Found chiado artifact: %s", c.name));
  contracts = merge(contracts, chiadoContracts);

  const sepoliaContracts = await readArtifacts("sepolia", "sepoliaDevnet");
  sepoliaContracts.forEach((c) => console.log("✔ Found sepolia artifact: %s", c.name));
  contracts = merge(contracts, sepoliaContracts);

  const IHomeGateway = await readArtifactJson("gateway/interfaces/IHomeGateway.sol/IHomeGateway.json");

  return {
    out: "deployments/hardhat.viem.ts",
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

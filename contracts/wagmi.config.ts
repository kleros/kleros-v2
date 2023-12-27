import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";
import { Config, ContractConfig, defineConfig } from "@wagmi/cli";
import { Abi } from "viem";
import { Chain } from "@wagmi/chains";
import IHomeGateway from "@kleros/kleros-v2-contracts/artifacts/src/gateway/interfaces/IHomeGateway.sol/IHomeGateway.json" assert { type: "json" };

type ArtifactPartial = {
  abi: Abi;
};

const getAbi = (artifact: any) => {
  return (artifact as ArtifactPartial).abi;
};

const readArtifacts = async (viemChainName: string, hardhatChainName?: string) => {
  const chains = await import("wagmi/chains");
  const chain = chains[viemChainName] as Chain;
  if (!chain) {
    throw new Error(`Viem chain ${viemChainName} not found`);
  }

  const directoryPath = `./deployments/${hardhatChainName ?? viemChainName}`;
  const files = await readdir(directoryPath);

  const results: ContractConfig[] = [];
  for (const file of files) {
    const { name, ext } = parse(file);
    if (ext === ".json") {
      const filePath = join(directoryPath, file);
      const fileContent = await readFile(filePath, "utf-8");
      const jsonContent = JSON.parse(fileContent);
      results.push({
        name: name,
        address: {
          [chain.id]: jsonContent.address as `0x{string}`,
        },
        abi: jsonContent.abi,
      });
    }
  }
  return results;
};

// Group contracts by name and merge the address dictionary
function merge(arr1: ContractConfig[], arr2: ContractConfig[]) {
  const mergedArr: ContractConfig[] = [...arr1];
  for (const contract of arr2) {
    const index = mergedArr.findIndex((c) => c.name === contract.name);
    if (index === -1) {
      mergedArr.push(contract);
    } else {
      mergedArr[index] = {
        ...mergedArr[index],
        address: {
          ...(mergedArr[index].address as Record<number, `0x${string}`>),
          ...(contract.address as Record<number, `0x${string}`>),
        },
      };
    }
  }
  return mergedArr;
}

const getConfig = async (): Promise<Config> => {
  const arbitrumSepoliaContracts = await readArtifacts("arbitrumSepolia", "arbitrumSepoliaDevnet");
  arbitrumSepoliaContracts.forEach((c) => console.log("✔ Found arbitrumSepolia artifact: %s", c.name));
  let contracts = arbitrumSepoliaContracts;

  const chiadoContracts = await readArtifacts("gnosisChiado", "chiado"); // renaming the Hardhat network improves this but breaks many other scripts
  chiadoContracts.forEach((c) => console.log("✔ Found chiado artifact: %s", c.name));
  contracts = merge(contracts, chiadoContracts);

  const sepoliaContracts = await readArtifacts("sepolia");
  sepoliaContracts.forEach((c) => console.log("✔ Found sepolia artifact: %s", c.name));
  contracts = merge(contracts, sepoliaContracts);

  const arbitrumContracts = await readArtifacts("arbitrum");
  arbitrumContracts.forEach((c) => console.log("✔ Found arbitrum artifact: %s", c.name));
  contracts = merge(contracts, arbitrumContracts);

  const gnosisContracts = await readArtifacts("gnosis", "gnosischain");
  gnosisContracts.forEach((c) => console.log("✔ Found gnosis artifact: %s", c.name));
  contracts = merge(contracts, gnosisContracts);

  const mainnetContracts = await readArtifacts("mainnet");
  mainnetContracts.forEach((c) => console.log("✔ Found mainnet artifact: %s", c.name));
  contracts = merge(contracts, mainnetContracts);

  return {
    out: "viem/generated.ts",
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

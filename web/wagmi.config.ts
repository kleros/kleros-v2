import { type Config, type ContractConfig, defineConfig } from "@wagmi/cli";
import { react, actions } from "@wagmi/cli/plugins";
import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";
import { Abi } from "viem";
import { Chain } from "@wagmi/chains";
import dotenv from "dotenv";
import IHomeGateway from "@kleros/kleros-v2-contracts/artifacts/src/gateway/interfaces/IHomeGateway.sol/IHomeGateway.json" assert { type: "json" };
import IArbitrableV2 from "@kleros/kleros-v2-contracts/artifacts/src/arbitration/interfaces/IArbitrableV2.sol/IArbitrableV2.json" assert { type: "json" };

dotenv.config();

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

  const directoryPath = `../contracts/deployments/${hardhatChainName ?? viemChainName}`;
  const files = await readdir(directoryPath);

  const results: ContractConfig[] = [];
  for (const file of files) {
    const { name, ext } = parse(file);
    if (ext === ".json") {
      const filePath = join(directoryPath, file);
      const fileContent = await readFile(filePath, "utf-8");
      const jsonContent = JSON.parse(fileContent);
      results.push({
        name,
        address: {
          [chain.id]: jsonContent.address as `0x{string}`,
        },
        abi: jsonContent.abi,
      });
    }
  }
  return results;
};

const getConfig = async (): Promise<Config> => {
  const deployment = process.env.REACT_APP_DEPLOYMENT ?? "testnet";

  let viemNetwork: string;
  let hardhatNetwork: string;
  switch (deployment) {
    case "devnet":
      viemNetwork = "arbitrumSepolia";
      hardhatNetwork = "arbitrumSepoliaDevnet";
      break;
    case "testnet":
      viemNetwork = "arbitrumSepolia";
      hardhatNetwork = "arbitrumSepolia";
      break;
    case "mainnet":
      viemNetwork = "arbitrum";
      hardhatNetwork = "arbitrum";
      break;
    default:
      throw new Error(`Unknown deployment ${deployment}`);
  }

  const deploymentContracts = await readArtifacts(viemNetwork, hardhatNetwork);

  return {
    out: "src/hooks/contracts/generated.ts",
    contracts: [
      ...deploymentContracts,
      {
        name: "IHomeGateway",
        abi: getAbi(IHomeGateway),
      },
      {
        name: "IArbitrableV2",
        abi: getAbi(IArbitrableV2),
      },
    ],
    plugins: [react(), actions()],
  };
};

export default defineConfig(getConfig);

import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";

import { type Config, type ContractConfig, defineConfig } from "@wagmi/cli";
import { react, actions } from "@wagmi/cli/plugins";
import dotenv from "dotenv";
import { type Chain } from "viem";
import { arbitrum, arbitrumSepolia, gnosis, gnosisChiado, mainnet, sepolia, hardhat } from "viem/chains";

import IArbitrableV2 from "../contracts/artifacts/src/arbitration/interfaces/IArbitrableV2.sol/IArbitrableV2.json" assert { type: "json" };
import * as devnetViem from "../contracts/deployments/devnet.viem";
import * as hardhatViem from "../contracts/deployments/hardhat.viem";
import * as mainnetViem from "../contracts/deployments/mainnet.viem";
import * as testnetViem from "../contracts/deployments/testnet.viem";

dotenv.config();

const readArtifacts = async (viemChainName: string, hardhatChainName?: string) => {
  const chainMap: Record<string, Chain> = {
    arbitrum,
    arbitrumSepolia,
    sepolia,
    mainnet,
    gnosisChiado,
    gnosis,
    hardhat,
  };

  const chain = chainMap[viemChainName];
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
  let arbitratorContracts;
  switch (deployment) {
    case "localhost":
      viemNetwork = "hardhat";
      hardhatNetwork = "localhost";
      arbitratorContracts = hardhatViem;
      break;
    case "devnet":
      viemNetwork = "arbitrumSepolia";
      hardhatNetwork = "arbitrumSepoliaDevnet";
      arbitratorContracts = devnetViem;
      break;
    case "testnet":
      viemNetwork = "arbitrumSepolia";
      hardhatNetwork = "arbitrumSepolia";
      arbitratorContracts = testnetViem;
      break;
    case "mainnet":
      viemNetwork = "arbitrum";
      hardhatNetwork = "arbitrum";
      arbitratorContracts = mainnetViem;
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
        abi: arbitratorContracts.iHomeGatewayAbi,
      },
      {
        name: "IArbitrableV2",
        abi: IArbitrableV2.abi,
      },
    ],
    plugins: [react(), actions()],
  };
};

export default defineConfig(getConfig);

import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";

import { type Config, type ContractConfig, defineConfig } from "@wagmi/cli";
import { react, actions } from "@wagmi/cli/plugins";
import dotenv from "dotenv";
import { type Chain, type Abi } from "viem";
import { arbitrum, arbitrumSepolia, gnosis, gnosisChiado, mainnet, sepolia } from "viem/chains";

import IArbitrableV2 from "../contracts/artifacts/src/arbitration/interfaces/IArbitrableV2.sol/IArbitrableV2.json" assert { type: "json" };
import * as devnetViem from "../contracts/deployments/devnet.viem";
import * as mainnetViem from "../contracts/deployments/mainnet.viem";
import * as testnetViem from "../contracts/deployments/testnet.viem";

import { ArbitratorTypes, getArbitratorType } from "./src/consts/arbitratorTypes";

dotenv.config();

const readArtifacts = async (type: ArbitratorTypes, viemChainName: string, hardhatChainName?: string) => {
  const artifactSuffix =
    type === ArbitratorTypes.vanilla
      ? ""
      : ArbitratorTypes[type].toString().charAt(0).toUpperCase() + ArbitratorTypes[type].toString().slice(1);
  const vanillaArtifacts = [
    "KlerosCore",
    "DisputeKitClassic",
    "SortitionModule",
    "DisputeResolver",
    "KlerosCoreRuler",
    "DisputeResolverRuler",
  ];
  const typeSpecificArtifacts = vanillaArtifacts.map((artifact) => `${artifact}${artifactSuffix}`);

  const chainMap: Record<string, Chain> = {
    arbitrum,
    arbitrumSepolia,
    sepolia,
    mainnet,
    gnosisChiado,
    gnosis,
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
      let nameWithoutSuffix = name;
      if (vanillaArtifacts.some((artifact) => name.startsWith(artifact))) {
        if (!typeSpecificArtifacts.includes(name)) {
          // console.debug(`Skipping ${name} for deployment type ${ArbitratorTypes[type]}`);
          continue;
        }
        if (type !== ArbitratorTypes.vanilla) {
          nameWithoutSuffix = name.slice(0, -artifactSuffix.length);
          // console.debug(`Using ${nameWithoutSuffix} instead of ${name}`);
        }
      }
      const filePath = join(directoryPath, file);
      const fileContent = await readFile(filePath, "utf-8");
      const jsonContent = JSON.parse(fileContent);
      results.push({
        name: nameWithoutSuffix,
        address: {
          [chain.id]: jsonContent.address as `0x{string}`,
        },
        abi: jsonContent.abi as Abi,
      });
    }
  }
  return results;
};

const getConfig = async (): Promise<Config> => {
  const deployment = process.env.NEXT_PUBLIC_DEPLOYMENT ?? "testnet";
  const type = getArbitratorType(
    process.env.NEXT_PUBLIC_ARBITRATOR_TYPE?.toLowerCase() as keyof typeof ArbitratorTypes
  );

  let viemNetwork: string;
  let hardhatNetwork: string;
  let arbitratorContracts;
  switch (deployment) {
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

  const deploymentContracts = await readArtifacts(type, viemNetwork, hardhatNetwork);

  return {
    out: "src/hooks/contracts/generated.ts",
    contracts: [
      ...deploymentContracts,
      {
        name: "IHomeGateway",
        abi: arbitratorContracts.iHomeGatewayAbi as Abi,
      },
      {
        name: "IArbitrableV2",
        abi: IArbitrableV2.abi as Abi,
      },
    ],
    plugins: [react(), actions()],
  };
};

export default defineConfig(getConfig);

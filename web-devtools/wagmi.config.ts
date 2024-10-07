import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";

import { Chain } from "@wagmi/chains";
import { type Config, type ContractConfig, defineConfig } from "@wagmi/cli";
import { react, actions } from "@wagmi/cli/plugins";
import dotenv from "dotenv";
import { type Abi } from "viem";

import IArbitrableV2 from "@kleros/kleros-v2-contracts/artifacts/src/arbitration/interfaces/IArbitrableV2.sol/IArbitrableV2.json" assert { type: "json" };
import IHomeGateway from "@kleros/kleros-v2-contracts/artifacts/src/gateway/interfaces/IHomeGateway.sol/IHomeGateway.json" assert { type: "json" };

import { ArbitratorTypes, getArbitratorType } from "./src/consts/arbitratorTypes";

dotenv.config();

type ArtifactPartial = {
  abi: Abi;
};

const getAbi = (artifact: any) => {
  return (artifact as ArtifactPartial).abi;
};

const readArtifacts = async (type: ArbitratorTypes, viemChainName: string, hardhatChainName?: string) => {
  const artifactSuffix =
    type === ArbitratorTypes.vanilla
      ? ""
      : ArbitratorTypes[type].toString().charAt(0).toUpperCase() + ArbitratorTypes[type].toString().slice(1);
  const vanillaArtifacts = ["KlerosCore", "DisputeKitClassic", "SortitionModule", "DisputeResolver", "KlerosCoreRuler"];
  const typeSpecificArtifacts = vanillaArtifacts.map((artifact) => `${artifact}${artifactSuffix}`);

  const chains = await import("wagmi/chains");
  const chain = (chains as any)[viemChainName] as Chain;
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
        abi: jsonContent.abi,
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

  const deploymentContracts = await readArtifacts(type, viemNetwork, hardhatNetwork);

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

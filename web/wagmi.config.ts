import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";

import { type Config, type ContractConfig, defineConfig } from "@wagmi/cli";
import { react, actions } from "@wagmi/cli/plugins";
import dotenv from "dotenv";
import { Address, zeroAddress, type Abi, type Chain } from "viem";
import { arbitrum, arbitrumSepolia, gnosis, gnosisChiado, mainnet, sepolia, hardhat } from "viem/chains";

import { IArbitrableV2__factory } from "@kleros/kleros-v2-contracts/ethers";
import { devnetViem, mainnetViem, testnetViem } from "@kleros/kleros-v2-contracts/viem";

import * as hardhatViem from "../contracts/deployments/hardhat.viem";

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
      const jsonContent = JSON.parse(fileContent) as { address: Address; abi: Abi };
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

  // On mainnet, DisputeKitClassicUniversity is not deployed. Adding a stub so the generated
  // hook exists (when useVotingContext, setJurorsButton imports it).
  // The hook is never enabled on mainnet since we filter out the DisputeKit in selectable kits in disputeFeature.ts.
  let universityStub: ContractConfig[] = [];
  if (deployment === "mainnet") {
    console.info("Injecting DisputeKitClassicUniversity stub from arbitrum sepolia deployment");
    const stubPath = "../contracts/deployments/arbitrumSepoliaDevnet/DisputeKitClassicUniversity.json";

    const stubContent = JSON.parse(await readFile(stubPath, "utf-8")) as { address: Address; abi: Abi };
    universityStub = [
      {
        name: "DisputeKitClassicUniversity",
        address: { [arbitrum.id]: zeroAddress },
        abi: stubContent.abi,
      },
    ];
  }

  return {
    out: "src/hooks/contracts/generated.ts",
    contracts: [
      ...deploymentContracts,
      ...universityStub,
      {
        name: "IHomeGateway",
        abi: arbitratorContracts.iHomeGatewayAbi,
      },
      {
        name: "IArbitrableV2",
        abi: IArbitrableV2__factory.abi,
      },
    ],
    plugins: [react(), actions()],
  };
};

export default defineConfig(getConfig);

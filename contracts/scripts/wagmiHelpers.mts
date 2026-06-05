import { readdir, readFile } from "fs/promises";
import { parse, join } from "path";
import type { ContractConfig } from "@wagmi/cli";
import { Abi, Chain } from "viem";

type ArtifactPartial = {
  abi: Abi;
};

export const getAbi = (artifact: unknown) => {
  return (artifact as ArtifactPartial).abi;
};

export const readArtifacts = async (viemChainName: string, hardhatChainName?: string) => {
  const chains = await import("wagmi/chains");
  const chain = chains[viemChainName as keyof typeof chains] as Chain | undefined;
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

// Group contracts by name and merge the address dictionary
export const merge = (arr1: ContractConfig[], arr2: ContractConfig[]) => {
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
};

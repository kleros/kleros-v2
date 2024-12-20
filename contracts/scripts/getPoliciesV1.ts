import { ethers } from "hardhat";
import fetch from "node-fetch";
import hre = require("hardhat");

interface Policy {
  court: number;
  uri: string;
  name: string;
  description: string;
  summary: string;
  requiredSkills: string;
}

const policyRegistryByChain = new Map<number, string>([
  [1, "0xCf1f07713d5193FaE5c1653C9f61953D048BECe4"], // mainnet
  [100, "0x9d494768936b6bDaabc46733b8D53A937A6c6D7e"], // gnosis
]);

async function main() {
  const chainId = Number(await hre.getChainId());
  const policyRegistryAddress = policyRegistryByChain.get(chainId) ?? hre.ethers.ZeroAddress;
  const policyRegistryV1 = await ethers.getContractAt("PolicyRegistry", policyRegistryAddress);

  const fetchPolicy = (url: string): Promise<Policy> => {
    return fetch(url).then((response) => response.json());
  };

  const fetchPolicyUri = (court: number): Promise<string> => {
    return policyRegistryV1.policies(court);
  };

  const policies: Policy[] = [];
  for (let court = 0; ; ++court) {
    const uri = await fetchPolicyUri(court);
    if (!uri) break;

    const policy = await fetchPolicy("https://cdn.kleros.link" + uri);
    policy.court = court;
    policy.uri = uri;
    policies.push(policy);
  }
  console.log(JSON.stringify(policies, null, "\t"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

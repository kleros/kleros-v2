import { deployments, getNamedAccounts, getChainId, ethers } from "hardhat";
import { PolicyRegistry } from "../typechain-types";
import policiesV1 from "../policies.v1.json";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,
  HARDHAT = 31337,
}

async function main() {
  // fallback to hardhat node signers on local network
  const deployer = (await getNamedAccounts()).deployer ?? (await ethers.getSigners())[0].address;

  const chainId = Number(await getChainId());
  if (!HomeChains[chainId]) {
    console.error(`Aborting: script is not compatible with ${chainId}`);
    return;
  } else {
    console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);
  }

  // WARNING: skip the Forking court at id 0, so the v1 courts are shifted by 1
  const policiesV2 = policiesV1.map((policy) => ({ ...policy, court: policy.court + 1 }));

  const policyRegistryDeployment = await deployments.get("PolicyRegistry");
  const policyRegistry = (await ethers.getContractAt(
    "PolicyRegistry",
    policyRegistryDeployment.address
  )) as PolicyRegistry;

  for await (const policy of policiesV2) {
    console.log("Populating policy for %s Court (%d): %s", policy.name, policy.court, policy.uri);
    await policyRegistry.setPolicy(policy.court, policy.uri);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

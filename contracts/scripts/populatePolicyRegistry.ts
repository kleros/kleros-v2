import { deployments, getNamedAccounts, getChainId, ethers, network } from "hardhat";
import { PolicyRegistry } from "../typechain-types";
import policiesV1Mainnet from "../config/policies.v1.mainnet.json";
import policiesV1GnosisChain from "../config/policies.v1.gnosischain.json";
import policiesV2ArbitrumTestnet from "../config/policies.v2.testnet.json";
import policiesV2ArbitrumDevnet from "../config/policies.v2.devnet.json";
import { isDevnet } from "../deploy/utils";

enum HomeChains {
  ARBITRUM_ONE = 42161,
  ARBITRUM_SEPOLIA = 421614,
  HARDHAT = 31337,
}

enum Sources {
  V1_MAINNET,
  V1_GNOSIS,
  V2_DEVNET,
  V2_TESTNET,
}
const from = isDevnet(network) ? Sources.V2_DEVNET : Sources.V2_TESTNET;

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

  let policiesV2;
  switch (+from) {
    case Sources.V1_MAINNET: {
      const policiesV1 = policiesV1Mainnet;

      // WARNING: skip the Forking court at id 0, so the v1 courts are shifted by 1
      policiesV2 = policiesV1.map((policy) => ({ ...policy, court: policy.court + 1 }));
      break;
    }
    case Sources.V1_GNOSIS: {
      const policiesV1 = policiesV1GnosisChain.map((policy) => ({
        ...policy,
        name: policy.name.replace("xDai ", ""),
      }));

      // WARNING: skip the Forking court at id 0, so the v1 courts are shifted by 1
      policiesV2 = policiesV1.map((policy) => ({ ...policy, court: policy.court + 1 }));
      break;
    }
    case Sources.V2_DEVNET: {
      policiesV2 = policiesV2ArbitrumDevnet;
      break;
    }
    case Sources.V2_TESTNET: {
      policiesV2 = policiesV2ArbitrumTestnet;
      break;
    }
    default:
      return;
  }

  const policyRegistryDeployment = await deployments.get("PolicyRegistry");
  const policyRegistry = (await ethers.getContractAt(
    "PolicyRegistry",
    policyRegistryDeployment.address
  )) as PolicyRegistry;

  for await (const policy of policiesV2) {
    console.log("Populating policy for %s Court (%d): %s", policy.name, policy.court, policy.uri);
    await policyRegistry.setPolicy(policy.court, policy.name, policy.uri);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

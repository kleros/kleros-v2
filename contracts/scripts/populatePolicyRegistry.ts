import { task, types } from "hardhat/config";
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

task("populate:policy-registry", "Populates the policy registry for each court")
  .addOptionalParam(
    "from",
    "The source of the policies between v1_mainnet, v1_gnosis, v2_devnet, v2_testnet (default: auto depending on the network)",
    undefined
  )
  .addOptionalParam(
    "maxNumberOfCourts",
    "The maximum number of courts to populate (default: all)",
    undefined,
    types.int
  )
  .setAction(async (taskArgs, hre) => {
    const { deployments, getNamedAccounts, getChainId, ethers, network } = hre;

    // fallback to hardhat node signers on local network
    const deployer = (await getNamedAccounts()).deployer ?? (await ethers.getSigners())[0].address;

    const chainId = Number(await getChainId());
    if (!HomeChains[chainId]) {
      console.error(`Aborting: script is not compatible with ${chainId}`);
      return;
    } else {
      console.log("deploying to %s with deployer %s", HomeChains[chainId], deployer);
    }

    let from: Sources | undefined;
    if (taskArgs.from) {
      from = Sources[taskArgs.from.toUpperCase() as keyof typeof Sources];
      if (from === undefined) {
        console.error("Invalid source, must be one of v1_mainnet, v1_gnosis, v2_devnet, v2_testnet");
        return;
      }
    } else {
      from = isDevnet(network) ? Sources.V2_DEVNET : Sources.V2_TESTNET;
    }
    console.log("Populating from source %s", Sources[from]);

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

    const maxNumberOfCourts = taskArgs.maxNumberOfCourts; // set to undefined for all the courts
    console.log("Keeping only the first %d courts", maxNumberOfCourts ?? policiesV2.length);
    policiesV2 = policiesV2.slice(0, maxNumberOfCourts);

    const policyRegistryDeployment = await deployments.get("PolicyRegistry");
    const policyRegistry = (await ethers.getContractAt(
      "PolicyRegistry",
      policyRegistryDeployment.address
    )) as PolicyRegistry;

    for await (const policy of policiesV2) {
      console.log("Populating policy for %s Court (%d): %s", policy.name, policy.court, policy.uri);
      await policyRegistry.setPolicy(policy.court, policy.name, policy.uri);
    }
  });

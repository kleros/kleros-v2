import { expect } from "chai";
import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { getContracts } from "../../deployments/contractsViem";
import { getActualAddress } from "../utils/getActualAddress";

// Network names for deployments
const NETWORKS = {
  DEVNET: "arbitrumSepoliaDevnet",
  TESTNET: "arbitrumSepolia",
  MAINNET: "arbitrum",
} as const;

type NetworkType = (typeof NETWORKS)[keyof typeof NETWORKS];

type Contracts = ReturnType<typeof getContracts>;

type ContractMapping = {
  [K in keyof Contracts]: {
    name: string;
    optional?: boolean;
  };
};

const devnetContractMapping: ContractMapping = {
  klerosCore: { name: "KlerosCore" },
  sortition: { name: "SortitionModule" },
  disputeKitClassic: { name: "DisputeKitClassic" },
  disputeKitClassicUniversity: { name: "DisputeKitClassicUniversity" },
  disputeKitShutter: { name: "DisputeKitShutter" },
  disputeKitGated: { name: "DisputeKitGated" },
  disputeKitGatedShutter: { name: "DisputeKitGatedShutter" },
  disputeKitGatedArgentinaConsumerProtection: {
    name: "DisputeKitGatedArgentinaConsumerProtection",
  },
  disputeResolver: { name: "DisputeResolver" },
  disputeTemplateRegistry: { name: "DisputeTemplateRegistry" },
  evidence: { name: "EvidenceModule" },
  policyRegistry: { name: "PolicyRegistry" },
  transactionBatcher: { name: "TransactionBatcher" },
  chainlinkRng: { name: "ChainlinkRNG", optional: true },
  rngWithFallback: { name: "RNGWithFallback" },
  randomizerRng: { name: "RandomizerRNG", optional: true },
  pnk: { name: "PNK" },
  klerosCoreSnapshotProxy: { name: "KlerosCoreSnapshotProxy" },
  leaderboardOffset: { name: "LeaderboardOffset" },
};

const testnetContractMapping: ContractMapping = {
  klerosCore: { name: "KlerosCore" },
  sortition: { name: "SortitionModule" },
  disputeKitClassic: { name: "DisputeKitClassic" },
  disputeKitClassicUniversity: {
    name: "DisputeKitClassicUniversity",
    optional: true,
  },
  disputeKitShutter: { name: "DisputeKitShutter" },
  disputeKitGated: { name: "DisputeKitGated" },
  disputeKitGatedShutter: { name: "DisputeKitGatedShutter" },
  disputeKitGatedArgentinaConsumerProtection: {
    name: "DisputeKitGatedArgentinaConsumerProtection",
    optional: true,
  }, // TODO: set optional to false once redeployed
  disputeResolver: { name: "DisputeResolver" },
  disputeTemplateRegistry: { name: "DisputeTemplateRegistry" },
  evidence: { name: "EvidenceModule" },
  policyRegistry: { name: "PolicyRegistry" },
  transactionBatcher: { name: "TransactionBatcher" },
  chainlinkRng: { name: "ChainlinkRNG", optional: true },
  randomizerRng: { name: "RandomizerRNG", optional: true },
  rngWithFallback: { name: "RNGWithFallback", optional: true }, // TODO: set optional to false once redeployed
  pnk: { name: "PNK" },
  klerosCoreSnapshotProxy: { name: "KlerosCoreSnapshotProxy" },
  leaderboardOffset: { name: "LeaderboardOffset", optional: true }, // TODO: set optional to false once redeployed
};

const mainnetContractMapping: ContractMapping = {
  klerosCore: { name: "KlerosCore" },
  sortition: { name: "SortitionModule" },
  disputeKitClassic: { name: "DisputeKitClassic" },
  disputeKitClassicUniversity: {
    name: "DisputeKitClassicUniversity",
    optional: true,
  },
  disputeKitShutter: { name: "DisputeKitShutter" },
  disputeKitGated: { name: "DisputeKitGated" },
  disputeKitGatedShutter: { name: "DisputeKitGatedShutter" },
  disputeKitGatedArgentinaConsumerProtection: {
    name: "DisputeKitGatedArgentinaConsumerProtection",
    optional: true,
  }, // TODO: set optional to false once redeployed
  disputeResolver: { name: "DisputeResolver" },
  disputeTemplateRegistry: { name: "DisputeTemplateRegistry" },
  evidence: { name: "EvidenceModule" },
  policyRegistry: { name: "PolicyRegistry" },
  transactionBatcher: { name: "TransactionBatcher" },
  chainlinkRng: { name: "ChainlinkRNG", optional: false },
  randomizerRng: { name: "RandomizerRNG", optional: false },
  rngWithFallback: { name: "RNGWithFallback", optional: true }, // TODO: set optional to false once redeployed
  pnk: { name: "PNK" },
  klerosCoreSnapshotProxy: { name: "KlerosCoreSnapshotProxy" },
  leaderboardOffset: { name: "LeaderboardOffset", optional: true }, // TODO: set optional to false once redeployed
};

describe("getContractsViem", () => {
  // Create Viem clients for testing
  const arbitrumSepoliaClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http("https://sepolia-rollup.arbitrum.io/rpc"),
  });

  const arbitrumClient = createPublicClient({
    chain: arbitrum,
    transport: http("https://arb1.arbitrum.io/rpc"),
  });

  // Helper to verify contract instance
  function verifyContractInstance(contract: Contracts[keyof Contracts]) {
    expect(contract).to.have.property("address");
    expect(contract).to.have.property("abi");
    expect(contract?.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(contract?.address).to.not.equal("0x0000000000000000000000000000000000000000");
  }

  // Helper to verify all contract instances
  function verifyAllContractInstances(contracts: Contracts) {
    verifyContractInstance(contracts.klerosCore);
    verifyContractInstance(contracts.sortition);
    verifyContractInstance(contracts.disputeKitClassic);
    if (contracts.disputeKitClassicUniversity) {
      verifyContractInstance(contracts.disputeKitClassicUniversity);
    }
    if (contracts.disputeKitShutter) {
      verifyContractInstance(contracts.disputeKitShutter);
    }
    if (contracts.disputeKitGated) {
      verifyContractInstance(contracts.disputeKitGated);
    }
    if (contracts.disputeKitGatedShutter) {
      verifyContractInstance(contracts.disputeKitGatedShutter);
    }
    if (contracts.disputeKitGatedArgentinaConsumerProtection) {
      verifyContractInstance(contracts.disputeKitGatedArgentinaConsumerProtection);
    }
    verifyContractInstance(contracts.disputeResolver);
    verifyContractInstance(contracts.disputeTemplateRegistry);
    verifyContractInstance(contracts.evidence);
    verifyContractInstance(contracts.policyRegistry);
    verifyContractInstance(contracts.transactionBatcher);
    verifyContractInstance(contracts.pnk);
    verifyContractInstance(contracts.klerosCoreSnapshotProxy);
    if (contracts.leaderboardOffset) {
      verifyContractInstance(contracts.leaderboardOffset);
    }
    if (contracts.chainlinkRng) {
      verifyContractInstance(contracts.chainlinkRng);
    }
    if (contracts.rngWithFallback) {
      verifyContractInstance(contracts.rngWithFallback);
    }
    if (contracts.randomizerRng) {
      verifyContractInstance(contracts.randomizerRng);
    }
  }

  // Helper to verify deployed addresses
  async function verifyDeployedAddresses(contracts: Contracts, network: NetworkType, contractMapping: ContractMapping) {
    for (const [key, { name, optional }] of Object.entries(contractMapping)) {
      const contract = contracts[key as keyof typeof contracts];
      if (!contract) {
        if (!optional) {
          throw new Error(`Required contract ${name} is null`);
        }
        continue;
      }
      expect(contract.address).to.equal(await getActualAddress(network, name));
    }
  }

  it("should return correct contract instances for devnet", async () => {
    const contracts = getContracts({
      publicClient: arbitrumSepoliaClient,
      deployment: "devnet",
    });

    // Verify chain ID
    expect(arbitrumSepoliaClient.chain.id).to.equal(arbitrumSepolia.id);

    // Verify all contract instances
    verifyAllContractInstances(contracts);

    // Verify specific DisputeKit instances
    expect(contracts.disputeKitClassicUniversity).to.not.be.undefined;
    expect(contracts.disputeKitShutter).to.not.be.undefined;
    expect(contracts.disputeKitGated).to.not.be.undefined;
    expect(contracts.disputeKitGatedShutter).to.not.be.undefined;
    expect(contracts.disputeKitGatedArgentinaConsumerProtection).to.not.be.undefined;

    // Verify specific RNG instances
    expect(contracts.chainlinkRng).to.not.be.undefined;
    expect(contracts.randomizerRng).to.be.undefined;

    // Verify deployed addresses
    await verifyDeployedAddresses(contracts, NETWORKS.DEVNET, devnetContractMapping);
  });

  it("should return correct contract instances for testnet", async () => {
    const contracts = getContracts({
      publicClient: arbitrumSepoliaClient,
      deployment: "testnet",
    });

    // Verify chain ID
    expect(arbitrumSepoliaClient.chain.id).to.equal(arbitrumSepolia.id);

    // Verify all contract instances
    verifyAllContractInstances(contracts);

    // Verify specific DisputeKit instances
    expect(contracts.disputeKitClassicUniversity).to.be.undefined;
    expect(contracts.disputeKitShutter).to.not.be.undefined;
    expect(contracts.disputeKitGated).to.not.be.undefined;
    expect(contracts.disputeKitGatedShutter).to.not.be.undefined;
    expect(contracts.disputeKitGatedArgentinaConsumerProtection).to.be.undefined; // Not deployed yet

    // Verify specific RNG instances
    expect(contracts.chainlinkRng).to.not.be.undefined;
    expect(contracts.randomizerRng).to.be.undefined;

    // Verify deployed addresses
    await verifyDeployedAddresses(contracts, NETWORKS.TESTNET, testnetContractMapping);
  });

  it("should return correct contract instances for mainnet", async () => {
    const contracts = getContracts({
      publicClient: arbitrumClient,
      deployment: "mainnet",
    });

    // Verify chain ID
    expect(arbitrumClient.chain.id).to.equal(arbitrum.id);

    // Verify all contract instances
    verifyAllContractInstances(contracts);

    // Verify specific DisputeKit instances
    expect(contracts.disputeKitClassicUniversity).to.be.undefined;
    expect(contracts.disputeKitShutter).to.not.be.undefined;
    expect(contracts.disputeKitGated).to.not.be.undefined;
    expect(contracts.disputeKitGatedShutter).to.not.be.undefined;
    expect(contracts.disputeKitGatedArgentinaConsumerProtection).to.be.undefined; // Not deployed yet

    // Verify specific RNG instances
    expect(contracts.chainlinkRng).to.not.be.undefined;
    expect(contracts.randomizerRng).to.not.be.undefined;

    // Verify deployed addresses
    await verifyDeployedAddresses(contracts, NETWORKS.MAINNET, mainnetContractMapping);
  });

  it("should throw error for unsupported deployment", () => {
    expect(() =>
      getContracts({
        publicClient: arbitrumSepoliaClient,
        // @ts-expect-error Testing invalid deployment
        deployment: "invalid",
      })
    ).to.throw(/Cannot destructure property 'chainId'/);
  });
});

import { expect } from "chai";
import { createPublicClient, createWalletClient, http, Address } from "viem";
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

type ContractMapping = {
  [K in keyof ReturnType<typeof getContracts>]: {
    name: string;
    optional?: boolean;
  };
};

const baseContractMapping: ContractMapping = {
  klerosCore: { name: "KlerosCore" },
  sortition: { name: "SortitionModule" },
  disputeKitClassic: { name: "DisputeKitClassic" },
  disputeResolver: { name: "DisputeResolver" },
  disputeTemplateRegistry: { name: "DisputeTemplateRegistry" },
  evidence: { name: "EvidenceModule" },
  policyRegistry: { name: "PolicyRegistry" },
  transactionBatcher: { name: "TransactionBatcher" },
  chainlinkRng: { name: "ChainlinkRNG", optional: true },
  randomizerRng: { name: "RandomizerRNG", optional: true },
  blockHashRng: { name: "BlockHashRNG" },
  pnk: { name: "PNK" },
  klerosCoreSnapshotProxy: { name: "KlerosCoreSnapshotProxy" },
};

const universityContractMapping: ContractMapping = {
  klerosCore: { name: "KlerosCoreUniversity" },
  sortition: { name: "SortitionModuleUniversity" },
  disputeKitClassic: { name: "DisputeKitClassicUniversity" },
  disputeResolver: { name: "DisputeResolverUniversity" },
  disputeTemplateRegistry: { name: "DisputeTemplateRegistry" },
  evidence: { name: "EvidenceModule" },
  policyRegistry: { name: "PolicyRegistry" },
  transactionBatcher: { name: "TransactionBatcher" },
  chainlinkRng: { name: "ChainlinkRNG", optional: true },
  randomizerRng: { name: "RandomizerRNG", optional: true },
  blockHashRng: { name: "BlockHashRNG" },
  pnk: { name: "PNK" },
  klerosCoreSnapshotProxy: { name: "KlerosCoreSnapshotProxy" },
};

const neoContractMapping: ContractMapping = {
  klerosCore: { name: "KlerosCoreNeo" },
  sortition: { name: "SortitionModuleNeo" },
  disputeKitClassic: { name: "DisputeKitClassicNeo" },
  disputeResolver: { name: "DisputeResolverNeo" },
  disputeTemplateRegistry: { name: "DisputeTemplateRegistry" },
  evidence: { name: "EvidenceModule" },
  policyRegistry: { name: "PolicyRegistry" },
  transactionBatcher: { name: "TransactionBatcher" },
  chainlinkRng: { name: "ChainlinkRNG", optional: false },
  randomizerRng: { name: "RandomizerRNG", optional: false },
  blockHashRng: { name: "BlockHashRNG" },
  pnk: { name: "PNK" },
  klerosCoreSnapshotProxy: { name: "KlerosCoreSnapshotProxy" },
};

describe("getContracts", () => {
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
  function verifyContractInstance(contract: any) {
    expect(contract).to.have.property("address");
    expect(contract).to.have.property("abi");
    expect(contract.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(contract.address).to.not.equal("0x0000000000000000000000000000000000000000");
  }

  // Helper to verify all contract instances
  function verifyAllContractInstances(contracts: ReturnType<typeof getContracts>) {
    verifyContractInstance(contracts.klerosCore);
    verifyContractInstance(contracts.sortition);
    verifyContractInstance(contracts.disputeKitClassic);
    verifyContractInstance(contracts.disputeResolver);
    verifyContractInstance(contracts.disputeTemplateRegistry);
    verifyContractInstance(contracts.evidence);
    verifyContractInstance(contracts.policyRegistry);
    verifyContractInstance(contracts.transactionBatcher);
    verifyContractInstance(contracts.blockHashRng);
    verifyContractInstance(contracts.pnk);
    verifyContractInstance(contracts.klerosCoreSnapshotProxy);

    if (contracts.chainlinkRng) {
      verifyContractInstance(contracts.chainlinkRng);
    }
    if (contracts.randomizerRng) {
      verifyContractInstance(contracts.randomizerRng);
    }
  }

  // Helper to verify deployed addresses
  async function verifyDeployedAddresses(
    contracts: ReturnType<typeof getContracts>,
    network: NetworkType,
    contractMapping: ContractMapping
  ) {
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

    // Verify specific RNG instances
    expect(contracts.chainlinkRng).to.not.be.undefined;
    expect(contracts.randomizerRng).to.be.undefined;

    // Verify deployed addresses
    await verifyDeployedAddresses(contracts, NETWORKS.DEVNET, baseContractMapping);
  });

  it("should return correct contract instances for university", async () => {
    const contracts = getContracts({
      publicClient: arbitrumSepoliaClient,
      deployment: "university",
    });

    // Verify chain ID
    expect(arbitrumSepoliaClient.chain.id).to.equal(arbitrumSepolia.id);

    // Verify all contract instances
    verifyAllContractInstances(contracts);

    // Verify specific RNG instances
    expect(contracts.chainlinkRng).to.be.undefined;
    expect(contracts.randomizerRng).to.be.undefined;

    // Verify deployed addresses
    await verifyDeployedAddresses(contracts, NETWORKS.DEVNET, universityContractMapping);
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

    // Verify specific RNG instances
    expect(contracts.chainlinkRng).to.not.be.undefined;
    expect(contracts.randomizerRng).to.be.undefined;

    // Verify deployed addresses
    await verifyDeployedAddresses(contracts, NETWORKS.TESTNET, baseContractMapping);
  });

  it("should return correct contract instances for mainnetNeo", async () => {
    const contracts = getContracts({
      publicClient: arbitrumClient,
      deployment: "mainnetNeo",
    });

    // Verify chain ID
    expect(arbitrumClient.chain.id).to.equal(arbitrum.id);

    // Verify all contract instances
    verifyAllContractInstances(contracts);

    // Verify specific RNG instances
    expect(contracts.chainlinkRng).to.not.be.undefined;
    expect(contracts.randomizerRng).to.not.be.undefined;

    // Verify deployed addresses
    await verifyDeployedAddresses(contracts, NETWORKS.MAINNET, neoContractMapping);
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

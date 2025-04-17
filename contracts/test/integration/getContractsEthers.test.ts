import { expect } from "chai";
import { ethers } from "ethers";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { getContracts } from "../../deployments/contractsEthers";
import {
  KlerosCore__factory,
  KlerosCoreNeo__factory,
  KlerosCoreUniversity__factory,
  SortitionModule__factory,
  SortitionModuleNeo__factory,
  SortitionModuleUniversity__factory,
  DisputeKitClassic__factory,
  DisputeResolver__factory,
  DisputeTemplateRegistry__factory,
  EvidenceModule__factory,
  PolicyRegistry__factory,
  TransactionBatcher__factory,
  ChainlinkRNG__factory,
  RandomizerRNG__factory,
  BlockHashRNG__factory,
  PNK__factory,
  KlerosCoreSnapshotProxy__factory,
} from "../../typechain-types";
import { getActualAddress } from "../utils/getActualAddress";

// Network names for deployments
const NETWORKS = {
  DEVNET: "arbitrumSepoliaDevnet",
  TESTNET: "arbitrumSepolia",
  MAINNET: "arbitrum",
} as const;

type NetworkType = (typeof NETWORKS)[keyof typeof NETWORKS];

type ContractMapping = {
  [K in keyof Awaited<ReturnType<typeof getContracts>>]: {
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
  // Use real providers for each network
  const arbitrumSepoliaProvider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
  const arbitrumProvider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

  function getConstructor<T extends { constructor: any }>(
    factory: { connect: (address: string, provider: ethers.Provider) => T },
    provider: ethers.Provider
  ) {
    return factory.connect("0x0", provider).constructor;
  }

  function verifyCommonContractInstances(
    contracts: Awaited<ReturnType<typeof getContracts>>,
    provider: ethers.Provider
  ) {
    expect(contracts.disputeKitClassic).to.be.instanceOf(getConstructor(DisputeKitClassic__factory, provider));
    expect(contracts.disputeResolver).to.be.instanceOf(getConstructor(DisputeResolver__factory, provider));
    expect(contracts.disputeTemplateRegistry).to.be.instanceOf(
      getConstructor(DisputeTemplateRegistry__factory, provider)
    );
    expect(contracts.evidence).to.be.instanceOf(getConstructor(EvidenceModule__factory, provider));
    expect(contracts.policyRegistry).to.be.instanceOf(getConstructor(PolicyRegistry__factory, provider));
    expect(contracts.transactionBatcher).to.be.instanceOf(getConstructor(TransactionBatcher__factory, provider));
    expect(contracts.blockHashRng).to.be.instanceOf(getConstructor(BlockHashRNG__factory, provider));
    expect(contracts.pnk).to.be.instanceOf(getConstructor(PNK__factory, provider));
    expect(contracts.klerosCoreSnapshotProxy).to.be.instanceOf(
      getConstructor(KlerosCoreSnapshotProxy__factory, provider)
    );
    if (contracts.chainlinkRng) {
      expect(contracts.chainlinkRng).to.be.instanceOf(getConstructor(ChainlinkRNG__factory, provider));
    }
    if (contracts.randomizerRng) {
      expect(contracts.randomizerRng).to.be.instanceOf(getConstructor(RandomizerRNG__factory, provider));
    }
  }

  // Helper to verify contract addresses
  async function verifyContractAddress(address: Promise<string>) {
    const resolvedAddress = await address;
    expect(resolvedAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(resolvedAddress).to.not.equal("0x0000000000000000000000000000000000000000");
  }

  // Helper to verify all contract addresses
  async function verifyAllContractAddresses(contracts: Awaited<ReturnType<typeof getContracts>>) {
    await verifyContractAddress(contracts.klerosCore.getAddress());
    await verifyContractAddress(contracts.sortition.getAddress());
    await verifyContractAddress(contracts.disputeKitClassic.getAddress());
    await verifyContractAddress(contracts.disputeResolver.getAddress());
    await verifyContractAddress(contracts.disputeTemplateRegistry.getAddress());
    await verifyContractAddress(contracts.evidence.getAddress());
    await verifyContractAddress(contracts.policyRegistry.getAddress());
    await verifyContractAddress(contracts.transactionBatcher.getAddress());
    if (contracts.chainlinkRng) {
      await verifyContractAddress(contracts.chainlinkRng.getAddress());
    }
    if (contracts.randomizerRng) {
      await verifyContractAddress(contracts.randomizerRng.getAddress());
    }
    await verifyContractAddress(contracts.blockHashRng.getAddress());
    await verifyContractAddress(contracts.pnk.getAddress());
    await verifyContractAddress(contracts.klerosCoreSnapshotProxy.getAddress());
  }

  // Helper to verify contract addresses against deployment files
  async function verifyDeployedAddresses(
    contracts: Awaited<ReturnType<typeof getContracts>>,
    network: NetworkType,
    contractMapping: ContractMapping
  ) {
    for (const [key, { name, optional }] of Object.entries(contractMapping)) {
      const contract = contracts[key as keyof typeof contracts];
      if (contract === null) {
        if (!optional) {
          throw new Error(`Required contract ${name} is null`);
        }
        continue;
      }
      expect(await contract.getAddress()).to.equal(await getActualAddress(network, name));
    }
  }

  it("should return correct contract instances for devnet", async () => {
    const contracts = await getContracts(arbitrumSepoliaProvider, "devnet");

    // Verify chain ID
    const network = await arbitrumSepoliaProvider.getNetwork();
    expect(network.chainId).to.equal(arbitrumSepolia.id);

    // Verify contract instances
    expect(contracts.klerosCore).to.be.instanceOf(getConstructor(KlerosCore__factory, arbitrumSepoliaProvider));
    expect(contracts.sortition).to.be.instanceOf(getConstructor(SortitionModule__factory, arbitrumSepoliaProvider));
    verifyCommonContractInstances(contracts, arbitrumSepoliaProvider);
    expect(contracts.chainlinkRng).to.not.be.null;
    expect(contracts.randomizerRng).to.be.null;

    // Verify all contract addresses
    await verifyAllContractAddresses(contracts);
    await verifyDeployedAddresses(contracts, NETWORKS.DEVNET, baseContractMapping);
  });

  it("should return correct contract instances for university", async () => {
    const contracts = await getContracts(arbitrumSepoliaProvider, "university");

    // Verify chain ID
    const network = await arbitrumSepoliaProvider.getNetwork();
    expect(network.chainId).to.equal(arbitrumSepolia.id);

    // Verify contract instances
    expect(contracts.klerosCore).to.be.instanceOf(
      getConstructor(KlerosCoreUniversity__factory, arbitrumSepoliaProvider)
    );
    expect(contracts.sortition).to.be.instanceOf(
      getConstructor(SortitionModuleUniversity__factory, arbitrumSepoliaProvider)
    );
    verifyCommonContractInstances(contracts, arbitrumSepoliaProvider);
    expect(contracts.chainlinkRng).to.not.be.null;
    expect(contracts.randomizerRng).to.be.null;

    // Verify all contract addresses
    await verifyAllContractAddresses(contracts);
    await verifyDeployedAddresses(contracts, NETWORKS.DEVNET, universityContractMapping);
  });

  it("should return correct contract instances for testnet", async () => {
    const contracts = await getContracts(arbitrumSepoliaProvider, "testnet");

    // Verify chain ID
    const network = await arbitrumSepoliaProvider.getNetwork();
    expect(network.chainId).to.equal(arbitrumSepolia.id);

    // Verify contract instances
    expect(contracts.klerosCore).to.be.instanceOf(getConstructor(KlerosCore__factory, arbitrumSepoliaProvider));
    expect(contracts.sortition).to.be.instanceOf(getConstructor(SortitionModule__factory, arbitrumSepoliaProvider));
    verifyCommonContractInstances(contracts, arbitrumSepoliaProvider);
    expect(contracts.chainlinkRng).to.not.be.null;
    expect(contracts.randomizerRng).to.be.null;

    // Verify all contract addresses
    await verifyAllContractAddresses(contracts);
    await verifyDeployedAddresses(contracts, NETWORKS.TESTNET, baseContractMapping);
  });

  it("should return correct contract instances for mainnetNeo", async () => {
    const contracts = await getContracts(arbitrumProvider, "mainnetNeo");

    // Verify chain ID
    const network = await arbitrumProvider.getNetwork();
    expect(network.chainId).to.equal(arbitrum.id);

    // Verify contract instances
    expect(contracts.klerosCore).to.be.instanceOf(getConstructor(KlerosCoreNeo__factory, arbitrumProvider));
    expect(contracts.sortition).to.be.instanceOf(getConstructor(SortitionModuleNeo__factory, arbitrumProvider));
    verifyCommonContractInstances(contracts, arbitrumProvider);
    expect(contracts.chainlinkRng).to.not.be.null;
    expect(contracts.randomizerRng).to.not.be.null;

    // Verify all contract addresses
    await verifyAllContractAddresses(contracts);
    await verifyDeployedAddresses(contracts, NETWORKS.MAINNET, neoContractMapping);
  });

  it("should throw error for unsupported deployment", async () => {
    // @ts-expect-error Testing invalid deployment
    await expect(getContracts(arbitrumSepoliaProvider, "invalid")).to.be.rejectedWith(
      /Unsupported deployment|Cannot destructure property/
    );
  });
});

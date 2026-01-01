import { promises as fs } from "fs";
import path from "path";
import { ethers } from "ethers";
import env from "./utils/env";
import loggerFactory from "./utils/logger";

const logger = loggerFactory.createLogger();

// ============================================================================
// Type Definitions
// ============================================================================

interface DeploymentArtifact {
  address: string;
  implementation?: string;
  [key: string]: any;
}

interface TenderlyContractPayload {
  network_id: string;
  address: string;
  display_name: string;
}

interface TenderlyConfig {
  accessKey: string;
  accountId: string;
  project: string;
}

interface ContractToSync {
  name: string;
  address: string;
  isImplementation: boolean;
}

interface SyncResult {
  network: string;
  chainId: string;
  total: number;
  succeeded: number;
  failed: number;
  alreadyExisted: number;
  errors: Array<{ contract: string; error: string }>;
}

interface TenderlyApiResponse {
  id: string;
  display_name: string;
  contract: {
    address: string;
    network_id: string;
    contract_name?: string;
  };
  added_at: string;
}

interface TenderlyTagPayload {
  tag: string;
  contract_ids: string[];
}

interface TenderlyTagResponse {
  tag: {
    tag: string;
    created_at: string;
  };
}

interface TagResult {
  network: string;
  chainId: string;
  tag: string;
  contractCount: number;
  success: boolean;
  error?: string;
}

interface UntagResult {
  network: string;
  chainId: string;
  tag: string;
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{ contract: string; error: string }>;
}

// ============================================================================
// Configuration
// ============================================================================

const getTenderlyConfig = (dryRun: boolean): TenderlyConfig => {
  return {
    accessKey: dryRun ? "dry-run-key" : env.require("TENDERLY_ACCESS_KEY"),
    accountId: env.require("TENDERLY_ACCOUNT_ID"),
    project: env.optional("TENDERLY_PROJECT", "kleros-v2"),
  };
};

// ============================================================================
// Deployment Reading Functions
// ============================================================================

/**
 * Reads deployment artifacts from a Hardhat network folder
 * @param network The network name (e.g., "arbitrumSepolia")
 * @returns Object containing chainId and list of contracts to sync
 */
async function getNetworkDeployments(network: string): Promise<{ chainId: string; contracts: ContractToSync[] }> {
  const deploymentPath = path.join(__dirname, "../deployments", network);

  // Check if deployment directory exists
  try {
    await fs.access(deploymentPath);
  } catch (error) {
    throw new Error(`Deployment directory not found: ${deploymentPath}`);
  }

  // Read chainId from .chainId file
  let chainId: string;
  try {
    chainId = (await fs.readFile(path.join(deploymentPath, ".chainId"), "utf-8")).trim();
  } catch (error) {
    throw new Error(`Missing .chainId file in ${deploymentPath}`);
  }

  // Read all JSON files (skip _Implementation.json and _Proxy.json duplicates)
  const files = await fs.readdir(deploymentPath);
  const jsonFiles = files.filter(
    (f) => f.endsWith(".json") && !f.endsWith("_Implementation.json") && !f.endsWith("_Proxy.json")
  );

  logger.info(`Found ${jsonFiles.length} deployment files in ${network}`);

  const contracts: ContractToSync[] = [];

  for (const file of jsonFiles) {
    try {
      const fileContent = await fs.readFile(path.join(deploymentPath, file), "utf-8");
      const artifact: DeploymentArtifact = JSON.parse(fileContent);

      const contractName = path.basename(file, ".json");

      // Add main contract (proxy or regular contract)
      contracts.push({
        name: contractName,
        address: artifact.address,
        isImplementation: false,
      });

      // Add implementation contract if it exists and is not zero address
      if (artifact.implementation && artifact.implementation !== ethers.ZeroAddress) {
        contracts.push({
          name: `${contractName}_Implementation`,
          address: artifact.implementation,
          isImplementation: true,
        });
      }
    } catch (error) {
      logger.error(`Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`);
      // Continue with next file
    }
  }

  return { chainId, contracts };
}

// ============================================================================
// Tenderly API Functions
// ============================================================================

/**
 * Adds a contract to Tenderly via REST API
 * @param config Tenderly configuration (API key, account ID, project)
 * @param chainId The network's chain ID (e.g., "421614")
 * @param contract The contract to add
 * @param dryRun If true, only log what would be done without making API calls
 * @returns Object indicating success/failure and whether contract already existed
 */
async function addContractToTenderly(
  config: TenderlyConfig,
  chainId: string,
  contract: ContractToSync,
  dryRun: boolean
): Promise<{ success: boolean; error?: string; alreadyExists?: boolean }> {
  const url = `https://api.tenderly.co/api/v1/account/${config.accountId}/project/${config.project}/address`;

  if (dryRun) {
    logger.info(`[DRY RUN] Would add: ${contract.name} at ${contract.address}`);
    return { success: true };
  }

  try {
    const payload: TenderlyContractPayload = {
      network_id: chainId,
      address: contract.address,
      display_name: contract.name,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Access-Key": config.accessKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Successfully added
      const data = (await response.json()) as TenderlyApiResponse;
      logger.debug(`Added at: ${data.added_at}`);
      return { success: true };
    }

    if (response.status === 409) {
      // Contract already exists - treat as success
      logger.debug(`Contract already exists in Tenderly`);
      return { success: true, alreadyExists: true };
    }

    // Handle other errors
    const errorBody = await response.text();
    return {
      success: false,
      error: `HTTP ${response.status}: ${errorBody}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Main Sync Logic
// ============================================================================

/**
 * Syncs all contracts from a network to Tenderly
 * @param network The network name (e.g., "arbitrumSepolia")
 * @param config Tenderly configuration
 * @param dryRun If true, only log what would be done
 * @returns Sync result with statistics
 */
async function syncNetworkToTenderly(network: string, config: TenderlyConfig, dryRun: boolean): Promise<SyncResult> {
  logger.info(`Syncing network: ${network}${dryRun ? " (DRY RUN)" : ""}`);

  const { chainId, contracts } = await getNetworkDeployments(network);

  logger.info(`Chain ID: ${chainId}`);
  logger.info(`Contracts to sync: ${contracts.length}`);
  logger.info("");

  const result: SyncResult = {
    network,
    chainId,
    total: contracts.length,
    succeeded: 0,
    failed: 0,
    alreadyExisted: 0,
    errors: [],
  };

  for (const contract of contracts) {
    const { success, error, alreadyExists } = await addContractToTenderly(config, chainId, contract, dryRun);

    if (success) {
      result.succeeded++;
      if (alreadyExists) {
        result.alreadyExisted++;
        logger.info(`⊙ ${contract.name} (${contract.address}) - already in Tenderly`);
      } else {
        logger.info(`✓ ${contract.name} (${contract.address}) - added`);
      }
    } else {
      result.failed++;
      result.errors.push({ contract: contract.name, error: error! });
      logger.error(`✗ ${contract.name}: ${error}`);
    }

    // Small delay to avoid rate limiting
    if (!dryRun) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return result;
}

// ============================================================================
// Tagging Functions
// ============================================================================

// Contracts to exclude from tagging (in addition to implementations)
const TAGGING_EXCLUDED_CONTRACTS = ["RandomizerOracle", "ChainlinkVRFCoordinator", "PNK", "PinakionV2"];

/**
 * Tags all non-implementation contracts in a network
 * @param network The network name (e.g., "arbitrumSepolia")
 * @param config Tenderly configuration
 * @param tagName The tag to apply to contracts
 * @param dryRun If true, only log what would be done
 * @returns Tag result with statistics
 */
async function tagNetworkContracts(
  network: string,
  config: TenderlyConfig,
  tagName: string,
  dryRun: boolean
): Promise<TagResult> {
  logger.info(`Tagging network contracts: ${network}${dryRun ? " (DRY RUN)" : ""}`);
  logger.info(`Tag: ${tagName}`);

  const { chainId, contracts } = await getNetworkDeployments(network);

  // Filter out implementation contracts and excluded contracts
  const proxyContracts = contracts.filter((c) => !c.isImplementation && !TAGGING_EXCLUDED_CONTRACTS.includes(c.name));

  logger.info(`Chain ID: ${chainId}`);
  logger.info(
    `Contracts to tag: ${proxyContracts.length} (excluding ${contracts.length - proxyContracts.length} implementations and specific contracts)`
  );
  logger.info("");

  // Build contract IDs array in format: eth:{chainId}:{address}
  const contractIds = proxyContracts.map((c) => `eth:${chainId}:${c.address.toLowerCase()}`);

  // Log contracts that will be tagged
  proxyContracts.forEach((c) => {
    logger.info(`  • ${c.name} (${c.address})`);
  });
  logger.info("");

  if (dryRun) {
    logger.info(`[DRY RUN] Would tag ${contractIds.length} contracts with tag: ${tagName}`);
    return {
      network,
      chainId,
      tag: tagName,
      contractCount: contractIds.length,
      success: true,
    };
  }

  try {
    const url = `https://api.tenderly.co/api/v1/account/${config.accountId}/project/${config.project}/tag`;

    const payload: TenderlyTagPayload = {
      tag: tagName,
      contract_ids: contractIds,
    };

    logger.debug(`Calling Tenderly tag API with ${contractIds.length} contracts`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Access-Key": config.accessKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = (await response.json()) as TenderlyTagResponse;
      logger.info(`✓ Successfully tagged ${contractIds.length} contracts`);
      logger.info(`  Tag: ${data.tag.tag}`);
      logger.info(`  Created at: ${data.tag.created_at}`);

      return {
        network,
        chainId,
        tag: tagName,
        contractCount: contractIds.length,
        success: true,
      };
    }

    const errorBody = await response.text();
    logger.error(`Failed to tag contracts: HTTP ${response.status}`);
    return {
      network,
      chainId,
      tag: tagName,
      contractCount: contractIds.length,
      success: false,
      error: `HTTP ${response.status}: ${errorBody}`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Exception while tagging: ${errorMsg}`);
    return {
      network,
      chainId,
      tag: tagName,
      contractCount: contractIds.length,
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Removes a specific tag from all contracts in a network
 * @param network The network name (e.g., "arbitrumSepolia")
 * @param config Tenderly configuration
 * @param tagName The tag to remove from contracts
 * @param dryRun If true, only log what would be done
 * @returns Untag result with statistics
 */
async function untagNetworkContracts(
  network: string,
  config: TenderlyConfig,
  tagName: string,
  dryRun: boolean
): Promise<UntagResult> {
  logger.info(`Untagging network contracts: ${network}${dryRun ? " (DRY RUN)" : ""}`);
  logger.info(`Tag to remove: ${tagName}`);

  const { chainId, contracts } = await getNetworkDeployments(network);

  logger.info(`Chain ID: ${chainId}`);
  logger.info(`Contracts to untag: ${contracts.length} (including implementations)`);
  logger.info("");

  const result: UntagResult = {
    network,
    chainId,
    tag: tagName,
    total: contracts.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  // Log contracts that will be untagged
  contracts.forEach((c) => {
    logger.info(`  • ${c.name} (${c.address})`);
  });
  logger.info("");

  if (dryRun) {
    logger.info(`[DRY RUN] Would remove tag "${tagName}" from ${contracts.length} contracts`);
    return { ...result, succeeded: contracts.length };
  }

  // Untag each contract individually (no bulk endpoint available)
  for (const contract of contracts) {
    const { success, error } = await removeTagFromContract(config, chainId, contract, tagName);

    if (success) {
      result.succeeded++;
      logger.info(`✓ ${contract.name} (${contract.address}) - tag removed`);
    } else {
      result.failed++;
      result.errors.push({ contract: contract.name, error: error! });
      logger.warn(`⚠ ${contract.name}: ${error}`);
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return result;
}

/**
 * Removes a tag from a single contract
 * @param config Tenderly configuration
 * @param chainId The network's chain ID
 * @param contract The contract to untag
 * @param tagName The tag to remove
 * @returns Object indicating success/failure
 */
async function removeTagFromContract(
  config: TenderlyConfig,
  chainId: string,
  contract: ContractToSync,
  tagName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://api.tenderly.co/api/v1/account/${config.accountId}/project/${config.project}/contract/${chainId}/${contract.address.toLowerCase()}/tag`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "X-Access-Key": config.accessKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tag: tagName }),
    });

    if (response.ok) {
      logger.debug(`Removed tag from ${contract.name}`);
      return { success: true };
    }

    // 404 might mean contract doesn't have the tag - treat as warning, not error
    if (response.status === 404) {
      return { success: false, error: "Tag not found on contract" };
    }

    const errorBody = await response.text();
    return {
      success: false,
      error: `HTTP ${response.status}: ${errorBody}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Support both --network=arbitrumSepolia and --network arbitrumSepolia
  let network: string | undefined;
  const networkEqualIndex = args.findIndex((a) => a.startsWith("--network="));
  const networkSpaceIndex = args.findIndex((a) => a === "--network");

  if (networkEqualIndex !== -1) {
    network = args[networkEqualIndex].split("=")[1];
  } else if (networkSpaceIndex !== -1 && args[networkSpaceIndex + 1]) {
    network = args[networkSpaceIndex + 1];
  }

  // Parse --tag (both formats: --tag=value and --tag value)
  let tag: string | undefined;
  const tagEqualIndex = args.findIndex((a) => a.startsWith("--tag="));
  const tagSpaceIndex = args.findIndex((a) => a === "--tag");

  if (tagEqualIndex !== -1) {
    tag = args[tagEqualIndex].split("=")[1];
  } else if (tagSpaceIndex !== -1 && args[tagSpaceIndex + 1]) {
    tag = args[tagSpaceIndex + 1];
  }

  // Parse --untag (both formats: --untag=value and --untag value)
  let untag: string | undefined;
  const untagEqualIndex = args.findIndex((a) => a.startsWith("--untag="));
  const untagSpaceIndex = args.findIndex((a) => a === "--untag");

  if (untagEqualIndex !== -1) {
    untag = args[untagEqualIndex].split("=")[1];
  } else if (untagSpaceIndex !== -1 && args[untagSpaceIndex + 1]) {
    untag = args[untagSpaceIndex + 1];
  }

  // Validate mutually exclusive options
  if (tag && untag) {
    logger.error("Error: Cannot use --tag and --untag together");
    process.exit(1);
  }

  const dryRun = args.includes("--dry-run");

  if (!network) {
    logger.error("Usage:");
    logger.error("  Sync:   yarn sync-tenderly --network=<network> [--dry-run]");
    logger.error("  Tag:    yarn sync-tenderly --network=<network> --tag=<tag> [--dry-run]");
    logger.error("  Untag:  yarn sync-tenderly --network=<network> --untag=<tag> [--dry-run]");
    logger.error("");
    logger.error("Examples:");
    logger.error("  yarn sync-tenderly --network arbitrumSepolia");
    logger.error("  yarn sync-tenderly --network arbitrumSepolia --tag v2.0.0");
    logger.error("  yarn sync-tenderly --network arbitrumSepolia --untag v1.0.0 --dry-run");
    logger.error("");
    logger.error("Available networks:");
    logger.error("  - arbitrum, arbitrumSepolia, arbitrumSepoliaDevnet");
    logger.error("  - chiado, chiadoDevnet");
    logger.error("  - gnosischain, kleroschain");
    logger.error("  - mainnet, sepolia, sepoliaDevnet");
    process.exit(1);
  }

  try {
    const config = getTenderlyConfig(dryRun);

    // If --untag is provided, untag contracts
    if (untag) {
      const result = await untagNetworkContracts(network, config, untag, dryRun);

      logger.info("");
      logger.info("=".repeat(50));
      logger.info("--- Untag Summary ---");
      logger.info(`Network: ${result.network} (chainId: ${result.chainId})`);
      logger.info(`Tag removed: ${result.tag}`);
      logger.info(`Total contracts: ${result.total}`);
      logger.info(`Succeeded: ${result.succeeded}`);
      logger.info(`Failed: ${result.failed}`);
      logger.info("=".repeat(50));

      if (result.errors.length > 0) {
        logger.warn("");
        logger.warn("Warnings/Errors:");
        result.errors.forEach((e) => logger.warn(`  ${e.contract}: ${e.error}`));
      }

      process.exit(result.failed > 0 ? 1 : 0);
    }

    // If --tag is provided, tag contracts instead of syncing
    if (tag) {
      const result = await tagNetworkContracts(network, config, tag, dryRun);

      logger.info("");
      logger.info("=".repeat(50));
      logger.info("--- Tag Summary ---");
      logger.info(`Network: ${result.network} (chainId: ${result.chainId})`);
      logger.info(`Tag: ${result.tag}`);
      logger.info(`Contracts tagged: ${result.contractCount}`);
      logger.info(`Status: ${result.success ? "✓ SUCCESS" : "✗ FAILED"}`);
      logger.info("=".repeat(50));

      if (result.error) {
        logger.error("");
        logger.error(`Error: ${result.error}`);
      }

      process.exit(result.success ? 0 : 1);
    }

    // Otherwise, sync contracts (existing behavior)
    const result = await syncNetworkToTenderly(network, config, dryRun);

    logger.info("");
    logger.info("=".repeat(50));
    logger.info("--- Sync Summary ---");
    logger.info(`Network: ${result.network} (chainId: ${result.chainId})`);
    logger.info(`Total contracts: ${result.total}`);
    logger.info(`Added: ${result.succeeded - result.alreadyExisted}`);
    logger.info(`Already existed: ${result.alreadyExisted}`);
    logger.info(`Failed: ${result.failed}`);
    logger.info("=".repeat(50));

    if (result.errors.length > 0) {
      logger.error("");
      logger.error("Errors:");
      result.errors.forEach((e) => logger.error(`  ${e.contract}: ${e.error}`));
    }

    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Fatal error: ${error.message}`);
      logger.error(error.stack);
    } else {
      logger.error("Fatal error:", error);
    }
    process.exit(1);
  }
}

main();

/**
 * Get the deployed address of a contract from its deployment JSON file
 * @param network The network name (e.g., "arbitrumSepoliaDevnet")
 * @param contractName The contract name (e.g., "KlerosCore")
 * @returns The deployed contract address
 * @throws Error if the deployment file doesn't exist or has no address
 */
export async function getActualAddress(network: string, contractName: string): Promise<string> {
  try {
    const deployment = await import(`../../deployments/${network}/${contractName}.json`, {
      assert: { type: "json" },
    });
    if (!deployment.default.address) {
      throw new Error(`No address found in deployment file for ${contractName} on ${network}`);
    }
    return deployment.default.address;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      throw new Error(`No deployment file found for ${contractName} on ${network}`);
    }
    throw error;
  }
}

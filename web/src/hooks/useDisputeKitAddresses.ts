import { useEffect, useState } from "react";

import { useChainId } from "wagmi";

import { DisputeKits } from "consts/index";

interface UseDisputeKitAddressesParams {
  disputeKitAddress?: string;
}

interface UseDisputeKitAddressesAllReturn {
  availableDisputeKits: Record<string, DisputeKits>;
  isLoading: boolean;
  error: string | null;
}

const DISPUTE_KIT_CONFIG = {
  [DisputeKits.Classic]: "disputeKitClassicAddress",
  [DisputeKits.Shutter]: "disputeKitShutterAddress",
  [DisputeKits.Gated]: "disputeKitGatedAddress",
  [DisputeKits.GatedShutter]: "disputeKitGatedShutterAddress",
} as const;

/**
 * Hook to get dispute kit name based on address
 * @param disputeKitAddress - Optional specific dispute kit address to identify
 * @returns The human-readable name of the dispute kit and loading state
 */
export const useDisputeKitAddresses = ({ disputeKitAddress }: UseDisputeKitAddressesParams = {}) => {
  const chainId = useChainId();
  const [disputeKitName, setDisputeKitName] = useState<DisputeKits | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDisputeKitName = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If no dispute kit address is provided, we can't determine the type
        if (!disputeKitAddress) {
          setDisputeKitName(undefined);
          setIsLoading(false);
          return;
        }

        // If no chainId, we can't look up from generated contracts
        if (!chainId) {
          setDisputeKitName(undefined);
          setIsLoading(false);
          return;
        }

        // Dynamic import to handle cases where generated contracts might not be available
        try {
          const generatedContracts = await import("hooks/contracts/generated");

          // Check each dispute kit to see if the address matches
          for (const [humanName, contractKey] of Object.entries(DISPUTE_KIT_CONFIG)) {
            const addressMapping = generatedContracts[contractKey as keyof typeof generatedContracts];

            if (addressMapping && typeof addressMapping === "object" && chainId in addressMapping) {
              const contractAddress = addressMapping[chainId as keyof typeof addressMapping] as string;
              if (
                contractAddress &&
                typeof contractAddress === "string" &&
                contractAddress.toLowerCase() === disputeKitAddress.toLowerCase()
              ) {
                setDisputeKitName(humanName as DisputeKits);
                return;
              }
            }
          }

          // If no address matches, return undefined
          setDisputeKitName(undefined);
        } catch {
          // If we can't import generated contracts, return undefined
          setDisputeKitName(undefined);
        }
      } catch (err) {
        console.error("Failed to determine dispute kit name:", err);
        setError("Failed to determine dispute kit type");
        setDisputeKitName(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    loadDisputeKitName();
  }, [chainId, disputeKitAddress]);

  return {
    disputeKitName,
    isLoading,
    error,
  };
};

/**
 * Hook to get all dispute kit addresses for the current chain
 * @returns All dispute kit addresses, loading state, and error state
 */
export const useDisputeKitAddressesAll = (): UseDisputeKitAddressesAllReturn => {
  const chainId = useChainId();
  const [availableDisputeKits, setAvailableDisputeKits] = useState<Record<string, DisputeKits>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllDisputeKitAddresses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If no chainId, we can't look up from generated contracts
        if (!chainId) {
          setAvailableDisputeKits({});
          setIsLoading(false);
          return;
        }

        // Dynamic import to handle cases where generated contracts might not be available
        try {
          const generatedContracts = await import("hooks/contracts/generated");
          const newAvailableDisputeKits: Record<string, DisputeKits> = {};

          // Iterate through all dispute kits and get their addresses
          for (const [humanName, contractKey] of Object.entries(DISPUTE_KIT_CONFIG)) {
            const addressMapping = generatedContracts[contractKey as keyof typeof generatedContracts];

            if (addressMapping && typeof addressMapping === "object" && chainId in addressMapping) {
              const contractAddress = addressMapping[chainId as keyof typeof addressMapping] as string;
              if (contractAddress && typeof contractAddress === "string") {
                newAvailableDisputeKits[contractAddress.toLowerCase()] = humanName as DisputeKits;
              }
            }
          }

          setAvailableDisputeKits(newAvailableDisputeKits);
        } catch {
          // If we can't import generated contracts, return empty object
          setAvailableDisputeKits({});
        }
      } catch (err) {
        console.error("Failed to load dispute kit addresses:", err);
        setError("Failed to load dispute kit addresses");
        setAvailableDisputeKits({});
      } finally {
        setIsLoading(false);
      }
    };

    loadAllDisputeKitAddresses();
  }, [chainId]);

  return {
    availableDisputeKits,
    isLoading,
    error,
  };
};

import { useEffect, useState, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getContract, isAddress } from "viem";
import { usePublicClient, useChainId } from "wagmi";

import { isUndefined } from "utils/index";

const ERC1155_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const ERC20_ERC721_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface UseTokenValidationParams {
  address?: string;
  enabled?: boolean;
}

interface TokenValidationResult {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
}

/**
 * Hook to validate if an address is a valid ERC20 or ERC721 token by attempting to call balanceOf(address)
 * @param address The address to validate
 * @param enabled Whether validation should be enabled
 * @returns Validation state including loading, result, and error
 */
export const useERC20ERC721Validation = ({
  address,
  enabled = true,
}: UseTokenValidationParams): TokenValidationResult => {
  return useTokenValidation({
    address,
    enabled,
    abi: ERC20_ERC721_ABI,
    contractCall: (contract) => contract.read.balanceOf(["0x0000000000000000000000000000000000000000"]),
    tokenType: "ERC-20 or ERC-721",
  });
};

/**
 * Hook to validate if an address is a valid ERC1155 token by attempting to call balanceOf(address, tokenId)
 * @param address The address to validate
 * @param enabled Whether validation should be enabled
 * @returns Validation state including loading, result, and error
 */
export const useERC1155Validation = ({ address, enabled = true }: UseTokenValidationParams): TokenValidationResult => {
  return useTokenValidation({
    address,
    enabled,
    abi: ERC1155_ABI,
    contractCall: (contract) => contract.read.balanceOf(["0x0000000000000000000000000000000000000000", 0]),
    tokenType: "ERC-1155",
  });
};

/**
 * Generic hook for token contract validation
 */
const useTokenValidation = ({
  address,
  enabled = true,
  abi,
  contractCall,
  tokenType,
}: UseTokenValidationParams & {
  abi: readonly any[];
  contractCall: (contract: any) => Promise<any>;
  tokenType: string;
}): TokenValidationResult => {
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const [debouncedAddress, setDebouncedAddress] = useState<string>();

  // Debounce address changes to avoid excessive network calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAddress(address);
    }, 500);

    return () => clearTimeout(timer);
  }, [address]);

  // Early validation - check format
  const isValidFormat = useMemo(() => {
    if (!debouncedAddress || debouncedAddress.trim() === "") return null;
    return isAddress(debouncedAddress);
  }, [debouncedAddress]);

  // Contract validation query
  const {
    data: isValidContract,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`${tokenType}-validation`, chainId, debouncedAddress],
    enabled: enabled && !isUndefined(publicClient) && Boolean(isValidFormat),
    staleTime: 300000, // Cache for 5 minutes
    retry: 1, // Only retry once to fail faster
    retryDelay: 1000, // Short retry delay
    queryFn: async () => {
      if (!publicClient || !debouncedAddress) {
        throw new Error("Missing required dependencies");
      }

      try {
        const contract = getContract({
          address: debouncedAddress as `0x${string}`,
          abi,
          client: publicClient,
        });

        // Execute the contract call specific to the token type
        await contractCall(contract);

        return true;
      } catch {
        throw new Error(`Address does not implement ${tokenType} interface`);
      }
    },
  });

  // Determine final validation state
  const isValid = useMemo(() => {
    if (!debouncedAddress || debouncedAddress.trim() === "") {
      return null;
    }

    if (isValidFormat === false) {
      return false;
    }

    if (isLoading) {
      return null; // Still validating
    }

    return isValidContract === true;
  }, [debouncedAddress, isValidFormat, isLoading, isValidContract]);

  const validationError = useMemo(() => {
    if (!debouncedAddress || debouncedAddress.trim() === "") {
      return null;
    }

    if (isValidFormat === false) {
      return "Invalid Ethereum address format";
    }

    if (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("not a contract")) {
        return "Address is not a contract";
      }
      if (errorMessage.includes(`does not implement ${tokenType}`)) {
        return `Not a valid ${tokenType} token address`;
      }
      return "Network error - please try again";
    }

    return null;
  }, [debouncedAddress, isValidFormat, error, tokenType]);

  return {
    isValidating: isLoading && enabled && !!debouncedAddress,
    isValid,
    error: validationError,
  };
};

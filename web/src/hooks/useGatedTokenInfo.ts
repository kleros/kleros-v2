import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Address, Hex, erc721Abi } from "viem";
import { usePublicClient } from "wagmi";

import { DisputeKits } from "consts/index";
import { extraDataToTokenInfo, GatedTokenInfo } from "utils/extradataToTokenInfo";
import { getIpfsUrl } from "utils/getIpfsUrl";

import { useRoundDetailsQuery } from "./queries/useRoundDetailsQuery";
import { useDisputeKitAddresses } from "./useDisputeKitAddresses";

// See https://eips.ethereum.org/EIPS/eip-165
// viem doesn't export this, so hardcoding
const ERC165_ABI = [
  {
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ERC165 identifier for ERC721
// See https://github.com/ethereum/ercs/blob/master/ERCS/erc-721.md#specification
const ERC721_INTERFACE_ID: Hex = "0x80ac58cd";

export type GatedTokenResult = {
  isGated: boolean;
  isERC721: boolean;
  tokenGateInfo: GatedTokenInfo | null;
  tokenName: string | null;
  tokenSymbol: string | null;
  imageUri: string | null;
  nftName: string | null;
  isLoading: boolean;
};

/**
 * Resolves ERC-721 gated info and metadata for a dispute.
 *
 * If the dispute uses a gated dispute kit, this hook:
 * - Extracts token gating info from extraData
 * - Detects ERC-721 support via ERC-165
 * - Reads collection metadata (name, symbol)
 * - Fetches and resolves NFT metadata (image, name)
 *
 * All calls are defensive since ERC-721 metadata is optional
 * and many contracts are partially compliant.
 *
 * @param disputeId - Dispute ID used to fetch round data.
 * @param disputeKitAddress - Dispute kit address to determine gating.
 * @param currentRoundIndex - Round index for extraData lookup.
 * @returns Resolved gated and NFT metadata state.
 */
export function useGatedTokenInfo(disputeId?: string, disputeKitAddress?: Address, currentRoundIndex?: number) {
  const publicClient = usePublicClient();
  const { disputeKitName, isLoading: isLoadingKit } = useDisputeKitAddresses({
    disputeKitAddress,
  });

  const isGated = disputeKitName === DisputeKits.Gated || disputeKitName === DisputeKits.GatedShutter;

  // Get the extraData from the subgraph via the existing RoundDetails query
  const roundIndex = currentRoundIndex !== undefined ? Number(currentRoundIndex) : undefined;
  const { data: roundData, isLoading: isLoadingRound } = useRoundDetailsQuery(
    isGated ? disputeId : undefined,
    isGated ? roundIndex : undefined
  );

  const tokenGateInfo = useMemo(() => {
    const extradata = roundData?.round?.dispute.disputeKitDispute?.[0].extraData;
    if (!isGated || !extradata) return null;

    const info = extraDataToTokenInfo(extradata);
    if (info) return info;

    return null;
  }, [isGated, roundData]);

  const shouldFetchNft = Boolean(isGated && tokenGateInfo && !tokenGateInfo.isERC1155 && publicClient);

  const { data: nftData, isLoading: isLoadingNft } = useQuery({
    queryKey: ["gatedTokenNftInfo", tokenGateInfo?.tokenGate, tokenGateInfo?.tokenId?.toString()],
    enabled: shouldFetchNft,
    staleTime: 1000 * 60 * 60,
    retry: 1,
    queryFn: async () => {
      if (!publicClient || !tokenGateInfo) return null;

      const address = tokenGateInfo.tokenGate;

      // Check ERC721 support via ERC165
      let isERC721 = false;
      try {
        isERC721 = await publicClient.readContract({
          address,
          abi: ERC165_ABI,
          functionName: "supportsInterface",
          args: [ERC721_INTERFACE_ID],
        });
      } catch {
        // Not ERC165 compatible - try tokenURI as fallback
      }

      // Get token name and symbol
      let tokenName: string | null = null;
      let tokenSymbol: string | null = null;
      try {
        tokenName = await publicClient.readContract({
          address,
          abi: erc721Abi,
          functionName: "name",
        });
      } catch {
        /* not available */
      }
      try {
        tokenSymbol = await publicClient.readContract({
          address,
          abi: erc721Abi,
          functionName: "symbol",
        });
      } catch {
        /* not available */
      }

      // Try to get tokenURI - try the tokenId from extraData, then 0, then 1
      let tokenUri: string | null = null;
      const tokenIdsToTry = [BigInt(tokenGateInfo.tokenId), 0n, 1n];

      for (const tokenId of tokenIdsToTry) {
        try {
          tokenUri = await publicClient.readContract({
            address,
            abi: erc721Abi,
            functionName: "tokenURI",
            args: [tokenId],
          });
          if (tokenUri) {
            isERC721 = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!tokenUri) {
        return { isERC721, tokenName, tokenSymbol, imageUri: null, nftName: null };
      }

      // Fetch metadata JSON from the resolved URI
      const resolvedUri = resolveUri(tokenUri);

      try {
        const response = await fetch(resolvedUri);
        // See https://github.com/ethereum/ercs/blob/master/ERCS/erc-721.md for ERC721 Metadata standard
        // which is optional
        const metadata = await response.json();
        const imageUri = metadata.image ? resolveUri(metadata.image) : null;
        const nftName = metadata.name || null;

        return { isERC721, tokenName, tokenSymbol, imageUri, nftName };
      } catch {
        return { isERC721, tokenName, tokenSymbol, imageUri: null, nftName: null };
      }
    },
  });

  return {
    isGated,
    isERC721: nftData?.isERC721 ?? false,
    tokenGateInfo,
    tokenName: nftData?.tokenName ?? null,
    tokenSymbol: nftData?.tokenSymbol ?? null,
    imageUri: nftData?.imageUri ?? null,
    nftName: nftData?.nftName ?? null,
    isLoading: isLoadingKit || (isGated && isLoadingRound) || (shouldFetchNft && isLoadingNft),
  };
}

/**
 * Resolves tokenUri or imageUri for ERC721 metadata
 */
const resolveUri = (uri: string) => {
  if (!uri) return uri;

  const lower = uri.toLowerCase();

  if (lower.startsWith("data:")) {
    return uri;
  }

  if (lower.startsWith("ipfs://") || lower.includes("/ipfs/") || lower.startsWith("ipfs/")) {
    return getIpfsUrl(uri);
  }

  if (lower.startsWith("ar://")) {
    return `https://arweave.net/${uri.slice(5)}`;
  }

  return uri;
};

import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { erc721Abi, parseAbi } from "viem";
import { describe, it, expect } from "vitest";

import { DisputeKits } from "src/dispute-kits/disputeKits";
import { prepareArbitratorExtradata } from "src/dispute-kits/prepareArbitratorExtradata";
import type { ReadMock } from "src/test/msw/rpc";
import { server } from "src/test/msw/server";
import { subgraphHandler } from "src/test/msw/subgraph";
import { renderHookWithProviders } from "src/test/renderWithProviders";

import { useGatedTokenInfo } from "./useGatedTokenInfo";

const NFT = "0x00000000000000000000000000000000000000aa";
const erc165Abi = parseAbi(["function supportsInterface(bytes4 interfaceId) view returns (bool)"]);

const serveRound = (extraData: `0x${string}`) => {
  const subgraph = subgraphHandler({ round: () => ({ dispute: { disputeKitDispute: [{ extraData }] } }) });
  server.use(subgraph.handler);
  return subgraph.calls;
};

const gatedExtraData = (isERC1155: boolean, tokenId = "0") =>
  prepareArbitratorExtradata("1", 3, DisputeKits.Gated, { isValid: true, tokenGate: NFT, isERC1155, tokenId });

const nftReads = (tokenUri?: string): ReadMock[] => [
  { address: NFT, abi: erc165Abi, functionName: "supportsInterface", result: () => true },
  { address: NFT, abi: erc721Abi, functionName: "name", result: () => "Accredited Lawyers" },
  { address: NFT, abi: erc721Abi, functionName: "symbol", result: () => "LAW" },
  {
    address: NFT,
    abi: erc721Abi,
    functionName: "tokenURI",
    result: () => {
      if (!tokenUri) throw new Error("nonexistent token");
      return tokenUri;
    },
  },
];

const serveMetadata = (metadata: object) =>
  server.use(http.get("https://cdn.kleros.link/ipfs/QmMeta/1.json", () => HttpResponse.json(metadata)));

describe("useGatedTokenInfo", () => {
  it("is empty for a dispute without token gate data", async () => {
    serveRound(prepareArbitratorExtradata("1", 3, DisputeKits.Classic, undefined));

    const { result, rpcCalls } = renderHookWithProviders(() => useGatedTokenInfo("12", 0));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tokenGateInfo).toBeNull();
    expect(rpcCalls.filter((c) => c.method === "eth_call")).toEqual([]);
  });

  it("decodes an ERC-1155 gate without reading NFT metadata", async () => {
    const calls = serveRound(gatedExtraData(true, "7"));

    const { result, rpcCalls } = renderHookWithProviders(() => useGatedTokenInfo("12", 1));

    await waitFor(() =>
      expect(result.current.tokenGateInfo).toEqual({ tokenGate: NFT, isERC1155: true, tokenId: "7" })
    );
    expect(calls[0].args).toEqual({ id: "12-1" });
    expect(result.current.isERC721).toBe(false);
    expect(rpcCalls.filter((c) => c.method === "eth_call")).toEqual([]);
  });

  it("resolves collection and token metadata for an ERC-721 gate through the IPFS gateway", async () => {
    serveRound(gatedExtraData(false));
    serveMetadata({ name: "Lawyer #1", image: "ipfs://QmImage/1.png" });

    const { result } = renderHookWithProviders(() => useGatedTokenInfo("12", 0), {
      reads: nftReads("ipfs://QmMeta/1.json"),
    });

    await waitFor(() => expect(result.current.nftName).toBe("Lawyer #1"));
    expect(result.current).toMatchObject({
      isERC721: true,
      tokenName: "Accredited Lawyers",
      tokenSymbol: "LAW",
      imageUri: "https://cdn.kleros.link/ipfs/QmImage/1.png",
      isLoading: false,
    });
  });

  it.each([
    ["data:text/html;base64,PHNjcmlwdD4=", null],
    ["data:image/png;base64,iVBORw0KGgo=", "data:image/png;base64,iVBORw0KGgo="],
    ["ar://tx123", "https://arweave.net/tx123"],
  ])("only keeps safe image URIs from metadata: %s", async (image, expected) => {
    serveRound(gatedExtraData(false));
    serveMetadata({ name: "Lawyer #1", image });

    const { result } = renderHookWithProviders(() => useGatedTokenInfo("12", 0), {
      reads: nftReads("ipfs://QmMeta/1.json"),
    });

    await waitFor(() => expect(result.current.nftName).toBe("Lawyer #1"));
    expect(result.current.imageUri).toBe(expected);
  });

  it("keeps the collection data when no token URI can be read", async () => {
    serveRound(gatedExtraData(false));

    const { result } = renderHookWithProviders(() => useGatedTokenInfo("12", 0), { reads: nftReads() });

    await waitFor(() => expect(result.current.tokenName).toBe("Accredited Lawyers"));
    expect(result.current).toMatchObject({ isERC721: true, imageUri: null, nftName: null });
  });
});

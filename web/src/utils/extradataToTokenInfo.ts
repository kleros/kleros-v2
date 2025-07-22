import { Address, hexToBytes } from "viem";

type GatedTokenInfo = {
  tokenGate: Address;
  isERC1155: boolean;
  tokenId: string;
};

/**
 * @dev Decodes token information from encoded extra data.
 * @param extraData The extraData
 * @returns GatedTokenInfo object with tokenGate address, isERC1155 flag, and tokenId.
 */
export function extraDataToTokenInfo(extraDataHex: `0x${string}`): GatedTokenInfo {
  const extraDataBytes = hexToBytes(extraDataHex);

  if (extraDataBytes.length < 160) {
    return {
      tokenGate: "0x0000000000000000000000000000000000000000",
      isERC1155: false,
      tokenId: "0",
    };
  }

  // Slot 4 (bytes 96–127): packedTokenGateAndFlag
  const packedBytes = extraDataBytes.slice(96, 128);
  const packed = BigInt("0x" + Buffer.from(packedBytes).toString("hex"));

  // Slot 5 (bytes 128–159): tokenId
  const tokenIdBytes = extraDataBytes.slice(128, 160);
  const tokenId = BigInt("0x" + Buffer.from(tokenIdBytes).toString("hex"));

  // Extract tokenGate: lower 160 bits
  const tokenGateBigInt = packed & ((1n << 160n) - 1n); // mask: 0x00..00ffffffffffffffffffffffffffffffffffffffff
  const tokenGate = `0x${tokenGateBigInt.toString(16).padStart(40, "0")}` as Address;

  // Extract flag: bit 160
  const isERC1155 = ((packed >> 160n) & 1n) === 1n;

  return {
    tokenGate,
    isERC1155,
    tokenId: tokenId.toString(),
  };
}

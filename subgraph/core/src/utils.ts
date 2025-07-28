import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);
export const ONE = BigInt.fromI32(1);

export function extractDisputeKitIDFromExtraData(extraData: Bytes): string {
  const littleEndian = extraData.subarray(64, 96).reverse();
  return BigInt.fromUnsignedBytes(Bytes.fromUint8Array(littleEndian)).toString();
}

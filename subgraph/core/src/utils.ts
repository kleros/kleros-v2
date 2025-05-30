import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);
export const ONE = BigInt.fromI32(1);

export function extractDisputeKitIDFromExtraData(extraData: Bytes): string {
  const start = extraData.length - 32;
  const littleEndian = extraData.subarray(start, extraData.length).reverse();
  return BigInt.fromUnsignedBytes(Bytes.fromUint8Array(littleEndian)).toString();
}

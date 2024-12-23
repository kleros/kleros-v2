import { getAddress } from "viem";

export function shortenAddress(address: string): string {
  try {
    const formattedAddress = getAddress(address);
    return formattedAddress.substring(0, 6) + "..." + formattedAddress.substring(formattedAddress.length - 4);
  } catch {
    throw new TypeError("Invalid input, address can't be parsed");
  }
}

export function shortenTxnHash(hash: string): string {
  try {
    return hash.substring(0, 6) + "..." + hash.substring(hash.length - 4);
  } catch {
    throw new TypeError("Invalid input, address can't be parsed");
  }
}

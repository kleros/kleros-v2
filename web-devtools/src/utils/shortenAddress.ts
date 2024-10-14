import { getAddress, isAddress } from "viem";

export function shortenAddress(address: string): string {
  if (!isAddress(address)) {
    throw new TypeError("Invalid input: address must be a valid Ethereum address");
  }
  try {
    const formattedAddress = getAddress(address);
    return formattedAddress.substring(0, 6) + "..." + formattedAddress.substring(formattedAddress.length - 4);
  } catch {
    throw new TypeError("Invalid input: address must be a valid Ethereum address");
  }
}

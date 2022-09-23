import { utils } from "ethers";

export function shortenAddress(address: string): string {
  try {
    const formattedAddress = utils.getAddress(address);
    return (
      formattedAddress.substring(0, 6) +
      "..." +
      formattedAddress.substring(formattedAddress.length - 4)
    );
  } catch {
    throw new TypeError("Invalid input, address can't be parsed");
  }
}

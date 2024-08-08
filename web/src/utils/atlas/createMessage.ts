import { createSiweMessage } from "viem/siwe";

import { DEFAULT_CHAIN } from "consts/chains";

export const createMessage = (address: `0x${string}`, chainId: number = DEFAULT_CHAIN, nonce: string) => {
  const domain = window.location.host;
  const origin = window.location.origin;

  // signature is valid only for 10 mins
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

  const message = createSiweMessage({
    domain,
    address,
    statement: "Sign In to Kleros with Ethereum.",
    uri: origin,
    version: "1",
    chainId,
    nonce,
    expirationTime,
  });
  return message;
};

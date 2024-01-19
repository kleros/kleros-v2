import { arbitrumSepolia } from "viem/chains";

export default {
  contactDetails: (
    address: `0x${string}`,
    nonce: string,
    telegram = "",
    email = "",
    chainId: number = arbitrumSepolia.id
  ) =>
    ({
      address: address.toLowerCase() as `0x${string}`,
      domain: {
        name: "Kleros v2",
        version: "1",
        chainId,
      },
      types: {
        ContactDetails: [
          { name: "email", type: "string" },
          { name: "telegram", type: "string" },
          { name: "nonce", type: "string" },
        ],
      },
      primaryType: "ContactDetails",
      message: {
        email,
        telegram,
        nonce,
      },
    } as const),
  signingAccount: (address: `0x${string}`, chainId: number = arbitrumSepolia.id) =>
    ({
      account: address.toLowerCase() as `0x${string}`,
      domain: {
        name: "Kleros v2",
        version: "1",
        chainId,
      },
      types: {
        SigningAccount: [{ name: "body", type: "string" }],
      },
      primaryType: "SigningAccount",
      message: {
        body:
          "To keep your data safe and to use certain features of Kleros, we ask that you sign these message to " +
          "create a secret key for your account. This key is unrelated from your main Ethereum account and will " +
          "not be able to send any transactions.",
      },
    } as const),
};

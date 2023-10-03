export default {
  contactDetails: (address: `0x${string}`, nonce, telegram = "", email = "") =>
    ({
      address: address.toLowerCase() as `0x${string}`,
      domain: {
        name: "Kleros v2",
        version: "1",
        chainId: 421_613,
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
};

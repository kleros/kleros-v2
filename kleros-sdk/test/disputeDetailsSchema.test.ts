import { describe, expect, it } from "vitest";
import DisputeDetailsSchema, {
  ethAddressSchema,
  ensNameSchema,
  ethAddressOrEnsNameSchema,
  isHexAddress,
  isHexId,
  isMultiaddr,
  TxHashSchema,
} from "../src/dataMappings/utils/disputeDetailsSchema";
import { aDispute } from "./fixtures/disputeDetails";

describe("Dispute Details Schema", () => {
  const validAddresses = [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // checksummed
    "0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045", // uppercase
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", // lowercase
  ];

  const invalidAddressesNoEns = [
    "",
    "yo",
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA960",
    "d8dA6BF26964aF9D7eEd9e03E53415D37aA960",
    "xd8dA6BF26964aF9D7eEd9e03E53415D37aA960",
    "0xd8Wa6bf26964af9d7eed9e03e53415d37aa96045",
  ];

  const validEnsNames = ["vitalik.eth", "vitalik.eth.eth"];

  const invalidEnsNamesNoAddress = ["", "vitalik", "vitalik.ether", "vitalik.sol", "eth.vitalik"];

  const validTxnHashes = [
    "0x274fbd8f08f1d2f76a49a7fa062c0590b00d400b1429a9f7a6c21e22b65c82d8",
    "0x274FBD8F08F1D2F76A49A7FA062C0590B00D400B1429A9F7A6C21E22B65C82D8",
    "0xa9d24e6c40c26c64b5fe96a3ef050f9a916ce4a362d123ab85a607055e9f99ec",
  ];

  const invalidTxnHashes = [
    "0x1234",
    "0x1234567890abcdef",
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde",
    "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "0X1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdeg",
    "0xZZZ4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00",
  ];

  describe("ethAddressSchema", () => {
    it("Should accept a valid address", async () => {
      validAddresses.forEach((address) => {
        expect(() => ethAddressSchema.parse(address)).not.toThrow();
      });
    });

    it("Should refuse an invalid address", async () => {
      expect(() => ethAddressSchema.parse(undefined)).toThrowError("invalid_type");

      const invalidAddress = "Provided address is invalid.";
      [...invalidAddressesNoEns, ...validEnsNames].forEach((address) => {
        expect(() => ethAddressSchema.parse(address)).toThrowError(invalidAddress);
      });
    });
  });

  describe("txHashSchema", () => {
    it("Should accept a valid transaction hash", async () => {
      validTxnHashes.forEach((hash) => {
        expect(() => TxHashSchema.parse(hash)).not.toThrow();
      });
    });

    it("Should refuse an invalid transaction hash", async () => {
      const invalidTransaction = "Provided transaction hash is invalid.";
      invalidTxnHashes.forEach((hash) => {
        expect(() => TxHashSchema.parse(hash)).toThrowError(invalidTransaction);
      });
    });
  });

  describe("ensNameSchema", () => {
    it("Should accept a valid ENS name", async () => {
      validEnsNames.forEach((ensName) => {
        expect(() => ensNameSchema.parse(ensName)).not.toThrow();
      });
    });

    it("Should refuse an invalid ENS name", async () => {
      expect(() => ensNameSchema.parse(undefined)).toThrowError("invalid_type");

      const invalidEns = "Provided ENS name is invalid.";
      [...invalidEnsNamesNoAddress, ...validAddresses].forEach((ensName) => {
        expect(() => ensNameSchema.parse(ensName)).toThrowError(invalidEns);
      });
    });
  });

  describe("ethAddressOrEnsNameSchema", () => {
    it("Should accept a valid address", async () => {
      validAddresses.forEach((address) => {
        expect(() => ethAddressOrEnsNameSchema.parse(address)).not.toThrow();
      });
    });

    it("Should accept a valid ENS name", async () => {
      validEnsNames.forEach((ensName) => {
        expect(() => ethAddressOrEnsNameSchema.parse(ensName)).not.toThrow();
      });
    });

    it("Should refuse an invalid address", async () => {
      expect(() => ethAddressOrEnsNameSchema.parse(undefined)).toThrowError("invalid_type");

      invalidAddressesNoEns.forEach((address) => {
        // FIXME: the errorMap is not working, expecting "Provided address or ENS name is invalid.");
        expect(() => ethAddressOrEnsNameSchema.parse(address)).toThrowError("custom");
      });
    });

    it("Should refuse an invalid ENS name", async () => {
      expect(() => ethAddressOrEnsNameSchema.parse(undefined)).toThrowError("invalid_type");

      invalidEnsNamesNoAddress.forEach((ensName) => {
        // FIXME: the errorMap is not working, expecting "Provided address or ENS name is invalid.");
        expect(() => ethAddressOrEnsNameSchema.parse(ensName)).toThrowError("custom");
      });
    });
  });

  describe("isMultiaddr", () => {
    it.each([
      "/ipfs/QmUnPyGi31RoF4DRR8vT3u13YsppxtsbBKbdQAbcP8be4M/policy.pdf",
      "/ipfs/QmUnPyGi31RoF4DRR8vT3u13YsppxtsbBKbdQAbcP8be4M",
      "/dns4/example.com/tcp/443",
      "ipfs://QmHash/policy.pdf",
    ])("accepts %s", (uri) => {
      expect(isMultiaddr(uri)).toBe(true);
    });

    it.each(["", "/ipfs", "ipfs://QmHash", "https://example.com/policy.pdf", "javascript:alert(1)", "/http/x"])(
      "rejects %j",
      (uri) => {
        expect(isMultiaddr(uri)).toBe(false);
      }
    );
  });

  describe("isHexAddress / isHexId", () => {
    it.each([
      { fn: isHexAddress, value: validAddresses[0], expected: true },
      { fn: isHexAddress, value: "0x1234", expected: false },
      { fn: isHexId, value: "0x1", expected: true },
      { fn: isHexId, value: `0x${"f".repeat(64)}`, expected: true },
      { fn: isHexId, value: `0x${"f".repeat(65)}`, expected: false },
      { fn: isHexId, value: "0x", expected: false },
    ])("$fn.name($value) = $expected", ({ fn, value, expected }) => {
      expect(fn(value)).toBe(expected);
    });
  });

  describe("DisputeDetailsSchema", () => {
    const evidence = {
      name: "Exhibit A",
      description: "A receipt",
      transactionHash: validTxnHashes[0],
      sender: "vitalik.eth",
      timestamp: 1700000000,
    };

    it.each([
      { name: "minimal", details: aDispute() },
      {
        name: "all optional fields",
        details: aDispute({
          attachment: { label: "Terms", uri: "/ipfs/QmX/terms.pdf" },
          frontendUrl: "https://example.com",
          metadata: { anything: [1, 2] },
          category: "General",
          lang: "en_US",
          specification: "KIP001",
          aliases: { Buyer: validAddresses[0], Seller: "vitalik.eth" },
          extraEvidences: [evidence],
        }),
      },
      {
        name: "reserved answer flag",
        details: aDispute({ answers: [{ id: "0x1", title: "A", description: "", reserved: true }] }),
      },
    ])("accepts $name", ({ details }) => {
      expect(DisputeDetailsSchema.safeParse(details).success).toBe(true);
    });

    it("defaults extraEvidences to an empty array", () => {
      expect(DisputeDetailsSchema.parse(aDispute()).extraEvidences).toEqual([]);
    });

    it.each([
      { name: "missing title", details: aDispute({ title: undefined }), path: "title" },
      { name: "missing version", details: aDispute({ version: undefined }), path: "version" },
      { name: "numeric chain id", details: aDispute({ arbitratorChainID: 421614 }), path: "arbitratorChainID" },
      {
        name: "invalid arbitrator address",
        details: aDispute({ arbitratorAddress: "0x1234" }),
        path: "arbitratorAddress",
      },
      { name: "https policy URI", details: aDispute({ policyURI: "https://example.com/p.pdf" }), path: "policyURI" },
      {
        name: "decimal answer id",
        details: aDispute({ answers: [{ id: "1", title: "A", description: "" }] }),
        path: "answers",
      },
      {
        name: "answer without description",
        details: aDispute({ answers: [{ id: "0x1", title: "A" }] }),
        path: "answers",
      },
      { name: "invalid alias", details: aDispute({ aliases: { Buyer: "not-an-address" } }), path: "aliases" },
      {
        name: "evidence with a bad transaction hash",
        details: aDispute({ extraEvidences: [{ ...evidence, transactionHash: "0x1234" }] }),
        path: "extraEvidences",
      },
      { name: "attachment without uri", details: aDispute({ attachment: { label: "x" } }), path: "attachment" },
    ])("rejects $name", ({ details, path }) => {
      const result = DisputeDetailsSchema.safeParse(details);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path[0]).toBe(path);
    });
  });
});

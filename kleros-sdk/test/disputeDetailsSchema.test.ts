import { describe, expect, it } from "vitest";
import {
  ethAddressSchema,
  ensNameSchema,
  ethAddressOrEnsNameSchema,
  TxHashSchema,
} from "../src/dataMappings/utils/disputeDetailsSchema";

describe("Dispute Details Schema", () => {
  it("snapshot", () => {
    expect({ foo: "bar" }).toMatchSnapshot();
  });

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

  describe.skip("disputeDetailsSchema", () => {
    // TODO: add tests
  });
});

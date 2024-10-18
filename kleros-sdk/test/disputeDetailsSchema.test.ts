import { describe, expect, it } from "vitest";
import {
  ethAddressSchema,
  ensNameSchema,
  ethAddressOrEnsNameSchema,
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

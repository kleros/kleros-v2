// TODO: implement a test to verify these fakes against the real api, then we can proceed to use these
/**
 * Verified fake for Shutter encryption
 * This fake produces deterministic, verifiable outputs for testing
 */
import { keccak256, encodePacked } from "viem";

interface ShutterEncryptResult {
  encryptedCommitment: `0x${string}`;
  identity: `0x${string}`;
}

/**
 * Creates a deterministic "encrypted" commitment from the input message
 * This allows tests to verify the encryption is called with correct inputs
 * without relying on actual shutter crypto
 */
export function fakeEncrypt(message: string, decryptionDelay: number): ShutterEncryptResult {
  // Create deterministic outputs based on inputs
  const identity = keccak256(encodePacked(["string", "uint256"], [message, BigInt(decryptionDelay)]));
  const encryptedCommitment = keccak256(encodePacked(["bytes32", "string"], [identity, "encrypted"]));

  return {
    encryptedCommitment,
    identity,
  };
}

/**
 * Verifies that the fake encrypt was called with expected inputs
 * by regenerating the expected outputs
 */
export function verifyFakeEncryptOutput(
  message: string,
  decryptionDelay: number,
  actualIdentity: `0x${string}`,
  actualEncrypted: `0x${string}`
): boolean {
  const expectedIdentity = keccak256(encodePacked(["string", "uint256"], [message, BigInt(decryptionDelay)]));
  const expectedEncrypted = keccak256(encodePacked(["bytes32", "string"], [expectedIdentity, "encrypted"]));

  return actualIdentity === expectedIdentity && actualEncrypted === expectedEncrypted;
}

import { encryptData, decrypt as shutterDecrypt } from "@shutter-network/shutter-sdk";
import { stringToHex, hexToString, Hex } from "viem";

interface ShutterApiMessageData {
  eon: number;
  identity: string;
  identity_prefix: string;
  eon_key: string;
  tx_hash: string;
}

interface ShutterApiResponse {
  message: ShutterApiMessageData;
  error?: string;
}

interface ShutterDecryptionKeyData {
  decryption_key: string;
  identity: string;
  decryption_timestamp: number;
}

/**
 * Fetches encryption data from the Shutter API
 * @param decryptionTimestamp Unix timestamp when decryption should be possible
 * @returns Promise with the eon key and identity
 */
async function fetchShutterData(decryptionTimestamp: number): Promise<ShutterApiMessageData> {
  try {
    // Generate a random identity prefix
    const identityPrefix = generateRandomBytes32();

    const response = await fetch(`${import.meta.env.REACT_APP_SHUTTER_API}/register_identity`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${import.meta.env.REACT_APP_SHUTTER_API_TOKEN}`,
      },
      body: JSON.stringify({
        decryptionTimestamp,
        identityPrefix,
      }),
    });

    // Log the response status

    // Get the response text
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${responseText}`);
    }

    // Parse the JSON response
    let jsonResponse: ShutterApiResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse API response as JSON: ${responseText}`);
    }

    // Check if we have the message data
    if (!jsonResponse.message) {
      throw new Error(`API response missing message data: ${JSON.stringify(jsonResponse)}`);
    }

    return jsonResponse.message;
  } catch (error) {
    console.error("Error fetching data from Shutter API:", error);
    throw error;
  }
}

/**
 * Fetches the decryption key from the Shutter API
 * @param identity The identity used for encryption
 * @returns Promise with the decryption key data
 */
async function fetchDecryptionKey(identity: string): Promise<ShutterDecryptionKeyData> {
  const response = await fetch(`${import.meta.env.REACT_APP_SHUTTER_API}/get_decryption_key?identity=${identity}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${import.meta.env.REACT_APP_SHUTTER_API_TOKEN}`,
    },
  });

  // Get the response text
  const responseText = await response.text();

  // Try to parse the error response even if the request failed
  let jsonResponse;
  try {
    jsonResponse = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse API response as JSON: ${responseText}`);
  }

  // Handle the "too early" error case specifically
  if (!response.ok) {
    if (jsonResponse?.description?.includes("timestamp not reached yet")) {
      throw new Error(
        `Cannot decrypt yet: The decryption timestamp has not been reached.\n` +
          `Please wait until the commit period has ended before attempting to decrypt.\n` +
          `Error details: ${jsonResponse.description}`
      );
    }
    throw new Error(`API request failed with status ${response.status}: ${responseText}`);
  }

  // Check if we have the message data
  if (!jsonResponse.message) {
    throw new Error(`API response missing message data: ${JSON.stringify(jsonResponse)}`);
  }

  return jsonResponse.message;
}

/**
 * Ensures a string is a valid hex string with 0x prefix
 * @param hexString The hex string to validate
 * @returns The validated hex string with 0x prefix
 */
function ensureHexString(hexString: string | undefined): `0x${string}` {
  if (!hexString) {
    throw new Error("Hex string is undefined or null");
  }

  // Add 0x prefix if it doesn't exist
  const prefixedHex = hexString.startsWith("0x") ? hexString : `0x${hexString}`;
  return prefixedHex as `0x${string}`;
}

/**
 * Generates a random 32 bytes
 * @returns Random 32 bytes as a hex string with 0x prefix
 */
function generateRandomBytes32(): `0x${string}` {
  return ("0x" +
    crypto
      .getRandomValues(new Uint8Array(32))
      .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "")) as Hex;
}

/**
 * Encrypts a message using the Shutter API
 * @param message The message to encrypt
 * @returns Promise with the encrypted commitment and identity
 */
export async function encrypt(
  message: string,
  decryptionDelay: number
): Promise<{ encryptedCommitment: string; identity: string }> {
  // Set decryption timestamp
  const decryptionTimestamp = Math.floor(Date.now() / 1000) + decryptionDelay;

  // Fetch encryption data from Shutter API
  const shutterData = await fetchShutterData(decryptionTimestamp);

  // Extract the eon key and identity from the response and ensure they have the correct format
  const eonKeyHex = ensureHexString(shutterData.eon_key);
  const identityHex = ensureHexString(shutterData.identity);

  // Message to encrypt
  const msgHex = stringToHex(message);

  // Generate a random sigma
  const sigmaHex = generateRandomBytes32();

  // Encrypt the message
  const encryptedCommitment = await encryptData(msgHex, identityHex, eonKeyHex, sigmaHex);

  return { encryptedCommitment, identity: identityHex };
}

/**
 * Decrypts a message using the Shutter API
 * @param encryptedMessage The encrypted message to decrypt
 * @param identity The identity used for encryption
 * @returns Promise with the decrypted message
 */
export async function decrypt(encryptedMessage: string, identity: string): Promise<string> {
  // Fetch the decryption key
  const decryptionKeyData = await fetchDecryptionKey(identity);

  // Ensure the decryption key is properly formatted
  const decryptionKey = ensureHexString(decryptionKeyData.decryption_key);

  // Decrypt the message
  const decryptedHexMessage = await shutterDecrypt(encryptedMessage, decryptionKey);

  // Convert the decrypted hex message back to a string
  return hexToString(decryptedHexMessage as `0x${string}`);
}

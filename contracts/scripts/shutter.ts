import { encryptData, decrypt as shutterDecrypt } from "@shutter-network/shutter-sdk";
import { Hex, stringToHex, hexToString } from "viem";
import crypto from "crypto";
import "isomorphic-fetch";
import env from "./utils/env";

// Time in seconds to wait before the message can be decrypted
export const DECRYPTION_DELAY = 5;

const SHUTTER_API_URL = {
  mainnet: "https://shutter-api.shutter.network",
  testnet: "https://shutter-api.chiado.staging.shutter.network",
};

const SHUTTER_API = env.optional("SHUTTER_API", "mainnet") as keyof typeof SHUTTER_API_URL;
const SHUTTER_API_KEY = env.optionalNoDefault("SHUTTER_API_KEY");

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
 * Gets the appropriate headers for API requests, including bearer token for mainnet if available
 * @returns Headers object for fetch requests
 */
function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  // Add bearer token for mainnet if available
  if (SHUTTER_API === "mainnet" && SHUTTER_API_KEY && SHUTTER_API_KEY?.trim() !== "") {
    headers.Authorization = `Bearer ${SHUTTER_API_KEY}`;
  }

  return headers;
}

/**
 * Fetches encryption data from the Shutter API
 * @param decryptionTimestamp Unix timestamp when decryption should be possible
 * @returns Promise with the eon key and identity
 */
async function fetchShutterData(decryptionTimestamp: number): Promise<ShutterApiMessageData> {
  try {
    console.log(`Sending request to Shutter API with decryption timestamp: ${decryptionTimestamp}`);

    // Generate a random identity prefix
    const identityPrefix = generateRandomBytes32();
    console.log(`Generated identity prefix: ${identityPrefix}`);

    const response = await fetch(`${SHUTTER_API_URL[SHUTTER_API]}/api/register_identity`, {
      method: "POST",
      headers: {
        ...getApiHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        decryptionTimestamp,
        identityPrefix,
      }),
    });

    // Log the response status
    console.log(`API response status: ${response.status}`);

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
  console.log(`Fetching decryption key for identity: ${identity}`);

  const response = await fetch(`${SHUTTER_API_URL[SHUTTER_API]}/api/get_decryption_key?identity=${identity}`, {
    method: "GET",
    headers: getApiHeaders(),
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
          `Please wait at least ${DECRYPTION_DELAY} seconds after encryption before attempting to decrypt.\n` +
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
export async function encrypt(message: string): Promise<{ encryptedCommitment: string; identity: string }> {
  // Set decryption timestamp
  const decryptionTimestamp = Math.floor(Date.now() / 1000) + DECRYPTION_DELAY;

  // Fetch encryption data from Shutter API
  console.log(`Fetching encryption data for decryption at timestamp ${decryptionTimestamp}...`);
  const shutterData = await fetchShutterData(decryptionTimestamp);

  // Extract the eon key and identity from the response and ensure they have the correct format
  const eonKeyHex = ensureHexString(shutterData.eon_key);
  const identityHex = ensureHexString(shutterData.identity);

  // Message to encrypt
  const msgHex = stringToHex(message);

  // Generate a random sigma
  const sigmaHex = generateRandomBytes32();

  console.log("Eon Key:", eonKeyHex);
  console.log("Identity:", identityHex);
  console.log("Sigma:", sigmaHex);

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
  console.log("Decryption key:", decryptionKeyData.decryption_key);

  // Ensure the decryption key is properly formatted
  const decryptionKey = ensureHexString(decryptionKeyData.decryption_key);

  // Decrypt the message
  const decryptedHexMessage = await shutterDecrypt(encryptedMessage, decryptionKey);

  // Convert the decrypted hex message back to a string
  return hexToString(decryptedHexMessage as `0x${string}`);
}

async function main() {
  try {
    const command = process.argv[2]?.toLowerCase();

    if (!command) {
      console.error(`
Usage: yarn ts-node shutter.ts <command> [arguments]

Commands:
  encrypt <message>                        Encrypt a message
  decrypt <encrypted message> <identity>   Decrypt a message (requires the identity used during encryption)

Examples:
  yarn ts-node shutter.ts encrypt "my secret message"
  yarn ts-node shutter.ts decrypt "encrypted-data" "0x1234..."`);
      process.exit(1);
    }

    switch (command) {
      case "encrypt": {
        const message = process.argv[3];
        if (!message) {
          console.error("Error: Missing message to encrypt");
          console.error("Usage: yarn ts-node shutter.ts encrypt <message>");
          process.exit(1);
        }
        console.log(`Using Shutter API ${SHUTTER_API_URL[SHUTTER_API]}...`);
        const { encryptedCommitment, identity } = await encrypt(message);
        console.log("\nEncrypted Commitment:", encryptedCommitment);
        console.log("Identity:", identity);
        break;
      }
      case "decrypt": {
        const [encryptedMessage, identity] = [process.argv[3], process.argv[4]];
        if (!encryptedMessage || !identity) {
          console.error("Error: Missing required arguments for decrypt");
          console.error("Usage: yarn ts-node shutter.ts decrypt <encrypted-message> <identity>");
          console.error("Note: The identity is the one returned during encryption");
          process.exit(1);
        }
        console.log(`Using Shutter API ${SHUTTER_API_URL[SHUTTER_API]}...`);
        const decryptedMessage = await decrypt(encryptedMessage, identity);
        console.log("\nDecrypted Message:", decryptedMessage);
        break;
      }
      default: {
        console.error(`Error: Unknown command '${command}'`);
        console.error("Valid commands are: encrypt, decrypt");
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("\nError:", error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

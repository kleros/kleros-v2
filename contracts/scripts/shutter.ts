import { encryptData } from "@shutter-network/shutter-sdk";
import { Hex, stringToHex } from "viem";
import crypto from "crypto";
import "isomorphic-fetch";

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

/**
 * Fetches encryption data from the Shutter API
 * @param decryptionTimestamp Unix timestamp when decryption should be possible
 * @returns Promise with the eon key and identity
 */
async function fetchShutterData(decryptionTimestamp: number): Promise<ShutterApiMessageData> {
  try {
    console.log(`Sending request to Shutter API with decryption timestamp: ${decryptionTimestamp}`);

    const response = await fetch("https://shutter-api.shutter.network/api/register_identity", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decryptionTimestamp }),
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
 * Generates a random sigma value (32 bytes)
 * @returns Random sigma as a hex string with 0x prefix
 */
function generateRandomSigma(): `0x${string}` {
  return ("0x" +
    crypto
      .getRandomValues(new Uint8Array(32))
      .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "")) as Hex;
}

async function main() {
  try {
    // Set decryption timestamp (e.g., 24 hours from now)
    const decryptionTimestamp = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

    // Fetch encryption data from Shutter API
    console.log(`Fetching encryption data for decryption at timestamp ${decryptionTimestamp}...`);
    const shutterData = await fetchShutterData(decryptionTimestamp);

    // Extract the eon key and identity from the response and ensure they have the correct format
    const eonKeyHex = ensureHexString(shutterData.eon_key);
    const identityHex = ensureHexString(shutterData.identity);

    // Message to encrypt
    const msgHex = stringToHex("my very secret vote");

    // Generate a random sigma
    const sigmaHex = generateRandomSigma();

    console.log("Eon Key:", eonKeyHex);
    console.log("Identity:", identityHex);
    console.log("Sigma:", sigmaHex);

    // Encrypt the message
    const encryptedCommitment = await encryptData(msgHex, identityHex, eonKeyHex, sigmaHex);

    // Print the encrypted commitment
    console.log("Encrypted Commitment:", encryptedCommitment);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute the main function
main();

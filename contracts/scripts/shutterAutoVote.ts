/**
 * TODO:
 * The goal is to automatically decrypt each encrypted voteID previously cast as encrypted commitments, and cast them as votes.
 * - modify shutter.ts encrypt() to return {encryptedCommitment, identity}
 * - implement shutterAutoVote.ts that:
 *   - provides a castCommit() function which
 *     - calls shutter.ts encrypt() with the message "disputeId␟voteId␟choice␟justification" with `U+241F` as separator
 *     - calls the DisputeKitShutterPoC.castCommit() function with the encryptedCommitment, voteId, choice and justification
 *     - retrieve the DisputeKitShutterPoC.CommitCast event and log its parameters
 *   - provides an autoVote() function which
 *     - runs continuously as a loop, waking up every 30 seconds
 *     - upon wake up, retrieve the details of the previously encrypted messages (and corresponding identities) which have not yet been decrypted and have been encrypted for more than shutter.ts `DECRYPTION_DELAY`.
 *     - for each of these messages, call shutter.ts decrypt() with the identity and the encryptedCommitment
 *     - if the decryption is successful, call the DisputeKitShutterPoC.castVote() function with the voteId, choice and justification
 *     - if the decryption is not successful, log an error
 *     - if the castVote() function was called, retrieve the DisputeKitShutterPoC.VoteCast event and log its parameters
 * - shutterAutoVote.ts needs to know:
 *    - the _voteIDs: they start from 0 and go up to DisputeKitShutterPoC.maxVoteIDs()
 *    - the _coreDisputeID: just use 0 for now.
 **/

import { createPublicClient, createWalletClient, http, Hex, decodeEventLog, Log, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { encrypt, decrypt, DECRYPTION_DELAY } from "./shutter";
import dotenv from "dotenv";
import { abi as DisputeKitShutterPoCAbi } from "../deployments/localhost/DisputeKitShutterPoC.json";

// Load environment variables
dotenv.config();

// Constants
const SEPARATOR = "␟"; // U+241F

// Validate environment variables
if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY environment variable is required");

/**
 * Split a hex string into bytes32 chunks
 */
function splitToBytes32(hex: string): Hex[] {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

  // Split into chunks of 64 characters (32 bytes)
  const chunks: Hex[] = [];
  for (let i = 0; i < cleanHex.length; i += 64) {
    const chunk = `0x${cleanHex.slice(i, i + 64)}` as Hex;
    chunks.push(chunk);
  }

  return chunks;
}

// Store encrypted votes for later decryption
interface EncryptedVote {
  encryptedCommitment: string;
  identity: Hex;
  timestamp: number;
  voteId: bigint;
}

const encryptedVotes: EncryptedVote[] = [];

// Initialize Viem clients
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as Hex;
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: hardhat,
  transport: http(),
});

const disputeKit = getContract({
  address: CONTRACT_ADDRESS,
  abi: DisputeKitShutterPoCAbi,
  client: { public: publicClient, wallet: walletClient },
});

/**
 * Cast an encrypted commit for a vote
 */
export async function castCommit({
  disputeId,
  voteId,
  choice,
  justification,
}: {
  disputeId: bigint;
  voteId: bigint;
  choice: bigint;
  justification: string;
}) {
  try {
    // Create message with U+241F separator
    const message = `${disputeId}${SEPARATOR}${voteId}${SEPARATOR}${choice}${SEPARATOR}${justification}`;

    // Encrypt the message
    const { encryptedCommitment, identity } = await encrypt(message);

    // Split encrypted commitment into bytes32 chunks
    const commitmentChunks = splitToBytes32(encryptedCommitment);
    console.log("Commitment chunks:", commitmentChunks);

    // Cast the commit on-chain
    const hash = await disputeKit.write.castCommit([disputeId, [voteId], encryptedCommitment as Hex, identity as Hex]);

    // Store encrypted vote for later decryption
    encryptedVotes.push({
      encryptedCommitment,
      identity: identity as Hex,
      timestamp: Math.floor(Date.now() / 1000),
      voteId,
    });

    // Watch for CommitCast event
    const events = await disputeKit.getEvents.CommitCast();
    console.log("CommitCast event:", (events[0] as any).args);

    return { encryptedCommitment, identity };
  } catch (error) {
    console.error("Error in castCommit:", error);
    throw error;
  }
}

/**
 * Continuously monitor for votes ready to be decrypted and cast
 */
export async function autoVote() {
  while (true) {
    try {
      const currentTime = Math.floor(Date.now() / 1000);

      // Find votes ready for decryption
      const readyVotes = encryptedVotes.filter((vote) => currentTime - vote.timestamp >= DECRYPTION_DELAY);
      console.log("Ready votes:", readyVotes);

      for (const vote of readyVotes) {
        try {
          console.log("Decrypting vote:", vote);

          // Attempt to decrypt the vote
          const decryptedMessage = await decrypt(vote.encryptedCommitment, vote.identity);
          console.log("Decrypted message:", decryptedMessage);

          // Parse the decrypted message
          const [, , choice, justification] = decryptedMessage.split(SEPARATOR);

          // Cast the vote on-chain
          const hash = await disputeKit.write.castVote([
            BigInt(0),
            [vote.voteId],
            BigInt(choice),
            justification,
            vote.identity,
          ]);

          // Watch for VoteCast event
          const events = await disputeKit.getEvents.VoteCast();
          console.log("VoteCast event:", (events[0] as any).args);

          // Remove the processed vote
          const index = encryptedVotes.indexOf(vote);
          if (index > -1) encryptedVotes.splice(index, 1);
        } catch (error) {
          console.error(`Error processing vote ${vote.voteId}:`, error);
        }
      }

      // Sleep for 30 seconds
      console.log("Sleeping for 30 seconds");
      await new Promise((resolve) => setTimeout(resolve, 30000));
    } catch (error) {
      console.error("Error in autoVote loop:", error);
      // Continue the loop even if there's an error
    }
  }
}

// Main function to start the auto voting process
async function main() {
  try {
    // Cast an encrypted commit
    await castCommit({
      disputeId: BigInt(0),
      voteId: BigInt(0),
      choice: BigInt(2),
      justification: "This is my vote justification",
    });

    // Start the auto voting process
    await autoVote();
  } catch (error) {
    console.error("Error in main:", error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

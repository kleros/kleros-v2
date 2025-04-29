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

import { createPublicClient, createWalletClient, http, Hex, decodeEventLog, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { encrypt, decrypt, DECRYPTION_DELAY } from "./shutter";
import { abi as DisputeKitShutterPoCAbi } from "../deployments/localhost/DisputeKitShutterPoC.json";
import crypto from "crypto";

// Constants
const SEPARATOR = "␟"; // U+241F

// Store encrypted votes for later decryption
interface EncryptedVote {
  encryptedCommitment: string;
  identity: Hex;
  timestamp: number;
  voteId: bigint;
  salt: Hex;
}

const encryptedVotes: EncryptedVote[] = [];

const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const;

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

const transport = http();
const publicClient = createPublicClient({
  chain: hardhat,
  transport,
});

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: hardhat,
  transport,
});

const disputeKit = getContract({
  address: CONTRACT_ADDRESS,
  abi: DisputeKitShutterPoCAbi,
  client: { public: publicClient, wallet: walletClient },
});

/**
 * Generate a random salt
 */
function generateSalt(): Hex {
  return ("0x" + crypto.randomBytes(32).toString("hex")) as Hex;
}

/**
 * Cast a commit on-chain
 */
async function castCommit({
  coreDisputeID,
  voteIDs,
  choice,
  justification,
}: {
  coreDisputeID: bigint;
  voteIDs: bigint[];
  choice: bigint;
  justification: string;
}) {
  try {
    // Create message with U+241F separator
    const message = `${coreDisputeID}${SEPARATOR}${voteIDs[0]}${SEPARATOR}${choice}${SEPARATOR}${justification}`;

    // Encrypt the message using shutter.ts
    const { encryptedCommitment, identity } = await encrypt(message);

    // Generate salt and compute hash
    const salt = generateSalt();
    const commitHash = await disputeKit.read.hashVote([coreDisputeID, voteIDs[0], choice, justification, salt]);

    // Cast the commit on-chain
    const txHash = await disputeKit.write.castCommit([coreDisputeID, voteIDs, commitHash, identity as Hex]);

    // Wait for transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Watch for CommitCast event
    const events = await disputeKit.getEvents.CommitCast();
    console.log("CommitCast event:", (events[0] as any).args);

    // Store encrypted vote for later decryption
    encryptedVotes.push({
      encryptedCommitment,
      identity: identity as Hex,
      timestamp: Math.floor(Date.now() / 1000),
      voteId: voteIDs[0],
      salt,
    });

    return { commitHash, identity, salt };
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
      const readyVotes = encryptedVotes.filter((vote) => currentTime - vote.timestamp >= DECRYPTION_DELAY + 10);

      for (const vote of readyVotes) {
        try {
          // Attempt to decrypt the vote
          const decryptedMessage = await decrypt(vote.encryptedCommitment, vote.identity);

          // Parse the decrypted message
          const [coreDisputeID, , choice, justification] = decryptedMessage.split(SEPARATOR);

          // Cast the vote on-chain
          const txHash = await disputeKit.write.castVote([
            BigInt(coreDisputeID),
            [vote.voteId],
            BigInt(choice),
            justification,
            vote.salt,
          ]);

          // Wait for transaction to be mined
          await publicClient.waitForTransactionReceipt({ hash: txHash });

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
      coreDisputeID: BigInt(0),
      voteIDs: [BigInt(0)],
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

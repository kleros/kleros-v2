import { createPublicClient, createWalletClient, http, Hex, getContract } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { encrypt, decrypt, DECRYPTION_DELAY } from "./shutter";
import { abi as DisputeKitShutterPoCAbi } from "../deployments/localhost/DisputeKitShutterPoC.json";
import crypto from "crypto";

// Constants
const SEPARATOR = "␟"; // U+241F

// Store encrypted votes for later decryption
type EncryptedVote = {
  coreDisputeID: bigint;
  encryptedCommitment: string;
  identity: Hex;
  timestamp: number;
  voteIDs: bigint[];
  salt: Hex;
};

const encryptedVotes: EncryptedVote[] = [];

const disputeKitAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

const MNEMONIC = "test test test test test test test test test test test junk";
const account = mnemonicToAccount(MNEMONIC);

const transport = http();
const publicClient = createPublicClient({
  chain: hardhat,
  transport,
});

const walletClient = createWalletClient({
  account,
  chain: hardhat,
  transport,
});

const disputeKit = getContract({
  address: disputeKitAddress,
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
 * Encodes vote parameters into a message string with separators
 */
function encode({ choice, salt, justification }: { choice: bigint; salt: Hex; justification: string }): string {
  return `${choice}${SEPARATOR}${salt}${SEPARATOR}${justification}`;
}

/**
 * Decodes a message string into its component parts
 * @param message The message to decode
 * @returns Object containing the decoded components
 */
function decode(message: string) {
  const [choice, salt, justification] = message.split(SEPARATOR);
  return {
    choice: BigInt(choice),
    salt,
    justification,
  };
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
    // Generate salt first
    const salt = generateSalt();

    // Encode the vote parameters into a message
    const message = encode({
      choice,
      salt,
      justification,
    });

    // Encrypt the message using shutter.ts
    const { encryptedCommitment, identity } = await encrypt(message);

    // Compute hash using all vote IDs
    const commitHash = await disputeKit.read.hashVote([choice, salt, justification]);

    // Cast the commit on-chain
    const txHash = await disputeKit.write.castCommit([coreDisputeID, voteIDs, commitHash, identity as Hex]);

    // Wait for transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Watch for CommitCast event
    const events = await disputeKit.getEvents.CommitCast();
    console.log("CommitCast event:", (events[0] as any).args);

    // Store encrypted vote for later decryption
    encryptedVotes.push({
      coreDisputeID,
      encryptedCommitment,
      identity: identity as Hex,
      timestamp: Math.floor(Date.now() / 1000),
      voteIDs,
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
      const sleep = DECRYPTION_DELAY + 10;

      // Find votes ready for decryption
      const readyVotes = encryptedVotes.filter((vote) => currentTime - vote.timestamp >= sleep);

      for (const vote of readyVotes) {
        try {
          // Attempt to decrypt the vote
          const decryptedMessage = await decrypt(vote.encryptedCommitment, vote.identity);

          // Decode the decrypted message
          const { choice, salt, justification } = decode(decryptedMessage);

          // Cast the vote on-chain
          const txHash = await disputeKit.write.castVote([
            vote.coreDisputeID,
            vote.voteIDs,
            choice,
            salt,
            justification,
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
          console.error(`Error processing vote ${vote.voteIDs.join(",")}:`, error);
        }
      }

      console.log(`Sleeping for ${sleep} seconds`);
      await new Promise((resolve) => setTimeout(resolve, sleep * 1000));
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
      coreDisputeID: 0n,
      voteIDs: [0n, 1n, 2n],
      choice: 2n,
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

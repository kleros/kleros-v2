/* eslint-disable node/no-unpublished-import */
import { ethers } from "ethers";
import { arbGoerliProvider } from "./providers";
import dotenv from "dotenv";
dotenv.config();

// export const governorWallet = new ethers.Wallet(
//   process.env.PRIVATE_KEY_GOVERNOR as string,
//   arbGoerliProvider
// )

export const firstWallet = new ethers.Wallet(process.env.PRIVATE_KEY_WALLET_1 as string, arbGoerliProvider);

export const secondWallet = new ethers.Wallet(process.env.PRIVATE_KEY_WALLET_2 as string, arbGoerliProvider);

export const thirdWallet = new ethers.Wallet(process.env.PRIVATE_KEY_WALLET_3 as string, arbGoerliProvider);

export const fourthWallet = new ethers.Wallet(process.env.PRIVATE_KEY_WALLET_4 as string, arbGoerliProvider);

export const fifthWallet = new ethers.Wallet(process.env.PRIVATE_KEY_WALLET_5 as string, arbGoerliProvider);

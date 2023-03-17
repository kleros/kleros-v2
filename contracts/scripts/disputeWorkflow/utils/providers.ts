/* eslint-disable node/no-unpublished-import */
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

export const arbGoerliProvider = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_GOERLI_RPC);

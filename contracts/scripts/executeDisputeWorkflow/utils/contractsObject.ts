import { ethers } from "ethers";
import disputeResolverJson from "../../../deployments/arbitrumGoerli/DisputeResolver.json";
import klerosCoreJson from "../../../deployments/arbitrumGoerli/KlerosCore.json";
import pnkJson from "../../../deployments/arbitrumGoerli/PNK.json";
import disputeKitClassicJson from "../../../deployments/arbitrumGoerli/DisputeKitClassic.json";
import randomizerRngJson from "../../../deployments/arbitrumGoerli/RandomizerRNG.json";
import { arbGoerliProvider } from "./providers";
import dotenv from "dotenv";
dotenv.config();

export const disputeResolver = new ethers.Contract(
  process.env.DISPUTE_RESOLVER_CONTRACT_ADDRESS as string,
  disputeResolverJson.abi,
  arbGoerliProvider
) as any;

export const klerosCore = new ethers.Contract(
  process.env.KLEROS_CORE_CONTRACT_ADDRESS as string,
  klerosCoreJson.abi,
  arbGoerliProvider
) as any;

export const pnk = new ethers.Contract(
  process.env.PNK_CONTRACT_ADDRESS as string,
  pnkJson.abi,
  arbGoerliProvider
) as any;

export const disputeKitClassic = new ethers.Contract(
  process.env.DISPUTE_KIT_CLASSIC_CONTRACT_ADDRESS as string,
  disputeKitClassicJson.abi,
  arbGoerliProvider
) as any;

export const randomizerRng = new ethers.Contract(
  process.env.RANDOMIZER_RNG_CONTRACT_ADDRESS as string,
  randomizerRngJson.abi,
  arbGoerliProvider
) as any;

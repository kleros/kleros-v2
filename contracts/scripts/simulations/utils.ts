import { setTimeout } from "timers/promises";
import {
  KlerosCore,
  DisputeKitClassic,
  PNK,
  RandomizerRNG,
  ArbitrableExampleEthFee,
  RandomizerMock,
} from "../../typechain-types";

export enum Period {
  Evidence,
  Commit,
  Vote,
  Appeal,
}

export const options = { gasLimit: 10000000, gasPrice: 5000000000 };

export const getContracts = async (hre) => {
  const core = (await hre.ethers.getContract("KlerosCore")) as KlerosCore;
  const disputeKitClassic = (await hre.ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
  const pnk = (await hre.ethers.getContract("PNK")) as PNK;
  const randomizerRng = (await hre.ethers.getContract("RandomizerRNG")) as RandomizerRNG;
  const arbitrable = (await hre.ethers.getContract("ArbitrableExampleEthFee")) as ArbitrableExampleEthFee;
  const randomizerMock = (await hre.ethers.getContract("RandomizerMock")) as RandomizerMock;

  return {
    core,
    disputeKitClassic,
    pnk,
    randomizerRng,
    arbitrable,
    randomizerMock,
  };
};

export const handleError = (e: any) => {
  if (typeof e === "string") {
    console.log("Error: %s", e);
  } else if (e instanceof Error) {
    console.log("%O", e);
  }
};

export const getWallet = async (hre: any, walletIndex: number) => {
  const signers = await hre.ethers.getSigners();
  const wallet = signers[walletIndex];
  return { wallet };
};

export const isRngReady = async (wallet, hre) => {
  const { randomizerRng, disputeKitClassic } = await getContracts(hre);
  const requesterID = await randomizerRng.connect(wallet).requesterToID(disputeKitClassic.address);
  const n = await randomizerRng.connect(wallet).randomNumbers(requesterID);
  if (Number(n) === 0) {
    console.log("rng is NOT ready.");
    return false;
  } else {
    console.log("rng is ready: %s", n.toString());
    return true;
  }
};

export const mineBlocks = async (n: number, network) => {
  for (let index = 0; index < n; index++) {
    await network.provider.send("evm_mine", []);
  }
};

export const isNetworkLocal = (hre: any): boolean => {
  return hre.network.tags?.local === true;
};

export const waitFor = async (seconds: number, hre) => {
  if (isNetworkLocal(hre)) {
    await hre.network.provider.send("evm_increaseTime", [seconds]);
    await hre.network.provider.send("evm_mine");
  } else {
    console.log("Waiting for %d seconds...", seconds);
    setTimeout(seconds * 1000); // in milliseconds
  }
};

export const latest = async (network): Promise<number> => {
  const latestBlock = (await network.provider.request({
    method: "eth_getBlockByNumber",
    params: ["latest", false],
  })) as { timestamp: string };

  return parseInt(latestBlock.timestamp, 16);
};

export const waitForPeriod = async (disputeId: number, period: Period, hre) => {
  const { core } = await getContracts(hre);
  const { lastPeriodChange, courtID } = await core.disputes(0);
  const periodDuration = (await core.getTimesPerPeriod(courtID))[period];
  const now = await latest(hre.network);
  const remainingDuration = lastPeriodChange.add(periodDuration).sub(now).toNumber();
  if (remainingDuration > 0) {
    await waitFor(remainingDuration, hre);
  }
};

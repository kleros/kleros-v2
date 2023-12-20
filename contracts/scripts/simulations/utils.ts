import { setTimeout } from "timers/promises";
import {
  KlerosCore,
  SortitionModule,
  DisputeKitClassic,
  PNK,
  RandomizerRNG,
  ArbitrableExampleEthFee,
  RandomizerOracle,
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
  const sortition = (await hre.ethers.getContract("SortitionModule")) as SortitionModule;
  const disputeKitClassic = (await hre.ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
  const pnk = (await hre.ethers.getContract("PNK")) as PNK;
  const randomizerRng = (await hre.ethers.getContract("RandomizerRNG")) as RandomizerRNG;
  const arbitrable = (await hre.ethers.getContract("ArbitrableExampleEthFee")) as ArbitrableExampleEthFee;
  const randomizerMock = (await hre.ethers.getContract("RandomizerOracle")) as RandomizerMock;

  return {
    core,
    sortition,
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

export const getArbitrationFees = (hre, nbofjurors: bigint, feeforjuror: bigint) => {
  if (isNetworkLocal(hre)) {
    return hre.ethers.utils.parseUnits("1");
  } else {
    return nbofjurors * feeforjuror;
  }
};

export const getSalt = (taskArgs) => {
  if (!taskArgs?.salt || taskArgs.salt === "0") return "0";
  else return taskArgs.salt;
};

export const getLatestRoundId = async (hre, disputeid: string) => {
  const { core } = await getContracts(hre);
  return Number(await core.getNumberOfRounds(disputeid)) - 1;
};

export const getRoundId = async (taskArgs, hre, disputeid: string) => {
  if (!taskArgs?.roundid) return getLatestRoundId(hre, disputeid);
  else return taskArgs.roundid;
};

export const getDrawnJurors = async (hre, disputeid, roundid) => {
  const { core } = await getContracts(hre);
  return (await core.getRoundInfo(disputeid, roundid)).drawnJurors;
};

export const findVoteIdInDrawnJurors = (walletAddress: string, drawnJurors: string[]) => {
  return drawnJurors.findIndex((address) => address.toLowerCase() === walletAddress.toLowerCase());
};

export const findFirstDrawnJurorWalletIndex = async (hre, drawnJurors) => {
  // "i" represents the walletIndex, and the "5" is the length of the walletIndex array (in this case we have 5 accounts)
  for (let i = 0; i < 5; i++) {
    const { wallet } = await getWallet(hre, i);
    const voteId = findVoteIdInDrawnJurors(wallet.address, drawnJurors);
    if (voteId !== -1) {
      return i;
    }
  }
};

export const getAppealCost = async (hre, disputeId) => {
  const { core } = await getContracts(hre);
  return await core.appealCost(disputeId);
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
  const { lastPeriodChange, courtID } = await core.disputes(disputeId);
  const periodDuration = (await core.getTimesPerPeriod(courtID))[period];
  const now = await latest(hre.network);
  const remainingDuration = lastPeriodChange.add(periodDuration).sub(now).toNumber();
  if (remainingDuration > 0) {
    await waitFor(remainingDuration, hre);
  }
};

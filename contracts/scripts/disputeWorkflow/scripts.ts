/* eslint-disable node/no-unpublished-import */
/* eslint-disable promise/param-names */
import { disputeKitClassic, klerosCore, pnk, randomizerRng, arbitrable } from "./utils/contractsObject";
import { Wallet, ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
const options = { gasLimit: 10000000, gasPrice: 5000000000 };

const handleError = (e: any) => {
  if (typeof e === "string") {
    console.log("Error: %s", e);
  } else if (e instanceof Error) {
    console.log("%O", e);
  }
};

// this function returns information about a court
export const courts = async (courtId: number) => {
  // parameter is courtId
  const courtsFunctionArgs = [1];
  const resultCourtsTx = await klerosCore.courts(...courtsFunctionArgs);
  console.log(resultCourtsTx);
};

/* this function grants permission to KlerosCore to use your PNK tokens */
export const approve = async (wallet: Wallet, pnkAmount: string) => {
  /* first parameter is KlerosCore contract address
second parameter is amount of PNK you want to approve (in wei) */
  const approvePNKFunctionArgs = [process.env.KLEROS_CORE_CONTRACT_ADDRESS, pnkAmount];
  const resultApproveTx = await pnk.connect(wallet).approve(...approvePNKFunctionArgs, options);
  await resultApproveTx.wait();
  console.log(resultApproveTx);
  console.log(`approve wallet ${wallet.address}, txID: %s`, resultApproveTx?.hash);
};

export const setStake = async (wallet: Wallet, pnkAmount: string) => {
  // first parameter is courtId, second is desired PNK to stake (in wei)
  const setStakeFunctionArgs = [1, pnkAmount];

  const resultSetStakeTx = await klerosCore.connect(wallet).setStake(...setStakeFunctionArgs, options);
  await resultSetStakeTx.wait();
  console.log(`setStake wallet ${wallet.address}, txID: %s`, resultSetStakeTx?.hash);
};

export const createDisputeOnArbitrable = async (
  wallet: Wallet,
  nbOfChoices: number,
  nbOfJurors: bigint,
  feeForJuror: bigint
) => {
  const evidenceGroupID = ethers.BigNumber.from(ethers.utils.randomBytes(32));
  let disputeID;
  try {
    const tx = await arbitrable
      .connect(wallet)
      .createDispute(
        nbOfChoices,
        "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003",
        evidenceGroupID,
        {
          value: feeForJuror * nbOfJurors,
          ...options,
        }
      );
    await tx.wait();
    console.log("createDisputeOnArbitrable txID: %s", tx?.hash);
    const filter = klerosCore.filters.DisputeCreation();
    const logs = await klerosCore.queryFilter(filter, tx.blockNumber, tx.blockNumber);
    disputeID = logs[logs.length - 1]?.args?._disputeID;
    console.log("DisputeID: %s", disputeID);
  } catch (e) {
    handleError(e);
  }
  return disputeID;
};

export const passPhase = async (coreOrDKContract: any, wallet: Wallet) => {
  const before = await coreOrDKContract.phase();
  try {
    const tx = await (await coreOrDKContract.connect(wallet).passPhase(options)).wait();
    console.log("passPhase txID: %s", tx?.hash);
  } catch (e) {
    handleError(e);
  } finally {
    const after = await coreOrDKContract.phase();
    console.log("phase: %d -> %d", before, after);
  }
};

export const setRandomizer = async (wallet: Wallet) => {
  // parameter is randomizer.ai's randomizer
  const setRandomizerFunctionArgs = ["0x923096Da90a3b60eb7E12723fA2E1547BA9236Bc"];

  const resultSetRandomizerTx = await randomizerRng.connect(wallet).setRandomizer(...setRandomizerFunctionArgs);
  await resultSetRandomizerTx.wait();
  console.log("setRandomizer txID: %s", resultSetRandomizerTx?.hash);
};

const isRngReady = async (wallet: Wallet) => {
  const requesterID = await randomizerRng.requesterToID(process.env.DISPUTE_KIT_CLASSIC_CONTRACT_ADDRESS);
  const n = await randomizerRng.randomNumbers(requesterID);
  if (Number(n) === 0) {
    console.log("rng is NOT ready.");
    return false;
  } else {
    console.log("rng is ready: %s", n.toString());
    return true;
  }
};

export const waitForRng = async (wallet: Wallet, disputeID: number) => {
  let ready: boolean;
  try {
    ready = await isRngReady(wallet);
  } catch (e) {
    ready = false;
  }
  while (!ready) {
    console.log("Waiting for RNG to be ready...", disputeID);
    await new Promise((r) => setTimeout(r, 10000));
    ready = await isRngReady(wallet);
  }
};

export const draw = async (wallet: Wallet, disputeID: number) => {
  let info = await klerosCore.getRoundInfo(disputeID, 0);
  console.log("Drawn jurors before: %O", info.drawnJurors);
  try {
    const tx = await (await klerosCore.connect(wallet).draw(disputeID, 10, options)).wait();
    console.log("draw txID: %s", tx?.hash);
  } catch (e) {
    handleError(e);
  } finally {
    info = await klerosCore.getRoundInfo(disputeID, 0);
    console.log("Drawn jurors after: %O", info.drawnJurors);
  }
};

export const passPeriod = async (wallet: Wallet, disputeID: number) => {
  const before = (await klerosCore.disputes(disputeID)).period;
  try {
    const tx = await (await klerosCore.connect(wallet).passPeriod(disputeID, options)).wait();
    console.log("passPeriod (on KlerosCore) txID: %s", tx?.hash);
  } catch (e) {
    handleError(e);
  } finally {
    const after = (await klerosCore.disputes(disputeID)).period;
    console.log("Period for dispute %s: %d -> %d", disputeID, before, after);
  }
};

// a drawn juror votes with this function
export const castVote = async (wallet: Wallet, disputeID: number) => {
  // parameters are disputeID, possibleChoices, selectedChoice, , justification
  const castVoteFunctionArgs = [disputeID, [0, 1], 1, 0, "because"];

  const resultCastVoteTx = await disputeKitClassic.connect(wallet).castVote(...castVoteFunctionArgs);
  await resultCastVoteTx.wait();
  console.log("juror casted a vote on txID: %s", resultCastVoteTx?.hash);
};

export const fundAppeal = async (wallet: Wallet, disputeID: number, choice: number) => {
  const fundAppealFunctionArgs = [disputeID, choice];
  try {
    const fundAppealTx = await (await disputeKitClassic.connect(wallet).fundAppeal(fundAppealFunctionArgs)).wait(); // redistribute
    console.log("fundAppeal (DisputeKit) txID: %s", fundAppealTx?.hash);
  } catch (e) {
    handleError(e);
  }
};

export const executeRuling = async (wallet: Wallet, disputeID: number) => {
  const connectedKlerosCore = klerosCore.connect(wallet);
  let executeRulingTx;
  try {
    const executeTx = await (await connectedKlerosCore.execute(disputeID, 0, 10)).wait(); // redistribute
    console.log("txID execute: %s", executeTx?.hash);

    executeRulingTx = await (await connectedKlerosCore.executeRuling(disputeID)).wait(); // rule
    console.log("txID executeRuling: %s", executeRulingTx?.hash);
  } catch (e) {
    handleError(e);
  } finally {
    const dispute = await klerosCore.disputes(disputeID);
    console.log("Ruled? %s", dispute.ruled);

    const ruling = await klerosCore.currentRuling(disputeID);
    console.log("Ruling: %d, Tied? %s, Overridden? %s", ruling.ruling, ruling.tied, ruling.overridden);
  }
};

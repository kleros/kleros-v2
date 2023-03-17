/* eslint-disable no-unused-vars */
// approve KlerosCore to use your PNK tokens on 5 different wallets
import { firstWallet, secondWallet, thirdWallet, fourthWallet, fifthWallet } from "./utils/wallets";
import {
  approve,
  setStake,
  passPeriod,
  castVote,
  passPhase,
  draw,
  executeRuling,
  fundAppeal,
  createDisputeOnArbitrable,
  waitForRng,
} from "./scripts";
import { disputeKitClassic, klerosCore } from "./utils/contractsObject";

let disputeID;

// instructions for how to execute these functions in README

const functions = {
  stakeFiveJurors: async () => {
    // approve KlerosCore to use your PNK tokens on 5 different wallets, first parameter is the wallet you want to approve
    // and second parameter is the pnkAmount you want to approve (in wei), modify according to the court's needs.
    await approve(firstWallet, "200000000000000000000");
    await approve(secondWallet, "200000000000000000000");
    await approve(thirdWallet, "200000000000000000000");
    await approve(fourthWallet, "200000000000000000000");
    await approve(fifthWallet, "200000000000000000000");

    // stake PNK with 5 different wallets, parameters are the same as before but the pnkAmount is to stake instead of approve
    await setStake(firstWallet, "200000000000000000000");
    await setStake(secondWallet, "200000000000000000000");
    await setStake(thirdWallet, "200000000000000000000");
    await setStake(fourthWallet, "200000000000000000000");
    await setStake(fifthWallet, "200000000000000000000");
  },

  // create a new dispute (you need some ETH on the calling wallet). second parameter is the number of choices for jurors
  // third parameter is number of jurors (bigint) and fourth parameter is feeForJuror (bigint)

  // WARNING: if you want to change nbOfJurors/feeForJuror its NOT ENOUGH if you change them here, you have to go to
  // the function `createDisputeOnArbitrable` and change them on the "_arbitratorExtraData" calldata too
  createDispute: async () => {
    disputeID = Number(await createDisputeOnArbitrable(firstWallet, 2, 3n, 100000000000000000n));
  },

  disputeToGenerating: async () => {
    // pass Core and DK 1 phase each, core to 'freezing' and DK to 'generating'
    await passPhase(klerosCore, firstWallet);
    await passPhase(disputeKitClassic, firstWallet);
  },

  waitingForRng: async () => {
    // waits for the random number to be generated, we cannot continue until this is done
    await waitForRng(firstWallet, disputeID);
  },

  passDKPhaseAndDraw: async () => {
    // once the number is generated, DK passes to the phase 'drawing', and then you draw the jurors
    console.log("RNG is ready, pass another DK phase & draw jurors for the dispute", disputeID);
    await passPhase(disputeKitClassic, firstWallet);
    await draw(firstWallet, disputeID);
  },

  passDisputePeriod: async () => {
    await passPeriod(firstWallet, disputeID);
  },

  vote: async () => {
    await castVote(firstWallet, disputeID);
  },

  appeal: async () => {
    await fundAppeal(firstWallet, disputeID, 1);
  },

  execRuling: async () => {
    await executeRuling(firstWallet, disputeID);
  },

  returnPhases: async () => {
    await passPhase(disputeKitClassic, firstWallet);
    await passPhase(klerosCore, firstWallet);
  },
};

const functionName = process.argv[2];
const func = functions[functionName];

if (func) {
  func();
} else {
  console.error(`Unknown function: ${functionName}`);
}

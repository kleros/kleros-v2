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
    // approve KlerosCore to use your PNK tokens on 5 different wallets
    await approve(firstWallet);
    await approve(secondWallet);
    await approve(thirdWallet);
    await approve(fourthWallet);
    await approve(fifthWallet);

    // stake PNK with 5 different wallets
    await setStake(firstWallet);
    await setStake(secondWallet);
    await setStake(thirdWallet);
    await setStake(fourthWallet);
    await setStake(fifthWallet);
  },

  // create a new dispute (you need some ETH on the calling wallet). second parameter is the number of choices for jurors.
  createDispute: async () => {
    disputeID = Number(await createDisputeOnArbitrable(firstWallet, 2));
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

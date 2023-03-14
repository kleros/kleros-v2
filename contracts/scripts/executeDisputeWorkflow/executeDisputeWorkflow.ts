/* eslint-disable no-unused-vars */
import { firstWallet, secondWallet, thirdWallet, fourthWallet, fifthWallet } from "./utils/wallets";
import {
  approve,
  setStake,
  createDisputeOnResolver,
  passPeriod,
  passPhaseDisputeKitClassic,
  passPhaseKlerosCore,
  toEvidencePeriod,
  courts,
} from "./scripts";

const executeDisputeWorkflow = async () => {
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

  // create a new dispute (you need some ETH on the wallet)
  const disputeID = Number(await createDisputeOnResolver(firstWallet));

  // leaves the dispute on EvidencePeriod with jurors drawn. note: this passes a bunch of phases & draws jurors...
  await toEvidencePeriod(firstWallet, disputeID);

  // pass period to voting period
  await passPeriod(firstWallet, disputeID);

  // we can skip voting if the court has no time periods [0,0,0,0], otherwise use this formula on the drawn jurors/wallets:
  // await castVote(firstWallet, disputeID)

  // pass period to appeal period
  await passPeriod(firstWallet, disputeID);

  // pass period and end dispute
  await passPeriod(firstWallet, disputeID);

  // return DK and Core phases to "resolving" and "staking", respectively
  await passPhaseDisputeKitClassic(firstWallet);
  await passPhaseKlerosCore(firstWallet);
};

// executes script
executeDisputeWorkflow();

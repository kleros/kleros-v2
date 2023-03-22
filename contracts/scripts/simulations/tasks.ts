/* eslint-disable node/no-unpublished-import */
/* eslint-disable promise/param-names */

import { utils } from "ethers";
import { hexlify } from "ethers/lib/utils";
import { task } from "hardhat/config";

// .load scripts/simulations/tasks.ts

const getContracts = async (hre) => {
  const klerosCore = await hre.ethers.getContract("KlerosCore");
  const disputeKitClassic = await hre.ethers.getContract("DisputeKitClassic");
  const pnk = await hre.ethers.getContract("PNK");
  const randomizerRng = await hre.ethers.getContract("RandomizerRNG");
  const arbitrable = await hre.ethers.getContract("ArbitrableExampleEthFee");

  return {
    klerosCore,
    disputeKitClassic,
    pnk,
    randomizerRng,
    arbitrable,
  };
};

const options = { gasLimit: 10000000, gasPrice: 5000000000 };

const handleError = (e: any) => {
  if (typeof e === "string") {
    console.log("Error: %s", e);
  } else if (e instanceof Error) {
    console.log("%O", e);
  }
};

const getWalletAndProvider = async (hre: any, walletIndex: number, network: string) => {
  const provider = hre.ethers.providers.getNetwork(network);
  const signers = await hre.ethers.getSigners();
  const wallet = signers[walletIndex];
  return { wallet, provider };
};

const isRngReady = async (provider: any, hre) => {
  const { randomizerRng, disputeKitClassic } = await getContracts(hre);
  const connectedRandomizerRng = randomizerRng.connect(provider);
  const requesterID = await connectedRandomizerRng.requesterToID(disputeKitClassic.address);
  const n = await connectedRandomizerRng.randomNumbers(requesterID);
  if (Number(n) === 0) {
    console.log("rng is NOT ready.");
    return false;
  } else {
    console.log("rng is ready: %s", n.toString());
    return true;
  }
};

task("approve", "Grants permission to KlerosCore to use your PNK tokens")
  .addParam("walletindex", "Index of the wallet to call this function from and approve it")
  .addParam("pnkamount", "(in normal values, not wei!) Amount of PNK tokens to approve for transfer")
  .setAction(async (taskArgs, hre) => {
    const { klerosCore, pnk } = await getContracts(hre);
    const { walletindex, pnkamount, network } = taskArgs;

    // Get the list of wallets and the network information from the hardhat config file
    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    // Approve PNK tokens for transfer to KlerosCore
    try {
      const approvePNKFunctionArgs = [klerosCore.address, utils.parseEther(pnkamount.toString())];
      const resultApproveTx = await pnk.connect(wallet).approve(...approvePNKFunctionArgs, options);
      await resultApproveTx.wait();
      console.log(`Approved ${pnkamount} PNK tokens for transfer to KlerosCore from wallet ${wallet.address}`);
      console.log(`Transaction hash: ${resultApproveTx.hash}`);
    } catch (e) {
      handleError(e);
    }
  });

task("set-stake", "Stakes PNK tokens to participate in the Kleros dispute resolution")
  .addParam("walletindex", "Index of the wallet to call this function from and stake it")
  .addParam("pnkamount", "(in normal values, not wei!) Amount of PNK tokens to stake")
  .setAction(async (taskArgs, hre) => {
    const { klerosCore } = await getContracts(hre);
    const { walletindex, pnkamount, network } = taskArgs;

    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    // Stakes PNK tokens in Court 1
    try {
      const setStakeFunctionArgs = [1, utils.parseEther(pnkamount.toString())];
      const resultSetStakeTx = await klerosCore.connect(wallet).setStake(...setStakeFunctionArgs, options);
      await resultSetStakeTx.wait();
      console.log(`setStake wallet ${wallet.address}, txID: %s`, resultSetStakeTx?.hash);
    } catch (e) {
      handleError(e);
    }
  });

task("create-dispute", "Creates a dispute on an arbitrable contract")
  .addParam("walletindex", "Index of the wallet to use for creating the dispute")
  .addParam("nbofchoices", "Number of choices for the dispute")
  .addParam("nbofjurors", "Number of jurors for the dispute (in BigInt) (ex: 3n)")
  .addParam("feeforjuror", "Fee for each juror in wei (in BigInt) (ex: 100000n)")
  .setAction(async (taskArgs, hre) => {
    const { arbitrable, klerosCore } = await getContracts(hre);
    const { walletindex, nbofchoices, nbofjurors, feeforjuror, network } = taskArgs;
    const { ethers } = hre;

    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    // Create a random evidence group ID
    const evidenceGroupID = ethers.BigNumber.from(ethers.utils.randomBytes(32));

    let disputeID;

    const isLocalhost = () => {
      if (network === network?.localhost) return utils.parseUnits("1");
      else return nbofjurors * feeforjuror;
    };

    try {
      // Create a dispute on the arbitrable contract
      const tx = await arbitrable
        .connect(wallet)
        .createDispute(
          nbofchoices,
          "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003",
          evidenceGroupID,
          {
            value: isLocalhost(),
            ...options,
          }
        );
      await tx.wait();
      console.log("createDisputeOnArbitrable txID: %s", tx?.hash);

      // Get the dispute ID from the KlerosCore contract event logs
      const filter = klerosCore.filters.DisputeCreation();
      const logs = await klerosCore.queryFilter(filter, tx.blockNumber, tx.blockNumber);
      disputeID = logs[logs.length - 1]?.args?._disputeID;
      console.log("DisputeID: %s", disputeID);
    } catch (e) {
      handleError(e);
    }

    return disputeID;
  });

task("pass-phase-core", "Pass the phase of the KlerosCore contract")
  .addParam("walletindex", "Index of the wallet to use for passing the phase")
  .setAction(async (taskArgs, hre) => {
    const { klerosCore } = await getContracts(hre);
    const { walletindex, network } = taskArgs;

    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    const before = await klerosCore.phase();
    try {
      const tx = await (await klerosCore.connect(wallet).passPhase(options)).wait();
      console.log("passPhaseCore txID: %s", tx?.transactionHash);
    } catch (e) {
      handleError(e);
    } finally {
      const after = await klerosCore.phase();
      console.log("phaseCore: %d -> %d", before, after);
    }
  });

task("pass-phase-dk", "Pass the phase of the DisputeKitClassic contract")
  .addParam("walletindex", "Index of the wallet to use for passing the phase")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { walletindex, network } = taskArgs;

    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    const before = await disputeKitClassic.phase();
    try {
      const tx = await (await disputeKitClassic.connect(wallet).passPhase(options)).wait();
      console.log("PassPhaseDK txID: %s", tx?.transactionHash);
    } catch (e) {
      handleError(e);
    } finally {
      const after = await disputeKitClassic.phase();
      console.log("phaseDK: %d -> %d", before, after);
    }
  });

task("wait-for-rng", "Waits for the RNG to be ready").setAction(async (taskArgs, hre) => {
  const { network } = taskArgs;

  const walletIndex = 0;
  const { wallet, provider } = await getWalletAndProvider(hre, walletIndex, network);

  let ready: boolean;
  try {
    ready = await isRngReady(provider, hre);
  } catch (e) {
    ready = false;
  }
  while (!ready) {
    console.log("Waiting for RNG to be ready...");
    await new Promise((r) => setTimeout(r, 10000));
    ready = await isRngReady(wallet, hre);
  }
});

task("draw", "Draws jurors for a dispute on Kleros")
  .addParam("walletindex", "Index of the wallet to use for drawing jurors")
  .addParam("disputeid", "The ID of the dispute to draw jurors for")
  .setAction(async (taskArgs, hre) => {
    const { klerosCore } = await getContracts(hre);
    const { disputeid, walletindex, network } = taskArgs;
    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    let info = await klerosCore.getRoundInfo(disputeid, 0);
    console.log("Drawn jurors before: %O", info.drawnJurors);
    try {
      const tx = await (await klerosCore.connect(wallet).draw(disputeid, 10, options)).wait();
      console.log("draw txID: %s", tx?.hash);
    } catch (e) {
      handleError(e);
    } finally {
      info = await klerosCore.getRoundInfo(disputeid, 0);
      console.log("Drawn jurors after: %O", info.drawnJurors);
    }
  });

task("pass-period", "Passes the period of a dispute on Kleros Core")
  .addParam("walletindex", "Index of the wallet to use for passing period")
  .addParam("disputeid", "The ID of the dispute")
  .setAction(async (taskArgs, hre) => {
    const { klerosCore } = await getContracts(hre);
    const { disputeid, walletindex, network } = taskArgs;
    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    const before = (await klerosCore.disputes(disputeid)).period;

    try {
      const tx = await (await klerosCore.connect(wallet).passPeriod(disputeid, options)).wait();
      console.log("passPeriod (on KlerosCore) txID: %s", tx?.transactionHash);
    } catch (e) {
      handleError(e);
    } finally {
      const after = (await klerosCore.disputes(disputeid)).period;
      console.log("Period for dispute %s: %d -> %d", disputeid, before, after);
    }
  });

task("cast-commit", "Casts a commit for a drawn juror")
  .addParam("walletindex", "Index of the wallet to use for casting the commit")
  .addParam("disputeid", "The ID of the dispute to vote on")
  .addParam("voteids", "The ID of the votes where you are drawn to and you want to vote on (ex: 0,1) or (ex: 1)")
  .addParam("choice", "The ID of the choice you will vote")
  .addOptionalParam("justification", "The justification of making that choice, not mandatory")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { disputeid, walletindex, choice, voteids, network } = taskArgs;
    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    const salt = 123;
    console.log("salt used on juror %s is: %s", walletindex, salt);
    const generateCommit = (choice: number, justification: string) => {
      const hash = utils.solidityKeccak256(["uint256", "string", "uint256"], [choice, justification, salt]);
      return hexlify(hash);
    };
    const commitHash = generateCommit(choice, taskArgs.justification);
    const voteIdsParam = [voteids];

    const castCommitFunctionArgs = [disputeid, voteIdsParam, commitHash];
    const tx = await disputeKitClassic.connect(wallet).castCommit(...castCommitFunctionArgs);
    await tx.wait();

    console.log("juror %s casted a commit on txID: %s", wallet.address, tx?.hash);
  });

task("cast-vote", "Casts a vote for a drawn juror")
  .addParam("walletindex", "Index of the wallet to use for casting the vote")
  .addParam("disputeid", "The ID of the dispute to vote on")
  .addParam("voteids", "The ID of the votes where you are drawn to and you want to vote on (ex: 0,1) or (ex: 1)")
  .addParam("choice", "The ID of the choice you will vote")
  .addOptionalParam("justification", "if there was a commit phase this must match the justification too")
  .addOptionalParam("salt", "the salt used for the commit if there was a commit period")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { disputeid, walletindex, choice, network, voteids } = taskArgs;
    const { wallet } = await getWalletAndProvider(hre, walletindex, network);
    const voteIdsParam = [voteids];

    if (!taskArgs?.justification) {
      taskArgs.justification = "because";
    }
    const castVoteFunctionArgs = [disputeid, voteIdsParam, choice, taskArgs.salt, taskArgs.justification];
    const tx = await disputeKitClassic.connect(wallet).castVote(...castVoteFunctionArgs);
    await tx.wait();

    console.log("juror %s casted a vote on txID: %s", wallet.address, tx?.hash);
  });

task("fund-appeal", "Funds an appeal on a dispute")
  .addParam("walletindex", "Index of the wallet to use for funding the appeal")
  .addParam("disputeid", "The ID of the dispute to fund an appeal for")
  .addParam("choice", "The choice being funded (0 or 1)")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { disputeid, walletindex, network, choice } = taskArgs;
    const { wallet } = await getWalletAndProvider(hre, walletindex, network);

    const fundAppealFunctionArgs = [disputeid, choice, { value: utils.parseUnits("0.5") }];

    try {
      const fundAppealTx = await (await disputeKitClassic.connect(wallet).fundAppeal(...fundAppealFunctionArgs)).wait();
      console.log("fundAppeal (DisputeKit) txID: %s", fundAppealTx?.transactionHash);
    } catch (e) {
      handleError(e);
    }
  });

task("execute-ruling", "Executes the ruling for a dispute on KlerosCore")
  .addParam("walletindex", "Index of the wallet to use for executing the ruling")
  .addParam("disputeid", "The ID of the dispute to execute ruling")
  .setAction(async (taskArgs, hre) => {
    const { klerosCore } = await getContracts(hre);
    const { disputeid, walletindex, network } = taskArgs;

    const { wallet } = await getWalletAndProvider(hre, walletindex, network);
    const connectedKlerosCore = klerosCore.connect(wallet);
    let executeRulingTx;
    try {
      const executeTx = await (await connectedKlerosCore.execute(disputeid, 0, 10)).wait(); // redistribute
      console.log("txID execute: %s", executeTx?.transactionHash);

      executeRulingTx = await (await connectedKlerosCore.executeRuling(disputeid)).wait(); // rule
      console.log("txID executeRuling: %s", executeRulingTx?.transactionHash);
    } catch (e) {
      handleError(e);
    } finally {
      const dispute = await connectedKlerosCore.disputes(disputeid);
      console.log("Ruled? %s", dispute.ruled);

      const ruling = await connectedKlerosCore.currentRuling(disputeid);
      console.log("Ruling: %d, Tied? %s, Overridden? %s", ruling.ruling, ruling.tied, ruling.overridden);
    }
  });

task("withdraw-fees-and-rewards", "Withdraws fees and rewards for people who appealed and won")
  .addParam("walletindex", "Index of the wallet to use for executing the ruling")
  .addParam("disputeid", "The ID of the dispute to execute ruling")
  .addParam("beneficiary", "The address of the person who won the appeal")
  .addParam("roundid", "the round ID the appeal took place")
  .addParam("choice", "the choice you want to withdraw from")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { disputeid, walletindex, network, beneficiary, roundid, choice } = taskArgs;

    const { wallet } = await getWalletAndProvider(hre, walletindex, network);
    try {
      const withdrawTx = await (
        await disputeKitClassic.connect(wallet).withdrawFeesAndRewards(disputeid, beneficiary, roundid, choice)
      ).wait(); // redistribute
      console.log("txID withdrawFeesAndRewards: %s", withdrawTx?.transactionHash);
    } catch (e) {
      handleError(e);
    }
  });

task("stake-five-jurors", "Approve and stake 5 different wallets on the court 1")
  .addParam("walletindexes", "An array of wallet indexes that you want to stake (ex: 0,1,2,3,4)")
  .addParam("pnkamounts", "An array of pnkamounts to stake (in normal values, not wei!) (ex: 200,300,200,100,200)")
  .setAction(async (taskArgs, hre) => {
    const walletIndexes = taskArgs.walletindexes.split(",").map((index) => index.toString());
    const pnkAmounts = taskArgs.pnkamounts.split(",").map((amount) => amount.toString());

    await hre.run("approve", { walletindex: walletIndexes[0], pnkamount: pnkAmounts[0] });
    await hre.run("approve", { walletindex: walletIndexes[1], pnkamount: pnkAmounts[1] });
    await hre.run("approve", { walletindex: walletIndexes[2], pnkamount: pnkAmounts[2] });
    await hre.run("approve", { walletindex: walletIndexes[3], pnkamount: pnkAmounts[3] });
    await hre.run("approve", { walletindex: walletIndexes[4], pnkamount: pnkAmounts[4] });

    await hre.run("set-stake", { walletindex: walletIndexes[0], pnkamount: pnkAmounts[0] });
    await hre.run("set-stake", { walletindex: walletIndexes[1], pnkamount: pnkAmounts[1] });
    await hre.run("set-stake", { walletindex: walletIndexes[2], pnkamount: pnkAmounts[2] });
    await hre.run("set-stake", { walletindex: walletIndexes[3], pnkamount: pnkAmounts[3] });
    await hre.run("set-stake", { walletindex: walletIndexes[4], pnkamount: pnkAmounts[4] });
  });

task("dispute-to-generating", "Pass Core and DK 1 phase each, core to 'freezing' and DK to 'generating")
  .addParam("walletindex", "Index of the wallet to use for calling this task")
  .setAction(async (taskArgs, hre) => {
    await hre.run("pass-phase-core", { walletindex: taskArgs.walletindex });
    await hre.run("pass-phase-dk", { walletindex: taskArgs.walletindex });
  });

task("pass-dk-phase-and-draw", "DK passes to the phase 'drawing', and then you draw the jurors")
  .addParam("walletindex", "Index of the wallet to use for calling this task")
  .addParam("disputeid", "The ID of the dispute to draw jurors for")
  .setAction(async (taskArgs, hre) => {
    await hre.run("pass-phase-dk", { walletindex: taskArgs.walletindex });
    await hre.run("draw", { walletindex: taskArgs.walletindex, disputeid: taskArgs.disputeid });
  });

task("return-phases", "returns DK and Core phases to resolving and staking, respectively")
  .addParam("walletindex", "Index of the wallet to use for calling this task")
  .setAction(async (taskArgs, hre) => {
    await hre.run("pass-phase-dk", { walletindex: taskArgs.walletindex });
    await hre.run("pass-phase-core", { walletindex: taskArgs.walletindex });
  });

task("fund-with-PNK", "It funds with PNK from one wallet to the other 4 wallets")
  .addParam("walletindex", "Index of the wallet to use for calling this task")
  .addParam("pnkamountforeach", "Amount you will send to each wallet")
  .setAction(async (taskArgs, hre) => {
    const { pnk } = await getContracts(hre);
    const { walletindex, network, pnkamountforeach } = taskArgs;
    const { wallet } = await getWalletAndProvider(hre, walletindex, network);
    const amount = utils.parseUnits(pnkamountforeach.toString(), "18");
    const firstWallet = await (await getWalletAndProvider(hre, 1, network)).wallet;
    const secondWallet = await (await getWalletAndProvider(hre, 2, network)).wallet;
    const thirdWallet = await (await getWalletAndProvider(hre, 3, network)).wallet;
    const fourthWallet = await (await getWalletAndProvider(hre, 4, network)).wallet;
    const firstTx = await pnk.connect(wallet).transfer(firstWallet.address, amount);
    console.log("funded wallet %s with %s: %s", firstWallet.address, amount, firstTx?.hash);
    const secondTx = await pnk.connect(wallet).transfer(secondWallet.address, amount);
    console.log("funded wallet %s with %s: %s", secondWallet.address, amount, secondTx?.hash);
    const thirdTx = await pnk.connect(wallet).transfer(thirdWallet.address, amount);
    console.log("funded wallet %s with %s: %s", thirdWallet.address, amount, thirdTx?.hash);
    const fourthTx = await pnk.connect(wallet).transfer(fourthWallet.address, amount);
    console.log("funded wallet %s with %s: %s", fourthWallet.address, amount, fourthTx?.hash);
  });

task(
  "set-randomizer",
  "Only works in localhost network because it fetches RandomizerMock contract. This function sets the RandomizerMock to the RandomizerRNG contract"
)
  .addParam("walletindex", "Must be the governor. Index of the wallet to use for calling this task")
  .setAction(async (taskArgs, hre) => {
    const { randomizerRng } = await getContracts(hre);
    const randomizerMock = await hre.ethers.getContract("RandomizerMock");
    const { walletindex, network } = taskArgs;
    const { wallet } = await getWalletAndProvider(hre, walletindex, network);
    const tx = await randomizerRng.connect(wallet).setRandomizer(randomizerMock.address);
    await tx.wait();
    console.log("setRandomizer txHash %s", tx);
  });

module.exports = {};

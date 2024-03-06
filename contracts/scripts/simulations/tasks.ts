/* eslint-disable promise/param-names */
import { BigNumber, utils } from "ethers";
import { task } from "hardhat/config";
import {
  Period,
  getContracts,
  getWallet,
  handleError,
  options,
  isRngReady,
  mineBlocks,
  isNetworkLocal,
  waitFor,
  waitForPeriod,
  getArbitrationFees,
  getSalt,
  getRoundId,
  getDrawnJurors,
  getLatestRoundId,
  findVoteIdInDrawnJurors,
  findFirstDrawnJurorWalletIndex,
  getAppealCost,
} from "./utils";

task("simulate:approve", "Grants permission to KlerosCore to use your PNK tokens")
  .addParam("walletindex", "Index of the wallet to call this function from and approve it")
  .addParam("pnkamount", "(in normal values, not wei!) Amount of PNK tokens to approve for transfer")
  .setAction(async (taskArgs, hre) => {
    const { core, pnk } = await getContracts(hre);
    const { walletindex, pnkamount } = taskArgs;

    // Get the list of wallets and the network information from the hardhat config file
    const { wallet } = await getWallet(hre, walletindex);

    // Approve PNK tokens for transfer to KlerosCore
    try {
      const approvePNKFunctionArgs: [string, BigNumber] = [core.address, utils.parseEther(pnkamount.toString())];
      const resultApproveTx = await pnk.connect(wallet).approve(...approvePNKFunctionArgs, options);
      await resultApproveTx.wait();
      console.log(`Approved ${pnkamount} PNK tokens for transfer to KlerosCore from wallet ${wallet.address}`);
      console.log(`Transaction hash: ${resultApproveTx.hash}`);
    } catch (e) {
      handleError(e);
    }
  });

task("simulate:set-stake", "Stakes PNK tokens to participate in the Kleros dispute resolution")
  .addParam("walletindex", "Index of the wallet to call this function from and stake it")
  .addParam("pnkamount", "(in normal values, not wei!) Amount of PNK tokens to stake")
  .addParam("courtid", "the ID of the court you want to stake on (General Court ID = 1")
  .setAction(async (taskArgs, hre) => {
    const { core } = await getContracts(hre);
    const { walletindex, pnkamount, courtid } = taskArgs;

    const { wallet } = await getWallet(hre, walletindex);

    // Stakes PNK tokens in the Court you specified as parameter of this task
    try {
      const setStakeFunctionArgs: [string, BigNumber] = [courtid, utils.parseEther(pnkamount.toString())];
      const resultSetStakeTx = await core.connect(wallet).setStake(...setStakeFunctionArgs, options);
      await resultSetStakeTx.wait();
      console.log(`setStake wallet ${wallet.address}, txID: %s`, resultSetStakeTx?.hash);
    } catch (e) {
      handleError(e);
    }
  });

task("simulate:create-court", "callable by Governor only. Create a new Court")
  .addParam("walletindex", "Index of the wallet to use for creating the Court")
  .setAction(async (taskArgs, hre) => {
    const { core } = await getContracts(hre);
    const { walletindex } = taskArgs;

    const { wallet } = await getWallet(hre, walletindex);

    const parent = 1;
    const minStake = BigNumber.from(10).pow(20).mul(2);
    const alpha = 10000;
    const feeForJuror = BigNumber.from(10).pow(17);
    const jurorsForCourtJump = 3;
    const hiddenVotes = false;
    const timesPerPeriod = [300, 300, 300, 300] as any;
    const sortitionSumTreeK = 3;
    const supportedDisputeKits = [1]; // IDs of supported dispute kits
    let courtID;
    try {
      const tx = await (
        await core
          .connect(wallet)
          .createCourt(
            parent,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            jurorsForCourtJump,
            timesPerPeriod,
            sortitionSumTreeK,
            supportedDisputeKits
          )
      ).wait();
      console.log("createCourt txID: %s", tx?.transactionHash);
      // Get the court ID from the KlerosCore contract event logs
      const filter = core.filters.CourtCreated();
      const logs = await core.queryFilter(filter, tx.blockNumber, tx.blockNumber);
      const courtCreatedLog = logs[logs.length - 1];
      courtID = courtCreatedLog.args._courtID;
      console.log(
        `Created Court ${courtID} with these supportedDisputeKits: ${courtCreatedLog.args._supportedDisputeKits}`
      );
      const newCourt = await core.courts(courtID);
      console.log(`Details of this new court: ${newCourt}`);
    } catch (e) {
      handleError(e);
    }
    return courtID;
  });

task("simulate:create-dispute", "Creates a dispute on an arbitrable contract")
  .addParam("walletindex", "Index of the wallet to use for creating the dispute")
  .addParam("courtid", "ID of the court to create the dispute in")
  .addParam("nbofchoices", "Number of choices for the dispute")
  .addParam("nbofjurors", "Number of jurors for the dispute (in BigInt) (ex: 3n)")
  .addParam("feeforjuror", "Fee for each juror in wei (in BigInt) (ex: 100000n)")
  .setAction(async (taskArgs, hre) => {
    const { arbitrable, core } = await getContracts(hre);
    const { walletindex, courtid, nbofchoices, nbofjurors, feeforjuror } = taskArgs;
    const { ethers } = hre;

    const { wallet } = await getWallet(hre, walletindex);

    // Create a random evidence group ID
    const evidenceGroupID = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();

    let disputeID;

    // Construct the arbitratorExtraData parameter
    const courtIdBytes = ethers.utils.defaultAbiCoder.encode(["uint256"], [courtid]);
    const minJurorsBytes = ethers.utils.defaultAbiCoder.encode(["uint256"], [3]); // default value for minimum jurors

    const arbitratorExtraData = ethers.utils.hexConcat([courtIdBytes, minJurorsBytes]);

    try {
      // Create a dispute on the arbitrable contract
      const tx = await arbitrable.connect(wallet).createDispute(nbofchoices, arbitratorExtraData, evidenceGroupID, {
        value: getArbitrationFees(hre, nbofjurors, feeforjuror),
        ...options,
      });
      await tx.wait();
      console.log("createDisputeOnArbitrable txID: %s", tx?.hash);

      // Get the dispute ID from the KlerosCore contract event logs
      const filter = core.filters.DisputeCreation();
      const logs = await core.queryFilter(filter, tx.blockNumber, tx.blockNumber);
      disputeID = logs[logs.length - 1]?.args?._disputeID;
      console.log("Created Dispute %s on Court %s with evidenceGroupID %s", disputeID, courtid, evidenceGroupID);
    } catch (e) {
      handleError(e);
    }
    const dispute = {
      id: disputeID,
      evidenceGroupID: evidenceGroupID,
    };
    return dispute;
  });

task("simulate:pass-phase", "Pass the phase of the SortitionModule")
  .addParam("walletindex", "Index of the wallet to use for passing the phase")
  .setAction(async (taskArgs, hre) => {
    const { sortition } = await getContracts(hre);
    const { walletindex } = taskArgs;

    const { wallet } = await getWallet(hre, walletindex);

    const before = await sortition.phase();
    try {
      const tx = await (await sortition.connect(wallet).passPhase(options)).wait();
      console.log("passPhaseCore txID: %s", tx?.transactionHash);
    } catch (e) {
      handleError(e);
    } finally {
      const after = await sortition.phase();
      console.log("phaseCore: %d -> %d", before, after);
    }
  });

task("simulate:wait-for-rng", "Waits for the RNG to be ready").setAction(async (taskArgs, hre) => {
  const walletIndex = 0;
  const { wallet } = await getWallet(hre, walletIndex);

  let ready: boolean;
  try {
    ready = await isRngReady(wallet, hre);
  } catch (e) {
    ready = false;
  }
  while (!ready) {
    console.log("Waiting for RNG to be ready...");
    await new Promise((r) => setTimeout(r, 10000));
    ready = await isRngReady(wallet, hre);
  }
});

task("simulate:draw", "Draws jurors for a dispute on Kleros")
  .addParam("walletindex", "Index of the wallet to use for drawing jurors")
  .addParam("disputeid", "The ID of the dispute to draw jurors for")
  .setAction(async (taskArgs, hre) => {
    const { core } = await getContracts(hre);
    const { disputeid, walletindex } = taskArgs;
    const { wallet } = await getWallet(hre, walletindex);

    let info = await core.getRoundInfo(disputeid, 0);
    console.log("Drawn jurors before: %O", info.drawnJurors);
    try {
      const tx = await (await core.connect(wallet).draw(disputeid, 10, options)).wait();
      console.log("draw txID: %s", tx?.transactionHash);
    } catch (e) {
      handleError(e);
    } finally {
      info = await core.getRoundInfo(disputeid, 0);
      console.log("Drawn jurors after: %O", info.drawnJurors);
    }
  });

task("simulate:pass-period", "Passes the period of a dispute on Kleros Core")
  .addParam("walletindex", "Index of the wallet to use for passing period")
  .addParam("disputeid", "The ID of the dispute")
  .setAction(async (taskArgs, hre) => {
    const { core } = await getContracts(hre);
    const { disputeid, walletindex } = taskArgs;
    const { wallet } = await getWallet(hre, walletindex);

    const before = (await core.disputes(disputeid)).period;

    try {
      const tx = await (await core.connect(wallet).passPeriod(disputeid, options)).wait();
      console.log("passPeriod txID: %s", tx?.transactionHash);
    } catch (e) {
      handleError(e);
    } finally {
      const after = (await core.disputes(disputeid)).period;
      console.log("Period for dispute %s: %d -> %d", disputeid, before, after);
    }
  });

task("simulate:cast-commit", "Casts a commit for a drawn juror")
  .addParam("walletindex", "Index of the wallet to use for casting the commit")
  .addParam("disputeid", "The ID of the dispute to vote on")
  .addParam("choice", "The ID of the choice you will vote")
  .addParam("justification", "The justification of making that choice, not mandatory")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { disputeid, walletindex, choice } = taskArgs;
    const { wallet } = await getWallet(hre, walletindex);

    const salt = "123";
    console.log("salt used on juror %s is: %s", walletindex, salt);
    const generateCommit = (choice: number, justification: string) => {
      const hash = utils.solidityKeccak256(["string", "string", "string"], [choice, justification, salt]);
      return utils.hexlify(hash);
    };
    const commitHash = generateCommit(choice, taskArgs.justification);
    const drawnJurors = await getDrawnJurors(hre, disputeid, getRoundId(taskArgs, hre, disputeid));
    const voteid = findVoteIdInDrawnJurors(wallet.address, drawnJurors);
    const voteIdsParam = [voteid.toString()];

    const castCommitFunctionArgs: [string, string[], string] = [disputeid, voteIdsParam, commitHash];
    const tx = await disputeKitClassic.connect(wallet).castCommit(...castCommitFunctionArgs);
    await tx.wait();

    console.log("juror %s cast a commit on txID: %s", wallet.address, tx?.hash);
  });

task("simulate:cast-vote", "Casts a vote for a drawn juror")
  .addParam("walletindex", "Index of the wallet to use for casting the vote")
  .addParam("disputeid", "The ID of the dispute to vote on")
  .addParam("choice", "The ID of the choice you will vote")
  .addParam("justification", "if there was a commit phase this must match the justification too")
  .addOptionalParam("salt", "the salt used for the commit ONLY IF there was a commit period")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { disputeid, walletindex, choice } = taskArgs;
    const { wallet } = await getWallet(hre, walletindex);
    const drawnJurors = await getDrawnJurors(hre, disputeid, getRoundId(taskArgs, hre, disputeid));
    const voteid = findVoteIdInDrawnJurors(wallet.address, drawnJurors);
    const voteIdsParam = [voteid.toString()];

    const castVoteFunctionArgs: [string, string[], string, string, string] = [
      disputeid,
      voteIdsParam,
      choice,
      getSalt(taskArgs),
      taskArgs.justification,
    ];
    const tx = await disputeKitClassic.connect(wallet).castVote(...castVoteFunctionArgs);
    await tx.wait();

    console.log("juror %s cast a vote on txID: %s", wallet.address, tx?.hash);
  });

task("simulate:fund-appeal", "Funds an appeal on a dispute")
  .addParam("walletindex", "Index of the wallet to use for funding the appeal")
  .addParam("disputeid", "The ID of the dispute to fund an appeal for")
  .addParam("appealchoice", "The choice being funded (0 or 1)")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { disputeid, walletindex, appealchoice } = taskArgs;
    const { wallet } = await getWallet(hre, walletindex);

    const fundAppealFunctionArgs: [number, number, { value: BigNumber }] = [
      disputeid,
      appealchoice,
      { value: await getAppealCost(hre, disputeid) },
    ];

    try {
      if (isNetworkLocal(hre)) {
        const numberOfBlocksToMine = 5;
        await mineBlocks(numberOfBlocksToMine, hre.network);
      }
      const fundAppealTx = await (await disputeKitClassic.connect(wallet).fundAppeal(...fundAppealFunctionArgs)).wait();
      console.log("fundAppeal (in DisputeKitClassic) txID: %s", fundAppealTx?.transactionHash);
    } catch (e) {
      handleError(e);
    }
  });

task("simulate:execute-ruling", "Executes the ruling for a dispute on KlerosCore")
  .addParam("walletindex", "Index of the wallet to use for executing the ruling")
  .addParam("disputeid", "The ID of the dispute to execute ruling")
  .setAction(async (taskArgs, hre) => {
    const { core } = await getContracts(hre);
    const { disputeid, walletindex } = taskArgs;

    const { wallet } = await getWallet(hre, walletindex);
    const connectedKlerosCore = core.connect(wallet);
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

task("simulate:withdraw-fees-and-rewards", "Withdraws fees and rewards for people who appealed and won")
  .addParam("walletindex", "Index of the wallet to use for executing the ruling")
  .addParam("disputeid", "The ID of the dispute to execute ruling")
  .addParam("beneficiary", "The address of the person who won the appeal")
  .addOptionalParam("roundid", "the round ID the appeal took place")
  .addParam("choice", "the choice you want to withdraw from")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { disputeid, walletindex, beneficiary, choice } = taskArgs;

    const { wallet } = await getWallet(hre, walletindex);

    try {
      const withdrawTx = await (
        await disputeKitClassic
          .connect(wallet)
          .withdrawFeesAndRewards(disputeid, beneficiary, getRoundId(taskArgs, hre, disputeid), choice)
      ).wait(); // redistribute
      console.log("txID withdrawFeesAndRewards: %s", withdrawTx?.transactionHash);
    } catch (e) {
      handleError(e);
    }
  });

task("simulate:stake-five-jurors", "Approve and stake 5 different wallets on the court 1")
  .addParam("walletindexes", "An array of wallet indexes that you want to stake (ex: 0,1,2,3,4)")
  .addParam("pnkamounts", "An array of pnkamounts to stake (in normal values, not wei!) (ex: 200,300,200,100,200)")
  .addParam("courtid", "the ID of the court you want to stake on (General Court ID = 1")
  .setAction(async (taskArgs, hre) => {
    const walletIndexes = taskArgs.walletindexes.split(",").map((index) => index.toString());
    const pnkAmounts = taskArgs.pnkamounts.split(",").map((amount) => amount.toString());
    const { courtid } = taskArgs;

    await hre.run("simulate:approve", { walletindex: walletIndexes[0], pnkamount: pnkAmounts[0] });
    await hre.run("simulate:approve", { walletindex: walletIndexes[1], pnkamount: pnkAmounts[1] });
    await hre.run("simulate:approve", { walletindex: walletIndexes[2], pnkamount: pnkAmounts[2] });
    await hre.run("simulate:approve", { walletindex: walletIndexes[3], pnkamount: pnkAmounts[3] });
    await hre.run("simulate:approve", { walletindex: walletIndexes[4], pnkamount: pnkAmounts[4] });

    await hre.run("simulate:set-stake", { walletindex: walletIndexes[0], pnkamount: pnkAmounts[0], courtid: courtid });
    await hre.run("simulate:set-stake", { walletindex: walletIndexes[1], pnkamount: pnkAmounts[1], courtid: courtid });
    await hre.run("simulate:set-stake", { walletindex: walletIndexes[2], pnkamount: pnkAmounts[2], courtid: courtid });
    await hre.run("simulate:set-stake", { walletindex: walletIndexes[3], pnkamount: pnkAmounts[3], courtid: courtid });
    await hre.run("simulate:set-stake", { walletindex: walletIndexes[4], pnkamount: pnkAmounts[4], courtid: courtid });
  });

task("simulate:to-freezing-and-generating-phase", "Pass phase from 'staking' to 'generating")
  .addParam("walletindex", "Index of the wallet to use for calling this task")
  .setAction(async (taskArgs, hre: any) => {
    const { walletindex } = taskArgs;
    await hre.run("simulate:pass-phase", { walletindex: walletindex });
    if (isNetworkLocal(hre)) {
      const { sortition, randomizerMock, randomizerRng } = await getContracts(hre);
      const { wallet } = await getWallet(hre, walletindex);
      const numberOfBlocksToMine = Number(await sortition.rngLookahead());
      await mineBlocks(numberOfBlocksToMine, hre.network);
      await randomizerMock.connect(wallet).relay(randomizerRng.address, 0, utils.randomBytes(32));
    }
  });

task(
  "simulate:pass-phase-draw-unfreeze",
  "Passes phase from 'generating' to 'drawing', draws the jurors, then passes the phase to 'staking'."
)
  .addParam("walletindex", "Index of the wallet to use for calling this task")
  .addParam("disputeid", "The ID of the dispute to draw jurors for")
  .setAction(async (taskArgs, hre) => {
    await hre.run("simulate:pass-phase", { walletindex: taskArgs.walletindex });
    await hre.run("simulate:draw", { walletindex: taskArgs.walletindex, disputeid: taskArgs.disputeid });
    await hre.run("simulate:pass-phase", { walletindex: taskArgs.walletindex });
  });

task("simulate:split-pnk", "one wallet funds with PNK the other 4 wallets")
  .addParam("walletindex", "Index of the wallet to use for calling this task")
  .addParam("pnkperwallet", "PNK amount sent to each wallet")
  .setAction(async (taskArgs, hre) => {
    const { pnk } = await getContracts(hre);
    const { walletindex, pnkperwallet } = taskArgs;
    const { wallet } = await getWallet(hre, walletindex);
    const amount = utils.parseUnits(pnkperwallet.toString(), "18");
    const firstWallet = await (await getWallet(hre, 1)).wallet;
    const secondWallet = await (await getWallet(hre, 2)).wallet;
    const thirdWallet = await (await getWallet(hre, 3)).wallet;
    const fourthWallet = await (await getWallet(hre, 4)).wallet;
    const firstTx = await pnk.connect(wallet).transfer(firstWallet.address, amount);
    console.log("funded wallet %s with %s: %s", firstWallet.address, amount, firstTx?.hash);
    const secondTx = await pnk.connect(wallet).transfer(secondWallet.address, amount);
    console.log("funded wallet %s with %s: %s", secondWallet.address, amount, secondTx?.hash);
    const thirdTx = await pnk.connect(wallet).transfer(thirdWallet.address, amount);
    console.log("funded wallet %s with %s: %s", thirdWallet.address, amount, thirdTx?.hash);
    const fourthTx = await pnk.connect(wallet).transfer(fourthWallet.address, amount);
    console.log("funded wallet %s with %s: %s", fourthWallet.address, amount, fourthTx?.hash);
  });

task("simulate:submit-evidence", "Submits evidence to a dispute")
  .addParam("walletindex", "Index of the wallet to use for submitting evidence")
  .addParam("evidencegroupid", "The evidenceGroupID, which is linked to the dispute")
  .setAction(async (taskArgs, hre) => {
    const { disputeKitClassic } = await getContracts(hre);
    const { walletindex, evidencegroupid } = taskArgs;

    const { wallet } = await getWallet(hre, walletindex);
    const evidence = "/ipfs/QmaNEknCUEKDy74sDNLFXo8Vc3PqX7QC1ZyvUx4n7V6q1L/evidence.json";
    try {
      const tx = await (await disputeKitClassic.connect(wallet).submitEvidence(evidencegroupid, evidence)).wait();
      console.log("txID submitEvidence: %s", tx?.transactionHash);
    } catch (e) {
      handleError(e);
    }
  });

task("simulate:all", "Simulates arbitration activity to troubleshoot the subgraph and frontend").setAction(
  async (taskArgs, hre) => {
    const { sortition } = await getContracts(hre);
    const operator = 0;
    const stake = 1000;
    const courtId = "1";
    const appealChoice = "1";

    await hre.run("simulate:split-pnk", { walletindex: operator.toString(), pnkperwallet: stake.toString() });

    await hre.run("simulate:stake-five-jurors", {
      walletindexes: "0,1,2,3,4",
      pnkamounts: `${stake},${stake},${stake},${stake},${stake}`,
      courtid: courtId,
    });

    const dispute = await hre.run("simulate:create-dispute", {
      walletindex: operator.toString(),
      courtid: courtId.toString(),
      nbofchoices: "2",
      nbofjurors: "3",
      feeforjuror: utils.parseEther("0.1").toString(),
    });

    // Wait for minStakingTime
    const minStakingTime = await sortition.minStakingTime();
    await waitFor(minStakingTime.toNumber(), hre);

    // Phase Staking -> Generating
    await hre.run("simulate:to-freezing-and-generating-phase", { walletindex: operator.toString() });

    // Wait for RNG
    await hre.run("simulate:wait-for-rng");

    // Phase: Generating -> Drawing
    // Draws
    // Phase: Drawing -> Staking
    await hre.run("simulate:pass-phase-draw-unfreeze", {
      walletindex: operator.toString(),
      disputeid: dispute.id.toString(),
    });

    // Submit evidence
    await hre.run("simulate:submit-evidence", {
      walletindex: operator.toString(),
      evidencegroupid: dispute.evidenceGroupID,
    });

    // Period: Evidence -> Vote
    await waitForPeriod(dispute.id, Period.Evidence, hre);
    await hre.run("simulate:pass-period", { walletindex: operator.toString(), disputeid: dispute.id.toString() });

    // Find the first drawn juror and the corresponding wallet index
    const drawnJurors = await getDrawnJurors(hre, dispute.id, getLatestRoundId(hre, dispute.id));
    const firstDrawnJurorWalletIndex = (await findFirstDrawnJurorWalletIndex(hre, drawnJurors)) as number;

    // Vote
    await hre.run("simulate:cast-vote", {
      walletindex: firstDrawnJurorWalletIndex.toString(),
      disputeid: dispute.id.toString(),
      choice: "1",
      justification: "because",
    });

    // Period: Vote -> Appeal
    await waitForPeriod(dispute.id, Period.Vote, hre);
    await hre.run("simulate:pass-period", { walletindex: operator.toString(), disputeid: dispute.id.toString() });

    // Fund Appeal
    await hre.run("simulate:fund-appeal", {
      walletindex: operator.toString(),
      disputeid: dispute.id.toString(),
      appealchoice: appealChoice,
    });

    // Period: Appeal -> Execution
    await waitForPeriod(dispute.id, Period.Appeal, hre);
    await hre.run("simulate:pass-period", { walletindex: operator.toString(), disputeid: dispute.id.toString() });

    // Execution
    await hre.run("simulate:execute-ruling", { walletindex: operator.toString(), disputeid: dispute.id.toString() });
  }
);

module.exports = {};

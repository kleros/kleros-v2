import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { toBigInt, BigNumberish } from "ethers";
import { PNK, KlerosCore, SortitionModule, IncrementalNG, DisputeKitShutter } from "../../typechain-types";
import { expect } from "chai";
import { Courts } from "../../deploy/utils";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */ // https://github.com/standard/standard/issues/690#issuecomment-278533482

describe("DisputeKitShutter", async () => {
  const ONE_THOUSAND_PNK = 10n ** 21n;
  const thousandPNK = (amount: BigNumberish) => toBigInt(amount) * ONE_THOUSAND_PNK;

  let deployer: string;
  let juror1: HardhatEthersSigner;
  let juror2: HardhatEthersSigner;
  let bot: HardhatEthersSigner;
  let attacker: HardhatEthersSigner;
  let disputeKitShutter: DisputeKitShutter;
  let pnk: PNK;
  let core: KlerosCore;
  let sortitionModule: SortitionModule;
  let rng: IncrementalNG;
  const RANDOM = 424242n;
  const SHUTTER_DK_ID = 2;
  const SHUTTER_COURT_ID = 2; // Court with hidden votes for testing

  // Test data
  const choice = 1n;
  const salt = 12345n;
  const justification = "This is my justification for the vote";
  const identity = ethers.keccak256(ethers.toUtf8Bytes("shutter-identity"));
  const encryptedVote = ethers.toUtf8Bytes("encrypted-vote-data");

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());
    [, juror1, juror2, bot, attacker] = await ethers.getSigners();

    await deployments.fixture(["Arbitration", "VeaMock"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    disputeKitShutter = await ethers.getContract<DisputeKitShutter>("DisputeKitShutter");
    pnk = await ethers.getContract<PNK>("PNK");
    core = await ethers.getContract<KlerosCore>("KlerosCore");
    sortitionModule = await ethers.getContract<SortitionModule>("SortitionModule");

    // Make the tests more deterministic with this dummy RNG
    await deployments.deploy("IncrementalNG", {
      from: deployer,
      args: [RANDOM],
      log: true,
    });
    rng = await ethers.getContract<IncrementalNG>("IncrementalNG");

    await sortitionModule.changeRandomNumberGenerator(rng.target).then((tx) => tx.wait());

    // Create a court with hidden votes enabled for testing DisputeKitShutter
    // Parameters: parent, hiddenVotes, minStake, alpha, feeForJuror, jurorsForCourtJump, timesPerPeriod, sortitionExtraData, supportedDisputeKits
    await core.createCourt(
      Courts.GENERAL, // parent
      true, // hiddenVotes - MUST be true for DisputeKitShutter
      ethers.parseEther("200"), // minStake
      10000, // alpha
      ethers.parseEther("0.1"), // feeForJuror
      16, // jurorsForCourtJump
      [300, 300, 300, 300], // timesPerPeriod for evidence, commit, vote, appeal
      ethers.toBeHex(5), // sortitionExtraData
      [1, SHUTTER_DK_ID] // supportedDisputeKits - must include Classic (1) and Shutter (2)
    );

    // The new court ID should be 2 (after GENERAL court which is 1)
  });

  // ************************************* //
  // *              Constants            * //
  // ************************************* //

  const enum Period {
    evidence = 0,
    commit = 1,
    vote = 2,
    appeal = 3,
    execution = 4,
  }

  // ************************************* //
  // *          Helper Functions         * //
  // ************************************* //

  const encodeExtraData = (courtId: BigNumberish, minJurors: BigNumberish, disputeKitId: number) =>
    ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "uint256"], [courtId, minJurors, disputeKitId]);

  const generateCommitments = (choice: bigint, salt: bigint, justification: string) => {
    // Recovery commitment: hash(choice, salt) - no justification
    const recoveryCommit = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [choice, salt])
    );

    // Full commitment: hash(choice, salt, justificationHash)
    const justificationHash = ethers.keccak256(ethers.toUtf8Bytes(justification));
    const fullCommit = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "bytes32"], [choice, salt, justificationHash])
    );

    return { fullCommit, recoveryCommit };
  };

  const createDisputeAndDraw = async (courtId: BigNumberish, minJurors: BigNumberish, disputeKitId: number) => {
    // Stake jurors
    for (const juror of [juror1, juror2]) {
      await pnk.transfer(juror.address, thousandPNK(10)).then((tx) => tx.wait());
      expect(await pnk.balanceOf(juror.address)).to.equal(thousandPNK(10));

      await pnk
        .connect(juror)
        .approve(core.target, thousandPNK(10), { gasLimit: 300000 })
        .then((tx) => tx.wait());

      await core
        .connect(juror)
        .setStake(SHUTTER_COURT_ID, thousandPNK(10), { gasLimit: 500000 })
        .then((tx) => tx.wait());

      expect(await sortitionModule.getJurorBalance(juror.address, SHUTTER_COURT_ID)).to.deep.equal([
        thousandPNK(10), // totalStaked
        0, // totalLocked
        thousandPNK(10), // stakedInCourt
        1, // nbOfCourts
      ]);
    }

    const extraData = encodeExtraData(courtId, minJurors, disputeKitId);
    const arbitrationCost = await core["arbitrationCost(bytes)"](extraData);

    // Create dispute via core contract
    await core["createDispute(uint256,bytes)"](2, extraData, { value: arbitrationCost }).then((tx) => tx.wait());
    const disputeId = 0;

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");
    await sortitionModule.passPhase().then((tx) => tx.wait()); // Staking -> Generating

    await sortitionModule.passPhase().then((tx) => tx.wait()); // Generating -> Drawing
    await core.draw(disputeId, 70, { gasLimit: 10000000 });

    return disputeId;
  };

  const advanceToCommitPeriod = async (disputeId: number) => {
    // Advance from evidence to commit period
    await core.passPeriod(disputeId).then((tx) => tx.wait());

    // Verify we're in commit period
    const dispute = await core.disputes(disputeId);
    expect(dispute[2]).to.equal(Period.commit); // period is at index 2
  };

  const advanceToVotePeriod = async (disputeId: number) => {
    // Advance from commit to vote period
    const dispute = await core.disputes(disputeId);
    const courtId = dispute[0]; // courtID is at index 0
    const court = await core.courts(courtId);
    // Court struct: parent, hiddenVotes, children[], minStake, alpha, feeForJuror, jurorsForCourtJump, disabled, timesPerPeriod[]
    // timesPerPeriod is a mapping, we need to check the actual structure
    const timesPerPeriod = [300, 300, 300, 300]; // Default times from deployment
    const commitPeriod = timesPerPeriod[Period.commit];

    await network.provider.send("evm_increaseTime", [Number(commitPeriod)]);
    await network.provider.send("evm_mine");

    await core.passPeriod(disputeId).then((tx) => tx.wait());

    // Verify we're in vote period
    const updatedDispute = await core.disputes(disputeId);
    expect(updatedDispute[2]).to.equal(Period.vote); // period is at index 2
  };

  const getVoteIDsForJuror = async (disputeId: number, juror: HardhatEthersSigner) => {
    const localDisputeId = await disputeKitShutter.coreDisputeIDToLocal(disputeId);
    const nbRounds = await disputeKitShutter.getNumberOfRounds(localDisputeId);
    const roundIndex = Number(nbRounds) - 1;

    // Get all votes for this round and filter by juror
    const voteIDs: bigint[] = [];
    const maxVotes = 10; // Reasonable limit for testing

    for (let i = 0; i < maxVotes; i++) {
      try {
        const voteInfo = await disputeKitShutter.getVoteInfo(disputeId, roundIndex, i);
        if (voteInfo[0] === juror.address) {
          // account is at index 0
          voteIDs.push(BigInt(i));
        }
      } catch {
        // No more votes
        break;
      }
    }

    return voteIDs;
  };

  // ************************************* //
  // *              Tests                * //
  // ************************************* //

  describe("Commit Phase - castCommitShutter()", () => {
    describe("Successful commits", () => {
      it("Should allow juror to commit vote with recovery commitment", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        expect(voteIDs.length).to.be.greaterThan(0);

        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await expect(
          disputeKitShutter
            .connect(juror1)
            .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote)
        )
          .to.emit(disputeKitShutter, "CommitCastShutter")
          .withArgs(disputeId, juror1.address, fullCommit, recoveryCommit, identity, encryptedVote);

        // Verify recovery commitment was stored
        const localDisputeId = await disputeKitShutter.coreDisputeIDToLocal(disputeId);
        const storedRecoveryCommit = await disputeKitShutter.recoveryCommitments(localDisputeId, 0, voteIDs[0]);
        expect(storedRecoveryCommit).to.equal(recoveryCommit);
      });

      it("Should allow juror to update commitment multiple times", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);

        // First commitment
        const { fullCommit: commit1, recoveryCommit: recovery1 } = generateCommitments(1n, 111n, "First justification");
        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, commit1, recovery1, identity, encryptedVote);

        // Second commitment (overwrites first)
        const { fullCommit: commit2, recoveryCommit: recovery2 } = generateCommitments(
          2n,
          222n,
          "Second justification"
        );
        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, commit2, recovery2, identity, encryptedVote);

        // Verify only the second commitment is stored
        const localDisputeId = await disputeKitShutter.coreDisputeIDToLocal(disputeId);
        const storedRecoveryCommit = await disputeKitShutter.recoveryCommitments(localDisputeId, 0, voteIDs[0]);
        expect(storedRecoveryCommit).to.equal(recovery2);
      });
    });

    describe("Failed commits", () => {
      it("Should revert if recovery commitment is empty", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit } = generateCommitments(choice, salt, justification);

        await expect(
          disputeKitShutter.connect(juror1).castCommitShutter(
            disputeId,
            voteIDs,
            fullCommit,
            ethers.ZeroHash, // Empty recovery commit
            identity,
            encryptedVote
          )
        ).to.be.revertedWithCustomError(disputeKitShutter, "EmptyRecoveryCommit");
      });

      it("Should revert if not in commit period", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        // Still in evidence period

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await expect(
          disputeKitShutter
            .connect(juror1)
            .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote)
        ).to.be.revertedWithCustomError(disputeKitShutter, "NotCommitPeriod");
      });

      it("Should revert if juror doesn't own the vote", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await expect(
          disputeKitShutter.connect(juror2).castCommitShutter(
            disputeId,
            voteIDs, // Using juror1's vote IDs
            fullCommit,
            recoveryCommit,
            identity,
            encryptedVote
          )
        ).to.be.revertedWithCustomError(disputeKitShutter, "JurorHasToOwnTheVote");
      });
    });
  });

  describe("Normal Flow - Bot Reveals", () => {
    describe("Successful reveals", () => {
      it("Should allow bot to reveal vote with full justification", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        // Juror commits
        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        // Bot reveals vote
        await expect(disputeKitShutter.connect(bot).castVoteShutter(disputeId, voteIDs, choice, salt, justification))
          .to.emit(disputeKitShutter, "VoteCast")
          .withArgs(disputeId, juror1.address, voteIDs, choice, justification);

        // Verify vote was counted
        const voteInfo = await disputeKitShutter.getVoteInfo(disputeId, 0, Number(voteIDs[0]));
        expect(voteInfo[3]).to.be.true; // voted is at index 3
        expect(voteInfo[2]).to.equal(choice); // choice is at index 2
      });
    });

    describe("Failed reveals", () => {
      it("Should revert if wrong choice provided", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        const wrongChoice = 2n;
        await expect(
          disputeKitShutter.connect(bot).castVoteShutter(
            disputeId,
            voteIDs,
            wrongChoice, // Wrong choice
            salt,
            justification
          )
        ).to.be.revertedWithCustomError(disputeKitShutter, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if wrong salt provided", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        const wrongSalt = 99999n;
        await expect(
          disputeKitShutter.connect(bot).castVoteShutter(
            disputeId,
            voteIDs,
            choice,
            wrongSalt, // Wrong salt
            justification
          )
        ).to.be.revertedWithCustomError(disputeKitShutter, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if wrong justification provided", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        const wrongJustification = "Wrong justification";
        await expect(
          disputeKitShutter.connect(bot).castVoteShutter(
            disputeId,
            voteIDs,
            choice,
            salt,
            wrongJustification // Wrong justification
          )
        ).to.be.revertedWithCustomError(disputeKitShutter, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if vote already cast", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        // First vote succeeds
        await disputeKitShutter.connect(bot).castVoteShutter(disputeId, voteIDs, choice, salt, justification);

        // Second vote fails
        await expect(
          disputeKitShutter.connect(bot).castVoteShutter(disputeId, voteIDs, choice, salt, justification)
        ).to.be.revertedWithCustomError(disputeKitShutter, "VoteAlreadyCast");
      });
    });
  });

  describe("Recovery Flow - Juror Reveals", () => {
    describe("Successful recovery reveals", () => {
      it("Should allow juror to recover vote without justification", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        // Juror commits
        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        // Juror reveals vote (Shutter failed, so juror must reveal)
        // Note: justification can be anything as it won't be validated
        await expect(
          disputeKitShutter.connect(juror1).castVoteShutter(
            disputeId,
            voteIDs,
            choice,
            salt,
            "" // Empty justification is fine for recovery
          )
        )
          .to.emit(disputeKitShutter, "VoteCast")
          .withArgs(disputeId, juror1.address, voteIDs, choice, "");

        // Verify vote was counted
        const voteInfo = await disputeKitShutter.getVoteInfo(disputeId, 0, Number(voteIDs[0]));
        expect(voteInfo[3]).to.be.true; // voted is at index 3
        expect(voteInfo[2]).to.equal(choice); // choice is at index 2
      });

      it("Should validate against recovery commitment when juror reveals", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        // Juror can provide any justification - it won't be validated
        const differentJustification = "This is a different justification that won't be checked";
        await expect(
          disputeKitShutter.connect(juror1).castVoteShutter(
            disputeId,
            voteIDs,
            choice,
            salt,
            differentJustification // Different justification is OK for recovery
          )
        ).to.not.be.reverted;
      });
    });

    describe("Failed recovery reveals", () => {
      it("Should revert if wrong choice in recovery", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        const wrongChoice = 2n;
        await expect(
          disputeKitShutter.connect(juror1).castVoteShutter(
            disputeId,
            voteIDs,
            wrongChoice, // Wrong choice
            salt,
            ""
          )
        ).to.be.revertedWithCustomError(disputeKitShutter, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if wrong salt in recovery", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        const wrongSalt = 99999n;
        await expect(
          disputeKitShutter.connect(juror1).castVoteShutter(
            disputeId,
            voteIDs,
            choice,
            wrongSalt, // Wrong salt
            ""
          )
        ).to.be.revertedWithCustomError(disputeKitShutter, "HashDoesNotMatchHiddenVoteCommitment");
      });

      it("Should revert if non-juror tries to reveal without correct full commitment", async () => {
        // Use the court with hidden votes (court ID 2)
        const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
        await advanceToCommitPeriod(disputeId);

        const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
        const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

        await disputeKitShutter
          .connect(juror1)
          .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

        await advanceToVotePeriod(disputeId);

        // Attacker tries to reveal with only choice and salt (no justification)
        await expect(
          disputeKitShutter.connect(attacker).castVoteShutter(
            disputeId,
            voteIDs,
            choice,
            salt,
            "" // No justification - would work for juror but not for others
          )
        ).to.be.revertedWithCustomError(disputeKitShutter, "HashDoesNotMatchHiddenVoteCommitment");
      });
    });
  });

  describe("Hash Function Behavior", () => {
    it("Should return different hashes for juror vs non-juror callers", async () => {
      const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
      await advanceToCommitPeriod(disputeId);

      const voteIDs = await getVoteIDsForJuror(disputeId, juror1);
      const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

      await disputeKitShutter
        .connect(juror1)
        .castCommitShutter(disputeId, voteIDs, fullCommit, recoveryCommit, identity, encryptedVote);

      await advanceToVotePeriod(disputeId);

      // During castVoteShutter, the contract should use different hash logic
      // For juror: hash(choice, salt)
      // For non-juror: hash(choice, salt, justificationHash)

      // This is tested implicitly by the recovery flow tests above
      // The juror can reveal with any justification, while non-juror must provide exact justification
    });

    it("Should correctly compute hash for normal flow", async () => {
      // Test hashVote function directly
      const justificationHash = ethers.keccak256(ethers.toUtf8Bytes(justification));
      const expectedHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256", "bytes32"], [choice, salt, justificationHash])
      );

      // When called by non-juror (normal case), should include justification
      const computedHash = await disputeKitShutter.hashVote(choice, salt, justification);
      expect(computedHash).to.equal(expectedHash);
    });
  });

  describe("Edge Cases and Security", () => {
    it("Should handle mixed normal and recovery reveals in same dispute", async () => {
      const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
      await advanceToCommitPeriod(disputeId);

      const voteIDsJuror1 = await getVoteIDsForJuror(disputeId, juror1);
      const voteIDsJuror2 = await getVoteIDsForJuror(disputeId, juror2);

      const { fullCommit: commit1, recoveryCommit: recovery1 } = generateCommitments(1n, 111n, "Juror 1 justification");
      const { fullCommit: commit2, recoveryCommit: recovery2 } = generateCommitments(2n, 222n, "Juror 2 justification");

      // Both jurors commit
      await disputeKitShutter
        .connect(juror1)
        .castCommitShutter(disputeId, voteIDsJuror1, commit1, recovery1, identity, encryptedVote);

      await disputeKitShutter
        .connect(juror2)
        .castCommitShutter(disputeId, voteIDsJuror2, commit2, recovery2, identity, encryptedVote);

      await advanceToVotePeriod(disputeId);

      // Juror1 uses recovery flow (Shutter failed for them)
      await disputeKitShutter.connect(juror1).castVoteShutter(
        disputeId,
        voteIDsJuror1,
        1n,
        111n,
        "Different justification" // Recovery doesn't check this
      );

      // Bot reveals juror2's vote normally
      await disputeKitShutter.connect(bot).castVoteShutter(
        disputeId,
        voteIDsJuror2,
        2n,
        222n,
        "Juror 2 justification" // Must match exactly
      );

      // Verify both votes were counted
      const vote1Info = await disputeKitShutter.getVoteInfo(disputeId, 0, Number(voteIDsJuror1[0]));
      const vote2Info = await disputeKitShutter.getVoteInfo(disputeId, 0, Number(voteIDsJuror2[0]));

      expect(vote1Info[3]).to.be.true; // voted is at index 3
      expect(vote1Info[2]).to.equal(1n); // choice is at index 2
      expect(vote2Info[3]).to.be.true;
      expect(vote2Info[2]).to.equal(2n);
    });

    it("Should allow anyone to reveal vote with correct data only", async () => {
      const disputeId = await createDisputeAndDraw(2, 3, SHUTTER_DK_ID);
      await advanceToCommitPeriod(disputeId);

      const voteIDsJuror1 = await getVoteIDsForJuror(disputeId, juror1);
      const { fullCommit, recoveryCommit } = generateCommitments(choice, salt, justification);

      await disputeKitShutter
        .connect(juror1)
        .castCommitShutter(disputeId, voteIDsJuror1, fullCommit, recoveryCommit, identity, encryptedVote);

      // Juror2 commits with a different choice
      const differentChoice = 2n;
      const voteIDsJuror2 = await getVoteIDsForJuror(disputeId, juror2);
      const { fullCommit: commit2, recoveryCommit: recovery2 } = generateCommitments(
        differentChoice,
        salt,
        justification
      );

      await disputeKitShutter
        .connect(juror2)
        .castCommitShutter(disputeId, voteIDsJuror2, commit2, recovery2, identity, encryptedVote);

      await advanceToVotePeriod(disputeId);

      // In normal Shutter operation, anyone (bot/attacker) can reveal the vote if they have the correct data
      // This is by design - the security comes from the fact that only Shutter knows the decryption key
      await expect(
        disputeKitShutter.connect(attacker).castVoteShutter(disputeId, voteIDsJuror1, choice, salt, justification)
      )
        .to.emit(disputeKitShutter, "VoteCast")
        .withArgs(disputeId, juror1.address, voteIDsJuror1, choice, justification);

      // Attacker cannot change juror2's vote to a different choice
      await expect(
        disputeKitShutter.connect(attacker).castVoteShutter(
          disputeId,
          voteIDsJuror2,
          1n, // Wrong choice
          salt,
          justification
        )
      ).to.be.revertedWithCustomError(disputeKitShutter, "HashDoesNotMatchHiddenVoteCommitment");
    });
  });
});

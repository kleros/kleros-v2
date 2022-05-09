import { expect } from "chai";
import { ethers } from "hardhat";
import {
  ArbitrableExample,
  ArbitrableExample__factory,
  IncrementalNG,
  IncrementalNG__factory,
  DisputeKitClassic,
  DisputeKitClassic__factory,
  KlerosCore,
  KlerosCore__factory,
  PNK,
  PNK__factory,
} from "../../typechain-types";
import {
  checkContract,
  expectGoverned,
  generateCommitFromVote,
  getCurrentTimestamp,
  getSortitionSumTreeLibrary,
  increaseTime,
  randomInt,
} from "../shared";
import { SignerWithAddress } from "hardhat-deploy-ethers/signers";
import { AddressZero, Zero, One } from "@ethersproject/constants";
import { bitfieldDisputeKits, getDisputeExtraData } from "../shared/arbitration";
import { Period } from "../shared/enums/core";
import { BigNumber } from "ethers";
import { emptyBytes32 } from "../shared/constants";
import { randomBytes } from "ethers/lib/utils";

const JUROR_PROSECUTION_MODULE_ADDRESS = AddressZero;
const HIDDEN_VOTES = false;
const MIN_STAKE = BigNumber.from(1000);
const ALPHA = BigNumber.from(10000);
const FEE_FOR_JUROR = 30;
const JURORS_FOR_COURT_JUMP = BigNumber.from(3);
const TIMES_PER_PERIOD = [1000, 2000, 3000, 2000] as [number, number, number, number];
const SORTITION_SUM_TREE_K = BigNumber.from(3);

describe("DisputeKitClassic", function () {
  let [
    deployer,
    ambitiousUser,
    aspiringJuror,
    enthusiasticJuror,
    veteranJuror,
    maliciousActor,
    innocentBystander,
  ]: SignerWithAddress[] = [];

  let rng: IncrementalNG;
  let pnk: PNK;
  let core: KlerosCore;
  let disputeKit: DisputeKitClassic;
  let arbitrable: ArbitrableExample;

  before("Initialize wallets", async () => {
    [deployer, ambitiousUser, aspiringJuror, enthusiasticJuror, veteranJuror, maliciousActor, innocentBystander] =
      await ethers.getSigners();
  });

  beforeEach("Deploy contracts", async () => {
    rng = await new IncrementalNG__factory(deployer).deploy();
    pnk = await new PNK__factory(deployer).deploy();
    await pnk.connect(deployer).transfer(aspiringJuror.address, 1000);

    disputeKit = await new DisputeKitClassic__factory(deployer).deploy(
      deployer.address,
      AddressZero, // KlerosCore is set later once it is deployed
      rng.address
    );

    const sortitionSumTreeLibrary = await getSortitionSumTreeLibrary(deployer);
    core = await new KlerosCore__factory(sortitionSumTreeLibrary, deployer).deploy(
      deployer.address,
      pnk.address,
      JUROR_PROSECUTION_MODULE_ADDRESS,
      disputeKit.address,
      HIDDEN_VOTES,
      MIN_STAKE,
      ALPHA,
      FEE_FOR_JUROR,
      JURORS_FOR_COURT_JUMP,
      TIMES_PER_PERIOD,
      SORTITION_SUM_TREE_K
    );

    await disputeKit.changeCore(core.address);

    arbitrable = await new ArbitrableExample__factory(deployer).deploy(core.address, "uri://metaevidence.json");
  });

  it("Should initialize values correctly", async () => {
    expect(await disputeKit.governor()).to.equal(deployer.address);
    expect(await disputeKit.core()).to.equal(core.address);
    expect(await disputeKit.rng()).to.equal(rng.address);

    expect(await core.disputeKits(0)).to.equal(disputeKit.address);
  });

  it("Should change governance parameters properly", async () => {
    await expectGoverned(disputeKit, "changeGovernor")
      .withRealAndFakeGovernor(deployer, maliciousActor)
      .args(innocentBystander.address);
    expect(await disputeKit.governor()).to.equal(innocentBystander.address);

    await expectGoverned(disputeKit, "changeGovernor")
      .withRealAndFakeGovernor(innocentBystander, deployer)
      .args(deployer.address);
    expect(await disputeKit.governor()).to.equal(deployer.address);

    await expectGoverned(disputeKit, "changeCore")
      .withRealAndFakeGovernor(deployer, maliciousActor)
      .args(innocentBystander.address);
    expect(await disputeKit.core()).to.equal(innocentBystander.address);

    await expectGoverned(disputeKit, "changeRandomNumberGenerator")
      .withRealAndFakeGovernor(deployer, maliciousActor)
      .args(innocentBystander.address);
    expect(await disputeKit.rng()).to.equal(innocentBystander.address);
  });

  describe("Arbitration", () => {
    let otherDisputeKit: DisputeKitClassic;

    /**
     *      Court ID [DKs]
     *                        ╔═ Court 1 [21]
     *                        ║
     *  General Court 0 [ 0] ═╣
     *                        ║
     *                        ╚═ Court 2 [None ] ═ Court 3 [21, 0]
     */

    beforeEach("Add subcourts", async () => {
      otherDisputeKit = await new DisputeKitClassic__factory(deployer).deploy(
        deployer.address,
        core.address,
        rng.address
      );
      await core.addNewDisputeKit(otherDisputeKit.address, 21);
      await core.createSubcourt(
        0,
        true,
        MIN_STAKE,
        ALPHA,
        FEE_FOR_JUROR,
        JURORS_FOR_COURT_JUMP,
        TIMES_PER_PERIOD,
        SORTITION_SUM_TREE_K,
        bitfieldDisputeKits(21)
      );
      await core.createSubcourt(
        0,
        true,
        MIN_STAKE,
        ALPHA,
        FEE_FOR_JUROR,
        JURORS_FOR_COURT_JUMP,
        TIMES_PER_PERIOD,
        SORTITION_SUM_TREE_K,
        bitfieldDisputeKits()
      );
      await core.createSubcourt(
        1,
        true,
        MIN_STAKE,
        ALPHA,
        FEE_FOR_JUROR,
        JURORS_FOR_COURT_JUMP,
        TIMES_PER_PERIOD,
        SORTITION_SUM_TREE_K,
        bitfieldDisputeKits(21, 0)
      );

      await pnk.connect(deployer).transfer(aspiringJuror.address, 5000);
      await pnk.connect(aspiringJuror).approve(core.address, 5000);
      await core.connect(aspiringJuror).setStake(3, MIN_STAKE);

      await pnk.connect(deployer).transfer(enthusiasticJuror.address, 40000);
      await pnk.connect(enthusiasticJuror).approve(core.address, 40000);
      await core.connect(enthusiasticJuror).setStake(0, 10000);
      await core.connect(enthusiasticJuror).setStake(3, 20000);

      await pnk.connect(deployer).transfer(veteranJuror.address, 100000);
      await pnk.connect(veteranJuror).approve(core.address, 100000);
      await core.connect(veteranJuror).setStake(0, 60000);
      await core.connect(veteranJuror).setStake(3, 40000);
    });

    it("Should create disputes", async () => {
      let extraData = getDisputeExtraData(0, 3, 0);
      await expect(
        core.connect(innocentBystander).createDispute(2, extraData, { value: await core.arbitrationCost(extraData) })
      )
        .to.emit(core, "DisputeCreation")
        .withArgs(0, innocentBystander.address);

      expect(await disputeKit.disputes(0)).to.equal(2);
      expect(await disputeKit.coreDisputeIDToLocal(0)).to.equal(0);
      await checkContract(disputeKit, "getRoundInfo", 0, 0, 0).for({
        winningChoice: Zero,
        tied: true,
        totalVoted: Zero,
        totalCommited: Zero,
        nbVoters: Zero,
        choiceCount: Zero,
      });
      await checkContract(core, "getRoundInfo", 0, 0).for({
        tokensAtStakePerJuror: MIN_STAKE.mul(ALPHA).div(await core.ALPHA_DIVISOR()),
        totalFeesForJurors: await core.arbitrationCost(extraData),
        repartitions: Zero,
        penalties: Zero,
        drawnJurors: [],
      });
      await checkContract(core, "disputes", 0).for({
        subcourtID: Zero,
        arbitrated: innocentBystander.address,
        disputeKit: disputeKit.address,
        period: Period.Evidence,
        ruled: false,
        lastPeriodChange: BigNumber.from(await getCurrentTimestamp()),
        nbVotes: BigNumber.from(3),
      });

      extraData = getDisputeExtraData(1, 5, 21);

      await expect(
        arbitrable
          .connect(innocentBystander)
          .createDispute(4, extraData, 0, { value: await core.arbitrationCost(extraData) })
      )
        .to.emit(arbitrable, "Dispute")
        .withArgs(1, core.address, 0, 0)
        .and.to.emit(core, "DisputeCreation")
        .withArgs(1, arbitrable.address);

      expect(await otherDisputeKit.disputes(0)).to.equal(4);
      expect(await otherDisputeKit.coreDisputeIDToLocal(1)).to.equal(0);
      await checkContract(otherDisputeKit, "getRoundInfo", 1, 0, 0).for({
        winningChoice: Zero,
        tied: true,
        nbVoters: Zero,
      });
      await checkContract(core, "disputes", 1).for({
        subcourtID: One,
        arbitrated: arbitrable.address,
        disputeKit: otherDisputeKit.address,
        period: Period.Evidence,
        ruled: false,
        lastPeriodChange: BigNumber.from(await getCurrentTimestamp()),
        nbVotes: BigNumber.from(5),
      });

      extraData = getDisputeExtraData(3, 10, 21);

      await expect(
        arbitrable
          .connect(innocentBystander)
          .createDispute(3, extraData, 0, { value: await core.arbitrationCost(extraData) })
      )
        .to.emit(arbitrable, "Dispute")
        .withArgs(2, core.address, 0, 0)
        .and.to.emit(core, "DisputeCreation")
        .withArgs(2, arbitrable.address);

      expect(await otherDisputeKit.disputes(1)).to.equal(3);
      expect(await otherDisputeKit.coreDisputeIDToLocal(2)).to.equal(1);
      await checkContract(otherDisputeKit, "getRoundInfo", 1, 0, 0).for({
        winningChoice: Zero,
        tied: true,
        nbVoters: Zero,
      });
      await checkContract(core, "disputes", 2).for({
        subcourtID: BigNumber.from(3),
        arbitrated: arbitrable.address,
        disputeKit: otherDisputeKit.address,
        period: Period.Evidence,
        ruled: false,
        lastPeriodChange: BigNumber.from(await getCurrentTimestamp()),
        nbVotes: BigNumber.from(10),
      });
    });

    it("Should not create disputes with unsupported dispute-kits", async () => {
      let extraData = getDisputeExtraData(1, 6, 0);
      await expect(
        core.connect(innocentBystander).createDispute(3, extraData, { value: await core.arbitrationCost(extraData) })
      ).to.be.revertedWith("The dispute kit is not supported by this subcourt");

      extraData = getDisputeExtraData(2, 6, 21);
      await expect(
        core.connect(innocentBystander).createDispute(3, extraData, { value: await core.arbitrationCost(extraData) })
      ).to.be.revertedWith("The dispute kit is not supported by this subcourt");
    });

    // TODO Test with different msg.values on createDisputes

    it("Should draw jurors and pass the evidence period after finishing drawing", async () => {
      let extraData = getDisputeExtraData(0, 21, 0);
      await arbitrable
        .connect(innocentBystander)
        .createDispute(3, extraData, 0, { value: await core.arbitrationCost(extraData) });

      extraData = getDisputeExtraData(3, 5, 21);
      await arbitrable
        .connect(ambitiousUser)
        .createDispute(3, extraData, 0, { value: await core.arbitrationCost(extraData) });

      await expect(core.passPeriod(1)).to.be.revertedWith(
        "The evidence period time has not passed yet and it is not an appeal."
      );
      await increaseTime(TIMES_PER_PERIOD[Period.Evidence]);

      await expect(core.passPeriod(1)).to.be.revertedWith("The dispute has not finished drawing yet.");
      await core.draw(1, 1);
      expect((await core.getRoundInfo(1, 0)).drawnJurors.length).to.equal(1, "The number of drawn jurors is wrong");

      await expect(core.passPeriod(1)).to.be.revertedWith("The dispute has not finished drawing yet.");
      await core.draw(1, 12);
      expect((await core.getRoundInfo(1, 0)).drawnJurors.length).to.equal(5, "The number of drawn jurors is wrong");

      await core.draw(1, 1);
      expect((await core.getRoundInfo(1, 0)).drawnJurors.length).to.equal(5, "No more jurors should have been drawn");

      await expect(core.passPeriod(1)).to.emit(core, "NewPeriod").withArgs(1, Period.Commit);
      await checkContract(core, "disputes", 1).for({
        lastPeriodChange: BigNumber.from(await getCurrentTimestamp()),
        period: Period.Commit,
        nbVotes: BigNumber.from(5),
      });

      await expect(core.draw(1, 1)).to.be.revertedWith("Should be evidence period.");

      await core.draw(0, 1000);
      expect((await core.getRoundInfo(0, 0)).drawnJurors.length).to.equal(21, "The number of drawn jurors is wrong");

      const tokensAtStakePerJuror = MIN_STAKE.mul(ALPHA).div(await core.ALPHA_DIVISOR());
      const jurorsLockedTokens = (await core.getRoundInfo(0, 0)).drawnJurors.reduce(
        (jurorLockedTokens, dj) => ({ ...jurorLockedTokens, [dj]: jurorLockedTokens[dj].add(tokensAtStakePerJuror) }),
        { [aspiringJuror.address]: Zero, [enthusiasticJuror.address]: Zero, [veteranJuror.address]: Zero }
      );

      for (const juror in jurorsLockedTokens)
        expect((await core.getJurorBalance(juror, 0)).locked).to.eql(
          jurorsLockedTokens[juror],
          "Juror has wrong amount of locked tokens"
        );

      await expect(core.passPeriod(0)).to.emit(core, "NewPeriod").withArgs(0, Period.Vote);
      await checkContract(core, "getRoundInfo", 0, 0).for({
        tokensAtStakePerJuror,
        totalFeesForJurors: await core.arbitrationCost(getDisputeExtraData(0, 21, 0)),
        repartitions: Zero,
        penalties: Zero,
      });
      await checkContract(core, "disputes", 0).for({
        lastPeriodChange: BigNumber.from(await getCurrentTimestamp()),
        period: Period.Vote,
        nbVotes: BigNumber.from(21),
      });
    });

    it("Should cast commits and pass the commit period", async () => {
      const nJurors = randomInt(2, 10);
      const nChoices = randomInt(2, 5);
      const winningChoice = randomInt(0, nChoices) + 1;

      const extraData = getDisputeExtraData(3, nJurors, 0);
      await arbitrable
        .connect(innocentBystander)
        .createDispute(nChoices, extraData, 0, { value: await core.arbitrationCost(extraData) });

      await expect(disputeKit.connect(veteranJuror).castCommit(0, [0], randomBytes(32))).to.be.revertedWith(
        "The dispute should be in Commit period."
      );

      await increaseTime(TIMES_PER_PERIOD[Period.Evidence]);
      await core.draw(0, nJurors);
      await core.passPeriod(0);

      await expect(core.passPeriod(0)).to.be.revertedWith("The commit period time has not passed yet.");
      await expect(disputeKit.connect(veteranJuror).castCommit(0, [0], emptyBytes32)).to.be.revertedWith(
        "Empty commit."
      );
      await expect(disputeKit.connect(maliciousActor).castCommit(0, [1], randomBytes(32))).to.be.revertedWith(
        "The caller has to own the vote."
      );

      const drawnJurors = (await core.getRoundInfo(0, 0)).drawnJurors;
      for (let i = 0; i < nJurors - 1; i++) {
        const [commit] = generateCommitFromVote(winningChoice);
        const drawnJuror = jurorByAddress(drawnJurors[i]);
        await disputeKit.connect(drawnJuror).castCommit(0, [i], commit);
        await checkContract(disputeKit, "getVoteInfo", 0, 0, i).for({
          account: drawnJuror.address,
          choice: Zero,
          commit: BigNumber.from(commit)._hex,
          voted: false,
        });
      }

      await expect(
        disputeKit.connect(jurorByAddress(drawnJurors[0])).castCommit(0, [0], randomBytes(32))
      ).to.be.revertedWith("Already committed this vote.");

      expect((await disputeKit.getRoundInfo(0, 0, 0)).totalCommited).to.equal(
        nJurors - 1,
        "The right amount of commits has not been casted"
      );

      const [commit] = generateCommitFromVote(winningChoice);
      await expect(disputeKit.connect(jurorByAddress(drawnJurors[nJurors - 1])).castCommit(0, [nJurors - 1], commit))
        .to.emit(core, "NewPeriod")
        .withArgs(0, Period.Vote);
      await expect(disputeKit.connect(maliciousActor).castCommit(0, [nJurors - 1], commit)).to.be.revertedWith(
        "The dispute should be in Commit period."
      );
      expect(await core.getCurrentPeriod(0)).to.equal(Period.Vote, "Didn't reach vote period");

      // TODO Check case when not all committed and core passes period
    });

    it("Should cast votes and pass the vote period", async () => {
      const nJurors = randomInt(2, 10);
      const nChoices = randomInt(2, 5);

      const extraData = getDisputeExtraData(0, nJurors, 0);
      await arbitrable
        .connect(innocentBystander)
        .createDispute(nChoices, extraData, 0, { value: await core.arbitrationCost(extraData) });
      await increaseTime(TIMES_PER_PERIOD[Period.Evidence]);
      await core.draw(0, nJurors);
      await core.passPeriod(0);

      await expect(core.passPeriod(0)).to.be.revertedWith("The vote period time has not passed yet");

      const drawnJurors = (await core.getRoundInfo(0, 0)).drawnJurors;
      for (let i = 0; i < nJurors - 1; i++) {
        await disputeKit.connect(jurorByAddress(drawnJurors[i])).castVote(0, [i], (i % nChoices) + 1, randomBytes(32));
        await checkContract(disputeKit, "getRoundInfo", 0, 0, 1).for({
          winningChoice: One,
          tied: i % nChoices !== 0,
          totalVoted: BigNumber.from(i + 1),
          nbVoters: BigNumber.from(nJurors),
          choiceCount: BigNumber.from(Math.floor(i / nChoices) + 1),
        });
      }

      await expect(
        disputeKit
          .connect(jurorByAddress(drawnJurors[nJurors - 1]))
          .castVote(0, [nJurors - 1], nChoices + 1, emptyBytes32)
      ).to.be.revertedWith("Choice out of bounds");
      await expect(
        disputeKit
          .connect(jurorByAddress(drawnJurors[nJurors - 1]))
          .castVote(0, [], (nJurors - 1) % nChoices, randomBytes(32))
      ).to.be.revertedWith("No voteID provided");
      await expect(
        disputeKit.connect(jurorByAddress(drawnJurors[0])).castVote(0, [0], 0, randomBytes(32))
      ).to.be.revertedWith("Vote already cast.");

      await expect(
        disputeKit
          .connect(jurorByAddress(drawnJurors[nJurors - 1]))
          .castVote(0, [nJurors - 1], (nJurors - 1) % nChoices, randomBytes(32))
      )
        .to.emit(core, "AppealPossible")
        .withArgs(0, arbitrable.address)
        .and.to.emit(core, "NewPeriod")
        .withArgs(0, Period.Appeal);

      expect(await core.getCurrentPeriod(0), "Didn't reach appeal period").to.equal(Period.Appeal);
    });

    // it("Should cast votes in court with hidden votes", async () => {});

    // it("Should deal with appeals", async () => {});

    it("Should execute", async () => {
      const nJurors = randomInt(2, 10);
      const nChoices = randomInt(2, 5);
      const winningChoice = randomInt(0, nChoices) + 1;

      const extraData = getDisputeExtraData(0, nJurors, 0);
      await arbitrable
        .connect(innocentBystander)
        .createDispute(nChoices, extraData, 0, { value: await core.arbitrationCost(extraData) });
      await increaseTime(TIMES_PER_PERIOD[Period.Evidence]);
      await core.draw(0, nJurors);
      await core.passPeriod(0);

      const drawnJurors = (await core.getRoundInfo(0, 0)).drawnJurors;
      for (let i = 0; i < nJurors; i++)
        await disputeKit.connect(jurorByAddress(drawnJurors[i])).castVote(0, [i], winningChoice, randomBytes(32));

      await increaseTime(TIMES_PER_PERIOD[Period.Appeal] + 1);
      await core.passPeriod(0);
      expect(await core.getCurrentPeriod(0), "Didn't reach execution period").to.equal(Period.Execution);

      await expect(core.passPeriod(0)).to.be.revertedWith("The dispute is already in the last period.");

      await core.executeRuling(0);
    });

    const jurorByAddress = (address: string) =>
      ({
        [aspiringJuror.address]: aspiringJuror,
        [enthusiasticJuror.address]: enthusiasticJuror,
        [veteranJuror.address]: veteranJuror,
      }[address]);
  });
});

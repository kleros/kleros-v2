import { expect } from "chai";
import { ethers } from "hardhat";
import { AddressZero } from "@ethersproject/constants";
import {
  ConstantNG,
  ConstantNG__factory,
  DisputeKitClassic,
  DisputeKitClassic__factory,
  KlerosCore,
  KlerosCore__factory,
  PNK,
  PNK__factory,
} from "../../typechain-types";
import { expectGoverned, getSortitionSumTreeLibrary, randomInt } from "../shared";
import { bitfieldDisputeKits, generateSubcourts, getDisputeExtraData } from "../shared/arbitration";
import { SignerWithAddress } from "hardhat-deploy-ethers/signers";
import type { BigNumberish } from "ethers";

const JUROR_PROSECUTION_MODULE_ADDRESS = AddressZero;
const HIDDEN_VOTES = false;
const MIN_STAKE = 200;
const ALPHA = 10000;
const FEE_FOR_JUROR = 100;
const JURORS_FOR_COURT_JUMP = 3;
const TIMES_PER_PERIOD = [0, 0, 0, 0] as [BigNumberish, BigNumberish, BigNumberish, BigNumberish];
const SORTITION_SUM_TREE_K = 3;

describe("KlerosCore", function () {
  let [deployer, aspiringJuror, maliciousActor, innocentBystander]: SignerWithAddress[] = [];

  let rng: ConstantNG;
  let pnk: PNK;
  let core: KlerosCore;
  let disputeKit: DisputeKitClassic;

  before("Initialize wallets", async () => {
    [deployer, aspiringJuror, maliciousActor, innocentBystander] = await ethers.getSigners();
  });

  beforeEach("Deploy contracts", async () => {
    rng = await new ConstantNG__factory(deployer).deploy(42);
    pnk = await new PNK__factory(deployer).deploy();

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
  });

  it("Should initialize values correctly", async () => {
    expect(await core.governor()).to.equal(deployer.address);
    expect(await core.pinakion()).to.equal(pnk.address);
    expect(await core.jurorProsecutionModule()).to.equal(AddressZero);
    expect(await core.disputeKits(0)).to.equal(disputeKit.address);

    const generalCourt = await core.courts(0);
    expect(generalCourt.parent).to.equal(0);
    expect(generalCourt.hiddenVotes).to.equal(HIDDEN_VOTES);
    expect(generalCourt.minStake).to.equal(MIN_STAKE);
    expect(generalCourt.alpha).to.equal(ALPHA);
    expect(generalCourt.feeForJuror).to.equal(FEE_FOR_JUROR);
    expect(generalCourt.jurorsForCourtJump).to.equal(JURORS_FOR_COURT_JUMP);
    expect(generalCourt.supportedDisputeKits).to.equal(1);
  });

  describe("Governor functions", () => {
    it("Should change governance parameters properly", async () => {
      await expectGoverned(core, "changeGovernor")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(innocentBystander.address);
      expect(await core.governor()).to.equal(innocentBystander.address);

      await expectGoverned(core, "changeGovernor")
        .withRealAndFakeGovernor(innocentBystander, deployer)
        .args(deployer.address);
      expect(await core.governor()).to.equal(deployer.address);

      await expectGoverned(core, "changePinakion")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(innocentBystander.address);
      expect(await core.pinakion()).to.equal(innocentBystander.address);

      await expectGoverned(core, "changeJurorProsecutionModule")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(innocentBystander.address);
      expect(await core.jurorProsecutionModule()).to.equal(innocentBystander.address);

      await expectGoverned(core, "addNewDisputeKit")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(innocentBystander.address, 28);
      expect(await core.disputeKits(28)).to.equal(innocentBystander.address);

      await expectGoverned(core, "createSubcourt")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(0, true, 234, 56, 78, 5, [100, 200, 300, 400], 3, disputeKit.address);

      expect((await core.courts(1)).minStake).to.equal(234);
      await expectGoverned(core, "changeSubcourtMinStake")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(1, 909);
      expect((await core.courts(1)).minStake).to.equal(909);

      expect((await core.courts(1)).alpha).to.equal(56);
      await expectGoverned(core, "changeSubcourtAlpha").withRealAndFakeGovernor(deployer, maliciousActor).args(1, 321);
      expect((await core.courts(1)).alpha).to.equal(321);

      expect((await core.courts(1)).feeForJuror).to.equal(78);
      await expectGoverned(core, "changeSubcourtJurorFee")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(1, 700);
      expect((await core.courts(1)).feeForJuror).to.equal(700);

      expect((await core.courts(1)).jurorsForCourtJump).to.equal(5);
      await expectGoverned(core, "changeSubcourtJurorsForJump")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(1, 90);
      expect((await core.courts(1)).jurorsForCourtJump).to.equal(90);

      let timesPerPeriod = await core.getTimesPerPeriod(1);
      expect(timesPerPeriod[1].toNumber()).to.eql(200);
      expect(timesPerPeriod[3].toNumber()).to.eql(400);
      await expectGoverned(core, "changeSubcourtTimesPerPeriod")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(1, [900, 800, 700, 600]);
      timesPerPeriod = await core.getTimesPerPeriod(1);
      expect(timesPerPeriod[0].toNumber()).to.eql(900);
      expect(timesPerPeriod[2].toNumber()).to.eql(700);

      await expectGoverned(core, "setDisputeKits")
        .withRealAndFakeGovernor(deployer, maliciousActor)
        .args(1, [28], false);
    });

    it("Should correctly create subcourts", async () => {
      const subcourts = await generateSubcourts(deployer, core, disputeKit, MIN_STAKE);

      let randomCourtID = randomInt(0, subcourts.length);
      let randomCourt = await core.courts(randomCourtID + 1);
      expect(randomCourt.parent).to.equal(subcourts[randomCourtID].parent);
      expect(randomCourt.supportedDisputeKits[0]).to.equal(subcourts[randomCourtID].supportedDisputeKit);
      expect(randomCourt.alpha).to.equal(subcourts[randomCourtID].alpha);
      expect(randomCourt.hiddenVotes).to.equal(subcourts[randomCourtID].hiddenVotes);

      randomCourtID = randomInt(0, subcourts.length);
      randomCourt = await core.courts(randomCourtID + 1);
      expect(randomCourt.parent).to.equal(subcourts[randomCourtID].parent);
      expect(randomCourt.feeForJuror).to.equal(subcourts[randomCourtID].feeForJuror);
      expect(randomCourt.jurorsForCourtJump).to.equal(subcourts[randomCourtID].jurorsForCourtJump);
      expect(randomCourt.minStake).to.equal(subcourts[randomCourtID].minStake);
    });

    // TODO should not set court stake higher than parent and smaller than children

    it("Should not allow creating subcourts with parents that have a higher minimum stake", async () => {
      await expect(
        core
          .connect(deployer)
          .createSubcourt(
            0,
            HIDDEN_VOTES,
            MIN_STAKE - 1,
            ALPHA,
            FEE_FOR_JUROR,
            JURORS_FOR_COURT_JUMP,
            TIMES_PER_PERIOD,
            SORTITION_SUM_TREE_K,
            disputeKit.address
          )
      ).to.be.revertedWith("A subcourt cannot be a child of a subcourt with a higher minimum stake.");
    });

    it("Should add/remove disputekits from subcourt", async () => {
      const otherDisputeKit = await new DisputeKitClassic__factory(deployer).deploy(
        deployer.address,
        core.address,
        rng.address
      );
      await core.addNewDisputeKit(otherDisputeKit.address, 21);
      await core.addNewDisputeKit(innocentBystander.address, 57);
      await core
        .connect(deployer)
        .createSubcourt(
          0,
          HIDDEN_VOTES,
          MIN_STAKE,
          ALPHA,
          FEE_FOR_JUROR,
          JURORS_FOR_COURT_JUMP,
          TIMES_PER_PERIOD,
          SORTITION_SUM_TREE_K,
          0
        );

      await core.connect(deployer).setDisputeKits(0, [0], false);
      expect((await core.courts(0)).supportedDisputeKits).to.equal(bitfieldDisputeKits());

      expect((await core.courts(1)).supportedDisputeKits).to.equal(bitfieldDisputeKits());
      await core.connect(deployer).setDisputeKits(1, [0], true);
      expect((await core.courts(1)).supportedDisputeKits).to.equal(bitfieldDisputeKits(0));

      await core.connect(deployer).setDisputeKits(1, [21, 57], true);

      expect((await core.courts(1)).supportedDisputeKits).to.equal(bitfieldDisputeKits(0, 21, 57));
      await expect(core.connect(deployer).setDisputeKits(1, [57], true)).to.be.revertedWith(
        "Dispute kit already supported"
      );

      await core.connect(deployer).setDisputeKits(1, [0], false);
      expect((await core.courts(1)).supportedDisputeKits).to.equal(bitfieldDisputeKits(21, 57));
      await expect(core.connect(deployer).setDisputeKits(1, [0, 57], true)).to.be.revertedWith(
        "Dispute kit already supported"
      );
      await expect(core.connect(deployer).setDisputeKits(1, [0], false)).to.be.revertedWith(
        "Dispute kit is not supported"
      );

      await core.connect(deployer).setDisputeKits(1, [21], false);
      await expect(core.connect(deployer).setDisputeKits(1, [21, 57], false)).to.be.revertedWith(
        "Dispute kit is not supported"
      );
      expect((await core.courts(1)).supportedDisputeKits).to.equal(bitfieldDisputeKits(57));
    });
  });

  it("Should set stake correctly", async () => {
    await core.createSubcourt(0, true, 234, 56, 78, 5, [100, 200, 300, 400], 3, disputeKit.address);

    expect(await pnk.balanceOf(aspiringJuror.address)).to.equal(0);
    await pnk.connect(deployer).transfer(aspiringJuror.address, 1000);
    expect(await pnk.balanceOf(aspiringJuror.address)).to.equal(1000);
    await pnk.connect(aspiringJuror).approve(core.address, 500);

    await expect(core.connect(aspiringJuror).setStake(0, MIN_STAKE - 1)).to.be.revertedWith("Staking failed");

    await expect(core.connect(aspiringJuror).setStake(0, MIN_STAKE))
      .to.emit(core, "StakeSet")
      .withArgs(aspiringJuror.address, 0, MIN_STAKE, MIN_STAKE);
    expect(await pnk.balanceOf(aspiringJuror.address)).to.equal(1000 - MIN_STAKE);

    let jurorBalance = await core.getJurorBalance(aspiringJuror.address, 0);
    expect(jurorBalance.staked).to.equal(MIN_STAKE);
    expect(jurorBalance.locked).to.equal(0);

    await expect(core.connect(aspiringJuror).setStake(0, 0))
      .to.emit(core, "StakeSet")
      .withArgs(aspiringJuror.address, 0, 0, 0);
    expect(await pnk.balanceOf(aspiringJuror.address)).to.equal(1000);

    jurorBalance = await core.getJurorBalance(aspiringJuror.address, 0);
    expect(jurorBalance.staked).to.equal(0);
    expect(jurorBalance.locked).to.equal(0);
  });

  it("Should return correct arbitration cost", async () => {
    expect(await core.arbitrationCost(getDisputeExtraData(0, 3, 0))).to.equal(FEE_FOR_JUROR * 3);
    expect(await core.arbitrationCost(getDisputeExtraData(0, 24, 0))).to.equal(FEE_FOR_JUROR * 24);

    const subcourtJurorFee = 78;
    await core.createSubcourt(0, true, 234, 56, subcourtJurorFee, 5, [100, 200, 300, 400], 3, disputeKit.address);
    expect(await core.arbitrationCost(getDisputeExtraData(1, 3, 0))).to.equal(subcourtJurorFee * 3);
    expect(await core.arbitrationCost(getDisputeExtraData(1, 24, 0))).to.equal(subcourtJurorFee * 24);
  });
});

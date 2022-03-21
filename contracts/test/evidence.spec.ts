import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import {
  CentralizedArbitrator,
  CentralizedArbitrator__factory,
  ModeratedEvidenceModule,
  ModeratedEvidenceModule__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expectEvent, expectGoverned, increaseTime } from "./shared";
import { Zero, One } from "@ethersproject/constants";
import { Party } from "./shared/enums/evidence";

const arbitrationFee = 1000;
const appealFee = arbitrationFee;
const arbitratorExtraData = "0x85";
const appealTimeout = 100;
const bondTimeout = 60 * 10;
const totalCostMultiplier = 15000;
const initialDepositMultiplier = 625;
const metaEvidenceUri = "https://kleros.io";
const MULTIPLIER_DIVISOR = BigNumber.from(10000);
const totalCost = BigNumber.from(arbitrationFee).mul(BigNumber.from(totalCostMultiplier)).div(MULTIPLIER_DIVISOR);
const minRequiredDeposit = totalCost.mul(BigNumber.from(initialDepositMultiplier)).div(MULTIPLIER_DIVISOR);

describe("Home Evidence contract", async () => {
  let [deployer, user1, user2, user3]: SignerWithAddress[] = [];
  let arbitrator: CentralizedArbitrator;
  let evidenceModule: ModeratedEvidenceModule;
  let evidenceID: string;

  before("Initialize wallets", async () => {
    [deployer, user1, user2, user3] = await ethers.getSigners();
  });

  beforeEach("Deploy contracts contracts", async () => {
    arbitrator = await new CentralizedArbitrator__factory(deployer).deploy(arbitrationFee, appealTimeout, appealFee);
    evidenceModule = await new ModeratedEvidenceModule__factory(deployer).deploy(
      arbitrator.address,
      deployer.address,
      totalCostMultiplier,
      initialDepositMultiplier,
      bondTimeout,
      arbitratorExtraData,
      metaEvidenceUri
    );
  });

  it("Should initialize values correctly", async () => {
    expect(await evidenceModule.arbitrator()).to.equal(arbitrator.address);
    expect(await evidenceModule.governor()).to.equal(deployer.address);
    expect(await evidenceModule.totalCostMultiplier()).to.equal(totalCostMultiplier);
    expect(await evidenceModule.initialDepositMultiplier()).to.equal(initialDepositMultiplier);
    expect(await evidenceModule.bondTimeout()).to.equal(bondTimeout);
    expect(await evidenceModule.getCurrentArbitratorIndex()).to.equal(0);
    expect((await evidenceModule.arbitratorDataList(0)).arbitratorExtraData).to.equal(arbitratorExtraData);
    expect((await evidenceModule.arbitratorDataList(0)).metaEvidenceUpdates).to.equal(0);
  });

  it("Should change governance parameters properly", async () => {
    await expectGoverned(evidenceModule, "changeGovernor").withRealAndFakeGovernor(deployer, user1).args(user2.address);
    expect(await evidenceModule.governor()).to.equal(user2.address);

    await expectGoverned(evidenceModule, "changeGovernor").withRealAndFakeGovernor(user2, user1).args(deployer.address);
    expect(await evidenceModule.governor()).to.equal(deployer.address);

    await expectGoverned(evidenceModule, "changeInitialDepositMultiplier")
      .withRealAndFakeGovernor(deployer, user1)
      .args(312);
    expect(await evidenceModule.initialDepositMultiplier()).to.equal(312);

    await expectGoverned(evidenceModule, "changeTotalCostMultiplier")
      .withRealAndFakeGovernor(deployer, user1)
      .args(538);
    expect(await evidenceModule.totalCostMultiplier()).to.equal(538);

    await expectGoverned(evidenceModule, "changeBondTimeout").withRealAndFakeGovernor(deployer, user1).args(928);
    expect(await evidenceModule.bondTimeout()).to.equal(928);

    const oldArbitratorIndex = await evidenceModule.getCurrentArbitratorIndex();
    await expectGoverned(evidenceModule, "changeMetaEvidence").withRealAndFakeGovernor(deployer, user1).args(".json");
    expect(
      (await evidenceModule.arbitratorDataList(await evidenceModule.getCurrentArbitratorIndex())).metaEvidenceUpdates
    ).to.equal(oldArbitratorIndex.add(1));
    const receipt = await (await evidenceModule.connect(deployer).changeMetaEvidence("my-metaevidence")).wait();
    expectEvent(receipt)
      .named("MetaEvidence")
      .with({ _evidence: "my-metaevidence", _metaEvidenceID: oldArbitratorIndex.add(2) });

    await expectGoverned(evidenceModule, "changeArbitratorExtraData")
      .withRealAndFakeGovernor(deployer, user1)
      .args("0x64");
    expect(
      (await evidenceModule.arbitratorDataList(await evidenceModule.getCurrentArbitratorIndex())).arbitratorExtraData
    ).to.equal("0x64");

    await expect(evidenceModule.connect(user2).changeArbitratorExtraData(arbitratorExtraData)).to.be.revertedWith(
      "The caller must be the governor"
    );
  });

  describe("Evidence Submission", () => {
    it("Should submit evidence correctly.", async () => {
      const newEvidence = "Irrefutable evidence";
      const tx = await evidenceModule.connect(user1).submitEvidence(1234, newEvidence, { value: minRequiredDeposit }); // id: 0
      const receipt = await tx.wait();
      const evidenceID = ethers.utils.solidityKeccak256(["uint", "string"], [1234, newEvidence]);

      expectEvent(receipt).named("Evidence").with({
        _arbitrator: arbitrator.address,
        _evidenceGroupID: 1234,
        _party: user1.address,
        _evidence: newEvidence,
      });

      expect(await evidenceModule.getContributions(evidenceID, 0, user1.address)).to.deep.equal(
        [Zero, minRequiredDeposit, Zero],
        "Wrong contributions."
      );
    });

    it("Should not allowed the same evidence twice for the same evidence group id.", async () => {
      const newEvidence = "Irrefutable evidence";
      await evidenceModule.submitEvidence(1234, newEvidence, {
        value: minRequiredDeposit,
      });
      await expect(
        evidenceModule.submitEvidence(1234, newEvidence, {
          value: minRequiredDeposit,
        })
      ).to.be.revertedWith("Evidence already submitted.");
    });

    it("Should revert if deposit is too low.", async () => {
      const newEvidence = "Irrefutable evidence";
      await expect(
        evidenceModule.submitEvidence(1234, newEvidence, {
          value: minRequiredDeposit.sub(One),
        })
      ).to.be.revertedWith("Insufficient funding.");
    });
  });

  describe("Moderation", () => {
    beforeEach("Initialize posts and comments", async () => {
      const newEvidence = "Irrefutable evidence";
      await evidenceModule.connect(user1).submitEvidence(1234, newEvidence, { value: minRequiredDeposit });
      evidenceID = ethers.utils.solidityKeccak256(["uint", "string"], [1234, newEvidence]);
    });

    it("Should not allow moderation after bond timeout passed.", async () => {
      await expect(evidenceModule.resolveModerationMarket(evidenceID)).to.be.revertedWith("Moderation still ongoing.");

      await increaseTime(60 * 10);

      // Moderate
      await expect(evidenceModule.moderate(evidenceID, Party.Moderator, { value: totalCost })).to.be.revertedWith(
        "Moderation market is closed."
      );

      await evidenceModule.resolveModerationMarket(evidenceID);

      // After market has been closed, moderation can re-open.
      await evidenceModule.moderate(evidenceID, Party.Submitter, { value: totalCost });
    });

    it("Should create dispute after moderation escalation is complete.", async () => {
      await evidenceModule.connect(user2).moderate(evidenceID, Party.Moderator, {
        value: minRequiredDeposit.mul(2),
      });

      let moderationInfo = await evidenceModule.getModerationInfo(evidenceID, 0);
      let paidFees = moderationInfo.paidFees;
      let depositRequired = paidFees[Party.Moderator].mul(2).sub(paidFees[Party.Submitter]);
      await evidenceModule.connect(user3).moderate(evidenceID, Party.Submitter, {
        value: depositRequired,
      });

      moderationInfo = await evidenceModule.getModerationInfo(evidenceID, 0);
      paidFees = moderationInfo.paidFees;
      depositRequired = paidFees[Party.Submitter].mul(2).sub(paidFees[Party.Moderator]);
      await evidenceModule.connect(user2).moderate(evidenceID, Party.Moderator, {
        value: depositRequired,
      });

      moderationInfo = await evidenceModule.getModerationInfo(evidenceID, 0);
      paidFees = moderationInfo.paidFees;
      depositRequired = paidFees[Party.Moderator].mul(2).sub(paidFees[Party.Submitter]);
      await evidenceModule.connect(user3).moderate(evidenceID, Party.Submitter, {
        value: depositRequired,
      });

      moderationInfo = await evidenceModule.getModerationInfo(evidenceID, 0);
      paidFees = moderationInfo.paidFees;
      depositRequired = paidFees[Party.Submitter].mul(2).sub(paidFees[Party.Moderator]);
      await evidenceModule.connect(user2).moderate(evidenceID, Party.Moderator, {
        value: depositRequired,
      });

      moderationInfo = await evidenceModule.getModerationInfo(evidenceID, 0);
      paidFees = moderationInfo.paidFees;
      depositRequired = paidFees[Party.Moderator].mul(2).sub(paidFees[Party.Submitter]);
      const tx = await evidenceModule.connect(user3).moderate(evidenceID, Party.Submitter, {
        value: depositRequired, // Less is actually needed. Overpaid fees are reimbursed
      });
      const receipt = await tx.wait();

      expectEvent(receipt).named("Dispute").with({
        _arbitrator: arbitrator.address,
        _disputeID: 0,
        _metaEvidenceID: 0,
        _evidenceGroupID: evidenceID,
      });

      await expect(
        evidenceModule.connect(user2).moderate(evidenceID, Party.Moderator, {
          value: totalCost,
        })
      ).to.be.revertedWith("Evidence already disputed.");

      await expect(evidenceModule.connect(user2).resolveModerationMarket(evidenceID)).to.be.revertedWith(
        "Evidence already disputed."
      );
    });
  });
});

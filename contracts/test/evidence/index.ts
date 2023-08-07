import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
const hre = require("hardhat");

const Party = {
  None: 0,
  Submitter: 1,
  Moderator: 2,
};

function getEmittedEvent(eventName: any, receipt: any) {
  return receipt.events.find(({ event }) => event === eventName);
}

describe("Home Evidence contract", async () => {
  const arbitrationFee = 1000;
  const appealFee = arbitrationFee;
  const arbitratorExtraData = "0x85";
  const appealTimeout = 100;
  const bondTimeout = 60 * 10;
  const totalCostMultiplier = 15000;
  const initialDepositMultiplier = 625;
  const disputeTemplate = '{ "disputeTemplate": "foo"}';
  const MULTIPLIER_DIVISOR = BigNumber.from(10000);
  const totalCost = BigNumber.from(arbitrationFee).mul(BigNumber.from(totalCostMultiplier)).div(MULTIPLIER_DIVISOR);
  const minRequiredDeposit = totalCost.mul(BigNumber.from(initialDepositMultiplier)).div(MULTIPLIER_DIVISOR);
  const ZERO = BigNumber.from(0);

  let deployer;
  let user1;
  let user2;
  let user3;
  let user4;
  let evidenceID;

  let arbitrator;
  let evidenceModule;
  let disputeTemplateRegistry;

  beforeEach("Setup contracts", async () => {
    [deployer, user1, user2, user3, user4] = await ethers.getSigners();

    const Arbitrator = await ethers.getContractFactory("CentralizedArbitrator");
    arbitrator = await Arbitrator.deploy(String(arbitrationFee), appealTimeout, String(appealFee));

    const DisputeTemplateRegistry = await ethers.getContractFactory("DisputeTemplateRegistry");
    disputeTemplateRegistry = await DisputeTemplateRegistry.deploy();

    const EvidenceModule = await ethers.getContractFactory("ModeratedEvidenceModule");
    evidenceModule = await EvidenceModule.deploy(
      arbitrator.address,
      deployer.address, // governor
      disputeTemplateRegistry.address,
      totalCostMultiplier,
      initialDepositMultiplier,
      bondTimeout,
      arbitratorExtraData,
      disputeTemplate,
      "disputeTemplateMapping: TODO"
    );
  });

  describe("Governance", async () => {
    it("Should change parameters correctly", async () => {
      const newGovernor = await user2.getAddress();
      await evidenceModule.changeGovernor(newGovernor);
      expect(await evidenceModule.governor()).to.equal(newGovernor);
      await evidenceModule.connect(user2).changeGovernor(await deployer.getAddress());

      await evidenceModule.changeInitialDepositMultiplier(1);
      expect(await evidenceModule.initialDepositMultiplier()).to.equal(1);

      await evidenceModule.changeTotalCostMultiplier(1);
      expect(await evidenceModule.totalCostMultiplier()).to.equal(1);

      await evidenceModule.changeBondTimeout(1);
      expect(await evidenceModule.bondTimeout()).to.equal(1);

      const newDisputeTemplate = '{ "disputeTemplate": "bar"}';
      let tx = await evidenceModule.changeDisputeTemplate(newDisputeTemplate, "disputeTemplateMapping: TODO");
      let receipt = await tx.wait();
      let lastArbitratorIndex = await evidenceModule.getCurrentArbitratorIndex();
      let newArbitratorData = await evidenceModule.arbitratorDataList(lastArbitratorIndex);
      let oldArbitratorData = await evidenceModule.arbitratorDataList(lastArbitratorIndex.sub(BigNumber.from(1)));

      expect(newArbitratorData.disputeTemplateId).to.equal(oldArbitratorData.disputeTemplateId.add(BigNumber.from(1)));
      expect(newArbitratorData.arbitratorExtraData).to.equal(oldArbitratorData.arbitratorExtraData);
      const disputeTemplateEvents = await disputeTemplateRegistry.queryFilter(
        disputeTemplateRegistry.filters.DisputeTemplate(),
        receipt.blockNumber,
        receipt.blockNumber
      );
      const [_templateId, _, _templateData] = disputeTemplateEvents[0].args;
      expect(_templateData).to.equal(newDisputeTemplate, "Wrong Template Data.");
      expect(_templateId).to.equal(newArbitratorData.disputeTemplateId, "Wrong Template ID.");

      const newArbitratorExtraData = "0x86";
      await evidenceModule.changeArbitratorExtraData(newArbitratorExtraData);
      newArbitratorData = await evidenceModule.arbitratorDataList(lastArbitratorIndex.add(BigNumber.from(1)));
      expect(newArbitratorData.arbitratorExtraData).to.equal(newArbitratorExtraData, "Wrong extraData");
    });

    it("Should revert if the caller is not the governor", async () => {
      await expect(evidenceModule.connect(user2).changeGovernor(await user2.getAddress())).to.be.revertedWith(
        "The caller must be the governor"
      );

      await expect(evidenceModule.connect(user2).changeInitialDepositMultiplier(0)).to.be.revertedWith(
        "The caller must be the governor"
      );

      await expect(evidenceModule.connect(user2).changeTotalCostMultiplier(0)).to.be.revertedWith(
        "The caller must be the governor"
      );

      await expect(evidenceModule.connect(user2).changeBondTimeout(0)).to.be.revertedWith(
        "The caller must be the governor"
      );

      await expect(evidenceModule.connect(user2).changeDisputeTemplate(disputeTemplate, "")).to.be.revertedWith(
        "The caller must be the governor"
      );

      await expect(evidenceModule.connect(user2).changeArbitratorExtraData(arbitratorExtraData)).to.be.revertedWith(
        "The caller must be the governor"
      );
    });
  });

  describe("Evidence Submission", () => {
    it("Should submit evidence correctly.", async () => {
      const newEvidence = "Irrefutable evidence";
      const tx = await evidenceModule.connect(user1).submitEvidence(1234, newEvidence, {
        value: minRequiredDeposit,
      }); // id: 0
      const receipt = await tx.wait();
      const evidenceID = ethers.utils.solidityKeccak256(["uint", "string"], [1234, newEvidence]);

      const [_arbitrator, _externalDisputeID, _party, _evidence] = getEmittedEvent("ModeratedEvidence", receipt).args;
      expect(_arbitrator).to.equal(arbitrator.address, "Wrong arbitrator.");
      expect(_externalDisputeID).to.equal(1234, "Wrong external dispute ID.");
      expect(_party).to.equal(user1.address, "Wrong submitter.");
      expect(_evidence).to.equal(newEvidence, "Wrong evidence message.");

      let contributions = await evidenceModule.getContributions(evidenceID, 0, user1.address);
      expect(contributions[0]).to.equal(ZERO); // it's 1am and to.deep.equal() won't work, can't be bothered
      expect(contributions[1]).to.equal(BigNumber.from("93"));
      expect(contributions[2]).to.equal(ZERO);
      expect(contributions.length).to.equal(3);
    });

    it("Should not allowed the same evidence twice for the same external dispute id.", async () => {
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
          value: minRequiredDeposit.sub(BigNumber.from(1)),
        })
      ).to.be.revertedWith("Insufficient funding.");
    });
  });

  describe("Moderation", () => {
    beforeEach("Initialize posts and comments", async () => {
      const newEvidence = "Irrefutable evidence";
      await evidenceModule.connect(user1).submitEvidence(1234, newEvidence, {
        value: minRequiredDeposit,
      });
      evidenceID = ethers.utils.solidityKeccak256(["uint", "string"], [1234, newEvidence]);
    });

    it("Should not allow moderation after bond timeout passed.", async () => {
      await expect(evidenceModule.resolveModerationMarket(evidenceID)).to.be.revertedWith("Moderation still ongoing.");

      await hre.ethers.provider.send("evm_increaseTime", [60 * 10]);

      // Moderate
      await expect(
        evidenceModule.moderate(evidenceID, Party.Moderator, {
          value: totalCost,
          gasLimit: 500000,
        })
      ).to.be.revertedWith("Moderation market is closed.");

      await evidenceModule.resolveModerationMarket(evidenceID, { gasLimit: 500000 });

      // After market has been closed, moderation can re-open.
      await evidenceModule.moderate(evidenceID, Party.Submitter, {
        value: totalCost,
        gasLimit: 500000,
      });
    });

    it("Should create dispute after moderation escalation is complete.", async () => {
      await evidenceModule.connect(user2).moderate(evidenceID, Party.Moderator, {
        value: minRequiredDeposit.mul(2),
      });

      let moderationInfo = await evidenceModule.getModerationInfo(evidenceID, 0);
      let paidFees = moderationInfo.paidFees;
      let depositRequired = paidFees[Party.Moderator].mul(2).sub(paidFees[Party.Submitter]);
      await evidenceModule.connect(user4).moderate(evidenceID, Party.Submitter, {
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
      await evidenceModule.connect(user4).moderate(evidenceID, Party.Submitter, {
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
      let tx = await evidenceModule.connect(user4).moderate(evidenceID, Party.Submitter, {
        value: depositRequired, // Less is actually needed. Overpaid fees are reimbursed
      });
      let receipt = await tx.wait();

      let [_arbitrator, _arbitrableDisputeID, _externalDisputeID, _templateId, _templateUri] = getEmittedEvent(
        "DisputeRequest",
        receipt
      ).args;
      expect(_arbitrator).to.equal(arbitrator.address, "Wrong arbitrator.");
      expect(_arbitrableDisputeID).to.equal(0, "Wrong dispute ID.");
      expect(_templateId).to.equal(0, "Wrong template ID.");
      expect(_externalDisputeID).to.equal(evidenceID, "Wrong external dispute ID.");

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

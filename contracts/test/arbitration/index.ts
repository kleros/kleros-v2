import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { KlerosCore, DisputeKitClassic, DisputeKitShutter } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DisputeKitClassic", async () => {
  // eslint-disable-next-line no-unused-vars
  let deployer: HardhatEthersSigner;
  let core: KlerosCore, disputeKit: DisputeKitClassic, disputeKitShutter: DisputeKitShutter;

  before("Deploying", async () => {
    [deployer] = await ethers.getSigners();
    [core, disputeKit, disputeKitShutter] = await deployContracts();
  });

  it("Kleros Core initialization", async () => {
    const events = await core.queryFilter(core.filters.DisputeKitCreated());
    expect(events.length).to.equal(2);
    expect(events[0].args._disputeKitID).to.equal(1);
    expect(events[0].args._disputeKitAddress).to.equal(disputeKit.target);
    expect(events[1].args._disputeKitID).to.equal(2);
    expect(events[1].args._disputeKitAddress).to.equal(disputeKitShutter.target);

    // Reminder: the Forking court will be added which will break these expectations.
    const events2 = await core.queryFilter(core.filters.CourtCreated());
    expect(events2.length).to.equal(1);
    expect(events2[0].args._courtID).to.equal(1);
    expect(events2[0].args._parent).to.equal(0);
    expect(events2[0].args._hiddenVotes).to.equal(false);
    expect(events2[0].args._minStake).to.equal(ethers.parseUnits("200", 18));
    expect(events2[0].args._alpha).to.equal(10000);
    expect(events2[0].args._feeForJuror).to.equal(ethers.parseUnits("0.1", 18));
    expect(events2[0].args._jurorsForCourtJump).to.equal(256);
    expect(events2[0].args._timesPerPeriod).to.deep.equal([0, 0, 0, 10]);
    expect(events2[0].args._supportedDisputeKits).to.deep.equal([1]);

    const events3 = await core.queryFilter(core.filters.DisputeKitEnabled());
    expect(events3.length).to.equal(2);

    const classicDisputeKit = events3[0].args;
    expect(classicDisputeKit._courtID).to.equal(1);
    expect(classicDisputeKit._disputeKitID).to.equal(1);
    expect(classicDisputeKit._enable).to.equal(true);

    const shutterDisputeKit = events3[1].args;
    expect(shutterDisputeKit._courtID).to.equal(1);
    expect(shutterDisputeKit._disputeKitID).to.equal(2);
    expect(shutterDisputeKit._enable).to.equal(true);
  });

  it("Should create a dispute", async () => {
    await expect(disputeKit.connect(deployer).createDispute(0, 0, ethers.toBeHex(3), "0x00")).to.be.revertedWith(
      "Access not allowed: KlerosCore only."
    );

    const tx = await core
      .connect(deployer)
      ["createDispute(uint256,bytes)"](2, "0x00", { value: ethers.parseEther("0.3") });
    expect(tx).to.emit(core, "DisputeCreation").withArgs(0, deployer.address);
    expect(tx).to.emit(disputeKit, "DisputeCreation").withArgs(0, 2, "0x00");

    await disputeKit.disputes(0).then((disputes) => {
      expect(disputes[0]).to.equal(2);
    });

    console.log(`choice 0: ${await disputeKit.getRoundInfo(0, 0, 0)}`);
    console.log(`choice 1: ${await disputeKit.getRoundInfo(0, 0, 1)}`);
    console.log(`choice 2: ${await disputeKit.getRoundInfo(0, 0, 2)}`);
  });
});

async function deployContracts(): Promise<[KlerosCore, DisputeKitClassic, DisputeKitShutter]> {
  await deployments.fixture(["Arbitration", "VeaMock"], {
    fallbackToGlobal: true,
    keepExistingDeployments: false,
  });
  const disputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
  const disputeKitShutter = (await ethers.getContract("DisputeKitShutter")) as DisputeKitShutter;
  const core = (await ethers.getContract("KlerosCore")) as KlerosCore;
  return [core, disputeKit, disputeKitShutter];
}

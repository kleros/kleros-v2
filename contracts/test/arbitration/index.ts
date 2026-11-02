import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { KlerosCore, DisputeKitClassic, DisputeKitShutter, DisputeKitClassicUniversity } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { zeroAddress } from "viem";

describe("DisputeKitClassic", async () => {
  let deployer: HardhatEthersSigner;
  let core: KlerosCore,
    disputeKit: DisputeKitClassic,
    disputeKitShutter: DisputeKitShutter,
    disputeKitClassicUniversity: DisputeKitClassicUniversity;

  before("Deploying", async () => {
    [deployer] = await ethers.getSigners();
    [core, disputeKit, disputeKitShutter, disputeKitClassicUniversity] = await deployContracts();
  });

  it("Kleros Core initialization", async () => {
    const events = await core.queryFilter(core.filters.DisputeKitCreated());
    expect(events.length).to.equal(4);
    expect(events[0].args._disputeKitID).to.equal(0);
    expect(events[0].args._disputeKitAddress).to.equal(zeroAddress);
    expect(events[1].args._disputeKitID).to.equal(1);
    expect(events[1].args._disputeKitAddress).to.equal(disputeKit.target);
    expect(events[2].args._disputeKitID).to.equal(2);
    expect(events[2].args._disputeKitAddress).to.equal(disputeKitShutter.target);
    expect(events[3].args._disputeKitID).to.equal(3);
    expect(events[3].args._disputeKitAddress).to.equal(disputeKitClassicUniversity.target);

    // Reminder: the Forking court will be added which will break these expectations.
    const events2 = await core.queryFilter(core.filters.CourtCreated());
    expect(events2.length).to.equal(2);
    expect(events2[0].args._courtID).to.equal(0);
    expect(events2[0].args._parent).to.equal(0);
    expect(events2[0].args._hiddenVotes).to.equal(false);
    expect(events2[0].args._minStake).to.equal(ethers.MaxUint256);
    expect(events2[0].args._alpha).to.equal(0);
    expect(events2[0].args._feeForJuror).to.equal(0);
    expect(events2[0].args._jurorsForCourtJump).to.equal(0);
    expect(events2[0].args._timesPerPeriod).to.deep.equal([0n, 0n, 0n, 0n]);
    expect(events2[0].args._supportedDisputeKits).to.deep.equal([0n]);

    expect(events2[1].args._courtID).to.equal(1);
    expect(events2[1].args._parent).to.equal(0);
    expect(events2[1].args._hiddenVotes).to.equal(false);
    expect(events2[1].args._minStake).to.equal(ethers.parseUnits("200", 18));
    expect(events2[1].args._alpha).to.equal(10000);
    expect(events2[1].args._feeForJuror).to.equal(ethers.parseUnits("0.1", 18));
    expect(events2[1].args._jurorsForCourtJump).to.equal(256);
    expect(events2[1].args._timesPerPeriod).to.deep.equal([0n, 0n, 0n, 0n]);
    expect(events2[1].args._supportedDisputeKits).to.deep.equal([1n]);

    const events3 = await core.queryFilter(core.filters.DisputeKitEnabled());
    expect(events3.length).to.equal(4);

    const centralizedKit = events3[0].args;
    expect(centralizedKit._courtID).to.equal(0);
    expect(centralizedKit._disputeKitID).to.equal(0);
    expect(centralizedKit._enable).to.equal(true);

    const classicDisputeKit = events3[1].args;
    expect(classicDisputeKit._courtID).to.equal(1);
    expect(classicDisputeKit._disputeKitID).to.equal(1);
    expect(classicDisputeKit._enable).to.equal(true);

    const shutterDisputeKit = events3[2].args;
    expect(shutterDisputeKit._courtID).to.equal(1);
    expect(shutterDisputeKit._disputeKitID).to.equal(2);
    expect(shutterDisputeKit._enable).to.equal(true);

    const classicUniversityDisputeKit = events3[3].args;
    expect(classicUniversityDisputeKit._courtID).to.equal(1);
    expect(classicUniversityDisputeKit._disputeKitID).to.equal(3);
    expect(classicUniversityDisputeKit._enable).to.equal(true);
  });

  it("Should create a dispute", async () => {
    await expect(disputeKit.connect(deployer).createDispute(0, 0, 0)).to.be.revertedWithCustomError(
      disputeKit,
      "KlerosCoreOnly"
    );

    const tx = await core.connect(deployer).createDispute(2, "0x00", { value: ethers.parseEther("0.3") });
    await expect(tx).to.emit(core, "DisputeCreation").withArgs(0, deployer.address);
    await expect(tx).to.emit(disputeKit, "DisputeCreation").withArgs(0, 2);

    await disputeKit.disputes(0).then((disputes) => {
      expect(disputes).to.equal(2n);
    });

    console.log(`choice 0: ${await disputeKit.getRoundInfo(0, 0, 0)}`);
    console.log(`choice 1: ${await disputeKit.getRoundInfo(0, 0, 1)}`);
    console.log(`choice 2: ${await disputeKit.getRoundInfo(0, 0, 2)}`);
  });
});

async function deployContracts(): Promise<
  [KlerosCore, DisputeKitClassic, DisputeKitShutter, DisputeKitClassicUniversity]
> {
  await deployments.fixture(["Arbitration", "VeaMock"], {
    fallbackToGlobal: true,
    keepExistingDeployments: false,
  });
  const disputeKit = await ethers.getContract<DisputeKitClassic>("DisputeKitClassic");
  const disputeKitShutter = await ethers.getContract<DisputeKitShutter>("DisputeKitShutter");
  const disputeKitClassicUniversity =
    await ethers.getContract<DisputeKitClassicUniversity>("DisputeKitClassicUniversity");
  const core = await ethers.getContract<KlerosCore>("KlerosCore");
  return [core, disputeKit, disputeKitShutter, disputeKitClassicUniversity];
}

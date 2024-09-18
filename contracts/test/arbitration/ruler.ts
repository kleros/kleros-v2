import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { BigNumber } from "ethers";
import { DisputeResolver, KlerosCoreRuler } from "../../typechain-types";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("KlerosCoreRuler", async () => {
  // eslint-disable-next-line no-unused-vars
  let deployer, dev, dev2;
  let core: KlerosCoreRuler;
  let resolver: DisputeResolver;

  enum RulingMode {
    uninitialized,
    manual, // executeRuling() is called manually.
    automaticRandom, // The ruling is given randomly automatically.
    automaticPreset, // The ruling is given automatically with a preset value.
  }

  const extraData =
    "0x" +
    "0000000000000000000000000000000000000000000000000000000000000001" + // courtId 1
    "0000000000000000000000000000000000000000000000000000000000000003"; // minJurors 3

  before("Deploying", async () => {
    [deployer, dev, dev2] = await ethers.getSigners();
    [core, resolver] = await deployContracts(deployer);
  });

  it("Should have initialized the Arbitrator", async () => {
    // Reminder: the Forking court will be added which will break these expectations.
    let events = await core.queryFilter(core.filters.CourtCreated());
    expect(events.length).to.equal(1);
    expect(events[0].args._courtID).to.equal(1);
    expect(events[0].args._parent).to.equal(0);
    expect(events[0].args._alpha).to.equal(10000);
    expect(events[0].args._feeForJuror).to.equal(BigNumber.from(10).pow(17));
    expect(events[0].args._jurorsForCourtJump).to.equal(16);
  });

  it("Should fail to create a dispute without setting the RulingMode first", async () => {
    await expect(
      resolver.createDisputeForTemplate(extraData, "", "", 3, { value: ethers.utils.parseEther("0.3") })
    ).to.be.revertedWithCustomError(core, "RulingModeNotSet");
  });

  it("Should allow anyone to set the RulingMode for an uninitialized arbitrable", async () => {
    expect(await core.rulers(resolver.address)).to.equal(ethers.constants.AddressZero);

    await expect(core.connect(dev).changeRulingModeToAutomaticRandom(resolver.address))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.address, [RulingMode.automaticRandom, 0, false, false]);

    expect(await core.rulers(resolver.address)).to.equal(dev.address);
  });

  it("Should only allow the arbitrable's ruler to set the RulingMode", async () => {
    expect(await core.rulers(resolver.address)).to.equal(dev.address);

    await expect(core.connect(dev2).changeRulingModeToManual(resolver.address)).revertedWithCustomError(
      core,
      "RulerOnly"
    );

    await expect(core.connect(deployer).changeRulingModeToManual(resolver.address)).revertedWithCustomError(
      core,
      "RulerOnly"
    );

    expect(await core.rulers(resolver.address)).to.equal(dev.address);
  });

  it("Should create a dispute and automatically execute a random ruling", async () => {
    await expect(core.connect(dev).changeRulingModeToAutomaticRandom(resolver.address))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.address, [RulingMode.automaticRandom, 0, false, false]);

    const disputeID = 0;

    await expect(resolver.createDisputeForTemplate(extraData, "", "", 3, { value: ethers.utils.parseEther("0.3") }))
      .to.emit(core, "DisputeCreation")
      .withArgs(disputeID, resolver.address)
      .and.to.emit(core, "AutoRuled")
      .withArgs(resolver.address, RulingMode.automaticRandom, disputeID, anyValue, anyValue, anyValue)
      .and.to.emit(core, "Ruling")
      .withArgs(resolver.address, disputeID, anyValue)
      .and.to.emit(core, "TokenAndETHShift")
      .withArgs(dev.address, disputeID, 0, 1, 0, anyValue, ethers.constants.AddressZero)
      .and.to.emit(resolver, "DisputeRequest")
      .withArgs(core.address, disputeID, disputeID, disputeID, "")
      .and.to.emit(resolver, "Ruling")
      .withArgs(core.address, disputeID, anyValue);
  });

  it("Should create a dispute and automatically execute a preset ruling", async () => {
    await expect(core.connect(dev).changeRulingModeToAutomaticPreset(resolver.address, 2, true, false))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.address, [RulingMode.automaticPreset, 2, true, false]);

    const disputeID = 1;

    await expect(resolver.createDisputeForTemplate(extraData, "", "", 3, { value: ethers.utils.parseEther("0.3") }))
      .to.emit(core, "DisputeCreation")
      .withArgs(disputeID, resolver.address)
      .and.to.emit(core, "AutoRuled")
      .withArgs(resolver.address, RulingMode.automaticPreset, disputeID, 2, true, false)
      .and.to.emit(core, "Ruling")
      .withArgs(resolver.address, disputeID, 2)
      .and.to.emit(core, "TokenAndETHShift")
      .withArgs(dev.address, disputeID, 0, 1, 0, anyValue, ethers.constants.AddressZero)
      .and.to.emit(resolver, "DisputeRequest")
      .withArgs(core.address, disputeID, disputeID, disputeID, "")
      .and.to.emit(resolver, "Ruling")
      .withArgs(core.address, disputeID, 2);
  });

  it("Should create a dispute and manually execute a ruling", async () => {
    await expect(core.connect(dev).changeRulingModeToManual(resolver.address))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.address, [RulingMode.manual, 0, false, false]);

    const disputeID = 2;

    await expect(resolver.createDisputeForTemplate(extraData, "", "", 3, { value: ethers.utils.parseEther("0.3") }))
      .to.emit(core, "DisputeCreation")
      .withArgs(disputeID, resolver.address)
      .and.to.emit(resolver, "DisputeRequest")
      .withArgs(core.address, disputeID, disputeID, disputeID, "");

    await expect(core.connect(deployer).executeRuling(disputeID, 3, true, true)).revertedWithCustomError(
      core,
      "RulerOnly"
    );

    await expect(core.connect(dev).executeRuling(disputeID, 3, true, true))
      .and.to.emit(core, "Ruling")
      .withArgs(resolver.address, disputeID, 3)
      .and.to.emit(resolver, "Ruling")
      .withArgs(core.address, disputeID, 3);

    await expect(core.execute(disputeID, 0))
      .and.to.emit(core, "TokenAndETHShift")
      .withArgs(dev.address, disputeID, 0, 1, 0, anyValue, ethers.constants.AddressZero);
  });
});

async function deployContracts(deployer): Promise<[KlerosCoreRuler, DisputeResolver]> {
  await deployments.fixture(["ArbitrationRuler"], {
    fallbackToGlobal: true,
    keepExistingDeployments: false,
  });
  const resolver = (await ethers.getContract("DisputeResolverRuler")) as DisputeResolver;
  const core = (await ethers.getContract("KlerosCoreRuler")) as KlerosCoreRuler;
  return [core, resolver];
}

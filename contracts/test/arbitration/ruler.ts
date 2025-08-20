import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { ZeroAddress, parseEther } from "ethers";
import { DisputeResolver, KlerosCoreRuler } from "../../typechain-types";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("KlerosCoreRuler", async () => {
  // eslint-disable-next-line no-unused-vars
  let deployer: HardhatEthersSigner, dev: HardhatEthersSigner, dev2: HardhatEthersSigner;
  let core: KlerosCoreRuler;
  let resolver: DisputeResolver;

  enum RulingMode {
    uninitialized,
    manual, // executeRuling() is called manually.
    automaticRandom, // The ruling is given randomly automatically.
    automaticPreset, // The ruling is given automatically with a preset value.
  }

  const courtId = 1;
  const minJurors = 3;
  const disputeKitId = 1;
  const extraData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint96", "uint96", "uint256"],
    [courtId, minJurors, disputeKitId]
  );

  before("Deploying", async () => {
    [deployer, dev, dev2] = await ethers.getSigners();
    [core, resolver] = await deployContracts();

    // Create dummy disputes to distinguish between arbitrable-level and arbitrator-level disputeIDs
    await core.changeRulingModeToManual(deployer.address);
    await core["createDispute(uint256,bytes)"](2, extraData, { value: parseEther("0.3") });
  });

  it("Should have initialized the Arbitrator", async () => {
    // Reminder: the Forking court will be added which will break these expectations.
    let events = await core.queryFilter(core.filters.CourtCreated());
    expect(events.length).to.equal(1);
    expect(events[0].args._courtID).to.equal(1);
    expect(events[0].args._parent).to.equal(0);
    expect(events[0].args._alpha).to.equal(10000);
    expect(events[0].args._feeForJuror).to.equal(10n ** 17n);
    expect(events[0].args._jurorsForCourtJump).to.equal(16);
  });

  it("Should fail to create a dispute without setting the RulingMode first", async () => {
    await expect(
      resolver.createDisputeForTemplate(extraData, "", "", 3, { value: parseEther("0.3") })
    ).to.be.revertedWithCustomError(core, "RulingModeNotSet");
  });

  it("Should allow anyone to set the RulingMode for an uninitialized arbitrable", async () => {
    expect(await core.rulers(resolver.target)).to.equal(ZeroAddress);

    await expect(core.connect(dev).changeRulingModeToAutomaticRandom(resolver.target))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.target, [RulingMode.automaticRandom, 0, false, false]);

    expect(await core.rulers(resolver.target)).to.equal(dev.address);
  });

  it("Should only allow the arbitrable's ruler to set the RulingMode", async () => {
    expect(await core.rulers(resolver.target)).to.equal(dev.address);

    await expect(core.connect(dev2).changeRulingModeToManual(resolver.target)).revertedWithCustomError(
      core,
      "RulerOnly"
    );

    await expect(core.connect(deployer).changeRulingModeToManual(resolver.target)).revertedWithCustomError(
      core,
      "RulerOnly"
    );

    expect(await core.rulers(resolver.target)).to.equal(dev.address);
  });

  it("Should create a dispute and automatically execute a random ruling", async () => {
    await expect(core.connect(dev).changeRulingModeToAutomaticRandom(resolver.target))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.target, [RulingMode.automaticRandom, 0, false, false]);

    const disputeID = 1;
    const localDisputeID = disputeID - 1;
    const templateId = disputeID - 1;

    await expect(resolver.createDisputeForTemplate(extraData, "", "", 3, { value: parseEther("0.3") }))
      .to.emit(core, "DisputeCreation")
      .withArgs(disputeID, resolver.target)
      .and.to.emit(core, "AutoRuled")
      .withArgs(resolver.target, RulingMode.automaticRandom, disputeID, anyValue, anyValue, anyValue)
      .and.to.emit(core, "Ruling")
      .withArgs(resolver.target, disputeID, anyValue)
      .and.to.emit(core, "TokenAndETHShift")
      .withArgs(dev.address, disputeID, 0, 1, 0, anyValue, ZeroAddress)
      .and.to.emit(resolver, "DisputeRequest")
      .withArgs(core.target, disputeID, localDisputeID, templateId, "")
      .and.to.emit(resolver, "Ruling")
      .withArgs(core.target, disputeID, anyValue);
  });

  it("Should create a dispute and automatically execute a preset ruling", async () => {
    await expect(core.connect(dev).changeRulingModeToAutomaticPreset(resolver.target, 2, true, false))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.target, [RulingMode.automaticPreset, 2, true, false]);

    const disputeID = 2;
    const localDisputeID = disputeID - 1;
    const templateId = disputeID - 1;

    await expect(resolver.createDisputeForTemplate(extraData, "", "", 3, { value: parseEther("0.3") }))
      .to.emit(core, "DisputeCreation")
      .withArgs(disputeID, resolver.target)
      .and.to.emit(core, "AutoRuled")
      .withArgs(resolver.target, RulingMode.automaticPreset, disputeID, 2, true, false)
      .and.to.emit(core, "Ruling")
      .withArgs(resolver.target, disputeID, 2)
      .and.to.emit(core, "TokenAndETHShift")
      .withArgs(dev.address, disputeID, 0, 1, 0, anyValue, ZeroAddress)
      .and.to.emit(resolver, "DisputeRequest")
      .withArgs(core.target, disputeID, localDisputeID, templateId, "")
      .and.to.emit(resolver, "Ruling")
      .withArgs(core.target, disputeID, 2);
  });

  it("Should create a dispute and manually execute a ruling", async () => {
    await expect(core.connect(dev).changeRulingModeToManual(resolver.target))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.target, [RulingMode.manual, 0, false, false]);

    const disputeID = 3;
    const localDisputeID = disputeID - 1;
    const templateId = disputeID - 1;

    await expect(resolver.createDisputeForTemplate(extraData, "", "", 3, { value: parseEther("0.3") }))
      .to.emit(core, "DisputeCreation")
      .withArgs(disputeID, resolver.target)
      .and.to.emit(resolver, "DisputeRequest")
      .withArgs(core.target, disputeID, localDisputeID, templateId, "");

    await expect(core.connect(deployer).executeRuling(disputeID, 3, true, true)).revertedWithCustomError(
      core,
      "RulerOnly"
    );

    await expect(core.connect(dev).executeRuling(disputeID, 3, true, true))
      .and.to.emit(core, "Ruling")
      .withArgs(resolver.target, disputeID, 3)
      .and.to.emit(resolver, "Ruling")
      .withArgs(core.target, disputeID, 3);

    await expect(core.execute(disputeID, 0))
      .and.to.emit(core, "TokenAndETHShift")
      .withArgs(dev.address, disputeID, 0, 1, 0, anyValue, ZeroAddress);
  });
});

async function deployContracts(): Promise<[KlerosCoreRuler, DisputeResolver]> {
  await deployments.fixture(["ArbitrationRuler"], {
    fallbackToGlobal: true,
    keepExistingDeployments: false,
  });
  const resolver = await ethers.getContract<DisputeResolver>("DisputeResolverRuler");
  const core = await ethers.getContract<KlerosCoreRuler>("KlerosCoreRuler");
  return [core, resolver];
}

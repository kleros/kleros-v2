import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { BigNumber } from "ethers";
import { DisputeResolver, KlerosCoreRuler } from "../../typechain-types";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("KlerosCoreRuler", async () => {
  // eslint-disable-next-line no-unused-vars
  let deployer;
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
    [deployer] = await ethers.getSigners();
    [core, resolver] = await deployContracts(deployer);
  });

  it("Kleros Core initialization", async () => {
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

  it("Should create a dispute and automatically execute a random ruling", async () => {
    await expect(
      resolver.createDisputeForTemplate(extraData, "", "", 3, { value: ethers.utils.parseEther("0.3") })
    ).to.be.revertedWithCustomError(core, "RulingModeNotSet");

    await expect(core.changeRulingModeToAutomaticRandom(resolver.address))
      .to.emit(core, "RulerSettingsChanged")
      .withArgs(resolver.address, [RulingMode.automaticRandom, 0, false, false]);

    await expect(resolver.createDisputeForTemplate(extraData, "", "", 3, { value: ethers.utils.parseEther("0.3") }))
      .to.emit(core, "DisputeCreation")
      .withArgs(0, resolver.address)
      .and.to.emit(core, "AutoRuled")
      .withArgs(resolver.address, RulingMode.automaticRandom, 0, anyValue, anyValue, anyValue)
      .and.to.emit(core, "Ruling")
      .withArgs(resolver.address, 0, anyValue)
      .and.to.emit(core, "TokenAndETHShift")
      .withArgs(deployer.address, 0, 0, 1, 0, anyValue, ethers.constants.AddressZero)
      .and.to.emit(resolver, "DisputeRequest")
      .withArgs(core.address, 0, 1, "", "")
      .and.to.emit(resolver, "Ruling")
      .withArgs(core.address, 0, anyValue);
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

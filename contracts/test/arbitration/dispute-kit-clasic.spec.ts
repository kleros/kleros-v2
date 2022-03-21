import { expect } from "chai";
import { ethers } from "hardhat";
import { type BigNumberish } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  // ArbitrableExample,
  // ArbitrableExample__factory,
  ConstantNG,
  ConstantNG__factory,
  DisputeKitClassic,
  DisputeKitClassic__factory,
  KlerosCore,
  KlerosCore__factory,
} from "../../typechain-types";
import { expectGoverned, getSortitionSumTreeLibrary } from "../shared";

const PNK_ADDRESS = AddressZero;
const JUROR_PROSECUTION_MODULE_ADDRESS = AddressZero;
const HIDDEN_VOTES = false;
const MIN_STAKE = 200;
const ALPHA = 10000;
const FEE_FOR_JUROR = 100;
const JURORS_FOR_COURT_JUMP = 3;
const TIMES_PER_PERIOD = [0, 0, 0, 0] as [BigNumberish, BigNumberish, BigNumberish, BigNumberish];
const SORTITION_SUM_TREE_K = 3;

describe("DisputeKitClassic", function () {
  let [deployer, maliciousActor, innocentBystander]: SignerWithAddress[] = [];

  let rng: ConstantNG;
  let core: KlerosCore;
  let disputeKit: DisputeKitClassic;
  // let arbitrable: ArbitrableExample;

  before("Initialize wallets", async () => {
    [deployer, maliciousActor, innocentBystander] = await ethers.getSigners();
  });

  beforeEach("Deploy contracts", async () => {
    rng = await new ConstantNG__factory(deployer).deploy(42);

    disputeKit = await new DisputeKitClassic__factory(deployer).deploy(
      deployer.address,
      AddressZero, // KlerosCore is set later once it is deployed
      rng.address
    );

    const sortitionSumTreeLibrary = await getSortitionSumTreeLibrary(deployer);
    core = await new KlerosCore__factory(sortitionSumTreeLibrary, deployer).deploy(
      deployer.address,
      PNK_ADDRESS,
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

    // arbitrable = await new ArbitrableExample__factory(deployer).deploy(core.address, "uri://metaevidence.json");
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
});

import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { PNK, ConstantNG, KlerosCore } from "../../typechain";

describe("Demo pre-alpha1", function () {
  // eslint-disable-next-line no-unused-vars
  let deployer, claimant, supporter, challenger, innocentBystander;
  let pnk, core, disputeKit, arbitrable, ng;

  before("Setup", async () => {
    deployer = (await getNamedAccounts()).deployer;

    await deployments.fixture(["Arbitration"], { fallbackToGlobal: true, keepExistingDeployments: true });
    pnk = <PNK>await ethers.getContract("PNK");
    core = <KlerosCore>await ethers.getContract("KlerosCore");
    ng = <ConstantNG>await ethers.getContract("ConstantNG");

    [pnk, core, ng].forEach((contract: Contract) => {
      contract.connect(deployer);
    });
  });

  it("setStake on the top court", async function () {
    console.log("deployer:%s", deployer);
    console.log("address:%s", ng.address);
    console.log("rn=%d", await ng.getRN(2));

    const ONE_HUNDRED_PNK = BigNumber.from(10).pow(20);

    await pnk.approve(core.address, ONE_HUNDRED_PNK.mul(10));

    await core.setStake(0, ONE_HUNDRED_PNK);
    await core.getJurorBalance(deployer, 0).then((result) => {
      expect(result.staked).to.equal(ONE_HUNDRED_PNK);
      expect(result.locked).to.equal(0);
    });

    await core.setStake(0, ONE_HUNDRED_PNK.div(2));
    await core.getJurorBalance(deployer, 0).then((result) => {
      expect(result.staked).to.equal(ONE_HUNDRED_PNK.div(2));
      expect(result.locked).to.equal(0);
    });

    await core.setStake(0, ONE_HUNDRED_PNK.mul(5));
    await core.getJurorBalance(deployer, 0).then((result) => {
      expect(result.staked).to.equal(ONE_HUNDRED_PNK.mul(5));
      expect(result.locked).to.equal(0);
    });

    await core.setStake(0, 0);
    await core.getJurorBalance(deployer, 0).then((result) => {
      expect(result.staked).to.equal(0);
      expect(result.locked).to.equal(0);
    });
  });

  it("something else", async function () {
    console.log("staked=%s", (await core.getJurorBalance(deployer, 0)).staked);

    const ONE_HUNDRED_PNK = BigNumber.from(10).pow(20);
    await pnk.approve(core.address, ONE_HUNDRED_PNK.mul(10));
    await core.setStake(0, ONE_HUNDRED_PNK);
    await core.getJurorBalance(deployer, 0);

    // let disputeId = await core.callStatic.createDispute(2, "0x00", { value: 1000 });
    // console.log("disputeId=%d", disputeId);

    let tx = await core.createDispute(2, "0x00", { value: 1000 });
    const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
    const [disputeId] = ethers.utils.defaultAbiCoder.decode(["uint"], `0x${trace.returnValue}`);
    console.log(`disputeId: ${disputeId}`);
  });
});

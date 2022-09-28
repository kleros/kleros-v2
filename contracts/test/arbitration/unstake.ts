import { ethers, getNamedAccounts, network, deployments } from "hardhat";
import { BigNumber } from "ethers";
import { PNK, KlerosCore, DisputeKitClassic, SortitionModule } from "../../typechain-types";
import { expect } from "chai";

/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

describe("Unstake juror", async () => {
  const ONE_TENTH_ETH = BigNumber.from(10).pow(17);
  const ONE_THOUSAND_PNK = BigNumber.from(10).pow(21);

  // 2nd court, 3 jurors, 1 dispute kit
  const extraData =
    "0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001";

  let deployer;
  let disputeKit;
  let pnk;
  let core;
  let sortitionModule;

  beforeEach("Setup", async () => {
    ({ deployer } = await getNamedAccounts());

    console.log("deployer:%s", deployer);
    console.log("named accounts: %O", await getNamedAccounts());

    await deployments.fixture(["Arbitration"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    disputeKit = (await ethers.getContract("DisputeKitClassic")) as DisputeKitClassic;
    pnk = (await ethers.getContract("PNK")) as PNK;
    core = (await ethers.getContract("KlerosCore")) as KlerosCore;
    sortitionModule = (await ethers.getContract("SortitionModule")) as SortitionModule;
  });

  it("Unstake inactive juror", async () => {
    const arbitrationCost = ONE_TENTH_ETH.mul(3);

    await core.createSubcourt(1, false, ONE_THOUSAND_PNK, 1000, ONE_TENTH_ETH, 3, [0, 0, 0, 0], 3, [1]); // Parent - general court, Classic dispute kit

    await pnk.approve(core.address, ONE_THOUSAND_PNK.mul(4));
    await core.setStake(1, ONE_THOUSAND_PNK.mul(2));
    await core.setStake(2, ONE_THOUSAND_PNK.mul(2));

    expect(await core.getJurorSubcourtIDs(deployer)).to.be.deep.equal([BigNumber.from("1"), BigNumber.from("2")]);

    await core.createDispute(2, extraData, { value: arbitrationCost });

    await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
    await network.provider.send("evm_mine");
    await sortitionModule.passPhase(); // Staking -> Freezing
    for (let index = 0; index < 20; index++) {
      await network.provider.send("evm_mine"); // Wait for 20 blocks finality
    }
    await disputeKit.passPhase(); // Resolving -> Generating
    for (let index = 0; index < 20; index++) {
      await network.provider.send("evm_mine"); // RNG lookahead
    }
    await disputeKit.passPhase(); // Generating -> Drawing

    await core.draw(0, 5000);

    await disputeKit.passPhase(); // Drawing -> Resolving

    await core.passPeriod(0); // Evidence -> Voting
    await core.passPeriod(0); // Voting -> Appeal
    await core.passPeriod(0); // Appeal -> Execution

    await sortitionModule.passPhase(); // Freezing -> Staking. Change so we don't deal with delayed stakes

    expect(await core.getJurorSubcourtIDs(deployer)).to.be.deep.equal([BigNumber.from("1"), BigNumber.from("2")]);

    await core.execute(0, 0, 1); // 1 iteration should unstake from both courts

    expect(await core.getJurorSubcourtIDs(deployer)).to.be.deep.equal([]);
  });
});

import { ethers, getNamedAccounts, network, deployments } from "hardhat";
import { PNK, KlerosCore, SortitionModule, ChainlinkRNG, ChainlinkVRFCoordinatorV2Mock } from "../../typechain-types";
import { expect } from "chai";
import { NULL_ELIGIBILITY_REQUIREMENT } from "../../deploy/utils";

describe("Staking", async () => {
  const ETH = (amount: number) => ethers.parseUnits(amount.toString());
  const PNK = ETH;

  const extraData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "uint256"],
    [2, 3, 1] // courtId 2, minJurors 3, disputeKitId 1
  );

  let deployer: string;
  let pnk: PNK;
  let core: KlerosCore;
  let sortition: SortitionModule;
  let rng: ChainlinkRNG;
  let vrfCoordinator: ChainlinkVRFCoordinatorV2Mock;

  const deploy = async () => {
    ({ deployer } = await getNamedAccounts());
    await deployments.fixture(["Arbitration"], {
      fallbackToGlobal: true,
      keepExistingDeployments: false,
    });
    pnk = await ethers.getContract<PNK>("PNK");
    core = await ethers.getContract<KlerosCore>("KlerosCore");
    await pnk.approve(core.target, PNK(5000));
    await core.depositTokens(PNK(5000));
    sortition = await ethers.getContract<SortitionModule>("SortitionModule");
    rng = await ethers.getContract<ChainlinkRNG>("ChainlinkRNG");
    vrfCoordinator = await ethers.getContract<ChainlinkVRFCoordinatorV2Mock>("ChainlinkVRFCoordinator");
  };

  describe("When outside the Staking phase", async () => {
    let balanceBefore: bigint;

    const reachDrawingPhase = async () => {
      expect(await sortition.phase()).to.be.equal(0); // Staking
      const arbitrationCost = ETH(0.1) * 3n;
      await core.createCourt(1, false, PNK(1000), 1000, ETH(0.1), 3, [0, 0, 0, 0], [1], NULL_ELIGIBILITY_REQUIREMENT); // Parent - general court, Classic dispute kit

      await core.setStake(1, PNK(2000));
      await core.setStake(2, PNK(2000));

      await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
      await network.provider.send("evm_mine");
      await sortition.executeDelayedStakes([deployer, deployer], [1, 2]);

      expect(await sortition.getJurorCourtIDs(deployer)).to.be.deep.equal([1n, 2n]);

      await core.createDispute(2, extraData, {
        value: arbitrationCost,
      });

      await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
      await network.provider.send("evm_mine");

      await sortition.passPhase(); // Staking -> Generating
      await network.provider.send("evm_mine");

      balanceBefore = await pnk.balanceOf(deployer);
    };

    const reachStakingPhaseAfterDrawing = async () => {
      await vrfCoordinator.fulfillRandomWords(1, rng.target, []);
      await sortition.passPhase(); // Generating -> Drawing
      await core.draw(0, 5000);
      await sortition.passPhase(); // Drawing -> Staking
      await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
      await network.provider.send("evm_mine");
    };

    describe("When stake is increased once", async () => {
      before("Setup", async () => {
        await deploy();
        await reachDrawingPhase();
      });

      it("Should be outside the Staking phase", async () => {
        expect(await sortition.phase()).to.be.equal(1); // Generating
        expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
        expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
        expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
      });

      describe("When stake is increased", () => {
        it("Should delay the stake increase", async () => {
          expect((await sortition.delayedStakes(deployer, 2)).pending).to.be.equal(false);
          await expect(core.setStake(2, PNK(3000)))
            .to.emit(sortition, "StakeDelayed")
            .withArgs(deployer, 2, PNK(3000));
          // stake does not change
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
        });

        it("Should not transfer PNK", async () => {
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore);
        });

        it("Should store the delayed stake for later", async () => {
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(PNK(3000));
          expect(delayedStake.pending).to.be.equal(true);
        });
      });

      describe("When the Phase passes back to Staking", () => {
        before("Setup", async () => {
          await reachStakingPhaseAfterDrawing();
          balanceBefore = await pnk.balanceOf(deployer);
        });

        it("Should execute the delayed stakes", async () => {
          await expect(sortition.executeDelayedStakes([deployer], [2]))
            .to.emit(sortition, "StakeSet")
            .withArgs(deployer, 2, PNK(3000), PNK(5000))
            .to.not.emit(sortition, "StakeDelayed");
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([
            PNK(5000),
            PNK(300), // we're the only juror so we are drawn 3 times
          ]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(3000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(0n);
          expect(delayedStake.pending).to.be.equal(false);
        });

        it("Should increase stake without changing deposited or wallet PNK balances", async () => {
          expect(await core.balances(deployer)).to.be.equal(PNK(5000));
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore);
        });
      });
    });

    describe("When stake is decreased once", async () => {
      before("Setup", async () => {
        await deploy();
        await reachDrawingPhase();
      });

      it("Should be outside the Staking phase", async () => {
        expect(await sortition.phase()).to.be.equal(1); // Generating
        expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
        expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
        expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
      });

      describe("When stake is decreased", async () => {
        it("Should delay the stake decrease", async () => {
          expect((await sortition.delayedStakes(deployer, 2)).pending).to.be.equal(false);
          await expect(core.setStake(2, PNK(1000)))
            .to.emit(sortition, "StakeDelayed")
            .withArgs(deployer, 2, PNK(1000));
          // stake unchanged, delayed
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
        });

        it("Should not transfer any PNK", async () => {
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore); // No PNK transfer
        });

        it("Should store the delayed stake for later", async () => {
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(PNK(1000));
          expect(delayedStake.pending).to.be.equal(true);
        });
      });

      describe("When the Phase passes back to Staking", () => {
        before("Setup", async () => {
          await reachStakingPhaseAfterDrawing();
          balanceBefore = await pnk.balanceOf(deployer);
        });

        it("Should execute the delayed stakes and reduce the stakes", async () => {
          await expect(sortition.executeDelayedStakes([deployer], [2]))
            .to.emit(sortition, "StakeSet")
            .withArgs(deployer, 2, PNK(1000), PNK(3000));
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([
            PNK(3000),
            PNK(300), // we're the only juror so we are drawn 3 times
          ]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(1000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(0n);
          expect(delayedStake.pending).to.be.equal(false);
        });

        it("Should release stake without changing deposited or wallet PNK balances", async () => {
          expect(await core.balances(deployer)).to.be.equal(PNK(5000));
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore);
        });
      });
    });

    describe("When stake is decreased then increased back", async () => {
      before("Setup", async () => {
        await deploy();
        await reachDrawingPhase();
      });

      it("Should be outside the Staking phase", async () => {
        expect(await sortition.phase()).to.be.equal(1); // Generating
        expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
        expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
        expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
      });

      describe("When stake is decreased", async () => {
        it("Should delay the stake decrease", async () => {
          expect((await sortition.delayedStakes(deployer, 2)).pending).to.be.equal(false);
          await expect(core.setStake(2, PNK(1000)))
            .to.emit(sortition, "StakeDelayed")
            .withArgs(deployer, 2, PNK(1000));
          // stake unchanged, delayed
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
        });

        it("Should not transfer any PNK", async () => {
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore); // No PNK transfer
        });

        it("Should store the delayed stake for later", async () => {
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(PNK(1000));
          expect(delayedStake.pending).to.be.equal(true);
        });
      });

      describe("When stake is increased back to the previous amount", () => {
        it("Should delay the stake increase", async () => {
          balanceBefore = await pnk.balanceOf(deployer);
          await expect(core.setStake(2, PNK(2000))).to.emit(sortition, "StakeDelayed");
          // stake unchanged, delayed
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
        });

        it("Should not transfer any PNK", async () => {
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore); // No PNK transfer
        });

        it("Should store the delayed stake for later", async () => {
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(PNK(2000));
          expect(delayedStake.pending).to.be.equal(true);
        });
      });

      describe("When the Phase passes back to Staking", () => {
        before("Setup", async () => {
          await reachStakingPhaseAfterDrawing();
          balanceBefore = await pnk.balanceOf(deployer);
        });

        it("Should execute the delayed stakes but the stakes should remain the same", async () => {
          await expect(sortition.executeDelayedStakes([deployer], [2]))
            .to.emit(sortition, "StakeSet")
            .withArgs(deployer, 2, PNK(2000), PNK(4000)); // 2nd delayed stake will override the first one
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([
            PNK(4000),
            PNK(300), // we're the only juror so we are drawn 3 times
          ]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(0n);
          expect(delayedStake.pending).to.be.equal(false);
        });

        it("Should not transfer any PNK", async () => {
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore); // No PNK transfer
        });
      });
    });

    describe("When stake is increased then decreased back", async () => {
      before("Setup", async () => {
        await deploy();
        await reachDrawingPhase();
      });

      it("Should be outside the Staking phase", async () => {
        expect(await sortition.phase()).to.be.equal(1); // Generating
        expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
        expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
        expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
      });

      describe("When stake is increased", () => {
        it("Should delay the stake increase", async () => {
          expect((await sortition.delayedStakes(deployer, 2)).pending).to.be.equal(false);
          await expect(core.setStake(2, PNK(3000)))
            .to.emit(sortition, "StakeDelayed")
            .withArgs(deployer, 2, PNK(3000));
          // stake does not change
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
        });

        it("Should not transfer PNK", async () => {
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore);
        });

        it("Should store the delayed stake for later", async () => {
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(PNK(3000));
          expect(delayedStake.pending).to.be.equal(true);
        });
      });

      describe("When stake is decreased back to the previous amount", () => {
        it("Should cancel out the pending stake increase", async () => {
          balanceBefore = await pnk.balanceOf(deployer);
          await expect(core.setStake(2, PNK(2000)))
            .to.emit(sortition, "StakeDelayed")
            .withArgs(deployer, 2, PNK(2000));
          // stake is unchanged
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([PNK(4000), 0n]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
        });

        it("Should leave the wallet PNK balance unchanged when replacing the pending stake", async () => {
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore); // PNK balance left unchanged
        });

        it("Should store the delayed stake for later", async () => {
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(PNK(2000));
          expect(delayedStake.pending).to.be.equal(true);
        });
      });

      describe("When the Phase passes back to Staking", () => {
        before("Setup", async () => {
          await reachStakingPhaseAfterDrawing();
          balanceBefore = await pnk.balanceOf(deployer);
        });

        it("Should execute the delayed stakes but the stakes should remain the same", async () => {
          await expect(sortition.executeDelayedStakes([deployer], [2]))
            .to.emit(sortition, "StakeSet")
            .withArgs(deployer, 2, PNK(2000), PNK(4000))
            .to.not.emit(sortition, "StakeDelayed");
          expect(await sortition.getJurorBalance(deployer)).to.be.deep.equal([
            PNK(4000),
            PNK(300), // we're the only juror so we are drawn 3 times
          ]);
          expect(await sortition.stakeOf(deployer, 2)).to.be.equal(PNK(2000));
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2);
          const delayedStake = await sortition.delayedStakes(deployer, 2);
          expect(delayedStake.stake).to.be.equal(0n);
          expect(delayedStake.pending).to.be.equal(false);
        });

        it("Should not transfer any PNK", async () => {
          expect(await pnk.balanceOf(deployer)).to.be.equal(balanceBefore); // No PNK transfer
        });
      });
    });
  });

  describe("When a juror is inactive", async () => {
    before("Setup", async () => {
      await deploy();
    });

    it("Should unstake from all courts", async () => {
      const arbitrationCost = ETH(0.1) * 3n;
      await core.createCourt(1, false, PNK(1000), 1000, ETH(0.1), 3, [0, 0, 0, 0], [1], NULL_ELIGIBILITY_REQUIREMENT); // Parent - general court, Classic dispute kit

      await core.setStake(1, PNK(2000));
      await core.setStake(2, PNK(2000));

      await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
      await network.provider.send("evm_mine");
      await sortition.executeDelayedStakes([deployer, deployer], [1, 2]);

      expect(await sortition.getJurorCourtIDs(deployer)).to.be.deep.equal([1, 2]);

      await core.createDispute(2, extraData, {
        value: arbitrationCost,
      });

      await network.provider.send("evm_increaseTime", [2000]); // Wait for minStakingTime
      await network.provider.send("evm_mine");

      await sortition.passPhase(); // Staking -> Generating
      await network.provider.send("evm_mine");

      await vrfCoordinator.fulfillRandomWords(1, rng.target, []);
      await sortition.passPhase(); // Generating -> Drawing

      await core.draw(0, 5000);

      await core.passPeriod(0); // Evidence -> Voting
      await core.passPeriod(0); // Voting -> Appeal
      await core.passPeriod(0); // Appeal -> Execution

      await sortition.passPhase(); // Drawing -> Staking. Forced unstaking is immediate during Staking.

      expect(await sortition.getJurorCourtIDs(deployer)).to.be.deep.equal([1, 2]);

      await core.execute(0, 0, 1); // 1 iteration should unstake from both courts

      expect(await sortition.getJurorCourtIDs(deployer)).to.be.deep.equal([]);
    });
  });
});

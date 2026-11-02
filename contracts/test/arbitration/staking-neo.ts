import { ethers, getNamedAccounts, network, deployments } from "hardhat";
import {
  PNK,
  SortitionModule,
  KlerosCore,
  DisputeResolver,
  ChainlinkRNG,
  ChainlinkVRFCoordinatorV2Mock,
} from "../../typechain-types";
import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ZeroAddress } from "ethers";

// Staking compatibility tests using the Neo deployment fixture.

describe("Staking", async () => {
  const ETH = (amount: number) => ethers.parseUnits(amount.toString());
  const PNK = ETH;

  const extraData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "uint256"],
    [2, 3, 1] // courtId 2, minJurors 3, disputeKitId 1
  );

  let deployer: string;
  let juror: HardhatEthersSigner;
  let pnk: PNK;
  let core: KlerosCore;
  let sortition: SortitionModule;
  let rng: ChainlinkRNG;
  let vrfCoordinator: ChainlinkVRFCoordinatorV2Mock;
  let resolver: DisputeResolver;
  let balanceBefore: bigint;

  const deployUnhappy = async () => {
    ({ deployer } = await getNamedAccounts());

    await deployments.fixture(["ArbitrationMainnet"], {
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
    resolver = await ethers.getContract<DisputeResolver>("DisputeResolver");

    // Juror signer setup and funding
    const { firstWallet } = await getNamedAccounts();
    juror = await ethers.getSigner(firstWallet);
    await pnk.transfer(juror.address, PNK(100_000));
    await ethers.getSigner(deployer).then((signer) => signer.sendTransaction({ to: juror.address, value: ETH(1) }));
    await pnk.connect(juror).approve(core.target, PNK(1001));
    await core.connect(juror).depositTokens(PNK(1001));
  };

  const deploy = async () => {
    await deployUnhappy();
  };

  const createDisputeAndReachGeneratingPhaseFromStaking = async () => {
    const arbitrationCost = ETH(0.5);
    await resolver.createDisputeForTemplate(extraData, "", "", 2, {
      value: arbitrationCost,
    });
    await reachGeneratingPhaseFromStaking();
  };

  const reachGeneratingPhaseFromStaking = async () => {
    await network.provider.send("evm_increaseTime", [3600]); // Wait for minStakingTime
    await network.provider.send("evm_mine");

    expect(await sortition.phase()).to.be.equal(0); // Staking
    await sortition.passPhase(); // Staking -> Generating
    expect(await sortition.phase()).to.be.equal(1); // Generating
  };

  const drawFromGeneratingPhase = async () => {
    expect(await sortition.phase()).to.be.equal(1); // Generating

    await network.provider.send("evm_mine");

    await vrfCoordinator.fulfillRandomWords(1, rng.target, []);
    await sortition.passPhase(); // Generating -> Drawing
    expect(await sortition.phase()).to.be.equal(2); // Drawing

    await core.draw(0, 10);
  };

  const drawAndReachStakingPhaseFromGenerating = async () => {
    await drawFromGeneratingPhase();

    await network.provider.send("evm_increaseTime", [3600]); // Ensures that maxDrawingTime has passed
    await network.provider.send("evm_mine");

    await sortition.passPhase(); // Drawing -> Staking
    expect(await sortition.phase()).to.be.equal(0); // Staking
  };

  /************************************************************************************************
    STAKE CHANGES AND UNSTAKING
  ************************************************************************************************/

  describe("When juror stakes less", async () => {
    beforeEach("Setup", async () => {
      await deployUnhappy();

      await core.connect(juror).setStake(1, PNK(1000));

      await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
      await network.provider.send("evm_mine");
      await sortition.executeDelayedStakes([juror.address], [1]);
    });

    describe("When stakes are requested during the Staking phase", () => {
      it("Should be able to unstake", async () => {
        await core.connect(juror).setStake(1, PNK(500));
        await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
        await network.provider.send("evm_mine");
        await expect(sortition.executeDelayedStakes([juror.address], [1]))
          .to.emit(sortition, "StakeSet")
          .withArgs(juror.address, 1, PNK(500), PNK(500));
        expect((await sortition.getJurorBalance(juror.address))[0]).to.be.equal(PNK(500));

        await core.connect(juror).setStake(1, PNK(1001));
        await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
        await network.provider.send("evm_mine");
        await expect(sortition.executeDelayedStakes([juror.address], [1]))
          .to.emit(sortition, "StakeSet")
          .withArgs(juror.address, 1, PNK(1001), PNK(1001));
        expect((await sortition.getJurorBalance(juror.address))[0]).to.be.equal(PNK(1001));

        await core.connect(juror).setStake(1, PNK(0));
        await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
        await network.provider.send("evm_mine");
        await expect(sortition.executeDelayedStakes([juror.address], [1]))
          .to.emit(sortition, "StakeSet")
          .withArgs(juror.address, 1, PNK(0), PNK(0));
        expect((await sortition.getJurorBalance(juror.address))[0]).to.be.equal(PNK(0));
      });
    });

    describe("When stakes are delayed", () => {
      beforeEach("Setup", async () => {
        await createDisputeAndReachGeneratingPhaseFromStaking();
      });

      it("Should be able to unstake", async () => {
        await expect(core.connect(juror).setStake(1, PNK(0)))
          .to.emit(sortition, "StakeDelayed")
          .withArgs(juror.address, 1, PNK(0))
          .to.not.emit(sortition, "StakeSet");
        expect((await sortition.getJurorBalance(juror.address))[0]).to.be.equal(PNK(1000));
        await drawAndReachStakingPhaseFromGenerating();
        await expect(sortition.executeDelayedStakes([juror.address], [1]))
          .to.emit(sortition, "StakeSet")
          .withArgs(juror.address, 1, PNK(0), PNK(0));
        expect(await sortition.getJurorBalance(juror.address)).to.be.deep.equal([0n, PNK(1000)]); // Dispute-locked PNK remains locked after unstaking.
      });
    });
  });

  /************************************************************************************************
    DELAYED STAKE CHANGES AND INACTIVE JURORS
  ************************************************************************************************/

  describe("When outside the Staking phase", async () => {
    const createSubcourtStakeAndCreateDispute = async () => {
      expect(await sortition.phase()).to.be.equal(0); // Staking
      // Parent - general court, Classic dispute kit
      await core.createCourt(1, false, PNK(1000), 1000, ETH(0.1), 3, [0, 0, 0, 0], [1], ZeroAddress);

      await core.setStake(1, PNK(2000));
      await core.setStake(2, PNK(2000));

      await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
      await network.provider.send("evm_mine");
      await sortition.executeDelayedStakes([deployer, deployer], [1, 2]);

      expect(await sortition.getJurorCourtIDs(deployer)).to.be.deep.equal([1n, 2n]);

      const arbitrationCost = ETH(0.1) * 3n;
      await resolver.createDisputeForTemplate(extraData, "", "", 2, {
        value: arbitrationCost,
      });
    };

    describe("When stake is increased once", async () => {
      before("Setup", async () => {
        await deploy();
        await createSubcourtStakeAndCreateDispute();
        await reachGeneratingPhaseFromStaking();
        balanceBefore = await pnk.balanceOf(deployer);
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
          await drawAndReachStakingPhaseFromGenerating();
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
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2); // stake unchanged, delayed
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
        await createSubcourtStakeAndCreateDispute();
        await reachGeneratingPhaseFromStaking();
        balanceBefore = await pnk.balanceOf(deployer);
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
          await drawAndReachStakingPhaseFromGenerating();
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
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2); // stake unchanged, delayed
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
        await createSubcourtStakeAndCreateDispute();
        await reachGeneratingPhaseFromStaking();
        balanceBefore = await pnk.balanceOf(deployer);
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
          await expect(core.setStake(2, PNK(2000)))
            .to.emit(sortition, "StakeDelayed")
            .withArgs(deployer, 2, PNK(2000));
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
          await drawAndReachStakingPhaseFromGenerating();
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
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2); // stake unchanged, delayed
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
        await createSubcourtStakeAndCreateDispute();
        await reachGeneratingPhaseFromStaking();
        balanceBefore = await pnk.balanceOf(deployer);
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
        it("Should cancel out the stake decrease back", async () => {
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
          await drawAndReachStakingPhaseFromGenerating();
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
          expect((await sortition.getJurorCourtIDs(deployer)).length).to.be.equal(2); // stake unchanged, delayed
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
      // Parent - general court, Classic dispute kit
      await core.createCourt(1, false, PNK(1000), 1000, ETH(0.1), 3, [0, 0, 0, 0], [1], ZeroAddress);

      await core.setStake(1, PNK(2000));
      await core.setStake(2, PNK(2000));

      await network.provider.send("evm_increaseTime", [Number(await sortition.stakingDelay())]);
      await network.provider.send("evm_mine");
      await sortition.executeDelayedStakes([deployer, deployer], [1, 2]);

      expect(await sortition.getJurorCourtIDs(deployer)).to.be.deep.equal([1, 2]);

      await createDisputeAndReachGeneratingPhaseFromStaking();
      await drawAndReachStakingPhaseFromGenerating();

      await core.passPeriod(0); // Evidence -> Voting
      await core.passPeriod(0); // Voting -> Appeal
      await core.passPeriod(0); // Appeal -> Execution

      expect(await sortition.getJurorCourtIDs(deployer)).to.be.deep.equal([1, 2]);
      await core.execute(0, 0, 1); // 1 iteration should unstake from both courts
      expect(await sortition.getJurorCourtIDs(deployer)).to.be.deep.equal([]);
    });
  });
});

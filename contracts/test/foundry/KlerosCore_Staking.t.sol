// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {SortitionModule} from "../../src/arbitration/SortitionModule.sol";
import {ISortitionModule} from "../../src/arbitration/interfaces/ISortitionModule.sol";
import {IKlerosCore, KlerosCoreSnapshotProxy} from "../../src/arbitration/view/KlerosCoreSnapshotProxy.sol";
import "../../src/libraries/Constants.sol";
import {console} from "forge-std/console.sol";

/// @title KlerosCore_StakingTest
/// @dev Tests for KlerosCore staking mechanics and stake management
/// forge-lint: disable-next-item(erc20-unchecked-transfer)
contract KlerosCore_StakingTest is KlerosCore_TestBase {
    function test_pnkBalance() public {
        vm.prank(staker1);
        pinakion.approve(address(core), 10 ether);

        assertEq(core.balances(staker1), 1 ether, "Wrong internal token balance of staker1");
        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1"); // Should be 0 since the whole balance has been deposited into KC.

        // Should fail to transfer 1 token since balance is 0.
        vm.expectRevert(KlerosCore.TransferFailed.selector);
        vm.prank(staker1);
        core.depositTokens(1);

        // Should fail to withdraw more than deposited.
        vm.expectRevert(KlerosCore.AmountExceedsBalance.selector);
        vm.prank(staker1);
        core.withdrawTokens(1 ether + 1);

        // Nullify the balance
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.TokensWithdrawn(staker1, 1 ether);
        core.withdrawTokens(1 ether);

        assertEq(core.balances(staker1), 0, "Wrong internal token balance of staker1");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");

        // Won't allow to stake since internal balance is 0.
        vm.expectRevert(KlerosCore.StakingFailed.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.TokensDeposited(staker1, 2000);
        core.depositTokens(2000);

        assertEq(core.balances(staker1), 2000, "Wrong internal token balance of staker1");
        assertEq(pinakion.balanceOf(staker1), 1 ether - 2000, "Wrong token balance of staker1");

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, 1000, 1000);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Check that simple staking didn't affect balances

        assertEq(core.balances(staker1), 2000, "Wrong internal token balance of staker1");
        assertEq(pinakion.balanceOf(staker1), 1 ether - 2000, "Wrong token balance of staker1");

        // Check the revert while withdrawing staked tokens
        vm.expectRevert(KlerosCore.CannotWithdrawActiveTokens.selector);
        vm.prank(staker1);
        core.withdrawTokens(1001);

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.TokensWithdrawn(staker1, 1000);
        core.withdrawTokens(1000);
    }

    function test_setStake_increase() public {
        vm.expectRevert(KlerosCore.StakingNotPossibleInThisCourt.selector);
        vm.prank(staker1);
        core.setStake(FINAL_COURT, 1000);

        uint96 badCourtID = 2;
        vm.expectRevert(KlerosCore.StakingNotPossibleInThisCourt.selector);
        vm.prank(staker1);
        core.setStake(badCourtID, 1000);

        vm.expectRevert(KlerosCore.StakingFailed.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 800);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1001);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, 1001, 1001);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 1001, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1001, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        // Increase stake one more time to verify the correct behavior
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);

        vm.warp(block.timestamp + stakingDelay);
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, 2000, 2000);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (totalStaked, totalLocked) = sortitionModule.getJurorBalance(staker1);
        stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 2000, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 2000, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 1, "Number of courts should not increase");
    }

    function test_setStake_decrease() public {
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1500); // Decrease the stake to see if it's reflected correctly

        vm.warp(block.timestamp + stakingDelay);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 1500, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1500, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        vm.warp(block.timestamp + stakingDelay);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (totalStaked, totalLocked) = sortitionModule.getJurorBalance(staker1);
        stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 0, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 0, "Wrong number of courts");

        courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 0, "Wrong courts count");
        assertEq(sortitionModule.isJurorStaked(staker1), false, "Juror should not be staked");
    }

    function test_setStake_maxStakePathCheck() public {
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;

        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);
        jurors[0] = staker1;

        // Create 4 courts to check the require
        for (uint96 i = GENERAL_COURT; i <= 4; i++) {
            vm.prank(owner);
            core.createCourt(
                GENERAL_COURT,
                true,
                2000,
                20000,
                0.04 ether,
                50,
                [uint256(10), uint256(20), uint256(30), uint256(40)],
                supportedDK,
                NULL_ELIGIBILITY_REQUIREMENT
            );
            vm.prank(staker1);
            core.setStake(i, 2000);

            vm.warp(block.timestamp + stakingDelay);
            courtIDs[0] = i;
            sortitionModule.executeDelayedStakes(jurors, courtIDs);
        }

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 4, "Wrong courts count");

        uint96 excessiveCourtID = 5;
        vm.expectRevert(KlerosCore.StakingFailed.selector);
        vm.prank(staker1);
        core.setStake(excessiveCourtID, 2000);
    }

    function test_setStake_increaseDrawingPhase() public {
        // Set the stake and create a dispute to advance the phase
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeDelayed(staker1, GENERAL_COURT, 1000);
        core.setStake(GENERAL_COURT, 1000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        assertEq(uint256(sortitionModule.phase()), uint256(ISortitionModule.Phase.drawing), "Wrong phase");

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeDelayed(staker1, GENERAL_COURT, 1500);
        core.setStake(GENERAL_COURT, 1500);

        (uint256 stake, bool forced, bool pending, uint256 activationTime, uint256 reservedStake) = sortitionModule
            .delayedStakes(staker1, GENERAL_COURT);
        assertEq(stake, 1500, "Wrong amount delayed stake");
        assertEq(forced, false, "Should not be forced");
        assertEq(pending, true, "Should be pending");
        assertEq(activationTime, block.timestamp + stakingDelay, "Wrong activation time");
        assertEq(reservedStake, 500, "Wrong reserved stake");

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 1000, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1000, "Amount staked in court should not change until delayed stake is executed");
        assertEq(jurorCourtIDs.length, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");
    }

    function test_setStake_decreaseDrawingPhase() public {
        // Set the stake and create a dispute to advance the phase
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeDelayed(staker1, GENERAL_COURT, 1800);
        core.setStake(GENERAL_COURT, 1800);

        (uint256 totalStaked, ) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);

        assertEq(totalStaked, 2000, "Total staked amount should not change");
        assertEq(stakedInCourt, 2000, "Amount staked in court should not change");
    }

    function test_setStake_LockedTokens() public {
        // Check that correct amount is taken when locked tokens amount exceeds the staked amount
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);

        assertEq(totalStaked, 10000, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked"); // 1000 per draw and the juror was drawn 3 times
        assertEq(stakedInCourt, 10000, "Wrong amount staked in court");

        sortitionModule.passPhase(); // Staking

        // Unstake to check that locked tokens won't be withdrawn
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        vm.warp(block.timestamp + stakingDelay);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (totalStaked, totalLocked) = sortitionModule.getJurorBalance(staker1);
        stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 0, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 0, "Wrong amount staked in court");

        // Stake again to check the behaviour.
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 5000);

        vm.warp(block.timestamp + stakingDelay);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (totalStaked, totalLocked) = sortitionModule.getJurorBalance(staker1);
        stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 5000, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked");
        assertEq(stakedInCourt, 5000, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 1, "Wrong amount staked in court");
    }

    function test_executeDelayedStakes() public {
        // Stake as staker2 as well to diversify the execution of delayed stakes
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker2;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Set the stake and create a dispute to advance the phase
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        uint256 disputeID = 0;
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.expectRevert(SortitionModule.NotStakingPhase.selector);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Create delayed stake
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeDelayed(staker1, GENERAL_COURT, 1500);
        core.setStake(GENERAL_COURT, 1500);

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 0, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 0, "Wrong number of courts");

        (uint256 stake, bool forced, bool pending, uint256 activationTime, uint256 reservedStake) = sortitionModule
            .delayedStakes(staker1, GENERAL_COURT);
        assertEq(stake, 1500, "Wrong amount delayed stake");
        assertEq(forced, false, "Should not be forced");
        assertEq(pending, true, "Should be pending");
        assertEq(activationTime, block.timestamp + stakingDelay, "Wrong activation time");
        assertEq(reservedStake, 1500, "Wrong reservedStake");

        // Create another delayed stake for staker1 on top of it to check the replacement
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeDelayed(staker1, GENERAL_COURT, 1800);
        core.setStake(GENERAL_COURT, 1800);

        (stake, forced, pending, activationTime, reservedStake) = sortitionModule.delayedStakes(staker1, GENERAL_COURT);
        assertEq(stake, 1800, "Wrong amount delayed stake");
        assertEq(forced, false, "Should not be forced");
        assertEq(pending, true, "Should be pending");
        assertEq(activationTime, block.timestamp + stakingDelay, "Wrong activation time");
        assertEq(reservedStake, 1800, "Wrong reservedStake");

        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking. Delayed stakes can be executed now

        jurors[0] = staker1;

        address[] memory accounts = new address[](0);
        vm.expectRevert(SortitionModule.AccountsCourtsLengthMismatch.selector);
        sortitionModule.executeDelayedStakes(accounts, courtIDs);

        vm.expectRevert(SortitionModule.ActivationTimeNotReached.selector);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.warp(block.timestamp + stakingDelay);

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, 1800, 1800);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Check that delayed stake is nullified
        (stake, forced, pending, activationTime, reservedStake) = sortitionModule.delayedStakes(staker1, GENERAL_COURT);
        assertEq(stake, 0, "Wrong amount delayed stake");
        assertEq(forced, false, "Should not be forced");
        assertEq(pending, false, "Should not be pending");
        assertEq(activationTime, 0, "Wrong activation time");
        assertEq(reservedStake, 0, "Wrong reservedStake");

        (totalStaked, totalLocked) = sortitionModule.getJurorBalance(staker1);
        stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, 1800, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1800, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 1, "Wrong amount staked in court");
    }

    function test_executeDelayedStakes_failedExecution() public {
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);

        // Make the delayed stake invalid before execution.
        vm.prank(owner);
        core.changeCourtParameters(
            GENERAL_COURT,
            hiddenVotes,
            3000, // minStake
            alpha,
            feeForJuror,
            jurorsForCourtJump,
            timesPerPeriod,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.warp(block.timestamp + stakingDelay);

        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeDelayedExecutionFailed(staker1, GENERAL_COURT, 2000);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        assertEq(sortitionModule.stakeOf(staker1, GENERAL_COURT), 0, "Stake should not be set");

        (uint256 stake, bool forced, bool pending, uint256 activationTime, uint256 reservedStake) = sortitionModule
            .delayedStakes(staker1, GENERAL_COURT);
        assertEq(stake, 0, "Wrong delayed stake");
        assertEq(forced, false, "Should not be forced");
        assertEq(pending, false, "Should not be pending");
        assertEq(activationTime, 0, "Wrong activation time");
        assertEq(reservedStake, 0, "Wrong reservedStake");
    }

    function test_setStake_snapshotProxyCheck() public {
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 12346);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        KlerosCoreSnapshotProxy snapshotProxy = new KlerosCoreSnapshotProxy(IKlerosCore(address(core)));
        assertEq(snapshotProxy.name(), "Staked Pinakion", "Wrong name of the proxy token");
        assertEq(snapshotProxy.symbol(), "stPNK", "Wrong symbol of the proxy token");
        assertEq(snapshotProxy.decimals(), 18, "Wrong decimals of the proxy token");
        assertEq(address(snapshotProxy.core()), address(core), "Wrong core in snapshot proxy");
        assertEq(snapshotProxy.balanceOf(staker1), 12346, "Wrong stPNK balance");
    }

    function test_setStake_cannotOvercommitDelayedStake() public {
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;

        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            jurorsForCourtJump,
            timesPerPeriod,
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        uint96 newCourtID = 2;
        uint256 balance = core.balances(staker1);

        // Reserve the entire balance for a delayed stake in the General Court.
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, balance);

        assertEq(sortitionModule.totalReservedStake(staker1), balance, "Wrong reserved stake");

        // The same PNK cannot also back another delayed stake.
        vm.expectRevert(KlerosCore.StakingFailed.selector);
        vm.prank(staker1);
        core.setStake(newCourtID, minStake);

        // Nothing changed after the failed attempt.
        assertEq(sortitionModule.totalReservedStake(staker1), balance, "Reserved stake changed");
        assertEq(sortitionModule.stakeOf(staker1, GENERAL_COURT), 0, "Stake activated too early");
        assertEq(sortitionModule.stakeOf(staker1, newCourtID), 0, "Stake activated too early");
    }

    function test_setStake_replacementUpdatesReservedStake() public {
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;

        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            jurorsForCourtJump,
            timesPerPeriod,
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        uint96 newCourtID = 2;
        uint256 balance = core.balances(staker1);

        // Reserve the entire balance in the General Court.
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, balance);

        assertEq(sortitionModule.totalReservedStake(staker1), balance, "Wrong reserved stake");

        // Replace it with a smaller delayed stake.
        uint256 generalCourtStake = balance - minStake;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, generalCourtStake);

        assertEq(sortitionModule.totalReservedStake(staker1), generalCourtStake, "Reserved stake was not reduced");

        // The freed reservation can now be used in another court.
        vm.prank(staker1);
        core.setStake(newCourtID, minStake);

        assertEq(sortitionModule.totalReservedStake(staker1), balance, "Wrong total reserved stake");

        (uint256 generalStake, , bool generalPending, , uint256 generalReservedStake) = sortitionModule.delayedStakes(
            staker1,
            GENERAL_COURT
        );

        (uint256 newCourtStake, , bool newCourtPending, , uint256 newCourtReservedStake) = sortitionModule
            .delayedStakes(staker1, newCourtID);

        assertEq(generalStake, generalCourtStake, "Wrong General Court delayed stake");
        assertEq(generalReservedStake, generalCourtStake, "Wrong General Court reservation");
        assertEq(generalPending, true, "General Court stake should be pending");

        assertEq(newCourtStake, minStake, "Wrong new court delayed stake");
        assertEq(newCourtReservedStake, minStake, "Wrong new court reservation");
        assertEq(newCourtPending, true, "New court stake should be pending");
    }

    function testFuzz_setStake(uint256 firstStake, uint256 secondStake) public {
        uint256 stakerSupply = totalSupply / 10;

        vm.prank(owner);
        pinakion.transfer(staker1, stakerSupply - 1 ether); // 1 eth was transferred in the initial setup so offset that value.
        vm.assume(firstStake >= minStake && firstStake <= stakerSupply / 2);
        vm.assume(secondStake >= minStake && secondStake <= stakerSupply / 2);

        vm.startPrank(staker1);
        pinakion.approve(address(core), firstStake);
        core.depositTokens(firstStake);
        vm.stopPrank();

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, firstStake);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, firstStake, firstStake);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, firstStake, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, firstStake, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        // Change the stake and see if everything is correct.
        vm.startPrank(staker1);
        pinakion.approve(address(core), secondStake);
        core.depositTokens(secondStake);
        vm.stopPrank();

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, secondStake);

        vm.warp(block.timestamp + stakingDelay);

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, secondStake, secondStake);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (totalStaked, totalLocked) = sortitionModule.getJurorBalance(staker1);
        stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, secondStake, "Wrong amount total staked secondStake");
        assertEq(totalLocked, 0, "Wrong amount locked secondStake");
        assertEq(stakedInCourt, secondStake, "Wrong amount staked in court secondStake");
        assertEq(jurorCourtIDs.length, 1, "Number of courts should not increase secondStake");
    }

    function testFuzz_setStake_differentCourts(uint256 firstStake, uint256 secondStake) public {
        uint256 stakerSupply = totalSupply / 10;

        vm.prank(owner);
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            jurorsForCourtJump,
            timesPerPeriod, // Times per period
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        uint96 newCourtID = 2;

        vm.prank(owner);
        pinakion.transfer(staker1, stakerSupply - 1 ether); // 1 eth was transferred in the initial setup so offset that value.
        vm.assume(firstStake >= minStake && firstStake <= stakerSupply / 2);
        vm.assume(secondStake >= minStake && secondStake <= stakerSupply / 2);

        vm.startPrank(staker1);
        pinakion.approve(address(core), firstStake);
        core.depositTokens(firstStake);
        vm.stopPrank();

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, firstStake);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, firstStake, firstStake);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);
        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, firstStake, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, firstStake, "Wrong amount staked in court");
        assertEq(jurorCourtIDs.length, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        // Stake the juror in a different court.
        vm.startPrank(staker1);
        pinakion.approve(address(core), secondStake);
        core.depositTokens(secondStake);
        vm.stopPrank();

        vm.prank(staker1);
        core.setStake(newCourtID, secondStake);

        vm.warp(block.timestamp + stakingDelay);
        courtIDs[0] = newCourtID;

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, newCourtID, secondStake, firstStake + secondStake);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (totalStaked, totalLocked) = sortitionModule.getJurorBalance(staker1);
        stakedInCourt = sortitionModule.stakeOf(staker1, newCourtID);
        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);

        assertEq(totalStaked, secondStake + firstStake, "Wrong amount total staked secondStake");
        assertEq(totalLocked, 0, "Wrong amount locked secondStake");
        assertEq(stakedInCourt, secondStake, "Wrong amount staked in court secondStake");
        assertEq(jurorCourtIDs.length, 2, "Number of courts should increase");
    }
}

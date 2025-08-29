// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCoreBase} from "../../src/arbitration/KlerosCoreBase.sol";
import {SortitionModuleBase} from "../../src/arbitration/SortitionModuleBase.sol";
import {ISortitionModule} from "../../src/arbitration/interfaces/ISortitionModule.sol";
import {IKlerosCore, KlerosCoreSnapshotProxy} from "../../src/arbitration/view/KlerosCoreSnapshotProxy.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_StakingTest
/// @dev Tests for KlerosCore staking mechanics and stake management
contract KlerosCore_StakingTest is KlerosCore_TestBase {
    function test_setStake_increase() public {
        vm.prank(owner);
        core.pause();
        vm.expectRevert(KlerosCoreBase.WhenNotPausedOnly.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);
        vm.prank(owner);
        core.unpause();

        vm.expectRevert(KlerosCoreBase.StakingNotPossibleInThisCourt.selector);
        vm.prank(staker1);
        core.setStake(FORKING_COURT, 1000);

        uint96 badCourtID = 2;
        vm.expectRevert(KlerosCoreBase.StakingNotPossibleInThisCourt.selector);
        vm.prank(staker1);
        core.setStake(badCourtID, 1000);

        vm.expectRevert(KlerosCoreBase.StakingLessThanCourtMinStake.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 800);

        vm.expectRevert(KlerosCoreBase.StakingZeroWhenNoStake.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 1001, 1001);
        core.setStake(GENERAL_COURT, 1001);

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1001, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1001, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        assertEq(pinakion.balanceOf(address(core)), 1001, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998999, "Wrong token balance of staker1"); // 1 eth - 1001 wei
        assertEq(pinakion.allowance(staker1, address(core)), 999999999999998999, "Wrong allowance for staker1");

        vm.expectRevert(KlerosCoreBase.StakingTransferFailed.selector); // This  error will be caught because owner didn't approve any tokens for KlerosCore
        vm.prank(owner);
        core.setStake(GENERAL_COURT, 1000);

        // Increase stake one more time to verify the correct behavior
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 2000, 2000);
        core.setStake(GENERAL_COURT, 2000);

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 2000, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 2000, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Number of courts should not increase");

        assertEq(pinakion.balanceOf(address(core)), 2000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998000, "Wrong token balance of staker1"); // 1 eth - 2000 wei
        assertEq(pinakion.allowance(staker1, address(core)), 999999999999998000, "Wrong allowance for staker1");
    }

    function test_setStake_decrease() public {
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);
        assertEq(pinakion.balanceOf(address(core)), 2000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998000, "Wrong token balance of staker1");
        assertEq(pinakion.allowance(staker1, address(core)), 999999999999998000, "Wrong allowance for staker1");

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1500); // Decrease the stake to see if it's reflected correctly
        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1500, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1500, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        assertEq(pinakion.balanceOf(address(core)), 1500, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998500, "Wrong token balance of staker1");
        assertEq(
            pinakion.allowance(staker1, address(core)),
            999999999999998000,
            "Allowance should not change during withdrawal"
        );

        vm.prank(address(core));
        pinakion.transfer(staker1, 1); // Manually send 1 token to make the withdrawal fail

        vm.expectRevert(KlerosCoreBase.UnstakingTransferFailed.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        vm.prank(address(staker1));
        pinakion.transfer(address(core), 1); // Manually give the token back
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 0, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(nbCourts, 0, "Wrong number of courts");

        courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 0, "Wrong courts count");
        assertEq(sortitionModule.isJurorStaked(staker1), false, "Juror should not be staked");

        assertEq(pinakion.balanceOf(address(core)), 0, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");
        assertEq(
            pinakion.allowance(staker1, address(core)),
            999999999999998000,
            "Allowance should not change during withdrawal"
        );
    }

    function test_setStake_maxStakePathCheck() public {
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;

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
                abi.encode(uint256(4)),
                supportedDK
            );
            vm.prank(staker1);
            core.setStake(i, 2000);
        }

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 4, "Wrong courts count");

        uint96 excessiveCourtID = 5;
        vm.expectRevert(KlerosCoreBase.StakingInTooManyCourts.selector);
        vm.prank(staker1);
        core.setStake(excessiveCourtID, 2000);
    }

    function test_setStake_increaseDrawingPhase() public {
        // Set the stake and create a dispute to advance the phase
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");
        assertEq(uint256(sortitionModule.phase()), uint256(ISortitionModule.Phase.drawing), "Wrong phase");

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker1, GENERAL_COURT, 1500);
        core.setStake(GENERAL_COURT, 1500);

        uint256 delayedStakeId = sortitionModule.delayedStakeWriteIndex();
        assertEq(delayedStakeId, 1, "Wrong delayedStakeWriteIndex");
        assertEq(sortitionModule.delayedStakeReadIndex(), 1, "Wrong delayedStakeReadIndex");
        (address account, uint96 courtID, uint256 stake, bool alreadyTransferred) = sortitionModule.delayedStakes(
            delayedStakeId
        );
        assertEq(account, staker1, "Wrong staker account");
        assertEq(courtID, GENERAL_COURT, "Wrong court id");
        assertEq(stake, 1500, "Wrong amount staked in court");
        assertEq(alreadyTransferred, false, "Should be flagged as transferred");

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1000, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1000, "Amount staked in court should not change until delayed stake is executed");
        assertEq(nbCourts, 1, "Wrong number of courts");

        uint96[] memory courts = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(courts.length, 1, "Wrong courts count");
        assertEq(courts[0], GENERAL_COURT, "Wrong court id");
        assertEq(sortitionModule.isJurorStaked(staker1), true, "Juror should be staked");

        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");
    }

    function test_setStake_decreaseDrawingPhase() public {
        // Set the stake and create a dispute to advance the phase
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        assertEq(pinakion.balanceOf(address(core)), 2000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999998000, "Wrong token balance of staker1");

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker1, GENERAL_COURT, 1800);
        core.setStake(GENERAL_COURT, 1800);

        (uint256 totalStaked, , uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 2000, "Total staked amount should not change");
        assertEq(stakedInCourt, 2000, "Amount staked in court should not change");

        assertEq(pinakion.balanceOf(address(core)), 2000, "Token balance of the core should not change");
        assertEq(pinakion.balanceOf(staker1), 999999999999998000, "Wrong token balance of staker1");
    }

    function test_setStake_LockedTokens() public {
        // Check that correct amount is taken when locked tokens amount exceeds the staked amount
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 10000, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked"); // 1000 per draw and the juror was drawn 3 times
        assertEq(stakedInCourt, 10000, "Wrong amount staked in court");

        sortitionModule.passPhase(); // Staking

        assertEq(pinakion.balanceOf(address(core)), 10000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999990000, "Wrong token balance of staker1");

        // Unstake to check that locked tokens won't be withdrawn
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 3000, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(nbCourts, 0, "Wrong amount staked in court");

        assertEq(pinakion.balanceOf(address(core)), 3000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999997000, "Wrong token balance of staker1");

        // Stake again to check the behaviour.
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 5000);

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 8000, "Wrong amount total staked"); // 5000 were added to the previous 3000.
        assertEq(totalLocked, 3000, "Wrong amount locked");
        assertEq(stakedInCourt, 5000, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Wrong amount staked in court");

        assertEq(pinakion.balanceOf(address(core)), 8000, "Wrong amount of tokens in Core");
        assertEq(pinakion.balanceOf(staker1), 999999999999992000, "Wrong token balance of staker1");
    }

    function test_executeDelayedStakes() public {
        // Stake as staker2 as well to diversify the execution of delayed stakes
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 10000);

        vm.expectRevert(SortitionModuleBase.NoDelayedStakeToExecute.selector);
        sortitionModule.executeDelayedStakes(5);

        // Set the stake and create a dispute to advance the phase
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        uint256 disputeID = 0;
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.expectRevert(SortitionModuleBase.NotStakingPhase.selector);
        sortitionModule.executeDelayedStakes(5);

        // Create delayed stake
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker1, GENERAL_COURT, 1500);
        core.setStake(GENERAL_COURT, 1500);

        assertEq(pinakion.balanceOf(address(core)), 10000, "Wrong token balance of the core"); // Balance should not increase because the stake was delayed
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");

        // Create delayed stake for another staker
        vm.prank(staker2);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker2, GENERAL_COURT, 0);
        core.setStake(GENERAL_COURT, 0);
        assertEq(pinakion.balanceOf(staker2), 999999999999990000, "Wrong token balance of staker2"); // Balance should not change since wrong phase

        // Create another delayed stake for staker1 on top of it to check the execution
        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeDelayed(staker1, GENERAL_COURT, 1800);
        core.setStake(GENERAL_COURT, 1800);

        assertEq(sortitionModule.delayedStakeWriteIndex(), 3, "Wrong delayedStakeWriteIndex");
        assertEq(sortitionModule.delayedStakeReadIndex(), 1, "Wrong delayedStakeReadIndex");

        (address account, uint96 courtID, uint256 stake, bool alreadyTransferred) = sortitionModule.delayedStakes(1);

        // Check each delayed stake
        assertEq(account, staker1, "Wrong staker account for the first delayed stake");
        assertEq(courtID, GENERAL_COURT, "Wrong court ID");
        assertEq(stake, 1500, "Wrong staking amount");
        assertEq(alreadyTransferred, false, "Should be false");

        (account, courtID, stake, alreadyTransferred) = sortitionModule.delayedStakes(2);
        assertEq(account, staker2, "Wrong staker2 account");
        assertEq(courtID, GENERAL_COURT, "Wrong court id for staker2");
        assertEq(stake, 0, "Wrong amount for delayed stake of staker2");
        assertEq(alreadyTransferred, false, "Should be false");

        (account, courtID, stake, alreadyTransferred) = sortitionModule.delayedStakes(3);
        assertEq(account, staker1, "Wrong staker1 account");
        assertEq(courtID, GENERAL_COURT, "Wrong court id for staker1");
        assertEq(stake, 1800, "Wrong amount for delayed stake of staker1");
        assertEq(alreadyTransferred, false, "Should be false");

        // So far the only amount transferred was 10000 by staker2. Staker 1 has two delayed stakes, for 1500 and 1800 pnk.
        assertEq(pinakion.balanceOf(address(core)), 10000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(staker2), 999999999999990000, "Wrong token balance of staker2");

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT); // Only check the first staker to check how consecutive delayed stakes are handled.
        // Balances shouldn't be updated yet.
        assertEq(totalStaked, 0, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Wrong amount staked in court");
        assertEq(nbCourts, 0, "Wrong number of courts");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Staking. Delayed stakes can be executed now

        vm.prank(address(core));
        pinakion.transfer(owner, 10000); // Dispose of the tokens of 2nd staker to make the execution fail for the 2nd delayed stake
        assertEq(pinakion.balanceOf(address(core)), 0, "Wrong token balance of the core");

        // 2 events should be emitted but the 2nd stake supersedes the first one in the end.
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 1500, 1500);
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 1800, 1800);
        sortitionModule.executeDelayedStakes(20); // Deliberately ask for more iterations than needed

        assertEq(sortitionModule.delayedStakeWriteIndex(), 3, "Wrong delayedStakeWriteIndex");
        assertEq(sortitionModule.delayedStakeReadIndex(), 4, "Wrong delayedStakeReadIndex");

        // Check that delayed stakes are nullified
        for (uint i = 2; i <= sortitionModule.delayedStakeWriteIndex(); i++) {
            (account, courtID, stake, alreadyTransferred) = sortitionModule.delayedStakes(i);

            assertEq(account, address(0), "Wrong staker account after delayed stake deletion");
            assertEq(courtID, 0, "Court id should be nullified");
            assertEq(stake, 0, "No amount to stake");
            assertEq(alreadyTransferred, false, "Should be false");
        }

        assertEq(pinakion.balanceOf(staker1), 999999999999998200, "Wrong token balance of staker1");

        (totalStaked, totalLocked, stakedInCourt, nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1800, "Wrong amount total staked");
        assertEq(totalLocked, 0, "Wrong amount locked");
        assertEq(stakedInCourt, 1800, "Wrong amount staked in court");
        assertEq(nbCourts, 1, "Wrong amount staked in court");

        // Staker2 not getting the tokens back indicates that his delayed stake was skipped and the flow wasn't disrupted
        assertEq(pinakion.balanceOf(staker2), 999999999999990000, "Wrong token balance of staker2");
    }

    function test_setStakeBySortitionModule() public {
        // Note that functionality of this function was checked during delayed stakes execution
        vm.expectRevert(KlerosCoreBase.SortitionModuleOnly.selector);
        vm.prank(owner);
        core.setStakeBySortitionModule(staker1, GENERAL_COURT, 1000);
    }

    function test_setStake_snapshotProxyCheck() public {
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 12346);

        KlerosCoreSnapshotProxy snapshotProxy = new KlerosCoreSnapshotProxy(owner, IKlerosCore(address(core)));
        assertEq(snapshotProxy.name(), "Staked Pinakion", "Wrong name of the proxy token");
        assertEq(snapshotProxy.symbol(), "stPNK", "Wrong symbol of the proxy token");
        assertEq(snapshotProxy.decimals(), 18, "Wrong decimals of the proxy token");
        assertEq(snapshotProxy.owner(), msg.sender, "Wrong owner");
        assertEq(address(snapshotProxy.core()), address(core), "Wrong core in snapshot proxy");
        assertEq(snapshotProxy.balanceOf(staker1), 12346, "Wrong stPNK balance");

        vm.prank(other);
        vm.expectRevert(KlerosCoreSnapshotProxy.OwnerOnly.selector);
        snapshotProxy.changeCore(IKlerosCore(other));
        vm.prank(owner);
        snapshotProxy.changeCore(IKlerosCore(other));
        assertEq(address(snapshotProxy.core()), other, "Wrong core in snapshot proxy after change");

        vm.prank(other);
        vm.expectRevert(KlerosCoreSnapshotProxy.OwnerOnly.selector);
        snapshotProxy.changeOwner(other);
        vm.prank(owner);
        snapshotProxy.changeOwner(other);
        assertEq(snapshotProxy.owner(), other, "Wrong owner after change");
    }
}

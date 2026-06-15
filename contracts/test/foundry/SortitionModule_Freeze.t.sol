// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {SortitionModule} from "../../src/arbitration/SortitionModule.sol";
import "../../src/libraries/Constants.sol";

/// @title SortitionModule_Freeze_Test
/// @notice Tests the stake freeze (G-2 / INV-1) and the capture-without-refund path (G-7).
/// @dev RED until `freeze`/`unfreeze`/`captureUnstakeAllCourts` and the `_setStake` guard are implemented
///      (they currently revert `NotImplemented()`). The assertions pin the spec's required behavior.
/// forge-lint: disable-next-item(erc20-unchecked-transfer)
contract SortitionModule_Freeze_Test is KlerosCore_TestBase {
    uint256 constant STAKE = 1000;

    function _stake(address who, uint256 amount) internal {
        vm.prank(who);
        core.setStake(GENERAL_COURT, amount);
    }

    function _freeze(uint256 disputeID) internal {
        // The freeze is Core-only; tests drive it directly as if Core engaged it on a forking jump.
        vm.prank(address(core));
        sortitionModule.freeze(disputeID);
    }

    // INV-1: while frozen, staked-balance mutations revert.
    function test_stakeMutationsRevertWhileFrozen() public {
        _stake(staker1, STAKE);
        _freeze(0);
        assertTrue(sortitionModule.stakingFrozen(), "freeze flag must be set");

        vm.expectRevert(SortitionModule.StakingFrozen.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, STAKE * 2); // increase blocked

        vm.expectRevert(SortitionModule.StakingFrozen.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0); // withdrawal blocked
    }

    // After unfreeze, mutations work again.
    function test_unfreezeRestoresMutations() public {
        _stake(staker1, STAKE);
        _freeze(0);

        vm.prank(address(core));
        sortitionModule.unfreeze();
        assertFalse(sortitionModule.stakingFrozen(), "freeze flag must be cleared");

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, STAKE * 2);
        (uint256 total, , , ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(total, STAKE * 2, "stake change must apply after unfreeze");
    }

    // Double-freeze and stray-unfreeze are rejected.
    function test_freezeStateGuards() public {
        _freeze(0);
        vm.expectRevert(SortitionModule.AlreadyFrozen.selector);
        vm.prank(address(core));
        sortitionModule.freeze(0);

        vm.prank(address(core));
        sortitionModule.unfreeze();
        vm.expectRevert(SortitionModule.NotFrozen.selector);
        vm.prank(address(core));
        sortitionModule.unfreeze();
    }

    // G-7: capture zeroes the joiner's stake but does NOT refund — PNK stays in Core's balance.
    function test_captureUnstakeKeepsPNKInCore() public {
        _stake(staker1, STAKE);
        uint256 coreBalanceBefore = pinakion.balanceOf(address(core));
        uint256 jurorBalanceBefore = pinakion.balanceOf(staker1);

        _freeze(0);
        vm.prank(address(core));
        uint256 captured = sortitionModule.captureUnstakeAllCourts(staker1);

        assertEq(captured, STAKE, "captured must equal former staked PNK");
        (uint256 total, , , ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(total, 0, "joiner stake must be zeroed (INV-5)");
        assertEq(pinakion.balanceOf(staker1), jurorBalanceBefore, "joiner must NOT be refunded");
        assertEq(pinakion.balanceOf(address(core)), coreBalanceBefore, "captured PNK stays in Core");
    }

    // Access control: only Core may freeze/unfreeze/capture.
    function test_onlyCoreCanFreeze() public {
        vm.expectRevert(SortitionModule.KlerosCoreOnly.selector);
        vm.prank(other);
        sortitionModule.freeze(0);

        vm.expectRevert(SortitionModule.KlerosCoreOnly.selector);
        vm.prank(other);
        sortitionModule.captureUnstakeAllCourts(staker1);
    }
}

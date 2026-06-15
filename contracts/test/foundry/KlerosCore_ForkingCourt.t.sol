// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ForkingTestBase} from "./ForkingTestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_ForkingCourt_Test
/// @notice Tests the forking-court configuration and the Core-side forking hooks' access control.
/// @dev Access-control and "cannot stake" assertions are GREEN; the forking-court parameter
///      configuration (set in `initialize` during the implementation pass) and the hook bodies are RED.
contract KlerosCore_ForkingCourt_Test is ForkingTestBase {
    // Spec: commit/reveal periods for the forking court (see plan 1.4-5 / 1.5).
    uint256 constant COMMIT = 120;
    uint256 constant REVEAL = 180;

    // --- Already-enforced behavior (GREEN) --- //

    function test_cannotStakeDirectlyIntoForkingCourt() public {
        vm.expectRevert(KlerosCore.StakingNotPossibleInThisCourt.selector);
        vm.prank(staker1);
        core.setStake(FORKING_COURT, 1000);
    }

    function test_forkingDKRegistered() public view {
        assertGt(forkingDKID, DISPUTE_KIT_CLASSIC, "forking DK must be registered after classic");
        assertEq(address(core.forkSettlement()), address(forkSettlement));
    }

    // --- Access control on the new Core hooks (GREEN) --- //

    function test_captureStakeForForking_onlyByForkSettlement() public {
        vm.expectRevert(KlerosCore.ForkSettlementOnly.selector);
        vm.prank(other);
        core.captureStakeForForking(staker1);
    }

    function test_distributeForking_onlyByForkSettlement() public {
        vm.expectRevert(KlerosCore.ForkSettlementOnly.selector);
        vm.prank(other);
        core.distributeForking(staker1, 100);
    }

    function test_setForkSettlement_onlyByOwner() public {
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.setForkSettlement(other);
    }

    // --- RED until implemented --- //

    function test_captureStakeForForking_notImplemented() public {
        vm.expectRevert(KlerosCore.NotImplemented.selector);
        vm.prank(address(forkSettlement));
        core.captureStakeForForking(staker1);
    }

    function test_distributeForking_notImplemented() public {
        vm.expectRevert(KlerosCore.NotImplemented.selector);
        vm.prank(address(forkSettlement));
        core.distributeForking(staker1, 100);
    }

    /// RED: the forking court must be configured with commit/reveal periods in `initialize`.
    /// Currently `getTimesPerPeriod(FORKING_COURT)` reverts (no court params) — this fails until the
    /// implementation pass configures court 0.
    function test_forkingCourtConfigured() public view {
        uint256[4] memory times = core.getTimesPerPeriod(FORKING_COURT);
        assertEq(times[uint256(KlerosCore.Period.commit)], COMMIT, "commit period");
        assertEq(times[uint256(KlerosCore.Period.vote)], REVEAL, "reveal period");
    }
}

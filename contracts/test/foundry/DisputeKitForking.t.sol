// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ForkingTestBase} from "./ForkingTestBase.sol";
import {DisputeKitForking} from "../../src/arbitration/dispute-kits/DisputeKitForking.sol";
import "../../src/libraries/Constants.sol";

/// @title DisputeKitForking_Test
/// @notice Tests the forking dispute kit's `IDisputeKit` surface and its commit/reveal/finalize surface
///         (G-3 winner, G-9 hidden votes). The inert `IDisputeKit` views are real and assert GREEN; the
///         voting/finalization functions are skeletoned and assert RED via `NotImplemented()`.
contract DisputeKitForking_Test is ForkingTestBase {
    uint256 constant DISPUTE_ID = 0;

    // --- IDisputeKit surface (real in the skeleton) --- //

    function test_version() public view {
        assertEq(forkingDK.version(), "0.1.0");
    }

    function test_createDispute_onlyByCore() public {
        vm.expectRevert(DisputeKitForking.KlerosCoreOnly.selector);
        vm.prank(other);
        forkingDK.createDispute(DISPUTE_ID, 0, 3, "", 0);
    }

    function test_createDispute_storesNumberOfChoices() public {
        vm.prank(address(core));
        forkingDK.createDispute(DISPUTE_ID, 0, 3, "", 0);
        assertTrue(forkingDK.initialized(DISPUTE_ID), "dispute must be marked initialized");

        vm.expectRevert(DisputeKitForking.ForkAlreadyInitiated.selector);
        vm.prank(address(core));
        forkingDK.createDispute(DISPUTE_ID, 0, 3, "", 0);
    }

    function test_currentRuling_zeroBeforeFinalization() public view {
        (uint256 ruling, bool tied, bool overridden) = forkingDK.currentRuling(DISPUTE_ID);
        assertEq(ruling, 0, "no ruling before the winner is determined");
        assertFalse(tied);
        assertFalse(overridden);
    }

    function test_draw_returnsZeroAndDoesNotRevert() public {
        // Core may call draw at nbVotes = 0; it MUST be a harmless no-op, not a revert.
        (address drawn, uint96 court) = forkingDK.draw(DISPUTE_ID, 0, 0);
        assertEq(drawn, address(0));
        assertEq(court, 0);
    }

    function test_inertCoherenceViews() public view {
        (uint256 r1, uint256 r2) = forkingDK.getDegreeOfCoherenceReward(0, 0, 0, 0, 0);
        assertEq(r1, 0);
        assertEq(r2, 0);
        assertEq(forkingDK.getDegreeOfCoherencePenalty(0, 0, 0, 0, 0), 0);
        assertEq(forkingDK.getCoherentCount(0, 0), 0);
        assertFalse(forkingDK.areCommitsAllCast(0));
        assertFalse(forkingDK.areVotesAllCast(0));
        assertFalse(forkingDK.isAppealFunded(0));
        assertFalse(forkingDK.isVoteActive(0, 0, 0));
    }

    function test_getNextRoundSettings_revertsTerminal() public {
        vm.expectRevert(DisputeKitForking.UnsupportedOperation.selector);
        forkingDK.getNextRoundSettings(0, 0, 0, 0, 0, 0);
    }

    function test_hashForkVote_matchesScheme() public view {
        bytes32 expected = keccak256(abi.encodePacked(uint256(2), uint256(30), uint256(12345)));
        assertEq(forkingDK.hashForkVote(2, 30, 12345), expected);
    }

    // --- Voting / finalization surface (RED until implemented) --- //

    function test_commitVote_notImplemented() public {
        vm.expectRevert(DisputeKitForking.NotImplemented.selector);
        forkingDK.commitVote(DISPUTE_ID, bytes32(0));
    }

    function test_revealVote_notImplemented() public {
        vm.expectRevert(DisputeKitForking.NotImplemented.selector);
        forkingDK.revealVote(DISPUTE_ID, 2, 30, 12345);
    }

    function test_finalize_notImplemented() public {
        vm.expectRevert(DisputeKitForking.NotImplemented.selector);
        forkingDK.finalize(DISPUTE_ID, 10);
    }
}

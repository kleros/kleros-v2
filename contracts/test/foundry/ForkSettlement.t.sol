// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ForkingTestBase} from "./ForkingTestBase.sol";
import {ForkSettlement} from "../../src/arbitration/dispute-kits/ForkSettlement.sol";
import "../../src/libraries/Constants.sol";

/// @title ForkSettlement_Test
/// @notice Tests settlement: supply equalization (G-5 / INV-4), joiner exit + mint (G-7 / INV-5), PNK
///         conservation, capture-without-refund, and the baseline open-question answers (Q-006 slash
///         absorbed, Q-016 locked-PNK joiner).
/// @dev Wiring assertions are GREEN; the settlement flow is skeletoned and asserts RED via
///      `NotImplemented()`. The implementation pass fills in `initSettle`/`settle`/`slash`.
contract ForkSettlement_Test is ForkingTestBase {
    uint256 constant DISPUTE_ID = 0;

    // --- Wiring (real in the skeleton) --- //

    function test_wiring() public view {
        assertEq(address(forkSettlement.core()), address(core));
        assertEq(address(forkSettlement.pinakion()), address(pinakion));
        assertEq(forkSettlement.disputeKit(), address(forkingDK));
        assertEq(address(forkSettlement.slashDestination()), address(forkSettlement), "Q-006 baseline: absorb");
        assertEq(address(core.forkSettlement()), address(forkSettlement));
    }

    // --- Access control --- //

    function test_initSettle_onlyByDK() public {
        address[] memory stayers = new address[](0);
        uint256[] memory weights = new uint256[](0);
        uint256[] memory options = new uint256[](0);
        address[][] memory joiners = new address[][](0);
        uint256[][] memory joinerWeights = new uint256[][](0);

        vm.expectRevert(ForkSettlement.DisputeKitOnly.selector);
        vm.prank(other);
        forkSettlement.initSettle(DISPUTE_ID, stayers, weights, options, joiners, joinerWeights);
    }

    function test_slash_onlyByDK() public {
        vm.expectRevert(ForkSettlement.DisputeKitOnly.selector);
        vm.prank(other);
        forkSettlement.slash(DISPUTE_ID, staker1, 100);
    }

    // --- Settlement flow (RED until implemented) --- //

    function test_initSettle_notImplemented() public {
        address[] memory stayers = new address[](0);
        uint256[] memory weights = new uint256[](0);
        uint256[] memory options = new uint256[](0);
        address[][] memory joiners = new address[][](0);
        uint256[][] memory joinerWeights = new uint256[][](0);

        vm.expectRevert(ForkSettlement.NotImplemented.selector);
        vm.prank(address(forkingDK));
        forkSettlement.initSettle(DISPUTE_ID, stayers, weights, options, joiners, joinerWeights);
    }

    function test_settle_notImplemented() public {
        vm.expectRevert(ForkSettlement.NotImplemented.selector);
        forkSettlement.settle(DISPUTE_ID, 10);
    }

    function test_forceUnfreeze_notImplemented() public {
        vm.expectRevert(ForkSettlement.NotImplemented.selector);
        forkSettlement.forceUnfreeze(DISPUTE_ID);
    }

    // ------------------------------------------------------------------ //
    //  Specification of the settlement invariants for the GREEN pass.    //
    //  Encoded against the spec's Example 1 (option B forks at 30) so the //
    //  implementer has executable acceptance criteria. Currently RED.    //
    // ------------------------------------------------------------------ //
    //
    //  Given original total supply S and a fork of size `forkSize`, a holder of weight `w` on that fork
    //  receives genesis `w * S / forkSize` (supply equalization, G-5). After settlement:
    //   - each fork token's totalSupply == S            (INV-4)
    //   - every joiner's main-chain stakedPnk == 0       (INV-5)
    //   - sum(captured) + sum(stayer face value) == Core PNK balance at settle start (conservation)
    //   - a silent staker's PNK is absorbed into the stayer bonus (Q-006 baseline)
    //   - a joiner's full frozen stake (incl. locked) is captured (Q-016 baseline)
    //
    //  These become concrete assertions in `Forking_Integration.t.sol::test_fullLifecycle` once the
    //  end-to-end flow lands, and in dedicated unit tests here once `settle` is implemented.
}

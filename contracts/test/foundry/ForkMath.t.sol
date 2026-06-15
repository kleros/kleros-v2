// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ForkMathHarness} from "../../src/test/ForkMathHarness.sol";

/// @title ForkMath_Test
/// @notice Tests the forking "removal fixed point" (G-4 / INV-2). The two worked examples in
///         `docs/layer-1-core/07-forking.md` are the canonical fixtures.
/// @dev RED until `ForkMath` is implemented (the library bodies currently revert `NotImplemented()`).
///      The assertions encode the spec's expected fork sizes and survivor sets exactly.
contract ForkMath_Test is Test {
    ForkMathHarness harness;

    // Sentinel for "start searching from the tail".
    uint256 constant FROM_TAIL = type(uint256).max;

    function setUp() public {
        harness = new ForkMathHarness();
    }

    /// @dev Helper: insert a voter into option `opt` with no search hint (start from tail).
    function _add(uint256 opt, address who, uint256 threshold, uint256 weight) internal returns (uint256) {
        return harness.insert(opt, who, threshold, weight, FROM_TAIL);
    }

    /// @dev Helper: run the cut-off walk to completion with generous pagination.
    function _finalize(uint256 opt) internal {
        bool done;
        for (uint256 i = 0; i < 32 && !done; i++) {
            done = harness.finalizeStep(opt, 8);
        }
        assertTrue(done, "finalize did not complete");
    }

    // ********************************************************************** //
    // *  Example 1 — binary, A wins. Option B: total 39, v5 (40) cut off. * //
    // ********************************************************************** //

    /// INV-2: B fork = 30, survivors {v3(12), v7(20), v4(30)}, v5(40) evicted (40 > 39 then 40 > 30).
    function testRemovalFixedPointExample1() public {
        uint256 B = 1;
        // (threshold, weight) per the spec table.
        uint256 v3 = _add(B, vm.addr(3), 12, 12);
        uint256 v4 = _add(B, vm.addr(4), 30, 11);
        uint256 v5 = _add(B, vm.addr(5), 40, 9);
        uint256 v7 = _add(B, vm.addr(7), 20, 7);

        assertEq(harness.totalWeight(B), 39, "initial B support");

        _finalize(B);

        assertEq(harness.finalSupport(B), 30, "B fork must settle at 30");
        assertTrue(harness.isSurvivor(B, v3), "v3 survives");
        assertTrue(harness.isSurvivor(B, v4), "v4 survives (threshold 30 == support 30)");
        assertTrue(harness.isSurvivor(B, v7), "v7 survives");
        assertFalse(harness.isSurvivor(B, v5), "v5 is cut off (40 > 39) and stays on the main fork");
    }

    // ********************************************************************** //
    // *  Example 2 — four options, A wins. C forks at 23, B & D collapse.  * //
    // ********************************************************************** //

    /// INV-2: C fork = 23 (none evicted: 12<=12, 15<=16, 20<=23).
    function testRemovalFixedPointExample2_C_forks() public {
        uint256 C = 3;
        uint256 v3 = _add(C, vm.addr(3), 12, 12);
        uint256 v8 = _add(C, vm.addr(8), 15, 4);
        uint256 v7 = _add(C, vm.addr(7), 20, 7);

        assertEq(harness.totalWeight(C), 23, "initial C support");
        _finalize(C);

        assertEq(harness.finalSupport(C), 23, "C fork must settle at 23");
        assertTrue(harness.isSurvivor(C, v3), "v3 survives");
        assertTrue(harness.isSurvivor(C, v8), "v8 survives");
        assertTrue(harness.isSurvivor(C, v7), "v7 survives");
    }

    /// INV-2: B collapses to empty (25 > 20 evict v4 → 15 > 9 evict v5).
    function testRemovalFixedPointExample2_B_empty() public {
        uint256 B = 2;
        uint256 v5 = _add(B, vm.addr(15), 15, 9);
        uint256 v4 = _add(B, vm.addr(14), 25, 11);

        _finalize(B);

        assertEq(harness.finalSupport(B), 0, "B fork must be empty");
        assertFalse(harness.isSurvivor(B, v4), "v4 evicted");
        assertFalse(harness.isSurvivor(B, v5), "v5 evicted");
    }

    /// INV-2: D collapses to empty (10 > 9 evict the lone voter).
    function testRemovalFixedPointExample2_D_empty() public {
        uint256 D = 4;
        uint256 v6 = _add(D, vm.addr(16), 10, 9);

        _finalize(D);

        assertEq(harness.finalSupport(D), 0, "D fork must be empty");
        assertFalse(harness.isSurvivor(D, v6), "lone voter below own threshold is evicted");
    }

    // ********************************************************************** //
    // *                            Edge cases                             * //
    // ********************************************************************** //

    /// A lone voter whose threshold is satisfied by their own weight survives.
    function testEdge_loneVoterSatisfied() public {
        uint256 opt = 7;
        uint256 n = _add(opt, vm.addr(50), 5, 9);
        _finalize(opt);
        assertEq(harness.finalSupport(opt), 9);
        assertTrue(harness.isSurvivor(opt, n));
    }

    /// All members satisfied at full support → no eviction, fork = total.
    function testEdge_allJoin() public {
        uint256 opt = 8;
        _add(opt, vm.addr(60), 5, 10);
        _add(opt, vm.addr(61), 10, 10);
        _add(opt, vm.addr(62), 20, 10);
        _finalize(opt);
        assertEq(harness.finalSupport(opt), 30, "all thresholds <= 30 so everyone joins");
    }

    /// Empty option finalizes to zero support without reverting.
    function testEdge_emptyOption() public {
        uint256 opt = 9;
        _finalize(opt);
        assertEq(harness.finalSupport(opt), 0);
    }

    /// Threshold ties: members with equal thresholds are handled deterministically.
    function testEdge_thresholdTies() public {
        uint256 opt = 10;
        uint256 a = _add(opt, vm.addr(70), 20, 10);
        uint256 b = _add(opt, vm.addr(71), 20, 10);
        uint256 c = _add(opt, vm.addr(72), 20, 10);
        _finalize(opt);
        // total 30 >= 20, all satisfied.
        assertEq(harness.finalSupport(opt), 30);
        assertTrue(harness.isSurvivor(opt, a));
        assertTrue(harness.isSurvivor(opt, b));
        assertTrue(harness.isSurvivor(opt, c));
    }
}

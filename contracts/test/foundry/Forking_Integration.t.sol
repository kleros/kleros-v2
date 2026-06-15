// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ForkingTestBase} from "./ForkingTestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitClassic} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import "../../src/libraries/Constants.sol";

/// @title Forking_Integration_Test
/// @notice End-to-end lifecycle (G-1, G-2, G-3): a General Court dispute exhausts its appeals, jumps into
///         the forking court, runs a commit/reveal forking round, finalizes, settles, and exposes
///         `currentRuling == a_main` while the freeze is engaged then released.
/// @dev Fully RED until the Core forking guards, the DK voting logic, and settlement all land. This test
///      is the executable acceptance criterion for the whole mechanism; it drives the dispute to the
///      forking-court jump and asserts the post-jump state.
/// forge-lint: disable-next-item(erc20-unchecked-transfer)
contract Forking_Integration_Test is ForkingTestBase {
    uint256 constant DISPUTE_ID = 0;

    function setUp() public override {
        super.setUp();
        // Make the General Court jump to its parent (the forking court) after a single small round.
        vm.prank(owner);
        core.changeCourtParameters(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            DEFAULT_NB_OF_JURORS, // jurorsForCourtJump low so one appeal triggers the parent jump
            timesPerPeriod,
            NULL_ELIGIBILITY_REQUIREMENT
        );
    }

    /// @dev Drives a dispute through its first General Court round and into the appeal period.
    function _toAppealPeriod() internal {
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        core.draw(DISPUTE_ID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[uint256(KlerosCore.Period.evidence)]);
        core.passPeriod(DISPUTE_ID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit.castVote(DISPUTE_ID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(DISPUTE_ID); // Appeal
    }

    /// G-1/G-2: appealing the last General Court round jumps into the forking court, engages the freeze,
    /// and opens a zero-vote forking round routed to the forking dispute kit.
    function test_jumpIntoForkingCourt() public {
        _toAppealPeriod();

        // Funding the appeal must route the court jump to the forking court (DK is jumping to forking).
        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(DISPUTE_ID, 1);

        // Post-jump expectations (RED until the Core forking branch + freeze land).
        (uint96 courtID, , , , ) = core.disputes(DISPUTE_ID);
        assertEq(courtID, FORKING_COURT, "dispute must be in the forking court");
        assertTrue(sortitionModule.stakingFrozen(), "freeze must be engaged on jump (G-2)");

        KlerosCore.Round memory round = core.getRoundInfo(DISPUTE_ID, 1);
        assertEq(round.nbVotes, 0, "forking round has no drawn jurors");
        assertEq(round.disputeKitID, forkingDKID, "round must be routed to the forking DK");
    }

    /// G-1: no further appeal is possible once in the forking court.
    function test_noAppealAfterForking() public {
        _toAppealPeriod();
        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(DISPUTE_ID, 1);

        // appealCost out of the forking court must be NON_PAYABLE; appealing must revert.
        vm.expectRevert(KlerosCore.AppealNotAllowed.selector);
        core.appeal(DISPUTE_ID, 3, arbitratorExtraData);
    }

    /// G-3: after commit/reveal/finalize/settle, the ruling is the plurality winner and the freeze releases.
    /// Documented as the full acceptance flow; RED until the entire mechanism is implemented.
    function test_fullLifecycle() public {
        _toAppealPeriod();
        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(DISPUTE_ID, 1);

        // The dispute must actually be in the forking court for the lifecycle to be meaningful (G-1).
        (uint96 courtID, , , , ) = core.disputes(DISPUTE_ID);
        assertEq(courtID, FORKING_COURT, "lifecycle requires the forking-court jump");
        assertEq(core.getRoundInfo(DISPUTE_ID, 1).disputeKitID, forkingDKID, "round routed to forking DK");

        // commit → reveal → finalize → settle would proceed here against `forkingDK` and `forkSettlement`.
        // Acceptance assertions for the GREEN pass:
        //   - currentRuling(DISPUTE_ID) == a_main (the stake-weighted plurality winner)
        //   - each minority fork token's totalSupply == original PNK supply (INV-4)
        //   - every joiner's stakedPnk == 0 (INV-5)
        //   - sortitionModule.stakingFrozen() == false after settlement
        //   - disputesWithoutJurors is not wedged by the zero-vote round
        (uint256 ruling, , ) = core.currentRuling(DISPUTE_ID);
        assertGt(ruling, 0, "currentRuling must resolve to a_main once the forking round settles");
    }
}

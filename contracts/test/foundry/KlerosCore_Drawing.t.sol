// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCoreBase} from "../../src/arbitration/KlerosCoreBase.sol";
import {SortitionModuleBase} from "../../src/arbitration/SortitionModuleBase.sol";
import {ISortitionModule} from "../../src/arbitration/interfaces/ISortitionModule.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_DrawingTest
/// @dev Tests for KlerosCore jury drawing and selection mechanisms
contract KlerosCore_DrawingTest is KlerosCore_TestBase {
    function test_draw() public {
        uint256 disputeID = 0;
        uint256 roundID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1500);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker1, 1000, false);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, roundID, 0); // VoteID = 0

        core.draw(disputeID, DEFAULT_NB_OF_JURORS); // Do 3 iterations and see that the juror will get drawn 3 times despite low stake.

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, ) = sortitionModule.getJurorBalance(
            staker1,
            GENERAL_COURT
        );
        assertEq(totalStaked, 1500, "Wrong amount total staked");
        assertEq(totalLocked, 3000, "Wrong amount locked"); // 1000 per draw
        assertEq(stakedInCourt, 1500, "Wrong amount staked in court");
        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Wrong disputesWithoutJurors count");

        for (uint256 i = 0; i < DEFAULT_NB_OF_JURORS; i++) {
            (address account, bytes32 commit, uint256 choice, bool voted) = disputeKit.getVoteInfo(0, 0, i);
            assertEq(account, staker1, "Wrong drawn account");
            assertEq(commit, bytes32(0), "Commit should be empty");
            assertEq(choice, 0, "Choice should be empty");
            assertEq(voted, false, "Voted should be false");
        }
    }

    function test_draw_noEmptyAddresses() public {
        uint256 disputeID = 0;
        uint256 roundID = 0;

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS); // No one is staked so check that the empty addresses are not drawn.

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, roundID);
        assertEq(round.drawIterations, 3, "Wrong drawIterations number");

        (, , , , uint256 nbVoters, ) = disputeKit.getRoundInfo(disputeID, roundID, 0);
        assertEq(nbVoters, 0, "nbVoters should be 0");
    }

    function test_draw_parentCourts() public {
        uint96 newCourtID = 2;
        uint256 disputeID = 0;
        uint256 roundID = 0;

        // Create a child court and stake exclusively there to check that parent courts hold drawing power.
        vm.prank(owner);
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            sortitionExtraData, // Sortition extra data
            supportedDK
        );

        uint256[] memory children = core.getCourtChildren(GENERAL_COURT);
        assertEq(children.length, 1, "Wrong children count");
        assertEq(children[0], 2, "Wrong child ID");

        vm.prank(staker1);
        core.setStake(newCourtID, 3000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action"); // Dispute uses general court by default
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Wrong court ID of the dispute");

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, roundID, 0);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, roundID, 1);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.Draw(staker1, disputeID, roundID, 2);
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Wrong disputesWithoutJurors count");

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, roundID);
        assertEq(round.drawIterations, 3, "Wrong drawIterations number");

        (, , , , uint256 nbVoters, ) = disputeKit.getRoundInfo(disputeID, roundID, 0);
        assertEq(nbVoters, 3, "nbVoters should be 3");
    }
}

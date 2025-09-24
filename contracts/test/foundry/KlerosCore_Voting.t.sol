// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitClassic, DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {IDisputeKit} from "../../src/arbitration/interfaces/IDisputeKit.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_VotingTest
/// @dev Tests for KlerosCore voting system (commit/reveal and direct voting)
contract KlerosCore_VotingTest is KlerosCore_TestBase {
    function test_castCommit() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(owner);
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            511, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)] // Times per period
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        uint256 YES = 1;
        uint256 salt = 123455678;
        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        bytes32 commit;
        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.NotCommitPeriod.selector);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        vm.expectRevert(KlerosCore.EvidenceNotPassedAndNotAppeal.selector);
        core.passPeriod(disputeID);
        vm.warp(block.timestamp + timesPerPeriod[0]);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.commit);
        core.passPeriod(disputeID);

        (, , KlerosCore.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);

        assertEq(uint256(period), uint256(KlerosCore.Period.commit), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.EmptyCommit.selector);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        commit = keccak256(abi.encodePacked(YES, salt));

        vm.prank(other);
        vm.expectRevert(DisputeKitClassicBase.JurorHasToOwnTheVote.selector);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.CommitCast(disputeID, staker1, voteIDs, commit);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        (, , , uint256 totalCommited, uint256 nbVoters, uint256 choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 0);
        assertEq(totalCommited, 1, "totalCommited should be 1");
        assertEq(disputeKit.areCommitsAllCast(disputeID), false, "Commits should not all be cast");

        (, bytes32 commitStored, , ) = disputeKit.getVoteInfo(0, 0, 0);
        assertEq(commitStored, keccak256(abi.encodePacked(YES, salt)), "Incorrect commit");

        voteIDs = new uint256[](2); // Create the leftover votes subset
        voteIDs[0] = 1;
        voteIDs[1] = 2;

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.CommitCast(disputeID, staker1, voteIDs, commit);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        (, , , totalCommited, nbVoters, choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 0);
        assertEq(totalCommited, DEFAULT_NB_OF_JURORS, "totalCommited should be 3");
        assertEq(disputeKit.areCommitsAllCast(disputeID), true, "Commits should all be cast");

        for (uint256 i = 1; i < DEFAULT_NB_OF_JURORS; i++) {
            (, commitStored, , ) = disputeKit.getVoteInfo(0, 0, i);
            assertEq(commitStored, keccak256(abi.encodePacked(YES, salt)), "Incorrect commit");
        }

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.AlreadyCommittedThisVote.selector);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        // Check reveal in the next period
        vm.warp(block.timestamp + timesPerPeriod[1]);
        core.passPeriod(disputeID);

        // Check the require with the wrong choice and then with the wrong salt
        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.HashDoesNotMatchHiddenVoteCommitment.selector);
        disputeKit.castVote(disputeID, voteIDs, 2, salt, "XYZ");

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.HashDoesNotMatchHiddenVoteCommitment.selector);
        disputeKit.castVote(disputeID, voteIDs, YES, salt - 1, "XYZ");

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, YES, salt, "XYZ");

        for (uint256 i = 1; i < DEFAULT_NB_OF_JURORS; i++) {
            // 0 voteID was skipped when casting a vote
            (address account, , uint256 choice, bool voted) = disputeKit.getVoteInfo(0, 0, i);
            assertEq(account, staker1, "Wrong drawn account");
            assertEq(choice, YES, "Wrong choice");
            assertEq(voted, true, "Voted should be true");
        }
    }

    function test_castCommit_timeoutCheck() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(owner);
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            511, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)] // Times per period
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Commit

        vm.expectRevert(KlerosCore.CommitPeriodNotPassed.selector);
        core.passPeriod(disputeID);

        vm.warp(block.timestamp + timesPerPeriod[1]);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.vote);
        core.passPeriod(disputeID);
    }

    function test_castVote() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS - 1); // Draw less to check the require later
        vm.warp(block.timestamp + timesPerPeriod[0]);

        uint256[] memory voteIDs = new uint256[](0);
        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.NotVotePeriod.selector);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ"); // Leave salt empty as not needed

        vm.expectRevert(KlerosCore.DisputeStillDrawing.selector);
        core.passPeriod(disputeID);

        core.draw(disputeID, 1); // Draw the last juror

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.vote);
        core.passPeriod(disputeID); // Vote

        (, , KlerosCore.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);

        assertEq(uint256(period), uint256(KlerosCore.Period.vote), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.EmptyVoteIDs.selector);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        voteIDs = new uint256[](1);
        voteIDs[0] = 0; // Split vote IDs to see how the winner changes
        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.ChoiceOutOfBounds.selector);
        disputeKit.castVote(disputeID, voteIDs, 2 + 1, 0, "XYZ");

        vm.prank(other);
        vm.expectRevert(DisputeKitClassicBase.JurorHasToOwnTheVote.selector);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit IDisputeKit.VoteCast(disputeID, staker1, voteIDs, 2, "XYZ");
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.VoteAlreadyCast.selector);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommited,
            ,
            uint256 choiceCount
        ) = disputeKit.getRoundInfo(disputeID, 0, 2);
        assertEq(winningChoice, 2, "Wrong winning choice");
        assertEq(tied, false, "tied should be false");
        assertEq(totalVoted, 1, "totalVoted should be 1");
        assertEq(totalCommited, 0, "totalCommited should be 0");
        assertEq(choiceCount, 1, "choiceCount should be 1");

        (address account, bytes32 commit, uint256 choice, bool voted) = disputeKit.getVoteInfo(0, 0, 0); // Dispute - Round - VoteID
        assertEq(account, staker1, "Wrong drawn account");
        assertEq(commit, bytes32(0), "Commit should be empty");
        assertEq(choice, 2, "Choice should be 2");
        assertEq(voted, true, "Voted should be true");

        assertEq(disputeKit.isVoteActive(0, 0, 0), true, "Vote should be active"); // Dispute - Round - VoteID

        voteIDs = new uint256[](1);
        voteIDs[0] = 1; // Cast another vote to check the tie.

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit IDisputeKit.VoteCast(disputeID, staker1, voteIDs, 1, "XYZZ");
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZZ");

        (, tied, totalVoted, , , choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 1);
        assertEq(tied, true, "tied should be true");
        assertEq(totalVoted, 2, "totalVoted should be 2");
        assertEq(choiceCount, 1, "choiceCount should be 1 for first choice");

        vm.expectRevert(KlerosCore.VotePeriodNotPassed.selector);
        core.passPeriod(disputeID);

        voteIDs = new uint256[](1);
        voteIDs[0] = 2; // Cast another vote to declare a new winner.

        vm.prank(staker1);
        vm.expectEmit(true, true, true, true);
        emit IDisputeKit.VoteCast(disputeID, staker1, voteIDs, 1, "XYZZ");
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZZ");

        (winningChoice, tied, totalVoted, , , choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 1);
        assertEq(winningChoice, 1, "Wrong winning choice");
        assertEq(tied, false, "tied should be false");
        assertEq(totalVoted, 3, "totalVoted should be 3");
        assertEq(choiceCount, 2, "choiceCount should be 2 for first choice");
        assertEq(disputeKit.areVotesAllCast(disputeID), true, "Votes should all be cast");
    }

    function test_castVote_timeoutCheck() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Votes

        vm.expectRevert(KlerosCore.VotePeriodNotPassed.selector);
        core.passPeriod(disputeID);

        vm.warp(block.timestamp + timesPerPeriod[2]);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealPossible(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.appeal);
        core.passPeriod(disputeID);
    }

    function test_castVote_rulingCheck() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Votes

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZZ");

        (uint256 ruling, bool tied, bool overridden) = disputeKit.currentRuling(disputeID);
        assertEq(ruling, 1, "Wrong ruling");
        assertEq(tied, false, "Not tied");
        assertEq(overridden, false, "Not overridden");
    }

    function test_castVote_quickPassPeriod() public {
        // Change hidden votes in general court
        uint256 disputeID = 0;
        vm.prank(owner);
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            511, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)] // Times per period
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        uint256 YES = 1;
        uint256 salt = 123455678;
        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        bytes32 commit;

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID);

        commit = keccak256(abi.encodePacked(YES, salt));

        vm.prank(staker1);
        disputeKit.castCommit(disputeID, voteIDs, commit);

        (, , , uint256 totalCommited, uint256 nbVoters, uint256 choiceCount) = disputeKit.getRoundInfo(disputeID, 0, 0);
        assertEq(totalCommited, 1, "totalCommited should be 1");
        assertEq(disputeKit.areCommitsAllCast(disputeID), false, "Commits should not all be cast");

        vm.warp(block.timestamp + timesPerPeriod[1]);
        core.passPeriod(disputeID);

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, YES, salt, "XYZ");

        (, , uint256 totalVoted, , , ) = disputeKit.getRoundInfo(disputeID, 0, 0);
        assertEq(totalVoted, 1, "totalVoted should be 1");
        assertEq(disputeKit.areVotesAllCast(disputeID), true, "Every committed vote was cast");

        // Should pass period by counting only committed votes.
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.appeal);
        core.passPeriod(disputeID);
    }

    function test_castVote_differentDK() public {
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        // Create a new DK to check castVote.
        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,address,uint256)",
            owner,
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );

        UUPSProxy proxyDk = new UUPSProxy(address(dkLogic), initDataDk);
        DisputeKitClassic newDisputeKit = DisputeKitClassic(address(proxyDk));

        vm.prank(owner);
        core.addNewDisputeKit(newDisputeKit);

        uint256 newDkID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        bytes memory newExtraData = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, newDkID);

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitEnabled(GENERAL_COURT, newDkID, true);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);
        assertEq(core.isSupported(GENERAL_COURT, newDkID), true, "New DK should be supported by General court");

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        // Create one dispute for the old DK and two disputes for the new DK.
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        uint256 disputeID = 2; // Use the latest dispute for reference. This is the ID in the core contract

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, newDkID, "Wrong DK ID");

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        // Draw jurors for the old DK as well to prepare round.votes array
        core.draw(0, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        // Check that the new DK has the info but not the old one.

        assertEq(disputeKit.coreDisputeIDToActive(disputeID), false, "Should be false for old DK");

        // This is the DK where dispute was created. Core dispute points to index 1 because new DK has two disputes.
        assertEq(newDisputeKit.coreDisputeIDToLocal(disputeID), 1, "Wrong local dispute ID for new DK");
        assertEq(newDisputeKit.coreDisputeIDToActive(disputeID), true, "Should be active for new DK");
        (uint256 numberOfChoices, , bytes memory extraData) = newDisputeKit.disputes(1);
        assertEq(numberOfChoices, 2, "Wrong numberOfChoices in new DK");
        assertEq(extraData, newExtraData, "Wrong extra data");

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        // Deliberately cast votes using the old DK to see if the exception will be caught.
        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.NotActiveForCoreDisputeID.selector);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        // And check the new DK.
        vm.prank(staker1);
        newDisputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommited,
            ,
            uint256 choiceCount
        ) = newDisputeKit.getRoundInfo(disputeID, 0, 2);
        assertEq(winningChoice, 2, "Wrong winning choice");
        assertEq(tied, false, "tied should be false");
        assertEq(totalVoted, 3, "totalVoted should be 3");
        assertEq(totalCommited, 0, "totalCommited should be 0");
        assertEq(choiceCount, 3, "choiceCount should be 3");
    }
}

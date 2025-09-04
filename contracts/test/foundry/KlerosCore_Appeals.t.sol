// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitClassic, DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_AppealsTest
/// @dev Tests for KlerosCore appeal system, funding, and court/DK jumping
contract KlerosCore_AppealsTest is KlerosCore_TestBase {
    function test_appeal_fundOneSide() public {
        uint256 disputeID = 0;
        vm.deal(address(disputeKit), 1 ether);
        vm.deal(staker1, 1 ether);

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
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        (uint256 start, uint256 end) = core.appealPeriod(0);
        assertEq(start, 0, "Appeal period start should be 0");
        assertEq(end, 0, "Appeal period end should be 0");

        // Simulate the call from dispute kit to check the requires unrelated to caller
        vm.prank(address(disputeKit));
        vm.expectRevert(KlerosCore.DisputeNotAppealable.selector);
        core.appeal{value: 0.21 ether}(disputeID, 2, arbitratorExtraData);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealPossible(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.appeal);
        core.passPeriod(disputeID);

        (, , KlerosCore.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);
        (start, end) = core.appealPeriod(0);
        assertEq(uint256(period), uint256(KlerosCore.Period.appeal), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");
        assertEq(core.appealCost(0), 0.21 ether, "Wrong appealCost");
        assertEq(start, lastPeriodChange, "Appeal period start is incorrect");
        assertEq(end, lastPeriodChange + timesPerPeriod[3], "Appeal period end is incorrect");

        vm.expectRevert(KlerosCore.AppealPeriodNotPassed.selector);
        core.passPeriod(disputeID);

        // Simulate the call from dispute kit to check the requires unrelated to caller
        vm.prank(address(disputeKit));
        vm.expectRevert(KlerosCore.AppealFeesNotEnough.selector);
        core.appeal{value: 0.21 ether - 1}(disputeID, 2, arbitratorExtraData);
        vm.deal(address(disputeKit), 0); // Nullify the balance so it doesn't get in the way.

        vm.prank(staker1);
        vm.expectRevert(KlerosCore.DisputeKitOnly.selector);
        core.appeal{value: 0.21 ether}(disputeID, 2, arbitratorExtraData);

        vm.prank(crowdfunder1);
        vm.expectRevert(DisputeKitClassicBase.ChoiceOutOfBounds.selector);
        disputeKit.fundAppeal(disputeID, 3);

        vm.prank(crowdfunder1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.Contribution(disputeID, 0, 1, crowdfunder1, 0.21 ether);
        disputeKit.fundAppeal{value: 0.21 ether}(disputeID, 1); // Fund the losing choice. Total cost will be 0.63 (0.21 + 0.21 * (20000/10000))

        assertEq(crowdfunder1.balance, 9.79 ether, "Wrong balance of the crowdfunder");
        assertEq(address(disputeKit).balance, 0.21 ether, "Wrong balance of the DK");
        assertEq((disputeKit.getFundedChoices(disputeID)).length, 0, "No funded choices");

        vm.prank(crowdfunder1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.Contribution(disputeID, 0, 1, crowdfunder1, 0.42 ether);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.ChoiceFunded(disputeID, 0, 1);
        disputeKit.fundAppeal{value: 5 ether}(disputeID, 1); // Deliberately overpay to check reimburse

        assertEq(crowdfunder1.balance, 9.37 ether, "Wrong balance of the crowdfunder");
        assertEq(address(disputeKit).balance, 0.63 ether, "Wrong balance of the DK");
        assertEq((disputeKit.getFundedChoices(disputeID)).length, 1, "One choice should be funded");
        assertEq((disputeKit.getFundedChoices(disputeID))[0], 1, "Incorrect funded choice");

        vm.prank(crowdfunder1);
        vm.expectRevert(DisputeKitClassicBase.AppealFeeIsAlreadyPaid.selector);
        disputeKit.fundAppeal(disputeID, 1);
    }

    function test_appeal_timeoutCheck() public {
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
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(crowdfunder1);
        vm.expectRevert(DisputeKitClassicBase.AppealPeriodIsOver.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 1);
        core.passPeriod(disputeID);

        (uint256 start, uint256 end) = core.appealPeriod(0);

        vm.prank(crowdfunder1);
        vm.warp(block.timestamp + ((end - start) / 2 + 1));
        vm.expectRevert(DisputeKitClassicBase.AppealPeriodIsOverForLoser.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 1); // Losing choice

        disputeKit.fundAppeal(disputeID, 2); // Winning choice funding should not revert yet

        vm.prank(crowdfunder1);
        vm.warp(block.timestamp + (end - start) / 2); // Warp one more to cover the whole period
        vm.expectRevert(DisputeKitClassicBase.AppealPeriodIsOver.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 2);
    }

    function test_appeal_fullFundingNoJump() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1);

        vm.prank(crowdfunder2);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        assertEq((disputeKit.getFundedChoices(disputeID)).length, 0, "No funded choices in the fresh round");
        (uint256 ruling, bool tied, bool overridden) = disputeKit.currentRuling(disputeID);
        assertEq(ruling, 0, "Should be 0 ruling in the fresh round");
        assertEq(tied, true, "Should be tied");
        assertEq(overridden, false, "Not overridden");

        assertEq(address(disputeKit).balance, 0.84 ether, "Wrong balance of the DK"); // 0.63 + 0.42 - 0.21
        assertEq(address(core).balance, 0.3 ether, "Wrong balance of the core"); // 0.09 arbFee + 0.21 appealFee

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count after appeal");
        assertEq(core.getNumberOfRounds(disputeID), 2, "Wrong number of rounds");

        (, , KlerosCore.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);
        assertEq(uint256(period), uint256(KlerosCore.Period.evidence), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1); // Check the new round
        assertEq(round.pnkAtStakePerJuror, 1000, "Wrong pnkAtStakePerJuror");
        assertEq(round.totalFeesForJurors, 0.21 ether, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, 7, "Wrong nbVotes");

        core.draw(disputeID, 7);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.vote); // Check that we don't have to wait for the timeout to pass the evidence period after appeal
        core.passPeriod(disputeID);
    }

    function test_appeal_fullFundingCourtJumpAndDKJumpToClassic() public {
        // Setup: dk2 supported by court2 with dk2._jumpDisputeKitID == DISPUTE_KIT_CLASSIC
        // Ensure that court2 jumps to GENERAL_COURT and dk2 jumps to DISPUTE_KIT_CLASSIC
        uint256 disputeID = 0;
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        // Create a new DK and court to check the jump
        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,address,uint256)",
            owner,
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );

        UUPSProxy proxyDk = new UUPSProxy(address(dkLogic), initDataDk);
        DisputeKitClassic newDisputeKit = DisputeKitClassic(address(proxyDk));

        uint96 newCourtID = 2;
        uint256 newDkID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        bytes memory newExtraData = abi.encodePacked(uint256(newCourtID), DEFAULT_NB_OF_JURORS, newDkID);

        vm.prank(owner);
        core.addNewDisputeKit(newDisputeKit);
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            3, // jurors for jump. Low number to ensure jump after the first appeal
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Times per period
            sortitionExtraData,
            supportedDK
        );

        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(owner);
        supportedDK = new uint256[](1);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(newCourtID, supportedDK, true);
        assertEq(core.isSupported(newCourtID, newDkID), true, "New DK should be supported by new court");

        vm.prank(staker1);
        core.setStake(newCourtID, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, newDkID, "Wrong DK ID");

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        newDisputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        newDisputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1);

        assertEq(core.isDisputeKitJumping(disputeID), true, "Should be jumping");

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, newCourtID, GENERAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, newDkID, DISPUTE_KIT_CLASSIC);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.DisputeCreation(disputeID, 2, newExtraData);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        newDisputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        (, bool jumped, ) = newDisputeKit.disputes(disputeID);
        assertEq(jumped, true, "jumped should be true");
        assertEq(
            (newDisputeKit.getFundedChoices(disputeID)).length,
            2,
            "No fresh round created so the number of funded choices should be 2"
        );

        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, DISPUTE_KIT_CLASSIC, "Wrong DK ID");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Wrong court ID");

        (, jumped, ) = disputeKit.disputes(disputeID);
        assertEq(jumped, false, "jumped should be false in the DK that dispute jumped to");

        // Check jump modifier
        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToParentDK.selector);
        newDisputeKit.draw(disputeID, 1);

        // And check that draw in the new round works
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Draw(staker1, disputeID, 1, 0); // roundID = 1 VoteID = 0
        core.draw(disputeID, 1);

        (address account, , , ) = disputeKit.getVoteInfo(disputeID, 1, 0);
        assertEq(account, staker1, "Wrong drawn account in the classic DK");
    }

    function test_appeal_fullFundingCourtJumpAndDKJumpToNonClassic() public {
        // Setup:
        // dk2 supported by GENERAL_COURT, which is a non-DISPUTE_KIT_CLASSIC
        // dk3 supported by court2, with dk3._jumpDisputeKitID == dk2
        // Ensure that court2 jumps to GENERAL_COURT and dk3 jumps to dk2
        uint256 disputeID = 0;
        uint96 newCourtID = 2;
        uint256 dkID2 = 2;
        uint256 dkID3 = 3;

        DisputeKitClassic dkLogic = new DisputeKitClassic();

        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,address,uint256)",
            owner,
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );
        UUPSProxy proxyDk2 = new UUPSProxy(address(dkLogic), initDataDk2);
        DisputeKitClassic disputeKit2 = DisputeKitClassic(address(proxyDk2));

        bytes memory initDataDk3 = abi.encodeWithSignature(
            "initialize(address,address,address,uint256)",
            owner,
            address(core),
            address(wNative),
            dkID2
        );
        UUPSProxy proxyDk3 = new UUPSProxy(address(dkLogic), initDataDk3);
        DisputeKitClassic disputeKit3 = DisputeKitClassic(address(proxyDk3));

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit2);
        vm.prank(owner);
        core.addNewDisputeKit(disputeKit3);

        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = dkID3;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            3, // jurors for jump. Low number to ensure jump after the first appeal
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Times per period
            sortitionExtraData,
            supportedDK
        );
        assertEq(core.isSupported(newCourtID, dkID3), true, "dkID3 should be supported by new court");

        vm.prank(owner);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = dkID2;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);
        assertEq(core.isSupported(GENERAL_COURT, dkID2), true, "dkID2 should be supported by GENERAL_COURT");

        bytes memory newExtraData = abi.encodePacked(uint256(newCourtID), DEFAULT_NB_OF_JURORS, dkID3);
        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(staker1);
        core.setStake(newCourtID, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, dkID3, "Wrong DK ID");

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit3.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        disputeKit3.fundAppeal{value: 0.63 ether}(disputeID, 1);

        assertEq(core.isDisputeKitJumping(disputeID), true, "Should be jumping");

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, newCourtID, GENERAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, dkID3, dkID2);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.DisputeCreation(disputeID, 2, newExtraData);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit3.fundAppeal{value: 0.42 ether}(disputeID, 2);

        (, bool jumped, ) = disputeKit3.disputes(disputeID);
        assertEq(jumped, true, "jumped should be true");
        assertEq(
            (disputeKit3.getFundedChoices(disputeID)).length,
            2,
            "No fresh round created so the number of funded choices should be 2"
        );

        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, dkID2, "Wrong DK ID");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Wrong court ID");

        (, jumped, ) = disputeKit2.disputes(disputeID);
        assertEq(jumped, false, "jumped should be false in the DK that dispute jumped to");

        // Check jump modifier
        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToParentDK.selector);
        disputeKit3.draw(disputeID, 1);

        // And check that draw in the new round works
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Draw(staker1, disputeID, 1, 0); // roundID = 1 VoteID = 0
        core.draw(disputeID, 1);

        (address account, , , ) = disputeKit2.getVoteInfo(disputeID, 1, 0);
        assertEq(account, staker1, "Wrong drawn account in the classic DK");
    }

    function test_appeal_quickPassPeriod() public {
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
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3] / 2);

        // Should pass to execution period without waiting for the 2nd half of the appeal.
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.execution);
        core.passPeriod(disputeID);
    }
}

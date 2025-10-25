// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitClassic, DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {DisputeKitClassicMockUncheckedNextRoundSettings} from "../../src/test/DisputeKitClassicMockUncheckedNextRoundSettings.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_AppealsTest
/// @dev Tests for KlerosCore appeal system, funding, and court/DK jumping
contract KlerosCore_AppealsTest is KlerosCore_TestBase {
    /// @dev Test funding appeal for only one side without completing the appeal.
    /// Verifies appeal period calculation, funding mechanics (partial and full), overpayment reimbursement,
    /// and error conditions (cannot appeal before appeal period, insufficient fees, only DK can call appeal).
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

    /// @dev Test appeal period timing constraints for losing vs winning sides.
    /// Verifies losers can only fund appeals in the first half of the appeal period,
    /// while winners can fund anytime until the end of the period.
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
        vm.expectRevert(DisputeKitClassicBase.NotAppealPeriod.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 1);
        core.passPeriod(disputeID);

        (uint256 start, uint256 end) = core.appealPeriod(0);

        vm.prank(crowdfunder1);
        vm.warp(block.timestamp + ((end - start) / 2 + 1));
        vm.expectRevert(DisputeKitClassicBase.NotAppealPeriodForLoser.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 1); // Losing choice

        disputeKit.fundAppeal(disputeID, 2); // Winning choice funding should not revert yet

        vm.prank(crowdfunder1);
        vm.warp(block.timestamp + (end - start) / 2); // Warp one more to cover the whole period
        vm.expectRevert(DisputeKitClassicBase.NotAppealPeriod.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 2);
    }

    /// @dev Test complete appeal funding without court or dispute kit jumping.
    /// Verifies that when both sides fully fund an appeal, a new round is created in the same court
    /// with increased juror count (nbVotes * 2 + 1), and the dispute period transitions to evidence.
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

    /// @dev Test simultaneous court jump and dispute kit jump to DISPUTE_KIT_CLASSIC.
    /// Setup: Dispute starts in Court2 with DK2, where DK2._jumpDisputeKitID == DISPUTE_KIT_CLASSIC.
    /// Verifies dispute jumps from Court2→GENERAL_COURT and DK2→DISPUTE_KIT_CLASSIC on appeal.
    function test_appeal_fullFundingCourtJumpAndDKJumpToClassic() public {
        uint256 disputeID = 0;
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        // Create a new DK and court to check the jump
        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
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

        // NextRoundSettings override - Note that the test should pass even without this override.
        vm.prank(owner);
        newDisputeKit.changeNextRoundSettings(
            newCourtID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: GENERAL_COURT,
                jumpDisputeKitID: DISPUTE_KIT_CLASSIC,
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: 0
            })
        );

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

        (, , , , bool isDisputeKitJumping) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(isDisputeKitJumping, true, "Should be jumping");

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

        (, bool currentRound) = newDisputeKit.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, false, "round should be jumped");
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

        (, currentRound) = disputeKit.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, true, "round should be active in the DK that dispute jumped to");

        // Check jump modifier
        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToAnotherDisputeKit.selector);
        newDisputeKit.draw(disputeID, 1, round.nbVotes);

        // And check that draw in the new round works
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Draw(staker1, disputeID, 1, 0); // roundID = 1 VoteID = 0
        core.draw(disputeID, 1);

        (address account, , , ) = disputeKit.getVoteInfo(disputeID, 1, 0);
        assertEq(account, staker1, "Wrong drawn account in the classic DK");
    }

    /// @dev Test court jump and dispute kit jump to a non-classic dispute kit.
    /// Setup: DK2 supported by GENERAL_COURT, DK3 supported by Court2, with DK3.jumpDisputeKitIDOnCourtJump == DK2.
    /// Verifies dispute jumps from Court2→GENERAL_COURT and DK3→DK2 using jumpDisputeKitIDOnCourtJump setting.
    function test_appeal_fullFundingCourtJumpAndDKJumpToNonClassic() public {
        uint256 disputeID = 0;
        uint96 newCourtID = 2;
        uint256 dkID2 = 2;
        uint256 dkID3 = 3;

        DisputeKitClassic dkLogic = new DisputeKitClassic();

        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyDk2 = new UUPSProxy(address(dkLogic), initDataDk2);
        DisputeKitClassic disputeKit2 = DisputeKitClassic(address(proxyDk2));

        bytes memory initDataDk3 = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
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

        // NextRoundSettings override
        vm.prank(owner);
        disputeKit3.changeNextRoundSettings(
            newCourtID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: 0,
                jumpDisputeKitID: 0,
                jumpDisputeKitIDOnCourtJump: dkID2,
                nbVotes: 0
            })
        );

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

        (, , , , bool isDisputeKitJumping) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(isDisputeKitJumping, true, "Should be jumping");

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

        (, bool currentRound) = disputeKit3.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, false, "round should be jumped");
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

        (, currentRound) = disputeKit2.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, true, "round should be active in the DK that dispute jumped to");

        // Check jump modifier
        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit3.draw(disputeID, 1, round.nbVotes);

        // And check that draw in the new round works
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Draw(staker1, disputeID, 1, 0); // roundID = 1 VoteID = 0
        core.draw(disputeID, 1);

        (address account, , , ) = disputeKit2.getVoteInfo(disputeID, 1, 0);
        assertEq(account, staker1, "Wrong drawn account in the classic DK");
    }

    /// @dev Test dispute jumping between the same dispute kits multiple times across different rounds.
    /// Setup: Court hierarchy GENERAL_COURT→Court2→Court3. DK2 supported by Court2, DK3 supported by Court3.
    /// Verifies correct behavior when dispute oscillates: Court3/DK3 → Court2/DK2 → GENERAL_COURT/DK3,
    /// including local dispute ID tracking and round state management across multiple DK switches.
    function test_appeal_recurringDK() public {
        // Setup: create 2 more courts to facilitate appeal jump. Create 2 more DK.
        // Set General Court as parent to court2, and court2 as parent to court3. dk2 as jump DK for dk3, and dk3 as jump DK for dk2.
        // Ensure DK2 is supported by Court2 and DK3 is supported by court3.
        // Preemptively add DK3 support for General court.

        // Initial dispute starts with Court3, DK3.
        // Jumps to Court2, DK2.
        // Then jumps to General Court, DK3.
        uint256 disputeID = 0;

        uint96 courtID2 = 2;
        uint96 courtID3 = 3;

        uint256 dkID2 = 2;
        uint256 dkID3 = 3;

        DisputeKitClassic dkLogic = new DisputeKitClassic();

        // DK2 creation
        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyDk2 = new UUPSProxy(address(dkLogic), initDataDk2);
        DisputeKitClassic disputeKit2 = DisputeKitClassic(address(proxyDk2));

        vm.prank(owner);
        disputeKit2.changeNextRoundSettings(
            courtID2,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: 0,
                jumpDisputeKitID: 0,
                jumpDisputeKitIDOnCourtJump: dkID3,
                nbVotes: 0
            })
        );

        // DK3 creation
        bytes memory initDataDk3 = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyDk3 = new UUPSProxy(address(dkLogic), initDataDk3);
        DisputeKitClassic disputeKit3 = DisputeKitClassic(address(proxyDk3));

        vm.prank(owner);
        disputeKit3.changeNextRoundSettings(
            courtID3,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: 0,
                jumpDisputeKitID: 0,
                jumpDisputeKitIDOnCourtJump: dkID2,
                nbVotes: 0
            })
        );

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit2);
        vm.prank(owner);
        core.addNewDisputeKit(disputeKit3);

        // Court2 creation
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = dkID2;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            7, // jurors for jump. Minimal number to ensure jump after the first appeal
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Times per period
            sortitionExtraData,
            supportedDK
        );
        assertEq(core.isSupported(courtID2, dkID2), true, "dkID2 should be supported by Court2");

        (uint96 courtParent, , , , , uint256 courtJurorsForCourtJump) = core.courts(courtID2);
        assertEq(courtParent, GENERAL_COURT, "Wrong court parent for court2");
        assertEq(courtJurorsForCourtJump, 7, "Wrong jurors for jump value for court2");

        // Court3 creation
        supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = dkID3;
        vm.prank(owner);
        core.createCourt(
            courtID2,
            hiddenVotes,
            minStake,
            alpha,
            feeForJuror,
            3, // jurors for jump. Minimal number to ensure jump after the first appeal
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Times per period
            sortitionExtraData,
            supportedDK
        );
        assertEq(core.isSupported(courtID3, dkID3), true, "dkID3 should be supported by Court3");

        (courtParent, , , , , courtJurorsForCourtJump) = core.courts(courtID3);
        assertEq(courtParent, courtID2, "Wrong court parent for court3");
        assertEq(courtJurorsForCourtJump, 3, "Wrong jurors for jump value for court3");

        // Enable DK3 on the General Court
        vm.prank(owner);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = dkID3;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);
        assertEq(core.isSupported(GENERAL_COURT, dkID3), true, "dkID3 should be supported by GENERAL_COURT");

        bytes memory newExtraData = abi.encodePacked(uint256(courtID3), DEFAULT_NB_OF_JURORS, dkID3);
        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(staker1);
        core.setStake(courtID3, 20000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        // Round1 //

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, dkID3, "Wrong DK ID");

        assertEq(disputeKit3.coreDisputeIDToLocal(disputeID), 0, "Wrong local dispute ID to core dispute ID");
        assertEq(disputeKit3.getNumberOfRounds(0), 1, "Wrong number of rounds dk3"); // local dispute id
        (, uint256 localRoundID) = disputeKit3.getLocalDisputeRoundID(disputeID, 0);
        assertEq(localRoundID, 0, "Wrong local round ID dk3");

        (bool disputeActive, bool currentRound) = disputeKit3.coreDisputeIDToActive(0);
        assertEq(disputeActive, true, "dispute should be active for dk3");
        assertEq(currentRound, true, "round should be active in dk3");

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

        (, , , , bool isDisputeKitJumping) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(isDisputeKitJumping, true, "Should be jumping");

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, courtID3, courtID2);
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

        // Round2 //

        (disputeActive, currentRound) = disputeKit3.coreDisputeIDToActive(0);
        assertEq(disputeActive, true, "dispute should still be active for dk3");
        assertEq(currentRound, false, "round should be jumped in dk3");
        assertEq(
            (disputeKit3.getFundedChoices(disputeID)).length,
            2,
            "No fresh round created so the number of funded choices should be 2"
        );
        assertEq(disputeKit3.coreDisputeIDToLocal(disputeID), 0, "core to local ID should not change for dk3");
        assertEq(disputeKit3.getNumberOfRounds(0), 1, "Wrong number of rounds dk3"); // local dispute id
        (, localRoundID) = disputeKit3.getLocalDisputeRoundID(disputeID, 0);
        assertEq(localRoundID, 0, "Local round ID should not change dk3");

        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, dkID2, "Wrong DK ID");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, courtID2, "Wrong court ID after jump");

        (disputeActive, currentRound) = disputeKit2.coreDisputeIDToActive(0);
        assertEq(disputeActive, true, "dispute should be active for dk2");
        assertEq(currentRound, true, "round should be active in the DK that dispute jumped to");
        assertEq(disputeKit2.coreDisputeIDToLocal(disputeID), 0, "Wrong local dispute ID to core dispute ID dk2");
        assertEq(disputeKit2.getNumberOfRounds(0), 1, "Wrong number of rounds dk2"); // local dispute id
        (, localRoundID) = disputeKit2.getLocalDisputeRoundID(disputeID, 1);
        assertEq(localRoundID, 0, "Wrong local round ID for dk2");

        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit3.draw(disputeID, 1, round.nbVotes);

        core.draw(disputeID, 7); // New round requires 7 jurors
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        voteIDs = new uint256[](7);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            voteIDs[i] = i;
        }

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit3.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(staker1);
        disputeKit2.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit3.fundAppeal{value: 1.35 ether}(disputeID, 1);

        (, , , , isDisputeKitJumping) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(isDisputeKitJumping, true, "Should be jumping");

        vm.prank(crowdfunder1);
        // appealCost is 0.45. (0.03 * 15)
        disputeKit2.fundAppeal{value: 1.35 ether}(disputeID, 1); // 0.45 + (0.45 * 20000/10000).

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 2, courtID2, GENERAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 2, dkID2, dkID3);
        vm.prank(crowdfunder2);
        disputeKit2.fundAppeal{value: 0.9 ether}(disputeID, 2); // 0.45 + (0.45 * 10000/10000).

        // Round3 //

        (disputeActive, currentRound) = disputeKit2.coreDisputeIDToActive(0);
        assertEq(disputeActive, true, "dispute should still be active for dk2");
        assertEq(currentRound, false, "round should be jumped in dk2");
        assertEq(
            (disputeKit2.getFundedChoices(disputeID)).length,
            2,
            "No fresh round created so the number of funded choices should be 2 for dk2"
        );
        assertEq(
            disputeKit3.getFundedChoices(disputeID).length,
            0,
            "Should be 0 funded choices in dk3 because fresh round"
        );
        assertEq(disputeKit3.coreDisputeIDToLocal(disputeID), 0, "core to local ID should stay the same for dk3");
        assertEq(disputeKit3.getNumberOfRounds(0), 2, "Wrong number of rounds dk3 round3"); // local dispute id
        (, localRoundID) = disputeKit3.getLocalDisputeRoundID(disputeID, 2);
        assertEq(localRoundID, 1, "Wrong local round id for dk3 round3");

        round = core.getRoundInfo(disputeID, 2);
        assertEq(round.disputeKitID, dkID3, "Wrong DK ID");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        (courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Wrong court ID after jump");

        (disputeActive, currentRound) = disputeKit3.coreDisputeIDToActive(0); // local dispute id
        assertEq(disputeActive, true, "dispute should still be active for dk3");
        assertEq(currentRound, true, "round should be active in the DK that dispute jumped to");

        assertEq(
            disputeKit2.coreDisputeIDToLocal(disputeID),
            0,
            "Wrong local dispute ID to core dispute ID dk2 round3"
        );
        assertEq(disputeKit2.getNumberOfRounds(0), 1, "Wrong number of rounds dk2 round3"); // local dispute id
        (, localRoundID) = disputeKit2.getLocalDisputeRoundID(disputeID, 1);
        assertEq(localRoundID, 0, "Wrong local round ID for dk2 round3");

        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit2.draw(disputeID, 1, round.nbVotes);

        core.draw(disputeID, 15); // New round requires 15 jurors
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        voteIDs = new uint256[](15);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            voteIDs[i] = i;
        }

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassicBase.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit2.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(staker1);
        disputeKit3.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.warp(block.timestamp + timesPerPeriod[2]);
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        core.executeRuling(disputeID); // winning choice is 2

        // Appeal Rewards //
        disputeKit3.withdrawFeesAndRewards(disputeID, payable(crowdfunder1), 1); // wrong side, no reward

        vm.expectEmit();
        emit DisputeKitClassicBase.Withdrawal(disputeID, 2, payable(crowdfunder2), 0.84 ether);
        disputeKit3.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 2); // REWARDS

        disputeKit2.withdrawFeesAndRewards(disputeID, payable(crowdfunder1), 1); // wrong DK, no reward

        vm.expectEmit();
        emit DisputeKitClassicBase.Withdrawal(disputeID, 2, payable(crowdfunder2), 1.8 ether);
        disputeKit2.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 2); // REWARDS

        vm.expectRevert(DisputeKitClassicBase.DisputeUnknownInThisDisputeKit.selector);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder1), 1); // wrong DK, no reward

        vm.expectRevert(DisputeKitClassicBase.DisputeUnknownInThisDisputeKit.selector);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 2); // wrong DK, no reward
    }

    /// @dev Test early termination of appeal period when no appeal is funded.
    /// Verifies that the appeal period can be passed before timeout expires when waiting halfway
    /// through the period with no appeal funded, allowing quick transition to execution.
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

    /// @dev Fuzz test for appeal funding with random ruling options and juror vote distributions.
    /// Tests appeal mechanics with varying number of ruling options and different vote choices,
    /// ensuring appeal funding works correctly regardless of the choice configuration.
    function testFuzz_appeal(uint256 numberOfOptions, uint256 choice1, uint256 choice2, uint256 choice3) public {
        uint256 disputeID = 0;

        arbitrable.changeNumberOfRulingOptions(numberOfOptions);

        // Have only 2 options for 3 jurors to create a majority
        vm.assume(choice1 <= numberOfOptions);
        vm.assume(choice2 <= numberOfOptions);
        vm.assume(choice3 <= numberOfOptions); // Will be used for appeal

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        (uint256 numberOfChoices, ) = disputeKit.disputes(disputeID);

        assertEq(numberOfChoices, numberOfOptions, "Wrong numberOfChoices");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        // Split the stakers' votes. The first staker will get VoteID 0 and the second will take the rest.
        core.draw(disputeID, 1);

        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking phase to stake the 2nd voter
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 20000);
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, 2); // Assign leftover votes to staker2

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, choice1, 0, "XYZ"); // Staker1 only got 1 vote because of low stake

        voteIDs = new uint256[](2);
        voteIDs[0] = 1;
        voteIDs[1] = 2;
        vm.prank(staker2);
        disputeKit.castVote(disputeID, voteIDs, choice2, 0, "XYZ");
        core.passPeriod(disputeID); // Appeal

        vm.assume(choice3 != choice2);
        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, choice3); // Fund the losing choice. Total cost will be 0.63 (0.21 + 0.21 * (20000/10000))

        assertEq((disputeKit.getFundedChoices(disputeID)).length, 1, "1 choice should be funded");

        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, choice2); // Fund the winning choice. Total cost will be 0.42 (0.21 + 0.21 * (10000/10000))

        assertEq((disputeKit.getFundedChoices(disputeID)).length, 0, "No funded choices in a fresh round");
    }

    /// @dev Fuzz test for appeal funding with random msg.value amounts.
    /// Verifies overpayment is correctly reimbursed, partial funding is tracked, and the dispute kit
    /// never holds more than the required appeal amount regardless of how much is sent.
    function testFuzz_fundAppeal_msgValue(uint256 appealValue) public {
        uint256 disputeID = 0;

        vm.assume(appealValue <= 10 ether);
        vm.deal(crowdfunder1, 10 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        // Split the stakers' votes. The first staker will get VoteID 0 and the second will take the rest.
        core.draw(disputeID, 1);

        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking phase to stake the 2nd voter
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 20000);
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, 2); // Assign leftover votes to staker2

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ"); // Staker1 only got 1 vote because of low stake

        voteIDs = new uint256[](2);
        voteIDs[0] = 1;
        voteIDs[1] = 2;
        vm.prank(staker2);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");
        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: appealValue}(disputeID, 1); // Fund the losing choice

        if (appealValue >= 0.63 ether) {
            // 0.63 eth is the required amount for losing side.
            assertEq((disputeKit.getFundedChoices(disputeID)).length, 1, "One choice should be funded");
            // Dispute kit shouldn't demand more value than necessary
            assertEq(crowdfunder1.balance, 9.37 ether, "Wrong balance of the crowdfunder");
            assertEq(address(disputeKit).balance, 0.63 ether, "Wrong balance of the DK");
        } else {
            assertEq((disputeKit.getFundedChoices(disputeID)).length, 0, "No choices should be funded");
            assertEq(crowdfunder1.balance, 10 ether - appealValue, "Wrong balance of the crowdfunder");
            assertEq(address(disputeKit).balance, appealValue, "Wrong balance of the DK");
        }
    }

    /// @dev Test that a dispute can jump to a non-parent court using NextRoundSettings.jumpCourtID
    /// and that appealCost() correctly uses the target court's feeForJuror
    function test_appeal_jumpToNonParentCourtWithCostValidation() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;

        // Create Court2 (child of GENERAL_COURT) with feeForJuror = 0.05 ether
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether, // feeForJuror for Court2
            3, // jurorsForCourtJump - low to ensure jump
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Create Court3 (also child of GENERAL_COURT, making it a sibling of Court2) with feeForJuror = 0.07 ether
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent - same as Court2, so they're siblings
            hiddenVotes,
            minStake,
            alpha,
            0.07 ether, // feeForJuror for Court3 - DIFFERENT from Court2
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure Court2's NextRoundSettings to jump to Court3 (a sibling, not parent)
        vm.prank(owner);
        disputeKit.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: court3ID, // Jump to sibling Court3, NOT parent GENERAL_COURT
                jumpDisputeKitID: DISPUTE_KIT_CLASSIC, // Stay with same DK
                jumpDisputeKitIDOnCourtJump: 0, // Not used since jumpDisputeKitID is set
                nbVotes: 0 // Use default formula: currentVotes * 2 + 1
            })
        );

        // Setup: Stake in Court2 and Court3
        vm.prank(staker1);
        core.setStake(court2ID, 20000);
        vm.prank(staker1);
        core.setStake(court3ID, 20000);

        // Create dispute in Court2
        bytes memory court2ExtraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);
        arbitrable.changeArbitratorExtraData(court2ExtraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS); // Draw 3 jurors
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        // Vote
        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal period

        // CRITICAL TEST: Verify appealCost() uses Court3's feeForJuror (0.07 ether), not Court2's (0.05 ether)
        // Expected jurors after appeal: 3 * 2 + 1 = 7
        // Expected cost: 0.07 ether * 7 = 0.49 ether
        uint256 expectedCost = 0.07 ether * 7;
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court3's feeForJuror");

        // Verify that using Court2's cost would NOT be enough
        uint256 court2Cost = 0.05 ether * 7; // 0.35 ether
        assertTrue(court2Cost < expectedCost, "Court2's cost should be less than Court3's cost");

        // Verify getCourtAndDisputeKitJumps predicts the jump correctly
        (uint96 nextCourtID, uint256 nextDisputeKitID, , bool isCourtJumping, bool isDisputeKitJumping) = core
            .getCourtAndDisputeKitJumps(disputeID);
        assertEq(nextCourtID, court3ID, "Should predict jump to Court3");
        assertEq(nextDisputeKitID, DISPUTE_KIT_CLASSIC, "Should stay with DISPUTE_KIT_CLASSIC");
        assertEq(isCourtJumping, true, "Should be court jumping");
        assertEq(isDisputeKitJumping, false, "Should NOT be DK jumping");

        // Fund appeal with correct amount
        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 1.47 ether}(disputeID, 1); // 0.49 + (0.49 * 20000/10000)

        // Verify CourtJump event (NOT to parent GENERAL_COURT, but to sibling Court3)
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, court2ID, court3ID);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.98 ether}(disputeID, 2); // 0.49 + (0.49 * 10000/10000)

        // Verify dispute is now in Court3
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court3ID, "Dispute should now be in Court3");

        // Verify new round has correct number of jurors
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.nbVotes, 7, "New round should have 7 jurors (3 * 2 + 1)");
        assertEq(round.disputeKitID, DISPUTE_KIT_CLASSIC, "DK should still be DISPUTE_KIT_CLASSIC");

        // Verify we can draw jurors in the new court
        core.draw(disputeID, 7);
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.drawnJurors.length, 7, "Should have drawn 7 jurors in Court3");
    }

    /// @dev Test that a dispute can jump multiple levels up the court hierarchy (grandparent)
    function test_appeal_jumpToGrandparentCourtMultiLevel() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint96 court4ID = 4;

        // Create Court2 (child of GENERAL_COURT)
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.04 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Create Court3 (child of Court2)
        vm.prank(owner);
        core.createCourt(
            court2ID, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Create Court4 (child of Court3) - so hierarchy is: GENERAL_COURT -> Court2 -> Court3 -> Court4
        vm.prank(owner);
        core.createCourt(
            court3ID, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.06 ether,
            3, // Low threshold to ensure jump
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure Court4 to jump directly to GENERAL_COURT (skipping Court3 and Court2)
        vm.prank(owner);
        disputeKit.changeNextRoundSettings(
            court4ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: GENERAL_COURT, // Jump to grandparent, skipping Court3 and Court2
                jumpDisputeKitID: DISPUTE_KIT_CLASSIC,
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: 0
            })
        );

        // Stake in Court4 and GENERAL_COURT
        vm.prank(staker1);
        core.setStake(court4ID, 20000);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        // Create dispute in Court4
        bytes memory court4ExtraData = abi.encodePacked(uint256(court4ID), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);
        arbitrable.changeArbitratorExtraData(court4ExtraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.06 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

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

        // Verify appealCost uses GENERAL_COURT's feeForJuror (0.03 ether from base setup)
        uint256 expectedCost = feeForJuror * 7; // 0.03 * 7 = 0.21 ether
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use GENERAL_COURT's feeForJuror");

        // Verify jump prediction
        (uint96 nextCourtID, , , bool isCourtJumping, ) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(nextCourtID, GENERAL_COURT, "Should predict jump to GENERAL_COURT");
        assertEq(isCourtJumping, true, "Should be court jumping");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, court4ID, GENERAL_COURT);
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        // Verify dispute jumped directly to GENERAL_COURT (not to Court3 or Court2)
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Dispute should have jumped directly to GENERAL_COURT");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.nbVotes, 7, "New round should have 7 jurors");
    }

    /// @dev Test that when NextRoundSettings.enabled = false, default parent court jump logic is used
    function test_appeal_disabledNextRoundSettingsFallbackToParent() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;

        // Create Court2 (child of GENERAL_COURT)
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            3,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Create Court3 (sibling of Court2)
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.07 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure Court2's NextRoundSettings with enabled = FALSE
        // This should cause the settings to be ignored and default parent jump logic to apply
        vm.prank(owner);
        disputeKit.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: false, // DISABLED - settings should be ignored
                jumpCourtID: court3ID, // This should be IGNORED
                jumpDisputeKitID: DISPUTE_KIT_CLASSIC,
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: 9 // This should also be IGNORED
            })
        );

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        // Create dispute in Court2
        bytes memory court2ExtraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);
        arbitrable.changeArbitratorExtraData(court2ExtraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

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

        // Verify jump prediction shows parent court (GENERAL_COURT), NOT Court3
        (uint96 nextCourtID, , uint256 nextNbVotes, bool isCourtJumping, ) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(nextCourtID, GENERAL_COURT, "Should jump to parent GENERAL_COURT, not Court3");
        assertEq(isCourtJumping, true, "Should be court jumping");
        assertEq(nextNbVotes, 7, "Should use default formula (3*2+1=7), not custom nbVotes (9)");

        // Verify appealCost uses GENERAL_COURT's feeForJuror (0.03), not Court3's (0.07)
        uint256 expectedCost = feeForJuror * 7; // 0.03 * 7 = 0.21 ether
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use parent court's fee");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, court2ID, GENERAL_COURT); // Jump to GENERAL_COURT, not Court3
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        // Verify dispute jumped to GENERAL_COURT (parent), not Court3
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Dispute should be in GENERAL_COURT (parent), not Court3");

        // Verify nbVotes used default formula, not custom value
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.nbVotes, 7, "Should use default nbVotes (7), not custom (9)");
    }

    /// @dev Test that when jumpCourtID is invalid, the system falls back to staying in current court
    function test_appeal_invalidJumpCourtIDFallback() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 invalidCourtID = 999; // Non-existent court

        // Create Court2 (child of GENERAL_COURT)
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            3,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure Court2's NextRoundSettings with invalid jumpCourtID
        vm.prank(owner);
        disputeKit.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: invalidCourtID, // Invalid court ID - should cause fallback
                jumpDisputeKitID: DISPUTE_KIT_CLASSIC,
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: 0
            })
        );

        // Stake in Court2
        vm.prank(staker1);
        core.setStake(court2ID, 20000);

        // Create dispute in Court2
        bytes memory court2ExtraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);
        arbitrable.changeArbitratorExtraData(court2ExtraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

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

        // Verify jump prediction shows current court (fallback because invalid jumpCourtID)
        (uint96 nextCourtID, , , bool isCourtJumping, ) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(nextCourtID, court2ID, "Should fallback to current court when jumpCourtID is invalid");
        assertEq(isCourtJumping, false, "Should NOT be court jumping");

        // Verify appealCost uses Court2's feeForJuror since staying in Court2
        uint256 expectedCost = 0.05 ether * 7; // 0.35 ether
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use current court's fee");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 1.05 ether}(disputeID, 1); // 0.35 + (0.35 * 20000/10000)

        // No CourtJump event should be emitted since staying in same court
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.7 ether}(disputeID, 2); // 0.35 + (0.35 * 10000/10000)

        // Verify dispute stayed in Court2
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court2ID, "Dispute should still be in Court2");

        // Verify new round has correct number of jurors
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.nbVotes, 7, "New round should have 7 jurors (3 * 2 + 1)");
    }

    /// @dev Test that custom nbVotes in NextRoundSettings is respected and appealCost() calculates correctly
    function test_appeal_jumpCourtWithCustomNbVotes() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint256 customNbVotes = 11; // Custom vote count (not the default 3*2+1=7)

        // Create Court2 (child of GENERAL_COURT)
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            3,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Create Court3 (sibling of Court2)
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.08 ether, // Different feeForJuror for Court3
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure Court2 to jump to Court3 with custom nbVotes
        vm.prank(owner);
        disputeKit.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: court3ID,
                jumpDisputeKitID: DISPUTE_KIT_CLASSIC,
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: customNbVotes // Custom vote count
            })
        );

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);
        vm.prank(staker1);
        core.setStake(court3ID, 20000);

        // Create dispute in Court2
        bytes memory court2ExtraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);
        arbitrable.changeArbitratorExtraData(court2ExtraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

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

        // CRITICAL: Verify appealCost uses Court3's feeForJuror AND custom nbVotes
        // Expected: 0.08 ether * 11 = 0.88 ether
        uint256 expectedCost = 0.08 ether * customNbVotes;
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court3's fee with custom nbVotes");

        // Verify it's NOT using the default formula (which would be 7 votes)
        uint256 defaultFormulaVotes = 3 * 2 + 1; // 7
        uint256 defaultCost = 0.08 ether * defaultFormulaVotes; // 0.56 ether
        assertTrue(expectedCost != defaultCost, "Custom cost should differ from default formula cost");

        // Verify jump prediction
        (uint96 nextCourtID, , uint256 nextNbVotes, bool isCourtJumping, ) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(nextCourtID, court3ID, "Should jump to Court3");
        assertEq(nextNbVotes, customNbVotes, "Should use custom nbVotes");
        assertEq(isCourtJumping, true, "Should be court jumping");

        // Fund and execute appeal with custom vote count cost
        vm.prank(crowdfunder1);
        // Total: 0.88 + (0.88 * 20000/10000) = 0.88 + 1.76 = 2.64 ether
        disputeKit.fundAppeal{value: 2.64 ether}(disputeID, 1);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, court2ID, court3ID);
        vm.prank(crowdfunder2);
        // Total: 0.88 + (0.88 * 10000/10000) = 0.88 + 0.88 = 1.76 ether
        disputeKit.fundAppeal{value: 1.76 ether}(disputeID, 2);

        // Verify dispute jumped to Court3
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court3ID, "Dispute should be in Court3");

        // CRITICAL: Verify new round has custom nbVotes, NOT default (7)
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.nbVotes, customNbVotes, "New round should have custom nbVotes (11)");
        assertEq(round.disputeKitID, DISPUTE_KIT_CLASSIC, "DK should still be DISPUTE_KIT_CLASSIC");

        // Verify we can draw the custom number of jurors
        core.draw(disputeID, customNbVotes);
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.drawnJurors.length, customNbVotes, "Should have drawn custom number of jurors");
    }

    /// @dev Test that custom nbVotes in NextRoundSettings does NOT trigger a court jump
    /// Only the current round's actual drawn jurors should determine court jump, not custom nbVotes
    function test_appeal_customNbVotesDoesNotTriggerCourtJump() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint256 customNbVotes = 9; // Custom vote count that exceeds jurorsForCourtJump

        // Create Court2 with HIGH jurorsForCourtJump threshold
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.06 ether,
            7, // HIGH jurorsForCourtJump threshold
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure NextRoundSettings with custom nbVotes > jurorsForCourtJump
        // But NO explicit jumpCourtID (let default logic decide)
        vm.prank(owner);
        disputeKit.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: 0, // UNDEFINED - use default jump logic
                jumpDisputeKitID: DISPUTE_KIT_CLASSIC,
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: customNbVotes // 9 votes, which is > 7 threshold
            })
        );

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        // Create dispute in Court2 with only 3 jurors (well below threshold of 7)
        bytes memory court2ExtraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);
        arbitrable.changeArbitratorExtraData(court2ExtraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.06 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        core.draw(disputeID, DEFAULT_NB_OF_JURORS); // Draw 3 jurors
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        // CRITICAL TEST: Verify NO court jump occurs
        // Current round has 3 jurors (< 7 threshold) -> should NOT jump
        // Custom nbVotes = 9 (> 7 threshold) -> should NOT affect jump decision
        (uint96 nextCourtID, , uint256 nextNbVotes, bool isCourtJumping, ) = core.getCourtAndDisputeKitJumps(disputeID);
        assertEq(nextCourtID, court2ID, "Should stay in Court2 (no jump)");
        assertEq(isCourtJumping, false, "Should NOT be court jumping despite custom nbVotes > threshold");
        assertEq(nextNbVotes, customNbVotes, "Should use custom nbVotes for next round");

        // Verify appealCost uses Court2's feeForJuror with custom nbVotes
        // Expected: 0.06 ether * 9 = 0.54 ether
        uint256 expectedCost = 0.06 ether * customNbVotes;
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court2's fee with custom nbVotes");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        // Total: 0.54 + (0.54 * 20000/10000) = 0.54 + 1.08 = 1.62 ether
        disputeKit.fundAppeal{value: 1.62 ether}(disputeID, 1);

        // NO CourtJump event should be emitted (staying in same court)
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        // Total: 0.54 + (0.54 * 10000/10000) = 0.54 + 0.54 = 1.08 ether
        disputeKit.fundAppeal{value: 1.08 ether}(disputeID, 2);

        // Verify dispute stayed in Court2
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court2ID, "Dispute should still be in Court2 (no jump occurred)");

        // CRITICAL: Verify new round has custom nbVotes (9), not default (3*2+1=7)
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.nbVotes, customNbVotes, "New round should have custom nbVotes (9)");
        assertEq(round.disputeKitID, DISPUTE_KIT_CLASSIC, "DK should still be DISPUTE_KIT_CLASSIC");

        // Verify we can draw the custom number of jurors in the same court
        core.draw(disputeID, customNbVotes);
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.drawnJurors.length, customNbVotes, "Should have drawn 9 jurors in Court2");
    }

    /// @dev Test that jumpDisputeKitID takes precedence over jumpDisputeKitIDOnCourtJump when both are set
    function test_appeal_jumpDisputeKitIDTakesPrecedenceOverOnCourtJump() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint256 dkID2 = 2;
        uint256 dkID3 = 3;

        // Create DisputeKit2 and DisputeKit3
        DisputeKitClassic dkLogic = new DisputeKitClassic();

        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyDk2 = new UUPSProxy(address(dkLogic), initDataDk2);
        DisputeKitClassic disputeKit2 = DisputeKitClassic(address(proxyDk2));

        bytes memory initDataDk3 = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyDk3 = new UUPSProxy(address(dkLogic), initDataDk3);
        DisputeKitClassic disputeKit3 = DisputeKitClassic(address(proxyDk3));

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit2);
        vm.prank(owner);
        core.addNewDisputeKit(disputeKit3);

        // Create Court2 supporting all 3 DKs
        uint256[] memory supportedDK = new uint256[](3);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = dkID2;
        supportedDK[2] = dkID3;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            3, // Low jurorsForCourtJump to ensure jump
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Create Court3 (sibling of Court2) also supporting all 3 DKs
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // Same parent as Court2 (siblings)
            hiddenVotes,
            minStake,
            alpha,
            0.07 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // CRITICAL: Configure NextRoundSettings with BOTH jumpDisputeKitID and jumpDisputeKitIDOnCourtJump set
        // jumpDisputeKitID should take precedence
        vm.prank(owner);
        disputeKit3.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: court3ID, // Force court jump to Court3
                jumpDisputeKitID: dkID2, // Should be used (takes precedence)
                jumpDisputeKitIDOnCourtJump: dkID3, // Should be IGNORED despite being set
                nbVotes: 0
            })
        );

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);
        vm.prank(staker1);
        core.setStake(court3ID, 20000);

        // Create dispute in Court2 with DisputeKit3
        bytes memory extraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, dkID3);
        arbitrable.changeArbitratorExtraData(extraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        // Verify initial round uses DisputeKit3
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, dkID3, "Initial round should use DisputeKit3");

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

        // CRITICAL TEST: Verify jump prediction shows DK2, NOT DK3
        (uint96 nextCourtID, uint256 nextDisputeKitID, , bool isCourtJumping, bool isDisputeKitJumping) = core
            .getCourtAndDisputeKitJumps(disputeID);
        assertEq(nextCourtID, court3ID, "Should jump to Court3");
        assertEq(nextDisputeKitID, dkID2, "Should jump to DisputeKit2 (jumpDisputeKitID), NOT DisputeKit3");
        assertEq(isCourtJumping, true, "Should be court jumping");
        assertEq(isDisputeKitJumping, true, "Should be DK jumping");

        // Verify appealCost uses Court3's feeForJuror
        uint256 expectedCost = 0.07 ether * 7; // 0.49 ether
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court3's fee");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        disputeKit3.fundAppeal{value: 1.47 ether}(disputeID, 1);

        // Verify events show jump to Court3 and DisputeKit2 (NOT DisputeKit3)
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, court2ID, court3ID);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, dkID3, dkID2); // DK3 -> DK2 (NOT DK3)
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.DisputeCreation(disputeID, 2, extraData);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit3.fundAppeal{value: 0.98 ether}(disputeID, 2);

        // Verify dispute is now in Court3 with DisputeKit2
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court3ID, "Dispute should be in Court3");

        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, dkID2, "New round should use DisputeKit2 (NOT DisputeKit3)");
        assertEq(round.nbVotes, 7, "New round should have 7 jurors");

        // Verify DisputeKit3 is no longer active for this dispute
        (, bool currentRound) = disputeKit3.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, false, "DisputeKit3 should no longer be active");

        // Verify DisputeKit2 is now active
        (, currentRound) = disputeKit2.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, true, "DisputeKit2 should be active");

        // Verify we can draw jurors in the new DK
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Draw(staker1, disputeID, 1, 0);
        core.draw(disputeID, 1);

        (address account, , , ) = disputeKit2.getVoteInfo(disputeID, 1, 0);
        assertEq(account, staker1, "Should have drawn juror in DisputeKit2");
    }

    /// @dev Test that invalid jumpDisputeKitID triggers complete fallback of ALL THREE parameters
    /// Tests KlerosCore._getCompatibleNextRoundSettings() Scenario 1:
    /// if jumpDisputeKitID >= disputeKits.length, then ALL parameters (court, DK, nbVotes)
    /// fallback to current settings, even if other params are valid/custom.
    /// Verifies safety check: newDisputeKitID >= disputeKits.length
    function test_appeal_invalidDisputeKitIDCompleteTripleFallback() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint256 dkID2 = 2;
        uint256 invalidDKID = 999; // Invalid - exceeds disputeKits.length
        uint256 customNbVotes = 11;

        // Create DisputeKit2
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyDk2 = new UUPSProxy(address(dkLogic), initDataDk2);
        DisputeKitClassic disputeKit2 = DisputeKitClassic(address(proxyDk2));

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit2);

        // Create Court2 supporting both DISPUTE_KIT_CLASSIC and DK2
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = dkID2;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Create Court3 (valid target court)
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.07 ether, // Different fee to verify fallback
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure NextRoundSettings with INVALID jumpDisputeKitID
        // Even though jumpCourtID is VALID and nbVotes is CUSTOM, all should fallback
        vm.prank(owner);
        disputeKit2.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: court3ID, // VALID court (should be ignored due to invalid DK)
                jumpDisputeKitID: invalidDKID, // INVALID DK - triggers complete fallback
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: customNbVotes // CUSTOM nbVotes (should be ignored)
            })
        );

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);

        // Create dispute in Court2 with DisputeKit2
        bytes memory extraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, dkID2);
        arbitrable.changeArbitratorExtraData(extraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        core.draw(disputeID, DEFAULT_NB_OF_JURORS); // 3 jurors
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit2.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        // CRITICAL TEST: Verify COMPLETE TRIPLE FALLBACK
        // Despite jumpCourtID being valid (Court3) and nbVotes being custom (11),
        // the invalid jumpDisputeKitID should cause ALL THREE to fallback
        (
            uint96 nextCourtID,
            uint256 nextDisputeKitID,
            uint256 nextNbVotes,
            bool isCourtJumping,
            bool isDisputeKitJumping
        ) = core.getCourtAndDisputeKitJumps(disputeID);

        assertEq(nextCourtID, court2ID, "Court should fallback to current (Court2), not jump to Court3");
        assertEq(nextDisputeKitID, dkID2, "DK should fallback to current (DK2)");
        assertEq(nextNbVotes, 7, "nbVotes should fallback to default (7), not custom (11)");
        assertEq(isCourtJumping, false, "Should NOT be court jumping");
        assertEq(isDisputeKitJumping, false, "Should NOT be DK jumping");

        // Verify appealCost uses Court2's fee (not Court3's), with default nbVotes (not custom)
        uint256 expectedCost = 0.05 ether * 7; // Court2's fee × 7
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court2's fee with default nbVotes");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        disputeKit2.fundAppeal{value: 1.05 ether}(disputeID, 1);

        // NO CourtJump or DisputeKitJump events should be emitted
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit2.fundAppeal{value: 0.7 ether}(disputeID, 2);

        // Verify dispute stayed in Court2 with DK2 and default nbVotes
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court2ID, "Dispute should still be in Court2");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, dkID2, "Should still use DK2");
        assertEq(round.nbVotes, 7, "Should use default nbVotes (7), not custom (11)");

        // Verify we can draw jurors in the same court and DK
        core.draw(disputeID, 7);
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.drawnJurors.length, 7, "Should have drawn 7 jurors");
    }

    /// @dev Test that incompatible DK with target court falls back to DISPUTE_KIT_CLASSIC
    /// Tests KlerosCore._getCompatibleNextRoundSettings():
    /// if target court doesn't support target DK, fallback to DISPUTE_KIT_CLASSIC.
    /// Court jump still happens, but DK and nbVotes fallback.
    /// Verifies compatibility check: !courts[newCourtID].supportedDisputeKits[newDisputeKitID]
    function test_appeal_incompatibleDisputeKitFallbackToClassic() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint256 dkID2 = 2;
        uint256 customNbVotes = 11;

        // Create DisputeKit2
        DisputeKitClassic dkLogic = new DisputeKitClassic();
        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyDk2 = new UUPSProxy(address(dkLogic), initDataDk2);
        DisputeKitClassic disputeKit2 = DisputeKitClassic(address(proxyDk2));

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit2);

        // Create Court2 supporting BOTH DISPUTE_KIT_CLASSIC and DK2
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = dkID2;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            3, // Low threshold to ensure jump
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Create Court3 supporting ONLY DISPUTE_KIT_CLASSIC (NOT DK2)
        supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC; // Only Classic, no DK2!
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.08 ether, // Different fee to verify correct court is used
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Verify Court3 does NOT support DK2
        assertEq(core.isSupported(court3ID, dkID2), false, "Court3 should NOT support DK2");
        assertEq(core.isSupported(court3ID, DISPUTE_KIT_CLASSIC), true, "Court3 should support Classic");

        // Configure NextRoundSettings to jump to Court3 with DK2
        // DK2 is valid but incompatible with Court3
        vm.prank(owner);
        disputeKit2.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: court3ID, // Valid court
                jumpDisputeKitID: dkID2, // Valid DK BUT Court3 doesn't support it
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: customNbVotes // Custom nbVotes (should be overridden)
            })
        );

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);
        vm.prank(staker1);
        core.setStake(court3ID, 20000);

        // Create dispute in Court2 with DisputeKit2
        bytes memory extraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, dkID2);
        arbitrable.changeArbitratorExtraData(extraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        // Verify initial round uses DisputeKit2
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, dkID2, "Initial round should use DK2");

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit2.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        // CRITICAL TEST: Verify PARTIAL FALLBACK
        // Court jump should succeed to Court3
        // But DK should fallback to DISPUTE_KIT_CLASSIC (incompatible)
        // And nbVotes should fallback to default
        (
            uint96 nextCourtID,
            uint256 nextDisputeKitID,
            uint256 nextNbVotes,
            bool isCourtJumping,
            bool isDisputeKitJumping
        ) = core.getCourtAndDisputeKitJumps(disputeID);

        assertEq(nextCourtID, court3ID, "Court should jump to Court3");
        assertEq(nextDisputeKitID, DISPUTE_KIT_CLASSIC, "DK should fallback to DISPUTE_KIT_CLASSIC (not DK2)");
        assertEq(nextNbVotes, 7, "nbVotes should fallback to default (7), not custom (11)");
        assertEq(isCourtJumping, true, "Should be court jumping");
        assertEq(isDisputeKitJumping, true, "Should be DK jumping (DK2 -> Classic)");

        // Verify appealCost uses Court3's fee (court jump succeeds) with default nbVotes
        uint256 expectedCost = 0.08 ether * 7; // Court3's fee × 7
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court3's fee with default nbVotes");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        disputeKit2.fundAppeal{value: 2.4 ether}(disputeID, 1); // 0.56 + (0.56 * 20000/10000)

        // Verify CourtJump AND DisputeKitJump events
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, court2ID, court3ID);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, dkID2, DISPUTE_KIT_CLASSIC);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.DisputeCreation(disputeID, 2, extraData);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit2.fundAppeal{value: 1.6 ether}(disputeID, 2); // 0.56 + (0.56 * 10000/10000)

        // Verify dispute jumped to Court3 with DISPUTE_KIT_CLASSIC
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court3ID, "Dispute should be in Court3");

        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, DISPUTE_KIT_CLASSIC, "New round should use DISPUTE_KIT_CLASSIC (not DK2)");
        assertEq(round.nbVotes, 7, "Should use default nbVotes (7), not custom (11)");

        // Verify DK2 is no longer active
        (, bool currentRound) = disputeKit2.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, false, "DK2 should no longer be active");

        // Verify DISPUTE_KIT_CLASSIC is active
        (, currentRound) = disputeKit.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, true, "DISPUTE_KIT_CLASSIC should be active");

        // Verify we can draw jurors in the new court with Classic DK
        core.draw(disputeID, 7);
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.drawnJurors.length, 7, "Should have drawn 7 jurors in Court3");
    }

    /// @dev Test that jumpCourtID = FORKING_COURT triggers KlerosCore fallback
    /// Uses DisputeKitClassicMockUncheckedNextRoundSettings which returns raw values without
    /// DisputeKitClassicBase's safety logic. This allows testing KlerosCore._getCompatibleNextRoundSettings()
    /// sanity check: if newCourtID == FORKING_COURT, trigger complete fallback.
    /// Verifies complete triple fallback of all three parameters (court, DK, nbVotes).
    function test_appeal_forkingCourtTriggersKlerosCoreFallback() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint256 mockDKID = 2;
        uint256 customNbVotes = 11;

        // Create mock DK that bypasses DisputeKitClassicBase safety logic
        DisputeKitClassicMockUncheckedNextRoundSettings mockDKLogic = new DisputeKitClassicMockUncheckedNextRoundSettings();
        bytes memory initDataMockDK = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyMockDK = new UUPSProxy(address(mockDKLogic), initDataMockDK);
        DisputeKitClassicMockUncheckedNextRoundSettings mockDK = DisputeKitClassicMockUncheckedNextRoundSettings(
            address(proxyMockDK)
        );

        vm.prank(owner);
        core.addNewDisputeKit(mockDK);

        // Create Court2 supporting both DISPUTE_KIT_CLASSIC and mockDK
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = mockDKID;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.06 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure NextRoundSettings with jumpCourtID = FORKING_COURT (0)
        // Mock will pass this raw value to KlerosCore (no interception)
        vm.prank(owner);
        mockDK.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: FORKING_COURT, // 0 - will be passed raw to KlerosCore
                jumpDisputeKitID: mockDKID, // Valid DK (non-zero)
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: customNbVotes // Custom nbVotes (non-zero)
            })
        );

        // Stake in Court2
        vm.prank(staker1);
        core.setStake(court2ID, 20000);

        // Create dispute in Court2 with mockDK
        bytes memory extraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, mockDKID);
        arbitrable.changeArbitratorExtraData(extraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.06 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        core.draw(disputeID, DEFAULT_NB_OF_JURORS); // 3 jurors
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        mockDK.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        // CRITICAL TEST: KlerosCore should detect FORKING_COURT (0) and trigger complete fallback
        // Despite jumpDisputeKitID=mockDKID and nbVotes=11 being valid/custom
        (
            uint96 nextCourtID,
            uint256 nextDisputeKitID,
            uint256 nextNbVotes,
            bool isCourtJumping,
            bool isDisputeKitJumping
        ) = core.getCourtAndDisputeKitJumps(disputeID);

        assertEq(nextCourtID, court2ID, "Court should fallback to current (Court2)");
        assertEq(nextDisputeKitID, mockDKID, "DK should fallback to current (mockDK)");
        assertEq(nextNbVotes, 7, "nbVotes should fallback to default (7), not custom (11)");
        assertEq(isCourtJumping, false, "Should NOT be court jumping");
        assertEq(isDisputeKitJumping, false, "Should NOT be DK jumping");

        // Verify appealCost uses Court2's fee with default nbVotes
        uint256 expectedCost = 0.06 ether * 7; // Court2's fee × 7 (default)
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court2 fee with default nbVotes");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        mockDK.fundAppeal{value: 1.26 ether}(disputeID, 1);

        // NO CourtJump or DisputeKitJump events should be emitted
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        mockDK.fundAppeal{value: 0.84 ether}(disputeID, 2);

        // Verify dispute stayed in Court2 with mockDK and default nbVotes
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court2ID, "Dispute should still be in Court2");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, mockDKID, "Should still use mockDK");
        assertEq(round.nbVotes, 7, "Should use default nbVotes (7), not custom (11)");

        // Verify we can draw jurors
        core.draw(disputeID, 7);
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.drawnJurors.length, 7, "Should have drawn 7 jurors");
    }

    /// @dev Test that jumpDisputeKitID = NULL_DISPUTE_KIT triggers KlerosCore fallback
    /// Uses mock DK to bypass DisputeKitClassicBase safety logic and test KlerosCore sanity check:
    /// if newDisputeKitID == NULL_DISPUTE_KIT, trigger complete fallback.
    /// Verifies complete triple fallback of all three parameters.
    function test_appeal_nullDisputeKitTriggersKlerosCoreFallback() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint256 mockDKID = 2;
        uint256 customNbVotes = 11;

        // Create mock DK
        DisputeKitClassicMockUncheckedNextRoundSettings mockDKLogic = new DisputeKitClassicMockUncheckedNextRoundSettings();
        bytes memory initDataMockDK = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyMockDK = new UUPSProxy(address(mockDKLogic), initDataMockDK);
        DisputeKitClassicMockUncheckedNextRoundSettings mockDK = DisputeKitClassicMockUncheckedNextRoundSettings(
            address(proxyMockDK)
        );

        vm.prank(owner);
        core.addNewDisputeKit(mockDK);

        // Create Court2 and Court3
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = mockDKID;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.08 ether, // Different fee
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure NextRoundSettings with jumpDisputeKitID = NULL_DISPUTE_KIT (0)
        vm.prank(owner);
        mockDK.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: court3ID, // Valid court (non-zero)
                jumpDisputeKitID: NULL_DISPUTE_KIT, // 0 - will be passed raw to KlerosCore
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: customNbVotes // Custom nbVotes (non-zero)
            })
        );

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);

        // Create dispute
        bytes memory extraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, mockDKID);
        arbitrable.changeArbitratorExtraData(extraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID);

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        mockDK.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID);

        // CRITICAL TEST: KlerosCore should detect NULL_DISPUTE_KIT (0) and trigger complete fallback
        (
            uint96 nextCourtID,
            uint256 nextDisputeKitID,
            uint256 nextNbVotes,
            bool isCourtJumping,
            bool isDisputeKitJumping
        ) = core.getCourtAndDisputeKitJumps(disputeID);

        assertEq(nextCourtID, court2ID, "Court should fallback to current (Court2), not Court3");
        assertEq(nextDisputeKitID, mockDKID, "DK should fallback to current (mockDK)");
        assertEq(nextNbVotes, 7, "nbVotes should fallback to default (7), not custom (11)");
        assertEq(isCourtJumping, false, "Should NOT be court jumping");
        assertEq(isDisputeKitJumping, false, "Should NOT be DK jumping");

        // Verify appealCost uses Court2's fee with default nbVotes
        uint256 expectedCost = 0.05 ether * 7; // Court2's fee × 7 (not Court3's 0.08)
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court2 fee");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        mockDK.fundAppeal{value: 1.05 ether}(disputeID, 1);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        mockDK.fundAppeal{value: 0.7 ether}(disputeID, 2);

        // Verify complete fallback
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court2ID, "Should still be in Court2");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, mockDKID, "Should still use mockDK");
        assertEq(round.nbVotes, 7, "Should use default nbVotes (7)");
    }

    /// @dev Test that nbVotes = 0 triggers KlerosCore fallback
    /// Uses mock DK to test KlerosCore sanity check: if newRoundNbVotes == 0, trigger complete fallback.
    /// Verifies complete triple fallback of all three parameters.
    function test_appeal_zeroNbVotesTriggersKlerosCoreFallback() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint256 mockDKID = 2;

        // Create mock DK
        DisputeKitClassicMockUncheckedNextRoundSettings mockDKLogic = new DisputeKitClassicMockUncheckedNextRoundSettings();
        bytes memory initDataMockDK = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyMockDK = new UUPSProxy(address(mockDKLogic), initDataMockDK);
        DisputeKitClassicMockUncheckedNextRoundSettings mockDK = DisputeKitClassicMockUncheckedNextRoundSettings(
            address(proxyMockDK)
        );

        vm.prank(owner);
        core.addNewDisputeKit(mockDK);

        // Create Court2 and Court3
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = mockDKID;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.08 ether,
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            sortitionExtraData,
            supportedDK
        );

        // Configure NextRoundSettings with nbVotes = 0
        vm.prank(owner);
        mockDK.changeNextRoundSettings(
            court2ID,
            DisputeKitClassicBase.NextRoundSettings({
                enabled: true,
                jumpCourtID: court3ID, // Valid court (non-zero)
                jumpDisputeKitID: mockDKID, // Valid DK (non-zero)
                jumpDisputeKitIDOnCourtJump: 0,
                nbVotes: 0 // 0 - will be passed raw to KlerosCore
            })
        );

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);

        // Create dispute
        bytes memory extraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, mockDKID);
        arbitrable.changeArbitratorExtraData(extraData);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.05 ether * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID);

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        mockDK.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID);

        // CRITICAL TEST: KlerosCore should detect nbVotes == 0 and trigger complete fallback
        (
            uint96 nextCourtID,
            uint256 nextDisputeKitID,
            uint256 nextNbVotes,
            bool isCourtJumping,
            bool isDisputeKitJumping
        ) = core.getCourtAndDisputeKitJumps(disputeID);

        assertEq(nextCourtID, court2ID, "Court should fallback to current (Court2), not Court3");
        assertEq(nextDisputeKitID, mockDKID, "DK should fallback to current (mockDK)");
        assertEq(nextNbVotes, 7, "nbVotes should fallback to default (7)");
        assertEq(isCourtJumping, false, "Should NOT be court jumping");
        assertEq(isDisputeKitJumping, false, "Should NOT be DK jumping");

        // Verify appealCost uses Court2's fee
        uint256 expectedCost = 0.05 ether * 7;
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court2 fee");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        mockDK.fundAppeal{value: 1.05 ether}(disputeID, 1);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        mockDK.fundAppeal{value: 0.7 ether}(disputeID, 2);

        // Verify complete fallback
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court2ID, "Should still be in Court2");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, mockDKID, "Should still use mockDK");
        assertEq(round.nbVotes, 7, "Should use default nbVotes (7)");
    }
}

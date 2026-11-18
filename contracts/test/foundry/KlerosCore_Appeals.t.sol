// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore, IArbitratorV2, IArbitrableV2} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitClassic} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {CentralizedKit} from "../../src/arbitration/dispute-kits/CentralizedKit.sol";
import {DisputeKitClassicMockUncheckedNextRoundSettings} from "../../src/test/DisputeKitClassicMockUncheckedNextRoundSettings.sol";
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

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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
        core.appeal{value: 0.21 ether}(disputeID, 2);

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
        core.appeal{value: 0.21 ether - 1}(disputeID, 2);
        vm.deal(address(disputeKit), 0); // Nullify the balance so it doesn't get in the way.

        vm.prank(staker1);
        vm.expectRevert(KlerosCore.DisputeKitOnly.selector);
        core.appeal{value: 0.21 ether}(disputeID, 2);

        vm.prank(crowdfunder1);
        vm.expectRevert(DisputeKitClassic.ChoiceOutOfBounds.selector);
        disputeKit.fundAppeal(disputeID, 3);

        vm.prank(crowdfunder1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassic.Contribution(disputeID, 0, 1, crowdfunder1, 0.21 ether);
        disputeKit.fundAppeal{value: 0.21 ether}(disputeID, 1); // Fund the losing choice. Total cost will be 0.63 (0.21 + 0.21 * (20000/10000))

        assertEq(crowdfunder1.balance, 9.79 ether, "Wrong balance of the crowdfunder");
        assertEq(address(disputeKit).balance, 0.21 ether, "Wrong balance of the DK");
        assertEq((disputeKit.getFundedChoices(disputeID)).length, 0, "No funded choices");

        vm.prank(crowdfunder1);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassic.Contribution(disputeID, 0, 1, crowdfunder1, 0.42 ether);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassic.ChoiceFunded(disputeID, 0, 1);
        disputeKit.fundAppeal{value: 5 ether}(disputeID, 1); // Deliberately overpay to check reimburse

        assertEq(crowdfunder1.balance, 9.37 ether, "Wrong balance of the crowdfunder");
        assertEq(address(disputeKit).balance, 0.63 ether, "Wrong balance of the DK");
        assertEq((disputeKit.getFundedChoices(disputeID)).length, 1, "One choice should be funded");
        assertEq((disputeKit.getFundedChoices(disputeID))[0], 1, "Incorrect funded choice");

        vm.prank(crowdfunder1);
        vm.expectRevert(DisputeKitClassic.AppealFeeIsAlreadyPaid.selector);
        disputeKit.fundAppeal(disputeID, 1);
    }

    function test_appeal_tie() public {
        // Check that both sides have winner multiplier in case of a tie.

        uint256 disputeID = 0;
        vm.deal(address(disputeKit), 1 ether);
        vm.deal(staker1, 1 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        // Don't vote at all to make it a tie.
        vm.warp(block.timestamp + timesPerPeriod[2]);
        core.passPeriod(disputeID); // Appeal

        assertEq(core.appealCost(0), 0.21 ether, "Wrong appealCost");
        (uint256 start, uint256 end) = core.appealPeriod(0);

        // Go to 2nd half to check that both sides can fund.
        vm.warp(block.timestamp + ((end - start) / 2 + 1));

        // And check that appeal period can't be skipped in this case.
        vm.expectRevert(KlerosCore.AppealPeriodNotPassed.selector);
        core.passPeriod(disputeID);

        vm.prank(crowdfunder1);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 1);

        vm.prank(crowdfunder2);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        assertEq((disputeKit.getFundedChoices(disputeID)).length, 0, "No funded choices in the fresh round");
    }

    /// @dev Test appeal period timing constraints for losing vs winning sides.
    /// Verifies losers can only fund appeals in the first half of the appeal period,
    /// while winners can fund anytime until the end of the period.
    function test_appeal_timeoutCheck() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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
        vm.expectRevert(DisputeKitClassic.NotAppealPeriod.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 1);
        core.passPeriod(disputeID);

        (uint256 start, uint256 end) = core.appealPeriod(0);

        vm.prank(crowdfunder1);
        vm.warp(block.timestamp + ((end - start) / 2 + 1));
        vm.expectRevert(DisputeKitClassic.NotAppealPeriodForLoser.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 1); // Losing choice

        disputeKit.fundAppeal(disputeID, 2); // Winning choice funding should not revert yet

        vm.prank(crowdfunder1);
        vm.warp(block.timestamp + (end - start) / 2); // Warp one more to cover the whole period
        vm.expectRevert(DisputeKitClassic.NotAppealPeriod.selector);
        disputeKit.fundAppeal{value: 0.1 ether}(disputeID, 2);
    }

    /// @dev Test complete appeal funding without court or dispute kit jumping.
    /// Verifies that when both sides fully fund an appeal, a new round is created in the same court
    /// with increased juror count (nbVotes * 2 + 1), and the dispute period transitions to evidence.
    function test_appeal_fullFundingNoJump() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        assertEq(
            sortitionModule.disputesWithoutJurors(),
            0,
            "Wrong disputesWithoutJurors count after appeal in the current session"
        );
        assertEq(core.getNumberOfRounds(disputeID), 2, "Wrong number of rounds");

        (, , KlerosCore.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);
        assertEq(uint256(period), uint256(KlerosCore.Period.evidence), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1); // Check the new round
        assertEq(round.pnkAtStakePerJuror, 1000, "Wrong pnkAtStakePerJuror");
        assertEq(round.totalFeesForJurors, 0.21 ether, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, 7, "Wrong nbVotes");

        // Switch to the next drawing session first to make the dispute eligible for drawing.
        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count in the next session");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

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
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );

        TransparentUpgradeableProxy proxyDk = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk);
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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(owner);
        supportedDK = new uint256[](1);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(newCourtID, supportedDK, true);
        assertEq(core.isSupported(newCourtID, newDkID), true, "New DK should be supported by new court");

        vm.prank(staker1);
        core.setStake(newCourtID, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = newCourtID;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        (, uint256 jumpDisputeKitID, ) = newDisputeKit.getNextRoundSettings(disputeID);
        bool isDisputeKitJumping = newDkID != jumpDisputeKitID;
        assertEq(isDisputeKitJumping, true, "Should be jumping");
        assertEq(jumpDisputeKitID, DISPUTE_KIT_CLASSIC, "Wrong jump DK");

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, newCourtID, GENERAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, newDkID, DISPUTE_KIT_CLASSIC);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassic.DisputeCreation(disputeID, 2);
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
        assertEq(
            sortitionModule.disputesWithoutJurors(),
            0,
            "Wrong disputesWithoutJurors count in the current session"
        );
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Wrong court ID");

        (, currentRound) = disputeKit.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, true, "round should be active in the DK that dispute jumped to");

        // Switch to the next drawing session first to make the dispute eligible for drawing.
        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count in the next session");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        // Check jump modifier
        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassic.DisputeJumpedToAnotherDisputeKit.selector);
        newDisputeKit.draw(disputeID, 1, round.nbVotes);

        // And check that draw in the new round works
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Draw(staker1, disputeID, 1, 0); // roundID = 1 VoteID = 0
        core.draw(disputeID, 1);

        (address account, , , ) = disputeKit.getVoteInfo(disputeID, 1, 0);
        assertEq(account, staker1, "Wrong drawn account in the classic DK");
    }

    /// @dev Test court jump and dispute kit jump to a non-classic dispute kit.
    /// Setup: DK2 supported by GENERAL_COURT, DK3 supported by Court2, with DK3.jumpDisputeKitID == DK2.
    /// Verifies dispute jumps from Court2→GENERAL_COURT and DK3→DK2 using jumpDisputeKitID.
    function test_appeal_fullFundingCourtJumpAndDKJumpToNonClassic() public {
        uint256 disputeID = 0;
        uint96 newCourtID = 2;
        uint256 dkID2 = 2;
        uint256 dkID3 = 3;

        DisputeKitClassic dkLogic = new DisputeKitClassic();

        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );
        TransparentUpgradeableProxy proxyDk2 = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk2);
        DisputeKitClassic disputeKit2 = DisputeKitClassic(address(proxyDk2));

        bytes memory initDataDk3 = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            dkID2
        );
        TransparentUpgradeableProxy proxyDk3 = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk3);
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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
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

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = newCourtID;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        (, uint256 jumpDisputeKitID, ) = disputeKit3.getNextRoundSettings(disputeID);
        bool isDisputeKitJumping = dkID3 != jumpDisputeKitID;
        assertEq(isDisputeKitJumping, true, "Should be jumping");
        assertEq(jumpDisputeKitID, dkID2, "Wrong jump DK");

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, newCourtID, GENERAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, dkID3, dkID2);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassic.DisputeCreation(disputeID, 2);
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
        assertEq(
            sortitionModule.disputesWithoutJurors(),
            0,
            "Wrong disputesWithoutJurors count in the current session"
        );
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Wrong court ID");

        (, currentRound) = disputeKit2.coreDisputeIDToActive(disputeID);
        assertEq(currentRound, true, "round should be active in the DK that dispute jumped to");

        // Switch to the next drawing session first to make the dispute eligible for drawing.
        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count in the next session");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        // Check jump modifier
        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassic.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit3.draw(disputeID, 1, round.nbVotes);

        // And check that draw in the new round works
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Draw(staker1, disputeID, 1, 0); // roundID = 1 VoteID = 0
        core.draw(disputeID, 1);

        (address account, , , ) = disputeKit2.getVoteInfo(disputeID, 1, 0);
        assertEq(account, staker1, "Wrong drawn account in the classic DK");
    }

    /// @dev Test court jump and dispute kit jump to Final court.
    function test_appeal_fullFundingCourtJumpAndDKJumpToFinalCourt() public {
        // Create a dispute so the index is not 0.
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");

        uint256 disputeID = 1;

        vm.prank(owner); // lower jurors for jump so we can jump in the next round. Leave the rest untouched.
        core.changeCourtParameters(
            GENERAL_COURT,
            false, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            3, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Times per period
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        (, uint256 jumpDisputeKitID, ) = disputeKit.getNextRoundSettings(disputeID);
        bool isDisputeKitJumping = DISPUTE_KIT_CLASSIC != jumpDisputeKitID;
        assertEq(isDisputeKitJumping, true, "Should be jumping");
        assertEq(jumpDisputeKitID, FINAL_DISPUTE_KIT, "Wrong jump DK");

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, GENERAL_COURT, FINAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, DISPUTE_KIT_CLASSIC, FINAL_DISPUTE_KIT);
        vm.expectEmit(true, true, true, true);
        emit CentralizedKit.DisputeCreation(disputeID, 2);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, FINAL_DISPUTE_KIT, "Wrong DK ID");
        assertEq(round.pnkAtStakePerJuror, 0, "Wrong pnkAtStakePerJuror");
        assertEq(round.totalFeesForJurors, 0, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, 0, "Wrong nbVotes");

        assertEq(address(centralizedKit).balance, 0.21 ether, "Wrong balance of the Centralized Kit");

        // We dont increment dispute counter for Final court.
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        (uint96 courtID, , , , ) = core.disputes(disputeID);

        assertEq(courtID, FINAL_COURT, "Wrong court ID");

        (uint256 ruling, bool ruled, uint256 coreDisputeID, uint256 numberOfChoices) = centralizedKit.disputes(0);
        assertEq(ruling, 0, "Ruling should be empty");
        assertEq(ruled, false, "Not ruled yet");
        assertEq(coreDisputeID, 1, "Wrong core dispute ID");
        assertEq(numberOfChoices, 2, "Wrong numberOfChoices");

        assertEq(centralizedKit.coreDisputeIDToLocal(1), 0, "Wrong local disputeID");

        vm.expectRevert(CentralizedKit.KlerosCoreOnly.selector);
        vm.prank(disputer);
        centralizedKit.createDispute(disputeID, 1, 2);
    }

    function test_appeal_centralizedKitRuling() public {
        // Create a dispute so the index is not 0.
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        uint256 disputeID = 1;

        vm.prank(owner); // lower jurors for jump so we can jump in the next round. Leave the rest untouched.
        core.changeCourtParameters(
            GENERAL_COURT,
            false, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            3, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Times per period
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        (, uint256 jumpDisputeKitID, ) = disputeKit.getNextRoundSettings(disputeID);
        bool isDisputeKitJumping = DISPUTE_KIT_CLASSIC != jumpDisputeKitID;
        assertEq(isDisputeKitJumping, true, "Should be jumping");
        assertEq(jumpDisputeKitID, FINAL_DISPUTE_KIT, "Wrong jump DK");

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, GENERAL_COURT, FINAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, DISPUTE_KIT_CLASSIC, FINAL_DISPUTE_KIT);
        vm.expectEmit(true, true, true, true);
        emit CentralizedKit.DisputeCreation(disputeID, 2);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        // Check that no drawing
        core.draw(disputeID, 10);
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.drawnJurors.length, 0, "Should have 0 drawn jurors");

        vm.expectRevert(CentralizedKit.UnsupportedOperation.selector);
        vm.prank(address(core));
        centralizedKit.draw(disputeID, 1, 7); // CoreDisputeID, nonce, nbVotes

        vm.expectRevert(CentralizedKit.RulerOnly.selector);
        vm.prank(other);
        centralizedKit.giveRuling(disputeID, 1);

        vm.expectRevert(CentralizedKit.DisputeUnknownInThisDisputeKit.selector);
        vm.prank(ruler);
        centralizedKit.giveRuling(0, 1);

        vm.expectRevert(CentralizedKit.RulingOutOfBounds.selector);
        vm.prank(ruler);
        centralizedKit.giveRuling(disputeID, 3);

        vm.expectRevert(CentralizedKit.DisputeUnknownInThisDisputeKit.selector);
        centralizedKit.currentRuling(0);
        vm.expectRevert(CentralizedKit.RulingNotGiven.selector);
        centralizedKit.currentRuling(disputeID);

        vm.expectEmit(true, true, true, true);
        emit CentralizedKit.RulingGiven(disputeID, 1);
        vm.prank(ruler);
        centralizedKit.giveRuling(disputeID, 1);

        vm.expectRevert(CentralizedKit.RulingAlreadyGiven.selector);
        vm.prank(ruler);
        centralizedKit.giveRuling(disputeID, 1);

        (uint256 ruling, bool ruled, , ) = centralizedKit.disputes(0);
        assertEq(ruling, 1, "Incorrect ruling");
        assertEq(ruled, true, "Should be ruled");

        (uint256 currentRuling, bool tied, bool overridden) = centralizedKit.currentRuling(disputeID);
        assertEq(currentRuling, 1, "Incorrect ruling");
        assertEq(tied, false, "Not tied");
        assertEq(overridden, false, "Not overridden");

        (currentRuling, , ) = core.currentRuling(disputeID);
        assertEq(currentRuling, 1, "Incorrect ruling");

        assertEq(address(centralizedKit).balance, 0.21 ether, "Central kit should receive appeal fees");

        vm.expectRevert(CentralizedKit.RulerOnly.selector);
        vm.prank(other);
        centralizedKit.withdrawFees(payable(other), 0.1 ether);

        vm.expectRevert(CentralizedKit.InsufficientBalance.selector);
        vm.prank(ruler);
        centralizedKit.withdrawFees(payable(other), 0.22 ether);

        vm.expectEmit(true, true, true, true);
        emit CentralizedKit.FeesWithdrawn(other, 0.1 ether);
        vm.prank(ruler);
        centralizedKit.withdrawFees(payable(other), 0.1 ether);

        assertEq(other.balance, 0.1 ether, "Wrong balance of the recepient");
    }

    function test_appeal_centralizedKitRuling_execution() public {
        uint256 disputeID = 0;

        vm.prank(owner); // lower jurors for jump so we can jump in the next round. Leave the rest untouched.
        core.changeCourtParameters(
            GENERAL_COURT,
            false, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            3, // jurors for jump
            [uint256(60), uint256(120), uint256(180), uint256(240)], // Times per period
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, GENERAL_COURT, FINAL_COURT);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, DISPUTE_KIT_CLASSIC, FINAL_DISPUTE_KIT);
        vm.expectEmit(true, true, true, true);
        emit CentralizedKit.DisputeCreation(disputeID, 2);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.42 ether}(disputeID, 2);

        vm.warp(block.timestamp + finalCourtTimesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote
        vm.warp(block.timestamp + finalCourtTimesPerPeriod[2]);
        core.passPeriod(disputeID); // Appeal

        assertEq(core.appealCost(disputeID), (2 ** 256 - 2) / 2, "Should be non payable amount");

        vm.warp(block.timestamp + finalCourtTimesPerPeriod[3]);

        // Check that can't move to the next period without ruling.
        vm.expectRevert(CentralizedKit.RulingNotGiven.selector);
        core.passPeriod(disputeID); // Execution

        vm.prank(ruler);
        centralizedKit.giveRuling(disputeID, 2);

        core.passPeriod(disputeID); // Execution

        // Check 0 round
        core.execute(disputeID, 0, 6);
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.sumFeeRewardPaid, 0.09 ether, "Wrong sumFeeRewardPaid");

        // Check that execute in round 1 does nothing
        core.execute(disputeID, 1, 10);
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.repartitions, 0, "Should be 0 repartitions");

        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.RulingExecuted(arbitrable, disputeID, 2); // Winning choice = 2
        vm.expectEmit(true, true, true, true);
        emit IArbitrableV2.Ruling(core, disputeID, 2);
        core.executeRuling(disputeID);

        (, , , bool ruled, ) = core.disputes(disputeID);
        assertEq(ruled, true, "Should be ruled");
    }

    /// @dev Test dispute jumping between the same dispute kits multiple times across different rounds.
    /// Setup: Court hierarchy GENERAL_COURT→Court2→Court3. DK2 supported by Court2, DK3 supported by Court3.
    /// Verifies correct behavior when dispute oscillates: Court3/DK3 → Court2/DK2 → GENERAL_COURT/DK3,
    /// including local dispute ID tracking and round state management across multiple DK switches.
    function test_appeal_recurringDK() public {
        // Setup: create 2 more courts to facilitate appeal jump. Create 2 more DK.
        // Set General Court as parent to court2, and court2 as parent to court3. dk2 as jump DK for dk3, and dk3 as jump DK for dk2.
        // Ensure DK2 is supported by Court2 and DK3 is supported by court3. General court must not support DK2 for the last jump to happen.
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
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            dkID3
        );
        TransparentUpgradeableProxy proxyDk2 = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk2);
        DisputeKitClassic disputeKit2 = DisputeKitClassic(address(proxyDk2));

        // DK3 creation
        bytes memory initDataDk3 = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            dkID2
        );
        TransparentUpgradeableProxy proxyDk3 = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk3);
        DisputeKitClassic disputeKit3 = DisputeKitClassic(address(proxyDk3));

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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );
        assertEq(core.isSupported(courtID2, dkID2), true, "dkID2 should be supported by Court2");

        (uint96 courtParent, , , , ) = core.courts(courtID2);
        assertEq(courtParent, GENERAL_COURT, "Wrong court parent for court2");

        uint256 defaultCourtParamsIndex = 0;
        KlerosCore.AdditionalCourtParams memory courtParams = core.getAdditionalCourtParams(
            courtID2,
            defaultCourtParamsIndex
        );
        assertEq(courtParams.jurorsForCourtJump, 7, "Wrong jurors for jump value for court2");

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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );
        assertEq(core.isSupported(courtID3, dkID3), true, "dkID3 should be supported by Court3");

        (courtParent, , , , ) = core.courts(courtID3);
        assertEq(courtParent, courtID2, "Wrong court parent for court3");

        // Enable DK3 on the General Court
        vm.prank(owner);
        supportedDK = new uint256[](1);
        supportedDK[0] = dkID3;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);
        assertEq(core.isSupported(GENERAL_COURT, dkID3), true, "dkID3 should be supported by GENERAL_COURT");

        bytes memory newExtraData = abi.encodePacked(uint256(courtID3), DEFAULT_NB_OF_JURORS, dkID3);
        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(staker1);
        core.setStake(courtID3, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = courtID3;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        (, uint256 jumpDisputeKitID, ) = disputeKit3.getNextRoundSettings(disputeID);
        bool isDisputeKitJumping = dkID3 != jumpDisputeKitID;
        assertEq(isDisputeKitJumping, true, "Should be jumping");
        assertEq(jumpDisputeKitID, dkID2, "Wrong jump DK");

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtJump(disputeID, 1, courtID3, courtID2);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitJump(disputeID, 1, dkID3, dkID2);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassic.DisputeCreation(disputeID, 2);
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
        assertEq(
            sortitionModule.disputesWithoutJurors(),
            0,
            "Wrong disputesWithoutJurors count in the current session"
        );
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, courtID2, "Wrong court ID after jump");

        (disputeActive, currentRound) = disputeKit2.coreDisputeIDToActive(0);
        assertEq(disputeActive, true, "dispute should be active for dk2");
        assertEq(currentRound, true, "round should be active in the DK that dispute jumped to");
        assertEq(disputeKit2.coreDisputeIDToLocal(disputeID), 0, "Wrong local dispute ID to core dispute ID dk2");
        assertEq(disputeKit2.getNumberOfRounds(0), 1, "Wrong number of rounds dk2"); // local dispute id
        (, localRoundID) = disputeKit2.getLocalDisputeRoundID(disputeID, 1);
        assertEq(localRoundID, 0, "Wrong local round ID for dk2");

        // Switch to the next drawing session first to make the dispute eligible for drawing.
        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count in the next session");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassic.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit3.draw(disputeID, 1, round.nbVotes);

        core.draw(disputeID, 7); // New round requires 7 jurors
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        voteIDs = new uint256[](7);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            voteIDs[i] = i;
        }

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassic.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit3.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        vm.prank(staker1);
        disputeKit2.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.prank(crowdfunder1);
        vm.expectRevert(DisputeKitClassic.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit3.fundAppeal{value: 1.35 ether}(disputeID, 1);

        (, jumpDisputeKitID, ) = disputeKit2.getNextRoundSettings(disputeID);
        isDisputeKitJumping = dkID2 != jumpDisputeKitID;
        assertEq(isDisputeKitJumping, true, "Should be jumping");
        assertEq(jumpDisputeKitID, dkID3, "Wrong jump DK");

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
        assertEq(
            sortitionModule.disputesWithoutJurors(),
            0,
            "Wrong disputesWithoutJurors count in the current session"
        );
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

        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count in the next session");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        vm.prank(address(core));
        vm.expectRevert(DisputeKitClassic.DisputeJumpedToAnotherDisputeKit.selector);
        disputeKit2.draw(disputeID, 1, round.nbVotes);

        core.draw(disputeID, 15); // New round requires 15 jurors
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        voteIDs = new uint256[](15);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            voteIDs[i] = i;
        }

        vm.prank(staker1);
        vm.expectRevert(DisputeKitClassic.DisputeJumpedToAnotherDisputeKit.selector);
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
        emit DisputeKitClassic.Withdrawal(disputeID, 2, payable(crowdfunder2), 0.84 ether);
        disputeKit3.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 2); // REWARDS

        disputeKit2.withdrawFeesAndRewards(disputeID, payable(crowdfunder1), 1); // wrong DK, no reward

        vm.expectEmit();
        emit DisputeKitClassic.Withdrawal(disputeID, 2, payable(crowdfunder2), 1.8 ether);
        disputeKit2.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 2); // REWARDS

        vm.expectRevert(DisputeKitClassic.DisputeUnknownInThisDisputeKit.selector);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder1), 1); // wrong DK, no reward

        vm.expectRevert(DisputeKitClassic.DisputeUnknownInThisDisputeKit.selector);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 2); // wrong DK, no reward
    }

    /// @dev Test early termination of appeal period when no appeal is funded.
    /// Verifies that the appeal period can be passed before timeout expires when waiting halfway
    /// through the period with no appeal funded, allowing quick transition to execution.
    function test_appeal_quickPassPeriod() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        uint256 numberOfChoices = disputeKit.disputes(disputeID);

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

        vm.warp(block.timestamp + stakingDelay);
        jurors[0] = staker2;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        vm.warp(block.timestamp + stakingDelay);
        jurors[0] = staker2;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

    /// @dev Test that when jumpCourtID is invalid, the system falls back to staying in current court
    function test_appeal_invalidJumpCourtIDFallback() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint256 newDkID = 2;
        uint96 invalidCourtID = 999; // Non-existent court

        DisputeKitClassic dkLogic = new DisputeKitClassicMockUncheckedNextRoundSettings();
        // Create a test DK where jump settings can be customized
        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );
        TransparentUpgradeableProxy proxyDk2 = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk2);
        DisputeKitClassicMockUncheckedNextRoundSettings disputeKit2 = DisputeKitClassicMockUncheckedNextRoundSettings(
            address(proxyDk2)
        );

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit2);

        // Create Court2 (child of GENERAL_COURT)
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = newDkID;
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT, // parent
            hiddenVotes,
            minStake,
            alpha,
            0.05 ether,
            3,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        disputeKit2.setJumpCourt(invalidCourtID);
        disputeKit2.setJumpNbVotes(7);

        // Stake in Court2
        vm.prank(staker1);
        core.setStake(court2ID, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = court2ID;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Create dispute in Court2
        bytes memory court2ExtraData = abi.encodePacked(uint256(court2ID), DEFAULT_NB_OF_JURORS, newDkID);
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
        disputeKit2.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        (uint96 newCourtID, , ) = disputeKit2.getNextRoundSettings(disputeID);
        bool isCourtJumping = newCourtID != court2ID;
        assertEq(isCourtJumping, true, "Should be court jumping"); // The jump itself later shouldn't occur because of invalid court ID
        assertEq(newCourtID, invalidCourtID, "Wrong jump court");

        // Verify appealCost uses Court2's feeForJuror since staying in Court2
        uint256 expectedCost = 0.05 ether * 7; // 0.35 ether
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use current court's fee");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        disputeKit2.fundAppeal{value: 1.05 ether}(disputeID, 1); // 0.35 + (0.35 * 20000/10000)

        // No CourtJump event should be emitted since staying in same court
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        disputeKit2.fundAppeal{value: 0.7 ether}(disputeID, 2); // 0.35 + (0.35 * 10000/10000)

        // Verify dispute stayed in Court2
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court2ID, "Dispute should still be in Court2");

        // Verify new round has correct number of jurors
        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.nbVotes, 7, "New round should have 7 jurors (3 * 2 + 1)");
    }

    /// @dev Test the fallback when jumps to Final court with random DK.
    function test_invalidFinalCourtJumpFallback() public {
        uint256 disputeID = 0;
        uint256 newDkID = 2;

        DisputeKitClassic dkLogic = new DisputeKitClassicMockUncheckedNextRoundSettings();
        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );
        TransparentUpgradeableProxy proxyDk2 = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk2);
        DisputeKitClassicMockUncheckedNextRoundSettings disputeKit2 = DisputeKitClassicMockUncheckedNextRoundSettings(
            address(proxyDk2)
        );

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit2);

        vm.prank(owner);
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        disputeKit2.setJumpCourt(FINAL_COURT);
        disputeKit2.setJumpNbVotes(7);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        bytes memory newDKExtradata = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, newDkID);
        arbitrable.changeArbitratorExtraData(newDKExtradata);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.03 ether * DEFAULT_NB_OF_JURORS}("Action");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, newDkID, "Wrong DK ID");

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
        disputeKit2.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        (uint96 newCourtID, , ) = disputeKit2.getNextRoundSettings(disputeID);
        bool isCourtJumping = newCourtID != GENERAL_COURT;
        assertEq(isCourtJumping, true, "Should be court jumping");
        assertEq(newCourtID, FINAL_COURT, "Wrong jump court");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        disputeKit2.fundAppeal{value: 0.63 ether}(disputeID, 1);

        vm.prank(crowdfunder2);
        disputeKit2.fundAppeal{value: 0.42 ether}(disputeID, 2);

        // Verify dispute stayed in General court
        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, GENERAL_COURT, "Dispute should still be in GENERAL");

        // Verify new round has correct number of jurors
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.nbVotes, 7, "New round should have 7 jurors (3 * 2 + 1)");
    }

    /// @dev Test that incompatible DK with target court falls back to DISPUTE_KIT_CLASSIC
    /// if target court doesn't support target DK, fallback to DISPUTE_KIT_CLASSIC.
    /// Court jump still happens, but DK and nbVotes fallback.
    /// Verifies compatibility check: !courts[newCourtID].supportedDisputeKits[newDisputeKitID]
    function test_appeal_incompatibleDisputeKitFallbackToClassic() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint256 dkID2 = 2;
        uint256 dkID3 = 3;
        uint256 customNbVotes = 11;

        // Create DisputeKit2
        DisputeKitClassicMockUncheckedNextRoundSettings dkLogic = new DisputeKitClassicMockUncheckedNextRoundSettings();
        bytes memory initDataDk2 = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            dkID3
        );
        TransparentUpgradeableProxy proxyDk2 = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk2);
        DisputeKitClassicMockUncheckedNextRoundSettings disputeKit2 = DisputeKitClassicMockUncheckedNextRoundSettings(
            address(proxyDk2)
        );

        // DK3 creation
        bytes memory initDataDk3 = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            dkID2
        );
        TransparentUpgradeableProxy proxyDk3 = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk3);
        DisputeKitClassic disputeKit3 = DisputeKitClassic(address(proxyDk3));

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit2);
        vm.prank(owner);
        core.addNewDisputeKit(disputeKit3);

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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        // Create Court3 supporting ONLY DISPUTE_KIT_CLASSIC (NOT DK3)
        supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC; // Only Classic, no DK3!
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            hiddenVotes,
            minStake,
            alpha,
            0.08 ether, // Different fee to verify correct court is used
            5,
            [uint256(60), uint256(120), uint256(180), uint256(240)],
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.prank(owner);
        supportedDK = new uint256[](1);
        supportedDK[0] = dkID3;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        // Verify Court3 does NOT support DK3
        assertEq(core.isSupported(court3ID, dkID3), false, "Court3 should NOT support DK3");
        assertEq(core.isSupported(court3ID, DISPUTE_KIT_CLASSIC), true, "Court3 should support Classic");

        // Configure NextRoundSettings to jump to Court3 with DK3
        // DK3 is valid but incompatible with Court3
        disputeKit2.setJumpCourt(court3ID);
        disputeKit2.setJumpNbVotes(customNbVotes);

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);
        vm.prank(staker1);
        core.setStake(court3ID, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](2);
        uint96[] memory courtIDs = new uint96[](2);

        jurors[0] = staker1;
        jurors[1] = staker1;
        courtIDs[0] = court2ID;
        courtIDs[1] = court3ID;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        (uint96 nextCourtID, uint256 nextDisputeKitID, uint256 nextNbVotes) = disputeKit2.getNextRoundSettings(
            disputeID
        );
        bool isCourtJumping = nextCourtID != court2ID;
        assertEq(isCourtJumping, true, "Should be court jumping");
        assertEq(nextCourtID, court3ID, "Court should jump to Court3");
        assertEq(nextNbVotes, 11, "Wrong nbVotes");

        bool isDisputeKitJumping = dkID2 != nextDisputeKitID;
        assertEq(isDisputeKitJumping, true, "Should be DK jumping");
        assertEq(nextDisputeKitID, dkID3, "Wrong jump DK");

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
        emit DisputeKitClassic.DisputeCreation(disputeID, 2);
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
        // Switch to the next drawing session first to make the dispute eligible for drawing.
        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        core.draw(disputeID, 10); // Use more iterations to see that it's limited at 7.
        round = core.getRoundInfo(disputeID, 1);
        assertEq(round.drawnJurors.length, 7, "Should have drawn 7 jurors in Court3");
    }

    /// @dev Test that nbVotes = 0 triggers KlerosCore fallback
    /// Uses mock DK to test KlerosCore sanity check: if newRoundNbVotes == 0, trigger fallback.
    function test_appeal_zeroNbVotesTriggersKlerosCoreFallback() public {
        uint256 disputeID = 0;
        uint96 court2ID = 2;
        uint96 court3ID = 3;
        uint256 mockDKID = 2;

        // Create mock DK
        DisputeKitClassicMockUncheckedNextRoundSettings mockDKLogic = new DisputeKitClassicMockUncheckedNextRoundSettings();
        bytes memory initDataMockDK = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            mockDKID
        );
        TransparentUpgradeableProxy proxyMockDK = new TransparentUpgradeableProxy(
            address(mockDKLogic),
            owner,
            initDataMockDK
        );
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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        mockDK.setJumpCourt(court3ID);
        mockDK.setJumpNbVotes(0);

        // Stake in courts
        vm.prank(staker1);
        core.setStake(court2ID, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = court2ID;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

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

        // CRITICAL TEST: KlerosCore should detect nbVotes == 0 and trigger fallback

        (uint96 nextCourtID, uint256 nextDisputeKitID, uint256 nextNbVotes) = mockDK.getNextRoundSettings(disputeID);
        assertEq(nextCourtID, court3ID, "Should be Court3");
        assertEq(nextDisputeKitID, mockDKID, "Should be mock DK");
        assertEq(nextNbVotes, 0, "Wrong nbVotes");

        // Verify appealCost uses non-0 nbVotes
        uint256 expectedCost = 0.08 ether * 7;
        assertEq(core.appealCost(disputeID), expectedCost, "appealCost should use Court3 fee with 7 votes");

        // Fund and execute appeal
        vm.prank(crowdfunder1);
        mockDK.fundAppeal{value: 1.68 ether}(disputeID, 1);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.AppealDecision(disputeID, arbitrable);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.evidence);
        vm.prank(crowdfunder2);
        mockDK.fundAppeal{value: 1.12 ether}(disputeID, 2);

        // Verify the fallback

        (uint96 courtID, , , , ) = core.disputes(disputeID);
        assertEq(courtID, court3ID, "Should jump to Court3");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 1);
        assertEq(round.disputeKitID, mockDKID, "Should still use mockDK");
        assertEq(round.nbVotes, 7, "Should use default nbVotes (7)");
    }
}

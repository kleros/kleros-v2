// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {IArbitratorV2} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassicBase.sol";
import {IArbitrableV2} from "../../src/arbitration/arbitrables/ArbitrableExample.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_DisputesTest
/// @dev Tests for KlerosCore dispute creation and management
/// forge-lint: disable-next-item(erc20-unchecked-transfer)
contract KlerosCore_DisputesTest is KlerosCore_TestBase {
    function test_createDispute_eth() public {
        // Create a new court and DK to test non-standard extra data
        uint256 newFee = 0.01 ether;
        uint96 newCourtID = 2;
        uint256 newNbJurors = 4;
        uint256 newDkID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        bytes memory newExtraData = abi.encodePacked(uint256(newCourtID), newNbJurors, newDkID);
        uint256[4] memory newTimesPerPeriod = [uint256(10), uint256(20), uint256(30), uint256(40)];

        vm.prank(owner);
        core.addNewDisputeKit(disputeKit); // Just add the same dk to avoid dealing with initialization
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            newFee, // fee for juror
            50, // jurors for jump
            newTimesPerPeriod,
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.expectRevert(KlerosCore.ArbitrationFeesNotEnough.selector);
        vm.prank(disputer);
        arbitrable.createDispute{value: newFee * newNbJurors - 1}("Action");

        vm.expectRevert(KlerosCore.DisputeKitNotSupportedByCourt.selector);
        vm.prank(disputer);
        arbitrable.createDispute{value: 0.04 ether}("Action");

        vm.prank(owner);
        supportedDK = new uint256[](1);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(newCourtID, supportedDK, true);

        uint256 disputeID = 0;
        uint256 nbChoices = 2;
        vm.prank(disputer);
        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.DisputeCreation(disputeID, nbChoices, newExtraData);
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.DisputeCreation(disputeID, arbitrable);
        arbitrable.createDispute{value: 0.04 ether}("Action");

        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Wrong disputesWithoutJurors count");
        (
            uint96 courtID,
            IArbitrableV2 arbitrated,
            KlerosCore.Period period,
            bool ruled,
            bool executed,
            uint256 lastPeriodChange
        ) = core.disputes(disputeID);

        assertEq(courtID, newCourtID, "Wrong court ID");
        assertEq(address(arbitrated), address(arbitrable), "Wrong arbitrable");
        assertEq(uint256(period), uint256(KlerosCore.Period.evidence), "Wrong period");
        assertEq(ruled, false, "Should not be ruled");
        assertEq(executed, false, "Should not be executed");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, newDkID, "Wrong DK ID");
        assertEq(round.pnkAtStakePerJuror, 4000, "Wrong pnkAtStakePerJuror"); // minStake * alpha / divisor = 2000 * 20000/10000
        assertEq(round.totalFeesForJurors, 0.04 ether, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, 4, "Wrong nbVotes");
        assertEq(round.repartitions, 0, "repartitions should be 0");
        assertEq(round.pnkPenalties, 0, "pnkPenalties should be 0");
        assertEq(round.sumFeeRewardPaid, 0, "sumFeeRewardPaid should be 0");
        assertEq(round.sumPnkRewardPaid, 0, "sumPnkRewardPaid should be 0");
        assertEq(address(round.feeToken), address(0), "feeToken should be 0");
        assertEq(round.drawIterations, 0, "drawIterations should be 0");
        for (uint256 i = 0; i < 4; i++) {
            assertEq(round.timesPerPeriod[i], newTimesPerPeriod[i], "Wrong times per period");
        }

        (uint256 numberOfChoices, bytes memory extraData) = disputeKit.disputes(disputeID);
        assertEq(numberOfChoices, 2, "Wrong numberOfChoices");
        assertEq(extraData, newExtraData, "Wrong extra data");

        (bool dispute, bool currentRound) = disputeKit.coreDisputeIDToActive(0);
        assertEq(dispute, true, "Dispute should be active in this DK");
        assertEq(currentRound, true, "Current round should be active in this DK");

        assertEq(disputeKit.coreDisputeIDToLocal(0), disputeID, "Wrong local disputeID");

        (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommited,
            uint256 nbVoters,
            uint256 choiceCount
        ) = disputeKit.getRoundInfo(0, 0, 0);
        assertEq(winningChoice, 0, "winningChoice should be 0");
        assertEq(tied, true, "tied should be true");
        assertEq(totalVoted, 0, "totalVoted should be 0");
        assertEq(totalCommited, 0, "totalCommited should be 0");
        assertEq(nbVoters, 0, "nbVoters should be 0");
        assertEq(choiceCount, 0, "choiceCount should be 0");
    }

    function test_createDispute_tokens() public {
        feeToken.transfer(disputer, 1 ether);
        vm.prank(disputer);
        feeToken.approve(address(arbitrable), 1 ether);

        vm.expectRevert(KlerosCore.TokenNotAccepted.selector);
        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether);

        vm.prank(owner);
        core.changeAcceptedFeeTokens(feeToken, true);
        vm.prank(owner);
        core.changeCurrencyRates(feeToken, 500, 3);

        vm.expectRevert(KlerosCore.ArbitrationFeesNotEnough.selector);
        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether - 1);

        vm.expectRevert(KlerosCore.TransferFailed.selector);
        vm.prank(address(arbitrable)); // Bypass createDispute in arbitrable to avoid transfer checks there and make the arbitrable call KC directly
        core.createDispute(2, arbitratorExtraData, feeToken, 0.18 ether);

        assertEq(core.arbitrationCost(arbitratorExtraData, feeToken), 0.18 ether, "Wrong token cost");
        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether);

        KlerosCore.Round memory round = core.getRoundInfo(0, 0);
        assertEq(round.totalFeesForJurors, 0.18 ether, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, 3, "Wrong nbVotes");
        assertEq(address(round.feeToken), address(feeToken), "Wrong feeToken");

        assertEq(feeToken.balanceOf(address(core)), 0.18 ether, "Wrong token balance of the core");
        assertEq(feeToken.balanceOf(disputer), 0.82 ether, "Wrong token balance of the disputer");
    }

    function testFuzz_createDispute_msgValue(uint256 disputeValue) public {
        uint256 disputeID = 0;
        uint256 arbitrationCost = core.arbitrationCost(arbitratorExtraData);

        // Cap it to 10 eth, so the number of jurors is not astronomical.
        vm.assume(disputeValue >= arbitrationCost && disputeValue <= 10 ether);
        vm.deal(disputer, 10 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);
        vm.prank(disputer);
        arbitrable.createDispute{value: disputeValue}("Action");

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.totalFeesForJurors, disputeValue, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, disputeValue / feeForJuror, "Wrong nbVotes");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, disputeValue / feeForJuror);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](disputeValue / feeForJuror);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            voteIDs[i] = i;
        }

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit IArbitrableV2.Ruling(IArbitratorV2(address(core)), disputeID, 1);
        core.executeRuling(disputeID);
    }
}

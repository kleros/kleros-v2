// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCoreBase} from "../../src/arbitration/KlerosCoreBase.sol";
import {SortitionModuleBase} from "../../src/arbitration/SortitionModuleBase.sol";
import {DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassicBase.sol";
import {IArbitratorV2, IArbitrableV2} from "../../src/arbitration/KlerosCoreBase.sol";
import {IERC20} from "../../src/libraries/SafeERC20.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_ExecutionTest
/// @dev Tests for KlerosCore execution, rewards, and ruling finalization
contract KlerosCore_ExecutionTest is KlerosCore_TestBase {
    function test_execute() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1500);
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

        vm.expectRevert(KlerosCoreBase.NotExecutionPeriod.selector);
        core.execute(disputeID, 0, 1);

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.prank(owner);
        core.pause();
        vm.expectRevert(KlerosCoreBase.WhenNotPausedOnly.selector);
        core.execute(disputeID, 0, 1);
        vm.prank(owner);
        core.unpause();

        assertEq(disputeKit.getCoherentCount(disputeID, 0), 2, "Wrong coherent count");

        uint256 pnkCoherence;
        uint256 feeCoherence;
        // dispute, round, voteID, feeForJuror (not used in classic DK), pnkPerJuror (not used in classic DK)
        (pnkCoherence, feeCoherence) = disputeKit.getDegreeOfCoherenceReward(disputeID, 0, 0, 0, 0);
        assertEq(pnkCoherence, 0, "Wrong reward pnk coherence 0 vote ID");
        assertEq(feeCoherence, 0, "Wrong reward fee coherence 0 vote ID");

        (pnkCoherence, feeCoherence) = disputeKit.getDegreeOfCoherenceReward(disputeID, 0, 1, 0, 0);
        assertEq(pnkCoherence, 10000, "Wrong reward pnk coherence 1 vote ID");
        assertEq(feeCoherence, 10000, "Wrong reward fee coherence 1 vote ID");

        (pnkCoherence, feeCoherence) = disputeKit.getDegreeOfCoherenceReward(disputeID, 0, 2, 0, 0);
        assertEq(pnkCoherence, 10000, "Wrong reward pnk coherence 2 vote ID");
        assertEq(feeCoherence, 10000, "Wrong reward fee coherence 2 vote ID");

        assertEq(disputeKit.getDegreeOfCoherencePenalty(disputeID, 0, 0, 0, 0), 0, "Wrong penalty coherence 0 vote ID");
        assertEq(
            disputeKit.getDegreeOfCoherencePenalty(disputeID, 0, 1, 0, 0),
            10000,
            "Wrong penalty coherence 1 vote ID"
        );
        assertEq(
            disputeKit.getDegreeOfCoherencePenalty(disputeID, 0, 2, 0, 0),
            10000,
            "Wrong penalty coherence 2 vote ID"
        );

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker1, 1000, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker1, disputeID, 0, 0, -int256(1000), 0, IERC20(address(0)));
        // Check iterations for the winning staker to see the shifts
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker2, 0, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker2, disputeID, 0, 10000, 0, 0, IERC20(address(0)));
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker2, 0, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker2, disputeID, 0, 10000, 0, 0, IERC20(address(0)));
        core.execute(disputeID, 0, 3); // Do 3 iterations to check penalties first

        (uint256 totalStaked, uint256 totalLocked, , ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 500, "totalStaked should be penalized"); // 1500 - 1000
        assertEq(totalLocked, 0, "Tokens should be released for staker1");
        (, totalLocked, , ) = sortitionModule.getJurorBalance(staker2, GENERAL_COURT);
        assertEq(totalLocked, 2000, "Tokens should still be locked for staker2");

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 3, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker1, 0, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker1, disputeID, 0, 0, 0, 0, IERC20(address(0)));
        // Check iterations for the winning staker to see the shifts
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker2, 1000, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker2, disputeID, 0, 10000, 500, 0.045 ether, IERC20(address(0)));
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeLocked(staker2, 1000, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker2, disputeID, 0, 10000, 500, 0.045 ether, IERC20(address(0)));
        core.execute(disputeID, 0, 10); // Finish the iterations. We need only 3 but check that it corrects the count.

        (, totalLocked, , ) = sortitionModule.getJurorBalance(staker2, GENERAL_COURT);
        assertEq(totalLocked, 0, "Tokens should be unlocked for staker2");

        round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 6, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0.09 ether, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 1000, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 0, "Wrong balance of the core");
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(staker2.balance, 0.09 ether, "Wrong balance of the staker2");

        assertEq(pinakion.balanceOf(address(core)), 21500, "Wrong token balance of the core"); // Was 21500. 1000 was transferred to staker2
        assertEq(pinakion.balanceOf(staker1), 999999999999998500, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(staker2), 999999999999980000, "Wrong token balance of staker2"); // 20k stake and 1k added as a reward, thus -19k from the default
    }

    function test_execute_NoCoherence() public {
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

        vm.warp(block.timestamp + timesPerPeriod[2]); // Don't vote at all so no one is coherent
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        assertEq(disputeKit.getCoherentCount(disputeID, 0), 0, "Wrong coherent count");

        uint256 pnkCoherence;
        uint256 feeCoherence;
        // dispute, round, voteID, feeForJuror (not used in classic DK), pnkPerJuror (not used in classic DK)
        (pnkCoherence, feeCoherence) = disputeKit.getDegreeOfCoherenceReward(disputeID, 0, 0, 0, 0);
        assertEq(pnkCoherence, 0, "Wrong reward pnk coherence 0 vote ID");
        assertEq(feeCoherence, 0, "Wrong reward fee coherence 0 vote ID");

        (pnkCoherence, feeCoherence) = disputeKit.getDegreeOfCoherenceReward(disputeID, 0, 1, 0, 0);
        assertEq(pnkCoherence, 0, "Wrong reward pnk coherence 1 vote ID");
        assertEq(feeCoherence, 0, "Wrong reward fee coherence 1 vote ID");

        (pnkCoherence, feeCoherence) = disputeKit.getDegreeOfCoherenceReward(disputeID, 0, 2, 0, 0);
        assertEq(pnkCoherence, 0, "Wrong reward pnk coherence 2 vote ID");
        assertEq(feeCoherence, 0, "Wrong reward fee coherence 2 vote ID");

        assertEq(disputeKit.getDegreeOfCoherencePenalty(disputeID, 0, 0, 0, 0), 0, "Wrong penalty coherence 0 vote ID");
        assertEq(disputeKit.getDegreeOfCoherencePenalty(disputeID, 0, 1, 0, 0), 0, "Wrong penalty coherence 1 vote ID");
        assertEq(disputeKit.getDegreeOfCoherencePenalty(disputeID, 0, 2, 0, 0), 0, "Wrong penalty coherence 2 vote ID");

        uint256 ownerBalance = owner.balance;
        uint256 ownerTokenBalance = pinakion.balanceOf(owner);

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.LeftoverRewardSent(disputeID, 0, 3000, 0.09 ether, IERC20(address(0)));
        core.execute(disputeID, 0, 3);

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.pnkPenalties, 3000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 0, "Wrong balance of the core");
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(owner.balance, ownerBalance + 0.09 ether, "Wrong balance of the owner");

        assertEq(pinakion.balanceOf(address(core)), 17000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999980000, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(owner), ownerTokenBalance + 3000, "Wrong token balance of owner");
    }

    function test_execute_UnstakeInactive() public {
        // Create a 2nd court so unstaking is done in multiple courts.
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

        uint256 disputeID = 0;
        uint96 newCourtID = 2;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(staker1);
        core.setStake(newCourtID, 20000);
        (, , , uint256 nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(nbCourts, 2, "Wrong number of courts");

        assertEq(pinakion.balanceOf(address(core)), 40000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999960000, "Wrong token balance of staker1");

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        sortitionModule.passPhase(); // Staking phase. Change to staking so we don't have to deal with delayed stakes.

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        vm.warp(block.timestamp + timesPerPeriod[2]); // Don't vote at all so no one is coherent
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        uint256 ownerTokenBalance = pinakion.balanceOf(owner);

        // Note that these events are emitted only after the first iteration of execute() therefore the juror has been penalized only for 1000 PNK her.
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, newCourtID, 0, 19000); // Starting with 40000 we first nullify the stake and remove 20000 and then remove penalty once since there was only first iteration (40000 - 20000 - 1000)
        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 0, 2000); // 2000 PNK should remain in balance to cover penalties since the first 1000 of locked pnk was already unlocked
        core.execute(disputeID, 0, 3);

        assertEq(pinakion.balanceOf(address(core)), 0, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999997000, "Wrong token balance of staker1"); // 3000 locked PNK was withheld by the contract and given to owner.
        assertEq(pinakion.balanceOf(owner), ownerTokenBalance + 3000, "Wrong token balance of owner");

        (, , , nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(nbCourts, 0, "Should unstake from all courts");
    }

    function test_execute_UnstakeInsolvent() public {
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);

        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        (uint256 totalStaked, uint256 totalLocked, , uint256 nbCourts) = sortitionModule.getJurorBalance(
            staker1,
            GENERAL_COURT
        );
        assertEq(totalStaked, 1000, "Wrong totalStaked");
        assertEq(totalLocked, 3000, "totalLocked should exceed totalStaked"); // Juror only staked 1000 but was drawn 3x of minStake (3000 locked)
        assertEq(nbCourts, 1, "Wrong number of courts");

        sortitionModule.passPhase(); // Staking phase. Change to staking so we don't have to deal with delayed stakes.

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ"); // 1 incoherent vote should make the juror insolvent

        voteIDs = new uint256[](2);
        voteIDs[0] = 1;
        voteIDs[1] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.StakeSet(staker1, GENERAL_COURT, 0, 0); // Juror should have no stake left and should be unstaked from the court automatically.
        core.execute(disputeID, 0, 6);

        assertEq(pinakion.balanceOf(address(core)), 0, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "Wrong token balance of staker1"); // The juror should have his penalty back as a reward

        (, , , nbCourts) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(nbCourts, 0, "Should unstake from all courts");
    }

    function test_execute_withdrawLeftoverPNK() public {
        // Return the previously locked tokens
        uint256 disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 1000);
        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        sortitionModule.passPhase(); // Staking. Pass the phase so the juror can unstake before execution

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0); // Set stake to 0 to check if it will be withdrawn later.

        (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts) = sortitionModule
            .getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1000, "Wrong amount staked");
        assertEq(totalLocked, 3000, "Wrong amount locked");
        assertEq(stakedInCourt, 0, "Should be unstaked");
        assertEq(nbCourts, 0, "Should be 0 courts");

        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");

        vm.expectRevert(SortitionModuleBase.NotEligibleForWithdrawal.selector);
        sortitionModule.withdrawLeftoverPNK(staker1);

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.LeftoverPNK(staker1, 1000);
        core.execute(disputeID, 0, 6);

        (totalStaked, totalLocked, , ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 1000, "Wrong amount staked");
        assertEq(totalLocked, 0, "Should be fully unlocked");

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.pnkPenalties, 0, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0.09 ether, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid"); // No penalty so no rewards in pnk

        // Execute() shouldn't withdraw the tokens.
        assertEq(pinakion.balanceOf(address(core)), 1000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 999999999999999000, "Wrong token balance of staker1");

        vm.expectRevert(KlerosCoreBase.SortitionModuleOnly.selector);
        vm.prank(owner);
        core.transferBySortitionModule(staker1, 1000);

        vm.expectEmit(true, true, true, true);
        emit SortitionModuleBase.LeftoverPNKWithdrawn(staker1, 1000);
        sortitionModule.withdrawLeftoverPNK(staker1);

        (totalStaked, , , ) = sortitionModule.getJurorBalance(staker1, GENERAL_COURT);
        assertEq(totalStaked, 0, "Should be unstaked fully");

        // Check that everything is withdrawn now
        assertEq(pinakion.balanceOf(address(core)), 0, "Core balance should be empty");
        assertEq(pinakion.balanceOf(staker1), 1 ether, "All PNK should be withdrawn");
    }

    function test_execute_feeToken() public {
        uint256 disputeID = 0;

        feeToken.transfer(disputer, 1 ether);
        vm.prank(disputer);
        feeToken.approve(address(arbitrable), 1 ether);

        vm.prank(owner);
        core.changeAcceptedFeeTokens(feeToken, true);
        vm.prank(owner);
        core.changeCurrencyRates(feeToken, 500, 3);

        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
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
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ"); // Staker1 only got 1 vote because of low stake

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        // Check only once per penalty and per reward
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker1, disputeID, 0, 10000, 0, 0, feeToken);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.TokenAndETHShift(staker1, disputeID, 0, 10000, 0, 0.06 ether, feeToken);
        core.execute(disputeID, 0, 6);

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.sumFeeRewardPaid, 0.18 ether, "Wrong sumFeeRewardPaid");

        assertEq(feeToken.balanceOf(address(core)), 0, "Wrong fee token balance of the core");
        assertEq(feeToken.balanceOf(staker1), 0.18 ether, "Wrong fee token balance of staker1");
        assertEq(feeToken.balanceOf(disputer), 0.82 ether, "Wrong fee token balance of disputer");
    }

    function test_execute_NoCoherence_feeToken() public {
        uint256 disputeID = 0;

        feeToken.transfer(disputer, 1 ether);
        vm.prank(disputer);
        feeToken.approve(address(arbitrable), 1 ether);

        vm.prank(owner);
        core.changeAcceptedFeeTokens(feeToken, true);
        vm.prank(owner);
        core.changeCurrencyRates(feeToken, 500, 3);

        vm.prank(disputer);
        arbitrable.createDispute("Action", 0.18 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        vm.warp(block.timestamp + timesPerPeriod[2]); // Don't vote at all so no one is coherent
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.LeftoverRewardSent(disputeID, 0, 3000, 0.18 ether, feeToken);
        core.execute(disputeID, 0, 10); // Put more iterations to check that they're capped

        KlerosCoreBase.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.pnkPenalties, 3000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid");
        assertEq(round.repartitions, 3, "Wrong repartitions");

        assertEq(feeToken.balanceOf(address(core)), 0, "Wrong token balance of the core");
        assertEq(feeToken.balanceOf(staker1), 0, "Wrong token balance of staker1");
        assertEq(feeToken.balanceOf(disputer), 0.82 ether, "Wrong token balance of disputer");
        assertEq(feeToken.balanceOf(owner), 0.18 ether, "Wrong token balance of owner");
    }

    function test_executeRuling() public {
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

        vm.expectRevert(KlerosCoreBase.NotExecutionPeriod.selector);
        core.executeRuling(disputeID);

        vm.warp(block.timestamp + timesPerPeriod[3]);
        vm.expectEmit(true, true, true, true);
        emit KlerosCoreBase.NewPeriod(disputeID, KlerosCoreBase.Period.execution);
        core.passPeriod(disputeID); // Execution

        (, , KlerosCoreBase.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);
        assertEq(uint256(period), uint256(KlerosCoreBase.Period.execution), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        vm.expectRevert(KlerosCoreBase.DisputePeriodIsFinal.selector);
        core.passPeriod(disputeID);

        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.Ruling(arbitrable, disputeID, 2); // Winning choice = 2
        vm.expectEmit(true, true, true, true);
        emit IArbitrableV2.Ruling(core, disputeID, 2);
        core.executeRuling(disputeID);

        vm.expectRevert(KlerosCoreBase.RulingAlreadyExecuted.selector);
        core.executeRuling(disputeID);

        (, , , bool ruled, ) = core.disputes(disputeID);
        assertEq(ruled, true, "Should be ruled");
    }

    function test_executeRuling_appealSwitch() public {
        // Check that the ruling switches if only one side was funded
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
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1); // Fund the losing choice

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.Ruling(arbitrable, disputeID, 1); // Winning choice is switched to 1
        vm.expectEmit(true, true, true, true);
        emit IArbitrableV2.Ruling(core, disputeID, 1);
        core.executeRuling(disputeID);

        (uint256 ruling, bool tied, bool overridden) = disputeKit.currentRuling(disputeID);
        assertEq(ruling, 1, "Wrong ruling");
        assertEq(tied, false, "Not tied");
        assertEq(overridden, true, "Should be overridden");
    }

    function test_withdrawFeesAndRewards() public {
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
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1); // Fund the losing choice. The ruling will be overridden here
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.41 ether}(disputeID, 2); // Underpay a bit to not create an appeal and withdraw the funded sum fully

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectRevert(DisputeKitClassicBase.DisputeNotResolved.selector);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(staker1), 0, 1);

        core.executeRuling(disputeID);

        vm.prank(owner);
        core.pause();
        vm.expectRevert(DisputeKitClassicBase.CoreIsPaused.selector);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(staker1), 0, 1);
        vm.prank(owner);
        core.unpause();

        assertEq(crowdfunder1.balance, 9.37 ether, "Wrong balance of the crowdfunder1");
        assertEq(crowdfunder2.balance, 9.59 ether, "Wrong balance of the crowdfunder2");
        assertEq(address(disputeKit).balance, 1.04 ether, "Wrong balance of the DK");

        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.Withdrawal(disputeID, 0, 1, crowdfunder1, 0.63 ether);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder1), 0, 1);

        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassicBase.Withdrawal(disputeID, 0, 2, crowdfunder2, 0.41 ether);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 0, 2);

        assertEq(crowdfunder1.balance, 10 ether, "Wrong balance of the crowdfunder1");
        assertEq(crowdfunder2.balance, 10 ether, "Wrong balance of the crowdfunder2");
        assertEq(address(disputeKit).balance, 0, "Wrong balance of the DK");
    }
}

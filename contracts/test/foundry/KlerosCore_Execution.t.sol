// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {SortitionModule} from "../../src/arbitration/SortitionModule.sol";
import {DisputeKitClassic} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {IArbitratorV2, IArbitrableV2} from "../../src/arbitration/KlerosCore.sol";
import {IERC20} from "../../src/libraries/SafeERC20.sol";
import {console} from "forge-std/console.sol";
import {MaliciousArbitrableMock} from "../../src/test/MaliciousArbitrableMock.sol";
import {MaliciousDisputeKitMock} from "../../src/test/MaliciousDisputeKitMock.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_ExecutionTest
/// @dev Tests for KlerosCore execution, rewards, and ruling finalization
/// forge-lint: disable-next-item(erc20-unchecked-transfer)
contract KlerosCore_ExecutionTest is KlerosCore_TestBase {
    function test_execute() public {
        uint256 disputeID = 0;

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

        vm.expectRevert(KlerosCore.NotExecutionPeriod.selector);
        core.execute(disputeID, 0, 1);

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeLocked(staker1, 1000, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.JurorRewardPenalty(staker1, disputeID, 0, -int256(1000), 0); // penalties
        // Check iterations for the winning staker to see the shifts
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeLocked(staker2, 1000, true);
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeLocked(staker2, 1000, true);
        core.execute(disputeID, 0, 3); // Do 3 iterations to check penalties first

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);

        assertEq(totalStaked, 2000, "totalStaked should be unchanged");
        assertEq(totalLocked, 0, "Tokens should be released for staker1");

        (, totalLocked) = sortitionModule.getJurorBalance(staker2);

        assertEq(totalLocked, 0, "Tokens should be unlocked for staker2");
        assertEq(core.balances(staker1), 1 ether - 1000, "Wrong internal token balance of staker1"); // Should be penalized

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 3, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");

        // Check iterations for the winning staker to see the shifts
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.JurorRewardPenalty(staker2, disputeID, 0, 500, 0.045 ether); // rewards
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.JurorRewardPenalty(staker2, disputeID, 0, 500, 0.045 ether); // rewards
        core.execute(disputeID, 0, 10); // Finish the iterations. We need only 3 but check that it corrects the count.

        round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 6, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0.09 ether, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 1000, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 0, "Wrong balance of the core");
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(staker2.balance, 0.09 ether, "Wrong balance of the staker2");

        assertEq(
            pinakion.balanceOf(address(core)),
            2 ether - 1000,
            "Token balance of the core should decrease after paying the reward"
        );

        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1"); // Staker1 didn't get the reward.
        assertEq(pinakion.balanceOf(staker2), 1000, "Wrong token balance of staker2"); // Staker2 got the reward.

        assertEq(core.balances(staker1), 1 ether - 1000, "Wrong internal token balance of staker1"); // Should be penalized
        assertEq(core.balances(staker2), 1 ether, "Wrong internal token balance of staker2"); // Should remain the same.
    }

    function test_execute_tiedChoices() public {
        uint256 disputeID = 0;

        vm.prank(owner);
        pinakion.transfer(other, 1 ether);
        // Make other address a 3rd juror
        vm.startPrank(other);
        pinakion.approve(address(core), 1 ether);
        core.depositTokens(1 ether);
        vm.stopPrank();

        uint256 newNumberOfJurors = 5;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * newNumberOfJurors}("Action"); // 5 jurors, with future votes distribution 2-2-1
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        // Split the stakers' votes. First and 2nd juror get 2 votes, the 3rd juror - 1 vote.
        core.draw(disputeID, 2);

        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking phase to stake the 2nd voter and unstake the first voter to make sure he won't be drawn again

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        jurors = new address[](2);
        courtIDs = new uint96[](2);

        jurors[0] = staker1;
        jurors[1] = staker2;
        courtIDs[0] = GENERAL_COURT;
        courtIDs[1] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, 2);

        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking phase to stake the 3rd voter and unstake the 2nd voter to make sure he won't be drawn again

        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 0);
        vm.prank(other);
        core.setStake(GENERAL_COURT, 1000);

        vm.warp(block.timestamp + stakingDelay);

        jurors[0] = staker2;
        jurors[1] = other;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, 1);

        // Check that jurors are correctly drawn
        address account;
        for (uint256 i = 0; i < 2; i++) {
            (account, , , ) = disputeKit.getVoteInfo(0, 0, i);
            assertEq(account, staker1, "Wrong drawn account");
        }
        for (uint256 i = 2; i < 4; i++) {
            (account, , , ) = disputeKit.getVoteInfo(0, 0, i);
            assertEq(account, staker2, "Wrong drawn account");
        }
        (account, , , ) = disputeKit.getVoteInfo(0, 0, 4);
        assertEq(account, other, "Wrong drawn account");

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](2);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ");

        voteIDs = new uint256[](2);
        voteIDs[0] = 2;
        voteIDs[1] = 3;
        vm.prank(staker2);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        voteIDs = new uint256[](1);
        voteIDs[0] = 4;
        vm.prank(other);
        disputeKit.castVote(disputeID, voteIDs, 0, 0, "XYZ"); // The 3rd staker cast his vote for 0 choice and is in the minority, but should still be rewarded later.
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        core.execute(disputeID, 0, 10);

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 10, "Wrong repartitions");
        assertEq(round.pnkPenalties, 0, "Wrong pnkPenalties"); // No one is penalized
        assertEq(round.sumFeeRewardPaid, 0.15 ether, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 0, "Wrong balance of the core");
        assertEq(staker1.balance, 0.06 ether, "Wrong balance of the staker1");
        assertEq(staker2.balance, 0.06 ether, "Wrong balance of the staker2");
        assertEq(other.balance, 0.03 ether, "Wrong balance of the staker3");

        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(staker2), 0, "Wrong token balance of staker2");

        assertEq(core.balances(staker1), 1 ether, "Wrong internal token balance of staker1");
        assertEq(core.balances(staker2), 1 ether, "Wrong internal token balance of staker2");
    }

    function test_execute_maliciousDK() public {
        // Transfer extra assets to the core to check that it's not touched by malicious dk.
        vm.prank(owner);
        pinakion.transfer(address(core), 1 ether);
        vm.deal(address(core), 1 ether);

        MaliciousDisputeKitMock dkLogic = new MaliciousDisputeKitMock();
        // Create a new DK to check castVote.
        bytes memory initDataDk = abi.encodeWithSignature(
            "initialize(address,address,uint256)",
            address(core),
            address(wNative),
            DISPUTE_KIT_CLASSIC
        );

        TransparentUpgradeableProxy proxyDk = new TransparentUpgradeableProxy(address(dkLogic), owner, initDataDk);
        MaliciousDisputeKitMock maliciousDK = MaliciousDisputeKitMock(address(proxyDk));

        vm.prank(owner);
        core.addNewDisputeKit(maliciousDK);

        uint256 newDkID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        bytes memory newExtraData = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, newDkID);

        vm.prank(owner);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        arbitrable.changeArbitratorExtraData(newExtraData);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        uint256 disputeID = 0;

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.disputeKitID, newDkID, "Wrong DK ID");

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        // Split the stakers' votes. First staker gets 1 vote and 2nd - 2 votes.
        core.draw(disputeID, 1);

        vm.warp(block.timestamp + maxDrawingTime);
        sortitionModule.passPhase(); // Staking phase to stake the 2nd voter and unstake the first voter to make sure he won't be drawn again

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 0);
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        jurors = new address[](2);
        courtIDs = new uint96[](2);

        jurors[0] = staker1;
        jurors[1] = staker2;
        courtIDs[0] = GENERAL_COURT;
        courtIDs[1] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, 2);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        vm.prank(staker1);
        maliciousDK.castVote(disputeID, voteIDs, 1, 0, "XYZ");

        voteIDs = new uint256[](2);
        voteIDs[0] = 1;
        voteIDs[1] = 2;
        vm.prank(staker2);
        maliciousDK.castVote(disputeID, voteIDs, 2, 0, "XYZ");
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        core.execute(disputeID, 0, 4); // Do 4 iterations to check penalties first. 3 iterations are for penalties and the 4th is for staker1 rewards that shouldn't do anything since he is incoherent.

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);

        assertEq(totalStaked, 0, "totalStaked should be 0 for the first staker");
        assertEq(totalLocked, 0, "Tokens should be released for staker1");

        (, totalLocked) = sortitionModule.getJurorBalance(staker2);

        assertEq(totalLocked, 0, "Tokens should still be released for staker2");

        round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 4, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 1.09 ether, "Wrong balance of the core");
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(staker2.balance, 0, "Wrong balance of the staker2");

        assertEq(pinakion.balanceOf(address(core)), 3 ether, "Wrong token balance of the core"); // Token balance should remain untouched

        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(staker2), 0, "Wrong token balance of staker2");

        assertEq(core.balances(staker1), 1 ether - 1000, "Wrong internal token balance of staker1"); // Should be penalized
        assertEq(core.balances(staker2), 1 ether, "Wrong internal token balance of staker2"); // Should remain untouched

        // The next iteration should deplete the whole reward pool since malicious DK doubles the amount of rewards.
        core.execute(disputeID, 0, 1);

        round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 5, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0.09 ether, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 1000, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 1 ether, "Wrong balance of the core"); // Rewards should be depleted with this iteration
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(staker2.balance, 0.09 ether, "Wrong balance of the staker2");

        assertEq(pinakion.balanceOf(address(core)), 3 ether - 1000, "Wrong token balance of the core"); // 1000 was sent to staker2

        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(staker2), 1000, "Wrong token balance of staker2");

        assertEq(core.balances(staker1), 1 ether - 1000, "Wrong internal token balance of staker1");
        assertEq(core.balances(staker2), 1 ether, "Wrong internal token balance of staker2");

        // Do the final iteration to check that no extra money was spent and balances stayed the same.
        core.execute(disputeID, 0, 1);

        round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 6, "Wrong repartitions");
        assertEq(round.pnkPenalties, 1000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0.09 ether, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 1000, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 1 ether, "Wrong balance of the core");
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(staker2.balance, 0.09 ether, "Wrong balance of the staker2");

        assertEq(pinakion.balanceOf(address(core)), 3 ether - 1000, "Wrong token balance of the core");

        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(staker2), 1000, "Wrong token balance of staker2");

        assertEq(core.balances(staker1), 1 ether - 1000, "Wrong internal token balance of staker1");
        assertEq(core.balances(staker2), 1 ether, "Wrong internal token balance of staker2");
    }

    function test_execute_NoCoherence() public {
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

        vm.warp(block.timestamp + timesPerPeriod[2]); // Don't vote at all so no one is coherent
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        uint256 ownerBalance = owner.balance;
        uint256 ownerTokenBalance = pinakion.balanceOf(owner);

        vm.expectEmit(true, true, true, true);
        emit KlerosCore.LeftoverRewardSent(disputeID, 0, 3000, 0.09 ether);
        core.execute(disputeID, 0, 6);

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.pnkPenalties, 3000, "Wrong pnkPenalties");
        assertEq(round.sumFeeRewardPaid, 0, "Wrong sumFeeRewardPaid");
        assertEq(round.sumPnkRewardPaid, 0, "Wrong sumPnkRewardPaid");

        assertEq(address(core).balance, 0, "Wrong balance of the core");
        assertEq(staker1.balance, 0, "Wrong balance of the staker1");
        assertEq(owner.balance, ownerBalance + 0.09 ether, "Wrong balance of the owner");

        assertEq(pinakion.balanceOf(address(core)), 2 ether - 3000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1");
        assertEq(pinakion.balanceOf(owner), ownerTokenBalance + 3000, "Wrong token balance of owner");

        assertEq(core.balances(staker1), 1 ether - 3000, "Wrong internal token balance of staker1");
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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        uint256 disputeID = 0;
        uint96 newCourtID = 2;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(staker1);
        core.setStake(newCourtID, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](2);
        uint96[] memory courtIDs = new uint96[](2);

        jurors[0] = staker1;
        jurors[1] = staker1;
        courtIDs[0] = GENERAL_COURT;
        courtIDs[1] = newCourtID;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(jurorCourtIDs.length, 2, "Wrong number of courts");

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

        core.execute(disputeID, 0, 6);

        assertEq(pinakion.balanceOf(address(core)), 2 ether - 3000, "Wrong token balance of the core");
        assertEq(pinakion.balanceOf(staker1), 0, "Wrong token balance of staker1"); // Tokens should remain in contract.
        assertEq(pinakion.balanceOf(owner), ownerTokenBalance + 3000, "Wrong token balance of owner");

        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(jurorCourtIDs.length, 0, "Should unstake from all courts");
    }

    function test_execute_UnstakeInsolvent() public {
        uint256 disputeID = 0;

        vm.startPrank(staker1);
        core.setStake(GENERAL_COURT, 1000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // Withdraw most of the tokens so the deposit can fall below the staked amount.
        core.withdrawTokens(1 ether - 1900); // Juror will get penalized for 1000. That will leave him with 900 tokens which is less than staked amount.
        vm.stopPrank();

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);
        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);

        assertEq(totalStaked, 1000, "Wrong totalStaked");
        assertEq(totalLocked, 3000, "totalLocked should exceed totalStaked"); // Juror only staked 1000 but was drawn 3x of minStake (3000 locked)
        assertEq(jurorCourtIDs.length, 1, "Wrong number of courts");
        assertEq(core.balances(staker1), 1900, "Wrong internal token balance of staker1");

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
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, 0, 0); // Juror should have no stake left and should be unstaked from the court automatically.
        core.execute(disputeID, 0, 6);

        assertEq(pinakion.balanceOf(address(core)), 1 ether + 900, "Wrong token balance of the core"); // Should remain unchanged.
        assertEq(pinakion.balanceOf(staker1), 1 ether - 900, "Wrong token balance of staker1"); // 1000 was returned as a reward for votes 2 and 3. 900 stayed deposited

        assertEq(core.balances(staker1), 900, "Wrong internal token balance of staker1"); // Initial balance was 1900, got penalized for 1000.

        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(jurorCourtIDs.length, 0, "Should unstake from all courts");
    }

    function test_forceUnstake_delayed() public {
        // Check that can't overwrite forced stake.

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
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        uint256 disputeID = 0;
        uint96 newCourtID = 2;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
        vm.prank(staker1);
        core.setStake(newCourtID, 20000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](2);
        uint96[] memory courtIDs = new uint96[](2);

        jurors[0] = staker1;
        jurors[1] = staker1;
        courtIDs[0] = GENERAL_COURT;
        courtIDs[1] = newCourtID;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(jurorCourtIDs.length, 2, "Wrong number of courts");

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

        core.execute(disputeID, 0, 6);

        jurorCourtIDs = sortitionModule.getJurorCourtIDs(staker1);
        assertEq(jurorCourtIDs.length, 2, "Should not be unstaked yet");

        (uint256 stake, bool forced, bool pending, uint256 activationTime, uint256 reservedStake) = sortitionModule
            .delayedStakes(staker1, GENERAL_COURT);
        assertEq(stake, 0, "Wrong amount delayed stake");
        assertEq(forced, true, "Should be forced");
        assertEq(pending, true, "Should be pending");
        assertEq(activationTime, block.timestamp + stakingDelay, "Wrong activation time");
        assertEq(reservedStake, 0, "Wrong reservedStake");

        vm.expectRevert(KlerosCore.StakingFailed.selector);
        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 20000);
    }

    function test_execute_UnstakeInsolventDelayed() public {
        uint256 disputeID = 0;

        vm.startPrank(staker1);
        core.setStake(GENERAL_COURT, 1000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);
        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        // A penalty of 1000 will leave 900 deposited against 1000 active stake.
        core.withdrawTokens(1 ether - 1900);
        vm.stopPrank();

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ"); // One incoherent vote.

        voteIDs = new uint256[](2);
        voteIDs[0] = 1;
        voteIDs[1] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal
        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        // Keep sortition in drawing so the forced exit must be delayed.
        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeDelayed(staker1, GENERAL_COURT, 0);
        core.execute(disputeID, 0, 6);

        assertEq(core.balances(staker1), 900, "Wrong balance after penalty");
        assertEq(sortitionModule.stakeOf(staker1, GENERAL_COURT), 1000, "Should not be unstaked yet");

        (uint256 stake, bool forced, bool pending, uint256 activationTime, uint256 reservedStake) = sortitionModule
            .delayedStakes(staker1, GENERAL_COURT);
        assertEq(stake, 0, "Wrong amount delayed stake");
        assertEq(forced, true, "Should be forced");
        assertEq(pending, true, "Should be pending");
        assertEq(activationTime, block.timestamp + stakingDelay, "Wrong activation time");
        assertEq(reservedStake, 0, "Wrong reserved stake");

        sortitionModule.passPhase(); // Staking
        vm.warp(block.timestamp + stakingDelay);

        vm.expectEmit(true, true, true, true);
        emit SortitionModule.StakeSet(staker1, GENERAL_COURT, 0, 0);
        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        assertEq(totalStaked, 0, "Should have no stake left");
        assertEq(totalLocked, 0, "Should have no locked tokens");
        assertEq(sortitionModule.stakeOf(staker1, GENERAL_COURT), 0, "Should be unstaked from the court");
        assertEq(sortitionModule.getJurorCourtIDs(staker1).length, 0, "Should have no courts left");
        assertEq(core.balances(staker1), 900, "Delayed exit should not change the balance");

        (stake, forced, pending, activationTime, reservedStake) = sortitionModule.delayedStakes(staker1, GENERAL_COURT);
        assertEq(stake, 0, "Delayed stake should be cleared");
        assertEq(forced, false, "Forced flag should be cleared");
        assertEq(pending, false, "Pending flag should be cleared");
        assertEq(activationTime, 0, "Activation time should be cleared");
        assertEq(reservedStake, 0, "Reserved stake should be cleared");
        assertEq(sortitionModule.totalReservedStake(staker1), 0, "Should have no reservations left");
    }

    function test_executeRuling() public {
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

        vm.expectRevert(KlerosCore.NotExecutionPeriod.selector);
        core.executeRuling(disputeID);

        vm.warp(block.timestamp + timesPerPeriod[3]);
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.Ruling(arbitrable, disputeID, 2); // Winning choice = 2
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.NewPeriod(disputeID, KlerosCore.Period.execution);
        core.passPeriod(disputeID); // Execution

        (, , KlerosCore.Period period, , uint256 lastPeriodChange) = core.disputes(disputeID);
        assertEq(uint256(period), uint256(KlerosCore.Period.execution), "Wrong period");
        assertEq(lastPeriodChange, block.timestamp, "Wrong lastPeriodChange");

        vm.expectRevert(KlerosCore.DisputePeriodIsFinal.selector);
        core.passPeriod(disputeID);

        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.RulingExecuted(arbitrable, disputeID, 2); // Winning choice = 2
        vm.expectEmit(true, true, true, true);
        emit IArbitrableV2.Ruling(core, disputeID, 2);
        core.executeRuling(disputeID);

        (, , , bool ruled, ) = core.disputes(disputeID);
        assertEq(ruled, true, "Should be ruled");
    }

    function test_executeRuling_arbitrableRevert() public {
        MaliciousArbitrableMock maliciousArbitrable = new MaliciousArbitrableMock(
            core,
            templateData,
            templateDataMappings,
            arbitratorExtraData,
            registry
        );
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
        maliciousArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
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

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        vm.expectRevert(MaliciousArbitrableMock.RuleReverted.selector);
        core.executeRuling(disputeID); // Arbitrable reverts

        disputeKit.withdrawFeesAndRewards(disputeID, payable(staker1), 2); // Should not revert even if executeRuling() reverted

        maliciousArbitrable.changeBehaviour(false);

        core.executeRuling(disputeID);
        (, , , bool ruled, ) = core.disputes(disputeID);
        assertEq(ruled, true, "Should be ruled");
    }

    function test_executeRuling_appealSwitch() public {
        // Check that the ruling switches if only one side was funded
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
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1); // Fund the losing choice

        vm.warp(block.timestamp + timesPerPeriod[3]);
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.Ruling(arbitrable, disputeID, 1); // Winning choice is switched to 1
        core.passPeriod(disputeID); // Execution

        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.RulingExecuted(arbitrable, disputeID, 1); // Winning choice is switched to 1
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
        disputeKit.fundAppeal{value: 0.63 ether}(disputeID, 1); // Fund the losing choice. The ruling will be overridden here
        vm.prank(crowdfunder2);
        disputeKit.fundAppeal{value: 0.41 ether}(disputeID, 2); // Underpay a bit to not create an appeal and withdraw the funded sum fully

        vm.warp(block.timestamp + timesPerPeriod[3]);

        vm.expectRevert(DisputeKitClassic.DisputeNotResolved.selector);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(staker1), 1);

        core.passPeriod(disputeID); // Execution
        // executeRuling() should be irrelevant for withdrawals in case malicious arbitrable reverts rule()
        //core.executeRuling(disputeID);

        assertEq(crowdfunder1.balance, 9.37 ether, "Wrong balance of the crowdfunder1");
        assertEq(crowdfunder2.balance, 9.59 ether, "Wrong balance of the crowdfunder2");
        assertEq(address(disputeKit).balance, 1.04 ether, "Wrong balance of the DK");

        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassic.Withdrawal(disputeID, 1, crowdfunder1, 0.63 ether);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder1), 1);

        vm.expectEmit(true, true, true, true);
        emit DisputeKitClassic.Withdrawal(disputeID, 2, crowdfunder2, 0.41 ether);
        disputeKit.withdrawFeesAndRewards(disputeID, payable(crowdfunder2), 2);

        assertEq(crowdfunder1.balance, 10 ether, "Wrong balance of the crowdfunder1");
        assertEq(crowdfunder2.balance, 10 ether, "Wrong balance of the crowdfunder2");
        assertEq(address(disputeKit).balance, 0, "Wrong balance of the DK");
    }

    function testFuzz_executeIterations(uint256 iterations) public {
        uint256 disputeID = 0;
        uint256 roundID = 0;

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

        core.draw(disputeID, 3);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;
        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, roundID, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        core.execute(disputeID, roundID, iterations);

        uint256 iterationsCount = iterations < DEFAULT_NB_OF_JURORS * 2 ? iterations : DEFAULT_NB_OF_JURORS * 2;

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, roundID);
        assertEq(round.repartitions, iterationsCount, "Wrong repartitions");
    }

    function testFuzz_executeIterations_nbJurors(uint256 iterations, uint256 disputeValue) public {
        uint256 disputeID = 0;
        uint256 roundID = 0;

        uint256 arbitrationCost = core.arbitrationCost(arbitratorExtraData);
        // Cap it to 10 eth, so the number of jurors is not astronomical.
        vm.assume(disputeValue >= arbitrationCost && disputeValue <= 10 ether);
        vm.deal(disputer, 10 ether);

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 2000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = staker1;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(disputer);
        arbitrable.createDispute{value: disputeValue}("Action");
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 nbJurors = disputeValue / feeForJuror;

        core.draw(disputeID, nbJurors);

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, roundID);
        assertEq(round.totalFeesForJurors, disputeValue, "Wrong totalFeesForJurors");
        assertEq(round.nbVotes, nbJurors, "Wrong nbVotes");

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        uint256[] memory voteIDs = new uint256[](nbJurors);
        for (uint256 i = 0; i < voteIDs.length; i++) {
            voteIDs[i] = i;
        }

        vm.prank(staker1);
        disputeKit.castVote(disputeID, voteIDs, 1, 0, "XYZ");

        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution

        core.execute(disputeID, roundID, iterations);

        uint256 iterationsCount = iterations < nbJurors * 2 ? iterations : nbJurors * 2;
        round = core.getRoundInfo(disputeID, roundID);

        assertEq(round.repartitions, iterationsCount, "Wrong repartitions");

        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(staker1);
        uint256 stakedInCourt = sortitionModule.stakeOf(staker1, GENERAL_COURT);

        uint256 pnkAtStake = (minStake * alpha) / ONE_BASIS_POINT;
        uint256 unlockedTokens = iterationsCount >= nbJurors ? nbJurors * pnkAtStake : iterationsCount * pnkAtStake;
        assertEq(totalStaked, 2000, "Wrong amount total staked");
        assertEq(totalLocked, (pnkAtStake * nbJurors) - unlockedTokens, "Wrong amount locked");
        assertEq(stakedInCourt, 2000, "Wrong amount staked in court");
    }

    ///////// Internal //////////

    function _assertJurorBalance(
        address _juror,
        uint256 _totalStakedPnk,
        uint256 _totalLocked,
        uint256 _stakedInCourt,
        uint256 _nbCourts
    ) internal view {
        (uint256 totalStaked, uint256 totalLocked) = sortitionModule.getJurorBalance(_juror);
        uint256 stakedInCourt = sortitionModule.stakeOf(_juror, GENERAL_COURT);
        uint96[] memory jurorCourtIDs = sortitionModule.getJurorCourtIDs(_juror);

        assertEq(_totalStakedPnk, totalStaked, "Wrong totalStakedPnk"); // jurors total staked a.k.a juror.stakedPnk
        assertEq(_totalLocked, totalLocked, "Wrong totalLocked");
        assertEq(_stakedInCourt, stakedInCourt, "Wrong stakedInCourt"); // juror staked in court a.k.a _stakeOf
        assertEq(_nbCourts, jurorCourtIDs.length, "Wrong nbCourts");
    }

    function _stakeBalanceForJuror(address juror, uint256 amount) internal {
        console.log("actual juror PNK balance before staking: %e", pinakion.balanceOf(juror));
        vm.prank(juror);
        core.setStake(GENERAL_COURT, amount);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](1);
        uint96[] memory courtIDs = new uint96[](1);

        jurors[0] = juror;
        courtIDs[0] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);
    }

    function _drawJurors_advancePeriodToVoting(uint256 disputeID) internal {
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);
        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote
    }

    function _vote_execute(uint256 disputeID, address juror) internal {
        uint256[] memory voteIDs = new uint256[](3);
        voteIDs[0] = 0;
        voteIDs[1] = 1;
        voteIDs[2] = 2;

        vm.prank(juror);
        disputeKit.castVote(disputeID, voteIDs, 2, 0, "XYZ");
        core.passPeriod(disputeID); // Appeal

        vm.warp(block.timestamp + timesPerPeriod[3]);
        core.passPeriod(disputeID); // Execution
    }
}

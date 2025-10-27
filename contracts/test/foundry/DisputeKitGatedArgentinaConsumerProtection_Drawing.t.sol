// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitGatedArgentinaConsumerProtection} from "../../src/arbitration/dispute-kits/DisputeKitGatedArgentinaConsumerProtection.sol";
import {ArbitrableExample} from "../../src/arbitration/arbitrables/ArbitrableExample.sol";
import {TestERC721} from "../../src/token/TestERC721.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {Vm} from "forge-std/Vm.sol";
import {console} from "forge-std/console.sol";
import "../../src/libraries/Constants.sol";

/// @title DisputeKitGatedArgentinaConsumerProtection_DrawingTest
/// @dev Tests for DisputeKitGatedArgentinaConsumerProtection drawing logic
/// This dispute kit requires:
/// - Jurors must own either accreditedProfessionalToken OR accreditedConsumerProtectionLawyerToken
/// - Each round must have at least one juror with accreditedConsumerProtectionLawyerToken
contract DisputeKitGatedArgentinaConsumerProtection_DrawingTest is KlerosCore_TestBase {
    // ************************************* //
    // *          Test Contracts           * //
    // ************************************* //

    DisputeKitGatedArgentinaConsumerProtection argentinaDK;
    TestERC721 accreditedProfessionalToken;
    TestERC721 accreditedConsumerProtectionLawyerToken;

    // ************************************* //
    // *            Test Accounts          * //
    // ************************************* //

    address lawyer1; // Has only accredited professional token
    address lawyer2; // Has only accredited professional token
    address consumerLawyer1; // Has only consumer protection lawyer token
    address consumerLawyer2; // Has only consumer protection lawyer token
    address bothLawyer; // Has both tokens
    address noTokenJuror; // Has no tokens

    // ************************************* //
    // *         Test Parameters           * //
    // ************************************* //

    uint96 argentinaCourt;
    uint256 constant ARGENTINA_DK_ID = 2; // Assuming DK ID 1 is DisputeKitClassic
    ArbitrableExample argentinaArbitrable; // Arbitrable for Argentina court

    function setUp() public override {
        super.setUp();

        // Set up additional test accounts
        lawyer1 = vm.addr(10);
        lawyer2 = vm.addr(11);
        consumerLawyer1 = vm.addr(12);
        consumerLawyer2 = vm.addr(13);
        bothLawyer = vm.addr(14);
        noTokenJuror = vm.addr(15);

        // Deploy token contracts
        accreditedProfessionalToken = new TestERC721("Accredited Lawyer", "AL");
        accreditedConsumerProtectionLawyerToken = new TestERC721("Consumer Protection Lawyer", "CPL");

        // Deploy and initialize the Argentina dispute kit
        DisputeKitGatedArgentinaConsumerProtection dkLogic = new DisputeKitGatedArgentinaConsumerProtection();
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,address,address,address,address)",
            owner,
            address(core),
            address(wNative),
            address(accreditedProfessionalToken),
            address(accreditedConsumerProtectionLawyerToken)
        );
        UUPSProxy proxyDK = new UUPSProxy(address(dkLogic), initData);
        argentinaDK = DisputeKitGatedArgentinaConsumerProtection(address(proxyDK));

        // Add the dispute kit to core
        vm.prank(owner);
        core.addNewDisputeKit(argentinaDK);

        // Create a court that uses the Argentina dispute kit
        // Note: Courts must always support DISPUTE_KIT_CLASSIC
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = ARGENTINA_DK_ID;

        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            false, // Hidden votes
            1000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            sortitionExtraData,
            supportedDK
        );

        uint256[] memory children = core.getCourtChildren(GENERAL_COURT);
        argentinaCourt = uint96(children[children.length - 1]);

        // Enable the dispute kit in the Argentina court
        uint256[] memory dkIDs = new uint256[](1);
        dkIDs[0] = ARGENTINA_DK_ID;
        vm.prank(owner);
        core.enableDisputeKits(argentinaCourt, dkIDs, true);

        // Create an arbitrable that uses the Argentina court
        bytes memory argentinaExtraData = abi.encodePacked(
            uint256(argentinaCourt),
            uint256(DEFAULT_NB_OF_JURORS),
            uint256(ARGENTINA_DK_ID)
        );
        argentinaArbitrable = new ArbitrableExample(
            core,
            templateData,
            templateDataMappings,
            argentinaExtraData,
            registry,
            feeToken
        );

        // Give PNK to all test jurors and approve core
        address[6] memory jurors = [lawyer1, lawyer2, consumerLawyer1, consumerLawyer2, bothLawyer, noTokenJuror];
        for (uint256 i = 0; i < jurors.length; i++) {
            vm.prank(owner);
            pinakion.transfer(jurors[i], 5000);
            vm.prank(jurors[i]);
            pinakion.approve(address(core), 5000);
        }
    }

    // ************************************* //
    // *              Tests                * //
    // ************************************* //

    /// @notice Test helper to verify setup is correct
    function test_setUp() public {
        // Verify the Argentina court was created
        (
            uint96 parent,
            bool courtHiddenVotes,
            uint256 minStakeValue,
            uint256 alphaValue,
            uint256 feeForJurorValue,
            uint256 jurorsForJumpValue
        ) = core.courts(argentinaCourt);
        assertEq(parent, GENERAL_COURT, "Wrong parent court");
        assertEq(courtHiddenVotes, false, "Wrong hiddenVotes");
        assertEq(minStakeValue, 1000, "Wrong minStake");
        assertEq(alphaValue, 10000, "Wrong alpha");
        assertEq(feeForJurorValue, 0.03 ether, "Wrong feeForJuror");
        assertEq(jurorsForJumpValue, 50, "Wrong jurorsForJump");

        // Debug: Log the values being encoded
        console.log("argentinaCourt:", argentinaCourt);
        console.log("DEFAULT_NB_OF_JURORS:", DEFAULT_NB_OF_JURORS);
        console.log("ARGENTINA_DK_ID:", ARGENTINA_DK_ID);

        // Verify the arbitration cost is correct - use uint256 for all values
        bytes memory extraData = abi.encodePacked(
            uint256(argentinaCourt),
            uint256(DEFAULT_NB_OF_JURORS),
            uint256(ARGENTINA_DK_ID)
        );
        console.log("extraData length:", extraData.length);
        uint256 cost = core.arbitrationCost(extraData);
        console.log("Actual cost:", cost);
        console.log("Expected cost:", 0.03 ether * DEFAULT_NB_OF_JURORS);
        assertEq(cost, 0.03 ether * DEFAULT_NB_OF_JURORS, "Wrong arbitration cost");
    }

    /// @notice Test that drawing fails when only accredited lawyers (no consumer protection lawyers) are staked
    /// Expected: Drawing never completes all required jurors due to last-iteration rejection logic
    function test_drawFailsWithOnlyAccreditedLawyers() public {
        // Mint accredited lawyer tokens (but NOT consumer protection tokens)
        accreditedProfessionalToken.safeMint(lawyer1);
        accreditedProfessionalToken.safeMint(lawyer2);

        // Stake in the Argentina court
        vm.prank(lawyer1);
        core.setStake(argentinaCourt, 3000);
        vm.prank(lawyer2);
        core.setStake(argentinaCourt, 3000);

        // Create dispute
        vm.prank(disputer);
        argentinaArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        uint256 roundID = 0;

        // Try to draw jurors - should not complete all draws
        core.draw(disputeID, DEFAULT_NB_OF_JURORS * 10); // Try many iterations

        // Verify that NOT all jurors were drawn (because last draw keeps getting rejected)
        (, , , , uint256 nbVoters, ) = argentinaDK.getRoundInfo(disputeID, roundID, 0);
        assertLt(nbVoters, DEFAULT_NB_OF_JURORS, "Should not have drawn all jurors");

        // Verify the dispute is still waiting for jurors
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Dispute should still be waiting for jurors");
    }

    /// @notice Test that drawing succeeds when only consumer protection lawyers are staked
    function test_drawSucceedsWithOnlyConsumerProtectionLawyers() public {
        // Mint consumer protection lawyer tokens
        accreditedConsumerProtectionLawyerToken.safeMint(consumerLawyer1);
        accreditedConsumerProtectionLawyerToken.safeMint(consumerLawyer2);

        // Stake in the Argentina court
        vm.prank(consumerLawyer1);
        core.setStake(argentinaCourt, 3000);
        vm.prank(consumerLawyer2);
        core.setStake(argentinaCourt, 3000);

        // Create dispute
        vm.prank(disputer);
        argentinaArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        uint256 roundID = 0;

        // Draw jurors
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        // Verify all jurors were drawn
        (, , , , uint256 nbVoters, ) = argentinaDK.getRoundInfo(disputeID, roundID, 0);
        assertEq(nbVoters, DEFAULT_NB_OF_JURORS, "Should have drawn all jurors");

        // Verify at least one consumer protection lawyer was drawn
        _verifyConsumerProtectionLawyerDrawn(disputeID, roundID, nbVoters);

        // Verify the dispute has all jurors
        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Dispute should have all jurors");
    }

    /// @notice Test that drawing succeeds with a mix of both lawyer types
    function test_drawSucceedsWithMixedLawyers() public {
        // Mint tokens to different jurors
        accreditedProfessionalToken.safeMint(lawyer1);
        accreditedProfessionalToken.safeMint(lawyer2);
        accreditedConsumerProtectionLawyerToken.safeMint(consumerLawyer1);

        // Stake in the Argentina court
        vm.prank(lawyer1);
        core.setStake(argentinaCourt, 3000);
        vm.prank(lawyer2);
        core.setStake(argentinaCourt, 3000);
        vm.prank(consumerLawyer1);
        core.setStake(argentinaCourt, 3000);

        // Create dispute
        vm.prank(disputer);
        argentinaArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        uint256 roundID = 0;

        // Draw jurors
        core.draw(disputeID, DEFAULT_NB_OF_JURORS * 5); // Extra iterations in case of retries

        // Verify all jurors were drawn
        (, , , , uint256 nbVoters, ) = argentinaDK.getRoundInfo(disputeID, roundID, 0);
        assertEq(nbVoters, DEFAULT_NB_OF_JURORS, "Should have drawn all jurors");

        // Verify at least one consumer protection lawyer was drawn
        _verifyConsumerProtectionLawyerDrawn(disputeID, roundID, nbVoters);

        // Verify the dispute has all jurors
        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Dispute should have all jurors");
    }

    /// @notice Test drawing when a juror holds both token types
    function test_drawWithJurorHoldingBothTokens() public {
        // Mint both tokens to the same juror
        accreditedProfessionalToken.safeMint(bothLawyer);
        accreditedConsumerProtectionLawyerToken.safeMint(bothLawyer);

        // Stake in the Argentina court
        vm.prank(bothLawyer);
        core.setStake(argentinaCourt, 3000);

        // Create dispute
        vm.prank(disputer);
        argentinaArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        uint256 roundID = 0;

        // Draw jurors
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        // Verify all jurors were drawn
        (, , , , uint256 nbVoters, ) = argentinaDK.getRoundInfo(disputeID, roundID, 0);
        assertEq(nbVoters, DEFAULT_NB_OF_JURORS, "Should have drawn all jurors");

        // Verify the juror with both tokens was drawn
        bool foundBothLawyer = false;
        for (uint256 i = 0; i < nbVoters; i++) {
            (address account, , , ) = argentinaDK.getVoteInfo(disputeID, roundID, i);
            if (account == bothLawyer) {
                foundBothLawyer = true;
                break;
            }
        }
        assertTrue(foundBothLawyer, "Juror with both tokens should be drawn");

        // Verify consumer protection requirement is satisfied
        _verifyConsumerProtectionLawyerDrawn(disputeID, roundID, nbVoters);
    }

    /// @notice Test that jurors without tokens cannot be drawn
    function test_rejectJurorsWithoutTokens() public {
        // Mint consumer protection token to one juror (to allow drawing to complete)
        accreditedConsumerProtectionLawyerToken.safeMint(consumerLawyer1);

        // Stake: one with token, one without
        vm.prank(consumerLawyer1);
        core.setStake(argentinaCourt, 3000);
        vm.prank(noTokenJuror);
        core.setStake(argentinaCourt, 3000);

        // Create dispute
        vm.prank(disputer);
        argentinaArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        uint256 roundID = 0;

        // Draw jurors
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        // Verify that if any jurors were drawn, none of them is the noTokenJuror
        (, , , , uint256 nbVoters, ) = argentinaDK.getRoundInfo(disputeID, roundID, 0);
        for (uint256 i = 0; i < nbVoters; i++) {
            (address account, , , ) = argentinaDK.getVoteInfo(disputeID, roundID, i);
            assertNotEq(account, noTokenJuror, "Juror without token should not be drawn");
        }
    }

    /// @notice Test that each round independently satisfies the consumer protection lawyer requirement
    function test_multipleRoundsRequirement() public {
        // Mint tokens
        accreditedProfessionalToken.safeMint(lawyer1);
        accreditedConsumerProtectionLawyerToken.safeMint(consumerLawyer1);

        // Stake in the Argentina court
        vm.prank(lawyer1);
        core.setStake(argentinaCourt, 5000);
        vm.prank(consumerLawyer1);
        core.setStake(argentinaCourt, 5000);

        // Create dispute
        vm.deal(disputer, 100 ether);
        vm.prank(disputer);
        argentinaArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;

        // Draw round 0
        core.draw(disputeID, DEFAULT_NB_OF_JURORS * 5);
        (, , , , uint256 nbVoters0, ) = argentinaDK.getRoundInfo(disputeID, 0, 0);
        assertEq(nbVoters0, DEFAULT_NB_OF_JURORS, "Round 0 should have all jurors");
        _verifyConsumerProtectionLawyerDrawn(disputeID, 0, nbVoters0);

        // Move to voting period - need to pass evidence period first
        vm.warp(block.timestamp + 10); // evidence period duration
        core.passPeriod(disputeID); // Move to voting period

        // Vote with all jurors (no commit phase since hiddenVotes=false)
        for (uint256 i = 0; i < nbVoters0; i++) {
            (address account, , , ) = argentinaDK.getVoteInfo(disputeID, 0, i);
            uint256 choice = (i % 2) + 1; // Vote 1 or 2
            uint256[] memory voteIDs = new uint256[](1);
            voteIDs[0] = i;
            vm.prank(account);
            argentinaDK.castVote(disputeID, voteIDs, choice, 0, "");
        }

        // Move to appeal period
        vm.warp(block.timestamp + 20); // voting period duration
        core.passPeriod(disputeID);

        // Fund appeal for both sides
        uint256 appealCost = core.appealCost(disputeID);
        // Total cost = appealCost + (appealCost * multiplier / 10000)
        uint256 winnerCost = appealCost + (appealCost * 10000) / 10000; // = appealCost + appealCost = 2x
        uint256 loserCost = appealCost + (appealCost * 20000) / 10000; // = appealCost + 2*appealCost = 3x

        // Determine which choice is the winner/loser
        (uint256 ruling, , ) = argentinaDK.currentRuling(disputeID);
        uint256 winningChoice = ruling;
        uint256 losingChoice = winningChoice == 1 ? 2 : 1;

        // Fund the losing side first
        vm.prank(crowdfunder1);
        vm.deal(crowdfunder1, 100 ether);
        argentinaDK.fundAppeal{value: loserCost}(disputeID, losingChoice);

        // Fund the winning side - this triggers the appeal creation
        vm.prank(crowdfunder2);
        vm.deal(crowdfunder2, 100 ether);
        argentinaDK.fundAppeal{value: winnerCost}(disputeID, winningChoice);

        // The dispute is now in evidence period for round 1, ready for drawing
        // Round 1 has nbVotes * 2 + 1 jurors = 3 * 2 + 1 = 7 jurors
        uint256 expectedJurorsRound1 = DEFAULT_NB_OF_JURORS * 2 + 1;

        // Draw round 1
        core.draw(disputeID, expectedJurorsRound1 * 5); // Extra iterations for retries
        (, , , , uint256 nbVoters1, ) = argentinaDK.getRoundInfo(disputeID, 1, 0);
        assertEq(nbVoters1, expectedJurorsRound1, "Round 1 should have all jurors");

        // Verify round 1 also has a consumer protection lawyer
        _verifyConsumerProtectionLawyerDrawn(disputeID, 1, nbVoters1);
    }

    /// @notice Test that the drawnConsumerProtectionLawyer mapping is correctly updated
    function test_drawnConsumerProtectionLawyerMapping() public {
        // Mint consumer protection lawyer token
        accreditedConsumerProtectionLawyerToken.safeMint(consumerLawyer1);

        // Stake in the Argentina court
        vm.prank(consumerLawyer1);
        core.setStake(argentinaCourt, 3000);

        // Create dispute
        vm.prank(disputer);
        argentinaArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing phase

        uint256 disputeID = 0;
        uint256 roundID = 0;

        // Get the local dispute ID
        uint256 localDisputeID = argentinaDK.coreDisputeIDToLocal(disputeID);

        // Before drawing, the mapping should be false
        assertFalse(
            argentinaDK.drawnConsumerProtectionLawyer(localDisputeID, roundID),
            "Should be false before drawing"
        );

        // Draw jurors
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        // After drawing, the mapping should be true
        assertTrue(
            argentinaDK.drawnConsumerProtectionLawyer(localDisputeID, roundID),
            "Should be true after drawing consumer protection lawyer"
        );
    }

    // ************************************* //
    // *         Helper Functions          * //
    // ************************************* //

    /// @notice Verify that at least one drawn juror owns the consumer protection lawyer token
    function _verifyConsumerProtectionLawyerDrawn(uint256 _disputeID, uint256 _roundID, uint256 _nbVoters) internal {
        bool foundConsumerLawyer = false;
        for (uint256 i = 0; i < _nbVoters; i++) {
            (address account, , , ) = argentinaDK.getVoteInfo(_disputeID, _roundID, i);
            if (accreditedConsumerProtectionLawyerToken.balanceOf(account) > 0) {
                foundConsumerLawyer = true;
                break;
            }
        }
        assertTrue(foundConsumerLawyer, "At least one consumer protection lawyer should be drawn");
    }
}

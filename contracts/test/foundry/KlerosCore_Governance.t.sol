// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {IArbitratorV2} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitClassic} from "../../src/arbitration/dispute-kits/DisputeKitClassic.sol";
import {DisputeKitSybilResistant} from "../../src/arbitration/dispute-kits/DisputeKitSybilResistant.sol";
import {SortitionModule} from "../../src/arbitration/SortitionModule.sol";
import {SortitionModuleMock} from "../../src/test/SortitionModuleMock.sol";
import {PNK} from "../../src/token/PNK.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_GovernanceTest
/// @dev Tests for KlerosCore governance functions
contract KlerosCore_GovernanceTest is KlerosCore_TestBase {
    function _loserCutoff(uint256 appealStart, uint256 appealEnd) internal pure returns (uint256) {
        return appealStart + (appealEnd - appealStart) / 2;
    }

    function _createDisputeAndAdvanceToAppeal() internal returns (uint256 disputeID) {
        disputeID = 0;

        vm.prank(staker1);
        core.setStake(GENERAL_COURT, 10000);
        vm.prank(staker2);
        core.setStake(GENERAL_COURT, 10000);

        vm.warp(block.timestamp + stakingDelay);
        address[] memory jurors = new address[](2);
        uint96[] memory courtIDs = new uint96[](2);

        jurors[0] = staker1;
        jurors[1] = staker1;
        courtIDs[0] = GENERAL_COURT;
        courtIDs[1] = GENERAL_COURT;

        sortitionModule.executeDelayedStakes(jurors, courtIDs);

        vm.prank(disputer);
        arbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase(); // Generating
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase(); // Drawing

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + timesPerPeriod[0]);
        core.passPeriod(disputeID); // Vote

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        uint256 countStaker1;
        uint256 countStaker2;
        for (uint256 i = 0; i < round.drawnJurors.length; i++) {
            if (round.drawnJurors[i] == staker1) countStaker1++;
            if (round.drawnJurors[i] == staker2) countStaker2++;
        }

        if (countStaker1 > 0) {
            uint256[] memory voteIDsStaker1 = new uint256[](countStaker1);
            uint256 idx;
            for (uint256 i = 0; i < round.drawnJurors.length; i++) {
                if (round.drawnJurors[i] == staker1) {
                    voteIDsStaker1[idx] = i;
                    idx++;
                }
            }
            vm.prank(staker1);
            disputeKit.castVote(disputeID, voteIDsStaker1, 1, 0, "XYZ");
        }

        if (countStaker2 > 0) {
            uint256[] memory voteIDsStaker2 = new uint256[](countStaker2);
            uint256 idx;
            for (uint256 i = 0; i < round.drawnJurors.length; i++) {
                if (round.drawnJurors[i] == staker2) {
                    voteIDsStaker2[idx] = i;
                    idx++;
                }
            }
            vm.prank(staker2);
            // Vote the same as staker1 to avoid a potential tie in `currentRuling()`.
            disputeKit.castVote(disputeID, voteIDsStaker2, 1, 0, "XYZ");
        }

        core.passPeriod(disputeID); // Appeal
    }

    function test_executeOwnerProposal() public {
        bytes memory data = abi.encodeWithSignature("changeOwner(address)", other);
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.executeOwnerProposal(address(core), 0, data);

        vm.expectRevert(KlerosCore.UnsuccessfulCall.selector);
        vm.prank(owner);
        core.executeOwnerProposal(address(core), 0, data); // It'll fail because the core is not its own owner

        vm.prank(owner);
        core.changeOwner(payable(address(core)));
        vm.prank(address(core));
        core.executeOwnerProposal(address(core), 0, data);
        assertEq(core.owner(), other, "Wrong owner");
    }

    function test_changeOwner() public {
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changeOwner(payable(other));
        vm.prank(owner);
        core.changeOwner(payable(other));
        assertEq(core.owner(), other, "Wrong owner");
    }

    function test_changePnkToken() public {
        PNK fakePNK = new PNK();
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changePnkToken(fakePNK);
        vm.prank(owner);
        core.changePnkToken(fakePNK);
        assertEq(address(core.pnkToken()), address(fakePNK), "Wrong PNK");
    }

    function test_changeSortitionModule() public {
        SortitionModuleMock fakeSM = new SortitionModuleMock();
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changeSortitionModule(fakeSM);
        vm.prank(owner);
        core.changeSortitionModule(fakeSM);
        assertEq(address(core.sortitionModule()), address(fakeSM), "Wrong sortitionModule");
    }

    function test_addNewDisputeKit() public {
        DisputeKitSybilResistant newDK = new DisputeKitSybilResistant();
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.addNewDisputeKit(newDK);
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitCreated(2, newDK);
        core.addNewDisputeKit(newDK);
        assertEq(address(core.disputeKits(2)), address(newDK), "Wrong address of new DK");
        assertEq(core.getDisputeKitsLength(), 3, "Wrong DK array length");
    }

    function test_createCourt() public {
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = 2; // New DK is added below.
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        uint256[] memory badSupportedDK = new uint256[](2);
        badSupportedDK[0] = FINAL_DISPUTE_KIT; // Include FINAL_DISPUTE_KIT to check that it reverts
        badSupportedDK[1] = DISPUTE_KIT_CLASSIC;
        vm.expectRevert(KlerosCore.WrongDisputeKitIndex.selector);
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            badSupportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        badSupportedDK[0] = DISPUTE_KIT_CLASSIC;
        badSupportedDK[1] = 2; // Check out of bounds index
        vm.expectRevert(KlerosCore.WrongDisputeKitIndex.selector);
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            badSupportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        // Add new DK to check the requirement for classic DK
        DisputeKitSybilResistant newDK = new DisputeKitSybilResistant();
        vm.prank(owner);
        core.addNewDisputeKit(newDK);
        badSupportedDK = new uint256[](1);
        badSupportedDK[0] = 2; // Include only sybil resistant dk
        vm.expectRevert(KlerosCore.MustSupportDisputeKitClassic.selector);
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            badSupportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitEnabled(2, DISPUTE_KIT_CLASSIC, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitEnabled(2, 2, true);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtCreated(
            2,
            GENERAL_COURT,
            true,
            2000,
            20000,
            0.04 ether,
            50,
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Explicitly convert otherwise it throws
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        _assertCourtParameters(2, GENERAL_COURT, true, 2000, 20000, 0.04 ether, 50, 1);
        _assertTimesPerPeriod(2, [uint256(10), uint256(20), uint256(30), uint256(40)]);

        (uint256 K, uint256 nodeLength) = sortitionModule.getSortitionProperties(bytes32(uint256(2)));
        assertEq(K, 6, "Wrong tree K of the new court");
        assertEq(nodeLength, 1, "Wrong node length for created tree of the new court");
    }

    function test_changeCourtParameters() public {
        // Create a 2nd court to check the minStake requirements
        vm.prank(owner);
        uint96 newCourtID = 2;
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            NULL_ELIGIBILITY_REQUIREMENT
        );

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtModified(
            GENERAL_COURT,
            true,
            2000,
            20000,
            0.04 ether,
            50,
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Explicitly convert otherwise it throws
            NULL_ELIGIBILITY_REQUIREMENT
        );
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            NULL_ELIGIBILITY_REQUIREMENT
        );

        _assertCourtParameters(GENERAL_COURT, FINAL_COURT, true, 2000, 20000, 0.04 ether, 50, 2);
        _assertTimesPerPeriod(GENERAL_COURT, [uint256(10), uint256(20), uint256(30), uint256(40)]);
    }

    function test_changeCourtParameters_FinalCourt() public {
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.CourtModified(
            FINAL_COURT,
            true,
            2000,
            20000,
            0.04 ether,
            50,
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Explicitly convert otherwise it throws
            NULL_ELIGIBILITY_REQUIREMENT
        );
        core.changeCourtParameters(
            FINAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            NULL_ELIGIBILITY_REQUIREMENT
        );

        _assertCourtParameters(FINAL_COURT, FINAL_COURT, true, 2000, 20000, 0.04 ether, 50, 2);
        _assertTimesPerPeriod(FINAL_COURT, [uint256(10), uint256(20), uint256(30), uint256(40)]);
    }

    function test_enableDisputeKits() public {
        DisputeKitSybilResistant newDK = new DisputeKitSybilResistant();
        uint256 newDkID = 2;
        vm.prank(owner);
        core.addNewDisputeKit(newDK);

        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        uint256[] memory supportedDK = new uint256[](1);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        vm.expectRevert(KlerosCore.WrongDisputeKitIndex.selector);
        vm.prank(owner);
        supportedDK[0] = FINAL_DISPUTE_KIT;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        vm.expectRevert(KlerosCore.WrongDisputeKitIndex.selector);
        vm.prank(owner);
        supportedDK[0] = 3; // Out of bounds
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);

        vm.expectRevert(KlerosCore.CannotDisableClassicDK.selector);
        vm.prank(owner);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, false);

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitEnabled(GENERAL_COURT, newDkID, true);
        supportedDK[0] = newDkID;
        core.enableDisputeKits(GENERAL_COURT, supportedDK, true);
        assertEq(core.isSupported(GENERAL_COURT, newDkID), true, "New DK should be supported by General court");

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.DisputeKitEnabled(GENERAL_COURT, newDkID, false);
        core.enableDisputeKits(GENERAL_COURT, supportedDK, false);
        assertEq(core.isSupported(GENERAL_COURT, newDkID), false, "New DK should be disabled in General court");
    }

    function test_extraDataToCourtIDMinJurorsDisputeKit() public {
        // Standard values
        bytes memory extraData = abi.encodePacked(uint256(GENERAL_COURT), DEFAULT_NB_OF_JURORS, DISPUTE_KIT_CLASSIC);

        (uint96 courtID, uint256 minJurors, uint256 disputeKitID) = core.extraDataToCourtIDMinJurorsDisputeKit(
            extraData
        );
        assertEq(courtID, GENERAL_COURT, "Wrong courtID");
        assertEq(minJurors, DEFAULT_NB_OF_JURORS, "Wrong minJurors");
        assertEq(disputeKitID, DISPUTE_KIT_CLASSIC, "Wrong disputeKitID");

        // Botched extraData. Values should fall into standard
        extraData = "0xfa";

        (courtID, minJurors, disputeKitID) = core.extraDataToCourtIDMinJurorsDisputeKit(extraData);
        assertEq(courtID, GENERAL_COURT, "Wrong courtID");
        assertEq(minJurors, DEFAULT_NB_OF_JURORS, "Wrong minJurors");
        assertEq(disputeKitID, DISPUTE_KIT_CLASSIC, "Wrong disputeKitID");

        // Custom values.
        vm.startPrank(owner);
        core.addNewDisputeKit(disputeKit);
        core.addNewDisputeKit(disputeKit);
        core.addNewDisputeKit(disputeKit);
        core.addNewDisputeKit(disputeKit);
        core.addNewDisputeKit(disputeKit);
        extraData = abi.encodePacked(uint256(50), uint256(41), uint256(6));

        (courtID, minJurors, disputeKitID) = core.extraDataToCourtIDMinJurorsDisputeKit(extraData);
        assertEq(courtID, GENERAL_COURT, "Wrong courtID"); // Value in extra data is out of scope so fall back
        assertEq(minJurors, 41, "Wrong minJurors");
        assertEq(disputeKitID, DISPUTE_KIT_CLASSIC, "Wrong disputeKitID"); // Value in extra data is out of scope so fall back

        // Final court, final DK.
        extraData = abi.encodePacked(uint256(FINAL_COURT), DEFAULT_NB_OF_JURORS, FINAL_DISPUTE_KIT);
        (courtID, minJurors, disputeKitID) = core.extraDataToCourtIDMinJurorsDisputeKit(extraData);
        assertEq(courtID, GENERAL_COURT, "Wrong courtID"); // fallback
        assertEq(minJurors, DEFAULT_NB_OF_JURORS, "Wrong minJurors");
        assertEq(disputeKitID, DISPUTE_KIT_CLASSIC, "Wrong disputeKitID"); // fallback
    }
}

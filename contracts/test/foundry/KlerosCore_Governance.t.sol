// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore} from "../../src/arbitration/KlerosCore.sol";
import {IArbitratorV2} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitSybilResistant} from "../../src/arbitration/dispute-kits/DisputeKitSybilResistant.sol";
import {SortitionModuleMock} from "../../src/test/SortitionModuleMock.sol";
import {PNK} from "../../src/token/PNK.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_GovernanceTest
/// @dev Tests for KlerosCore governance functions (owner/guardian operations)
contract KlerosCore_GovernanceTest is KlerosCore_TestBase {
    function test_pause() public {
        vm.expectRevert(KlerosCore.GuardianOrOwnerOnly.selector);
        vm.prank(other);
        core.pause();
        // Note that we must explicitly switch to the owner/guardian address to make the call, otherwise Foundry treats UUPS proxy as msg.sender.
        vm.prank(guardian);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Paused();
        core.pause();
        assertEq(core.paused(), true, "Wrong paused value");
        // Switch between owner and guardian to test both. WhenNotPausedOnly modifier is triggered after owner's check.
        vm.prank(owner);
        vm.expectRevert(KlerosCore.WhenNotPausedOnly.selector);
        core.pause();
    }

    function test_unpause() public {
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.unpause();

        vm.expectRevert(KlerosCore.WhenPausedOnly.selector);
        vm.prank(owner);
        core.unpause();

        vm.prank(owner);
        core.pause();
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit KlerosCore.Unpaused();
        core.unpause();
        assertEq(core.paused(), false, "Wrong paused value");
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

    function test_changeGuardian() public {
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changeGuardian(other);
        vm.prank(owner);
        core.changeGuardian(other);
        assertEq(core.guardian(), other, "Wrong guardian");
    }

    function test_changePinakion() public {
        PNK fakePNK = new PNK();
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changePinakion(fakePNK);
        vm.prank(owner);
        core.changePinakion(fakePNK);
        assertEq(address(core.pinakion()), address(fakePNK), "Wrong PNK");
    }

    function test_changeJurorProsecutionModule() public {
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changeJurorProsecutionModule(other);
        vm.prank(owner);
        core.changeJurorProsecutionModule(other);
        assertEq(core.jurorProsecutionModule(), other, "Wrong jurorProsecutionModule");
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
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        vm.expectRevert(KlerosCore.MinStakeLowerThanParentCourt.selector);
        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            800, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        vm.expectRevert(KlerosCore.UnsupportedDisputeKit.selector);
        vm.prank(owner);
        uint256[] memory emptySupportedDK = new uint256[](0);
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            emptySupportedDK
        );

        vm.expectRevert(KlerosCore.InvalidForkingCourtAsParent.selector);
        vm.prank(owner);
        core.createCourt(
            FORKING_COURT,
            true, // Hidden votes
            2000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        uint256[] memory badSupportedDK = new uint256[](2);
        badSupportedDK[0] = NULL_DISPUTE_KIT; // Include NULL_DK to check that it reverts
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
            abi.encode(uint256(4)), // Sortition extra data
            badSupportedDK
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
            abi.encode(uint256(4)), // Sortition extra data
            badSupportedDK
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
            abi.encode(uint256(4)), // Sortition extra data
            badSupportedDK
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
            supportedDK
        );
        core.createCourt(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)], // Times per period
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
        );

        _assertCourtParameters(2, GENERAL_COURT, true, 2000, 20000, 0.04 ether, 50, false);

        uint256[] memory children = core.getCourtChildren(2);
        assertEq(children.length, 0, "No children");
        _assertTimesPerPeriod(2, [uint256(10), uint256(20), uint256(30), uint256(40)]);

        children = core.getCourtChildren(GENERAL_COURT); // Check that parent updated children
        assertEq(children.length, 1, "Wrong children count");
        assertEq(children[0], 2, "Wrong child id");

        (uint256 K, uint256 nodeLength) = sortitionModule.getSortitionProperties(bytes32(uint256(2)));
        assertEq(K, 4, "Wrong tree K of the new court");
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
            abi.encode(uint256(4)), // Sortition extra data
            supportedDK
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
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Times per period
        );
        vm.expectRevert(KlerosCore.MinStakeLowerThanParentCourt.selector);
        vm.prank(owner);
        // Min stake of a parent became higher than of a child
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            3000, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Times per period
        );
        // Min stake of a child became lower than of a parent
        vm.expectRevert(KlerosCore.MinStakeLowerThanParentCourt.selector);
        vm.prank(owner);
        core.changeCourtParameters(
            newCourtID,
            true, // Hidden votes
            800, // min stake
            10000, // alpha
            0.03 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Times per period
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
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Explicitly convert otherwise it throws
        );
        core.changeCourtParameters(
            GENERAL_COURT,
            true, // Hidden votes
            2000, // min stake
            20000, // alpha
            0.04 ether, // fee for juror
            50, // jurors for jump
            [uint256(10), uint256(20), uint256(30), uint256(40)] // Times per period
        );

        _assertCourtParameters(GENERAL_COURT, FORKING_COURT, true, 2000, 20000, 0.04 ether, 50, false);
        _assertTimesPerPeriod(GENERAL_COURT, [uint256(10), uint256(20), uint256(30), uint256(40)]);
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
        supportedDK[0] = NULL_DISPUTE_KIT;
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

    function test_changeAcceptedFeeTokens() public {
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changeAcceptedFeeTokens(feeToken, true);

        (bool accepted, , ) = core.currencyRates(feeToken);
        assertEq(accepted, false, "Token should not be accepted yet");

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.AcceptedFeeToken(feeToken, true);
        core.changeAcceptedFeeTokens(feeToken, true);
        (accepted, , ) = core.currencyRates(feeToken);
        assertEq(accepted, true, "Token should be accepted");
    }

    function test_changeCurrencyRates() public {
        vm.expectRevert(KlerosCore.OwnerOnly.selector);
        vm.prank(other);
        core.changeCurrencyRates(feeToken, 100, 200);

        (, uint256 rateInEth, uint256 rateDecimals) = core.currencyRates(feeToken);
        assertEq(rateInEth, 0, "rateInEth should be 0");
        assertEq(rateDecimals, 0, "rateDecimals should be 0");

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.NewCurrencyRate(feeToken, 100, 200);
        core.changeCurrencyRates(feeToken, 100, 200);

        (, rateInEth, rateDecimals) = core.currencyRates(feeToken);
        assertEq(rateInEth, 100, "rateInEth is incorrect");
        assertEq(rateDecimals, 200, "rateDecimals is incorrect");
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
        assertEq(disputeKitID, 6, "Wrong disputeKitID");
    }
}

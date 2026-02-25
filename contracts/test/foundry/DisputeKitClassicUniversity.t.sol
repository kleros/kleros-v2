// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {KlerosCore, IArbitratorV2, IArbitrableV2} from "../../src/arbitration/KlerosCore.sol";
import {DisputeKitClassicUniversity} from "../../src/arbitration/dispute-kits/DisputeKitClassicUniversity.sol";
import {DisputeKitClassicBase} from "../../src/arbitration/dispute-kits/DisputeKitClassicBase.sol";
import {ArbitrableExample} from "../../src/arbitration/arbitrables/ArbitrableExample.sol";
import {SortitionModule} from "../../src/arbitration/SortitionModule.sol";
import {UUPSProxy} from "../../src/proxy/UUPSProxy.sol";
import {Vm} from "forge-std/Vm.sol";
import "../../src/libraries/Constants.sol";

contract DisputeKitClassicUniversityTest is KlerosCore_TestBase {
    DisputeKitClassicUniversity uniDK;
    ArbitrableExample uniArbitrable;

    address instructorAddr;
    address student1;
    address student2;
    address student3;
    address outsider;

    uint96 uniCourt;
    uint256 constant UNI_DK_ID = 2;

    function setUp() public override {
        super.setUp();

        instructorAddr = vm.addr(20);
        student1 = vm.addr(21);
        student2 = vm.addr(22);
        student3 = vm.addr(23);
        outsider = vm.addr(24);

        DisputeKitClassicUniversity dkLogic = new DisputeKitClassicUniversity();
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,address,address)",
            owner,
            address(core),
            address(wNative)
        );
        UUPSProxy proxyDK = new UUPSProxy(address(dkLogic), initData);
        uniDK = DisputeKitClassicUniversity(address(proxyDK));

        vm.prank(owner);
        uniDK.changeInstructor(instructorAddr);

        vm.prank(owner);
        core.addNewDisputeKit(uniDK);

        uint256[] memory supportedDK = new uint256[](2);
        supportedDK[0] = DISPUTE_KIT_CLASSIC;
        supportedDK[1] = UNI_DK_ID;

        vm.prank(owner);
        core.createCourt(
            GENERAL_COURT,
            false,
            1000,
            10000,
            0.03 ether,
            50,
            [uint256(10), uint256(20), uint256(30), uint256(40)],
            sortitionExtraData,
            supportedDK,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        uint256[] memory children = core.getCourtChildren(GENERAL_COURT);
        uniCourt = uint96(children[children.length - 1]);

        bytes memory uniExtraData = abi.encodePacked(
            uint256(uniCourt),
            uint256(DEFAULT_NB_OF_JURORS),
            uint256(UNI_DK_ID)
        );
        uniArbitrable = new ArbitrableExample(
            core,
            templateData,
            templateDataMappings,
            uniExtraData,
            registry,
            feeToken
        );

        address[3] memory students = [student1, student2, student3];
        for (uint256 i = 0; i < students.length; i++) {
            vm.prank(owner);
            pinakion.transfer(students[i], 10000);
            vm.prank(students[i]);
            pinakion.approve(address(core), 10000);
        }
    }

    // =========================================================================
    // Access Control
    // =========================================================================

    function test_initialize() public view {
        assertEq(uniDK.owner(), owner, "Wrong owner");
        assertEq(uniDK.instructor(), instructorAddr, "Wrong instructor");
        assertEq(address(uniDK.core()), address(core), "Wrong core");
        assertEq(uniDK.singleDrawPerJuror(), true, "singleDrawPerJuror should be true");
    }

    function test_changeInstructor_byOwner() public {
        vm.expectEmit(true, false, false, false);
        emit DisputeKitClassicUniversity.InstructorChanged(student1);
        vm.prank(owner);
        uniDK.changeInstructor(student1);
        assertEq(uniDK.instructor(), student1, "Instructor not updated");
    }

    function test_changeInstructor_byInstructor() public {
        vm.prank(instructorAddr);
        uniDK.changeInstructor(student2);
        assertEq(uniDK.instructor(), student2, "Instructor not updated");
    }

    function test_changeInstructor_revertsForOther() public {
        vm.expectRevert(DisputeKitClassicUniversity.OwnerOrInstructorOnly.selector);
        vm.prank(outsider);
        uniDK.changeInstructor(outsider);
    }

    function test_setJurors_revertsForNonInstructor() public {
        address[] memory jurors = new address[](1);
        jurors[0] = student1;
        vm.expectRevert(DisputeKitClassicUniversity.InstructorOnly.selector);
        vm.prank(outsider);
        uniDK.setJurors(0, jurors);
    }

    function test_clearJurors_revertsForNonInstructor() public {
        vm.expectRevert(DisputeKitClassicUniversity.InstructorOnly.selector);
        vm.prank(outsider);
        uniDK.clearJurors(0);
    }

    // =========================================================================
    // Juror Queue Management
    // =========================================================================

    function test_setJurors_and_getJurors() public {
        address[] memory jurors = new address[](3);
        jurors[0] = student1;
        jurors[1] = student2;
        jurors[2] = student3;

        vm.expectEmit(true, false, false, true);
        emit DisputeKitClassicUniversity.JurorsSet(0, jurors);
        vm.prank(instructorAddr);
        uniDK.setJurors(0, jurors);

        address[] memory stored = uniDK.getJurors(0);
        assertEq(stored.length, 3, "Wrong queue length");
        assertEq(stored[0], student1, "Wrong juror 0");
        assertEq(stored[1], student2, "Wrong juror 1");
        assertEq(stored[2], student3, "Wrong juror 2");
        assertEq(uniDK.getJurorQueueCursor(0), 0, "Cursor should be 0");
    }

    function test_setJurors_replacesExistingQueue() public {
        address[] memory first = new address[](2);
        first[0] = student1;
        first[1] = student2;

        vm.prank(instructorAddr);
        uniDK.setJurors(0, first);
        assertEq(uniDK.getJurors(0).length, 2, "First queue wrong length");

        address[] memory second = new address[](1);
        second[0] = student3;

        vm.prank(instructorAddr);
        uniDK.setJurors(0, second);
        assertEq(uniDK.getJurors(0).length, 1, "Second queue wrong length");
        assertEq(uniDK.getJurors(0)[0], student3, "Wrong replacement juror");
        assertEq(uniDK.getJurorQueueCursor(0), 0, "Cursor should be reset");
    }

    function test_clearJurors() public {
        address[] memory jurors = new address[](2);
        jurors[0] = student1;
        jurors[1] = student2;

        vm.prank(instructorAddr);
        uniDK.setJurors(0, jurors);

        vm.expectEmit(true, false, false, false);
        emit DisputeKitClassicUniversity.JurorsCleared(0);
        vm.prank(instructorAddr);
        uniDK.clearJurors(0);

        assertEq(uniDK.getJurors(0).length, 0, "Queue should be empty");
        assertEq(uniDK.getJurorQueueCursor(0), 0, "Cursor should be 0");
    }

    // =========================================================================
    // Drawing
    // =========================================================================

    function test_draw_instructorSelectedJurors() public {
        vm.prank(student1);
        core.setStake(uniCourt, 3000);
        vm.prank(student2);
        core.setStake(uniCourt, 3000);
        vm.prank(student3);
        core.setStake(uniCourt, 3000);

        vm.prank(disputer);
        uniArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        uint256 disputeID = 0;

        address[] memory jurors = new address[](3);
        jurors[0] = student1;
        jurors[1] = student2;
        jurors[2] = student3;
        vm.prank(instructorAddr);
        uniDK.setJurors(disputeID, jurors);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        for (uint256 i = 0; i < DEFAULT_NB_OF_JURORS; i++) {
            (address account, , , ) = uniDK.getVoteInfo(disputeID, 0, i);
            assertEq(account, jurors[i], "Wrong drawn juror");
        }

        assertEq(uniDK.getJurorQueueCursor(disputeID), 3, "Cursor should be fully advanced");
        assertEq(sortitionModule.disputesWithoutJurors(), 0, "Dispute should have all jurors");
    }

    function test_draw_returnsZeroWhenQueueExhausted() public {
        vm.prank(student1);
        core.setStake(uniCourt, 3000);

        vm.prank(disputer);
        uniArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        uint256 disputeID = 0;

        address[] memory jurors = new address[](1);
        jurors[0] = student1;
        vm.prank(instructorAddr);
        uniDK.setJurors(disputeID, jurors);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        (, , , , uint256 nbVoters, ) = uniDK.getRoundInfo(disputeID, 0, 0);
        assertEq(nbVoters, 1, "Only 1 juror should be drawn");
        assertEq(sortitionModule.disputesWithoutJurors(), 1, "Dispute still needs jurors");
    }

    function test_draw_skipsDuplicateJurors() public {
        vm.prank(student1);
        core.setStake(uniCourt, 3000);

        vm.prank(disputer);
        uniArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        uint256 disputeID = 0;

        address[] memory jurors = new address[](3);
        jurors[0] = student1;
        jurors[1] = student1;
        jurors[2] = student1;
        vm.prank(instructorAddr);
        uniDK.setJurors(disputeID, jurors);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        (, , , , uint256 nbVoters, ) = uniDK.getRoundInfo(disputeID, 0, 0);
        assertEq(nbVoters, 1, "Duplicate jurors should be skipped");
        assertEq(uniDK.getJurorQueueCursor(disputeID), 3, "All queue entries should be consumed");
    }

    function test_draw_emptyQueueReturnsNoJurors() public {
        vm.prank(student1);
        core.setStake(uniCourt, 3000);

        vm.prank(disputer);
        uniArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        uint256 disputeID = 0;

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        (, , , , uint256 nbVoters, ) = uniDK.getRoundInfo(disputeID, 0, 0);
        assertEq(nbVoters, 0, "No jurors should be drawn from empty queue");
    }

    function test_draw_lockStakeOnDrawnJuror() public {
        vm.prank(student1);
        core.setStake(uniCourt, 3000);

        vm.prank(disputer);
        uniArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        uint256 disputeID = 0;

        address[] memory jurors = new address[](3);
        jurors[0] = student1;
        jurors[1] = student1;
        jurors[2] = student1;
        vm.prank(instructorAddr);
        uniDK.setJurors(disputeID, jurors);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();

        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        (uint256 totalStaked, uint256 totalLocked, , ) = sortitionModule.getJurorBalance(student1, uniCourt);
        assertEq(totalStaked, 3000, "Wrong total staked");
        uint256 pnkAtStake = (1000 * 10000) / ONE_BASIS_POINT;
        assertEq(totalLocked, pnkAtStake, "Should lock PNK for the one successful draw");
    }

    // =========================================================================
    // Full Dispute Lifecycle: draw -> vote -> execute -> ruling
    // =========================================================================

    function test_fullLifecycle_drawVoteExecuteRuling() public {
        vm.prank(student1);
        core.setStake(uniCourt, 5000);
        vm.prank(student2);
        core.setStake(uniCourt, 5000);
        vm.prank(student3);
        core.setStake(uniCourt, 5000);

        vm.prank(disputer);
        uniArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        uint256 disputeID = 0;

        address[] memory jurors = new address[](3);
        jurors[0] = student1;
        jurors[1] = student2;
        jurors[2] = student3;
        vm.prank(instructorAddr);
        uniDK.setJurors(disputeID, jurors);

        // Draw
        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        // Pass evidence period -> vote period
        vm.warp(block.timestamp + 10);
        core.passPeriod(disputeID);

        // Vote: student1 votes 1, student2 and student3 vote 2
        uint256[] memory voteIDs = new uint256[](1);
        voteIDs[0] = 0;
        vm.prank(student1);
        uniDK.castVote(disputeID, voteIDs, 1, 0, "reason1");

        voteIDs = new uint256[](1);
        voteIDs[0] = 1;
        vm.prank(student2);
        uniDK.castVote(disputeID, voteIDs, 2, 0, "reason2");

        voteIDs = new uint256[](1);
        voteIDs[0] = 2;
        vm.prank(student3);
        uniDK.castVote(disputeID, voteIDs, 2, 0, "reason3");

        // Pass to appeal
        core.passPeriod(disputeID);

        // Pass appeal period -> execution
        vm.warp(block.timestamp + 40);
        core.passPeriod(disputeID);

        (, , KlerosCore.Period period, , , ) = core.disputes(disputeID);
        assertEq(uint256(period), uint256(KlerosCore.Period.execution), "Should be execution period");

        // Execute penalties + rewards
        core.execute(disputeID, 0, 6);

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.repartitions, 6, "All repartitions should be done");

        // student1 was incoherent => penalized
        (uint256 student1Staked, , , ) = sortitionModule.getJurorBalance(student1, uniCourt);
        assertLt(student1Staked, 5000, "Incoherent juror should be penalized");

        // Execute ruling
        vm.expectEmit(true, true, true, true);
        emit IArbitratorV2.Ruling(uniArbitrable, disputeID, 2);
        core.executeRuling(disputeID);

        (, , , bool ruled, bool executed, ) = core.disputes(disputeID);
        assertEq(ruled, true, "Should be ruled");
        assertEq(executed, true, "Should be executed");
    }

    function test_fullLifecycle_unanimousVote() public {
        vm.prank(student1);
        core.setStake(uniCourt, 5000);
        vm.prank(student2);
        core.setStake(uniCourt, 5000);
        vm.prank(student3);
        core.setStake(uniCourt, 5000);

        vm.prank(disputer);
        uniArbitrable.createDispute{value: feeForJuror * DEFAULT_NB_OF_JURORS}("Action");
        uint256 disputeID = 0;

        address[] memory jurors = new address[](3);
        jurors[0] = student1;
        jurors[1] = student2;
        jurors[2] = student3;
        vm.prank(instructorAddr);
        uniDK.setJurors(disputeID, jurors);

        vm.warp(block.timestamp + minStakingTime);
        sortitionModule.passPhase();
        vm.warp(block.timestamp + rngLookahead);
        sortitionModule.passPhase();
        core.draw(disputeID, DEFAULT_NB_OF_JURORS);

        vm.warp(block.timestamp + 10);
        core.passPeriod(disputeID); // vote

        // All vote 1
        for (uint256 i = 0; i < DEFAULT_NB_OF_JURORS; i++) {
            (address account, , , ) = uniDK.getVoteInfo(disputeID, 0, i);
            uint256[] memory ids = new uint256[](1);
            ids[0] = i;
            vm.prank(account);
            uniDK.castVote(disputeID, ids, 1, 0, "agree");
        }

        core.passPeriod(disputeID); // appeal
        vm.warp(block.timestamp + 40);
        core.passPeriod(disputeID); // execution

        assertEq(uniDK.getCoherentCount(disputeID, 0), 3, "All jurors should be coherent");

        core.execute(disputeID, 0, 6);

        KlerosCore.Round memory round = core.getRoundInfo(disputeID, 0);
        assertEq(round.pnkPenalties, 0, "No penalties for unanimous vote");

        // All stakers should keep their full stake
        for (uint256 i = 0; i < DEFAULT_NB_OF_JURORS; i++) {
            (uint256 totalStaked, uint256 totalLocked, , ) = sortitionModule.getJurorBalance(jurors[i], uniCourt);
            assertGe(totalStaked, 5000, "Coherent juror should keep stake");
            assertEq(totalLocked, 0, "Tokens should be unlocked");
        }

        core.executeRuling(disputeID);
        (, , , bool ruled, bool executed, ) = core.disputes(disputeID);
        assertTrue(ruled && executed, "Dispute should be ruled and executed");
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {KlerosCore_TestBase} from "./KlerosCore_TestBase.sol";
import {SortitionModule} from "../../src/arbitration/SortitionModule.sol";
import {RNGWithFallback, IRNG} from "../../src/rng/RNGWithFallback.sol";
import {RNGMock} from "../../src/test/RNGMock.sol";
import "../../src/libraries/Constants.sol";

/// @title KlerosCore_RNGTest
/// @dev Tests for KlerosCore random number generation and fallback mechanisms
contract KlerosCore_RNGTest is KlerosCore_TestBase {
    function test_RNGFallback() public {
        RNGWithFallback rngFallback;
        uint256 fallbackTimeout = 100;
        RNGMock rngMock = new RNGMock();
        rngFallback = new RNGWithFallback(msg.sender, address(sortitionModule), fallbackTimeout, rngMock);
        assertEq(rngFallback.owner(), msg.sender, "Wrong owner");
        assertEq(rngFallback.consumer(), address(sortitionModule), "Wrong sortition module address");
        assertEq(address(rngFallback.rng()), address(rngMock), "Wrong RNG in fallback contract");
        assertEq(rngFallback.fallbackTimeoutSeconds(), fallbackTimeout, "Wrong fallback timeout");
        assertEq(rngFallback.requestTimestamp(), 0, "Request timestamp should be 0");

        vm.prank(owner);
        sortitionModule.changeRandomNumberGenerator(rngFallback);
        assertEq(address(sortitionModule.rng()), address(rngFallback), "Wrong RNG address");

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
        assertEq(rngFallback.requestTimestamp(), block.timestamp, "Wrong request timestamp");

        vm.expectRevert(SortitionModule.RandomNumberNotReady.selector);
        sortitionModule.passPhase();

        vm.warp(block.timestamp + fallbackTimeout + 1);

        // Pass several blocks too to see that correct block.number is still picked up.
        vm.roll(block.number + 5);

        vm.expectEmit(true, true, true, true);
        emit RNGWithFallback.RNGFallback();
        sortitionModule.passPhase(); // Drawing phase

        assertEq(sortitionModule.randomNumber(), uint256(blockhash(block.number - 1)), "Wrong random number");
    }

    function test_RNGFallback_happyPath() public {
        RNGWithFallback rngFallback;
        uint256 fallbackTimeout = 100;
        RNGMock rngMock = new RNGMock();
        rngFallback = new RNGWithFallback(msg.sender, address(sortitionModule), fallbackTimeout, rngMock);

        vm.prank(owner);
        sortitionModule.changeRandomNumberGenerator(rngFallback);
        assertEq(address(sortitionModule.rng()), address(rngFallback), "Wrong RNG address");

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

        assertEq(rngFallback.requestTimestamp(), 0, "Request timestamp should be 0");

        sortitionModule.passPhase(); // Generating
        assertEq(rngFallback.requestTimestamp(), block.timestamp, "Wrong request timestamp");
        assertEq(rngFallback.requestAccepted(), true, "Request accepted");

        rngMock.setRN(123);

        sortitionModule.passPhase(); // Drawing phase
        assertEq(sortitionModule.randomNumber(), 123, "Wrong random number");
    }

    function test_RNGFallback_sanityChecks() public {
        RNGWithFallback rngFallback;
        uint256 fallbackTimeout = 100;
        RNGMock rngMock = new RNGMock();
        rngFallback = new RNGWithFallback(msg.sender, address(sortitionModule), fallbackTimeout, rngMock);

        vm.expectRevert(RNGWithFallback.ConsumerOnly.selector);
        vm.prank(owner);
        rngFallback.requestRandomness();

        vm.expectRevert(RNGWithFallback.ConsumerOnly.selector);
        vm.prank(owner);
        rngFallback.receiveRandomness();

        vm.expectRevert(RNGWithFallback.OwnerOnly.selector);
        vm.prank(other);
        rngFallback.changeOwner(other);
        vm.prank(owner);
        rngFallback.changeOwner(other);
        assertEq(rngFallback.owner(), other, "Wrong owner");

        // Change owner back for convenience
        vm.prank(other);
        rngFallback.changeOwner(owner);

        vm.expectRevert(RNGWithFallback.OwnerOnly.selector);
        vm.prank(other);
        rngFallback.changeConsumer(other);
        vm.prank(owner);
        rngFallback.changeConsumer(other);
        assertEq(rngFallback.consumer(), other, "Wrong consumer");

        vm.expectRevert(RNGWithFallback.OwnerOnly.selector);
        vm.prank(other);
        rngFallback.changeFallbackTimeout(5);

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit RNGWithFallback.FallbackTimeoutChanged(5);
        rngFallback.changeFallbackTimeout(5);
        assertEq(rngFallback.fallbackTimeoutSeconds(), 5, "Wrong fallback timeout");
    }

    function test_RNGFallback_insufficientGasForRequest() public {
        uint256 fallbackTimeout = 100;
        RNGMock rngMock = new RNGMock();
        RNGWithFallback rngFallback = new RNGWithFallback(
            msg.sender,
            address(sortitionModule),
            fallbackTimeout,
            rngMock
        );

        vm.prank(owner);
        sortitionModule.changeRandomNumberGenerator(rngFallback);

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

        vm.mockCallRevert(address(rngMock), abi.encodeWithSelector(IRNG.requestRandomness.selector), bytes(""));

        vm.expectRevert(RNGWithFallback.InsufficientGasForRequest.selector);
        sortitionModule.passPhase{gas: 400_000}();
    }

    function test_RNGFallback_badRequest() public {
        RNGWithFallback rngFallback;
        uint256 fallbackTimeout = 100;
        RNGMock rngMock = new RNGMock();
        rngFallback = new RNGWithFallback(msg.sender, address(sortitionModule), fallbackTimeout, rngMock);

        vm.prank(owner);
        sortitionModule.changeRandomNumberGenerator(rngFallback);

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

        vm.mockCallRevert(address(rngMock), abi.encodeWithSelector(IRNG.requestRandomness.selector), bytes(""));

        vm.expectEmit(true, true, true, true);
        emit RNGWithFallback.RNGRequestFailed();
        sortitionModule.passPhase{gas: 600_000}(); // Generating

        assertEq(rngFallback.requestAccepted(), false, "Request not accepted");

        vm.expectRevert(SortitionModule.RandomNumberNotReady.selector);
        sortitionModule.passPhase();

        vm.warp(block.timestamp + fallbackTimeout + 1);

        // Pass several blocks too to see that correct block.number is still picked up.
        vm.roll(block.number + 5);

        vm.expectEmit(true, true, true, true);
        emit RNGWithFallback.RNGFallback();
        sortitionModule.passPhase(); // Drawing phase

        assertEq(sortitionModule.randomNumber(), uint256(blockhash(block.number - 1)), "Wrong random number");
    }
}

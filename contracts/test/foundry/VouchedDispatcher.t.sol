// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {MessageIdCalculator} from "@kleros/veashi-sdk/contracts/utils/MessageIdCalculator.sol";
import {MessageHashCalculator} from "@kleros/veashi-sdk/contracts/utils/MessageHashCalculator.sol";
import {VouchedDispatcher} from "../../src/gateway/VouchedDispatcher.sol";
import {SelfVouchingDispatcher} from "./gateway/Reporters.sol";

/// @dev A Yaho that calls its dispatcher back once during a dispatch, as a reporter re-entering a gateway would.
contract ReenteringYaho is MessageIdCalculator, MessageHashCalculator {
    uint256 public currentNonce;
    bool internal reentered;

    function dispatchMessageToAdapters(
        uint256 _targetChainId,
        uint256 _threshold,
        address _receiver,
        bytes calldata _data,
        IReporter[] calldata _reporters,
        IAdapter[] calldata _adapters
    ) external payable returns (uint256, bytes32[] memory) {
        if (!reentered) {
            reentered = true;
            SelfVouchingDispatcher(msg.sender).dispatch(
                _targetChainId,
                _threshold,
                _receiver,
                _data,
                _reporters,
                _adapters
            );
        }
        return (0, new bytes32[](0));
    }
}

/// @dev A Yaho that dispatches another message than the one its dispatcher vouched for, so it returns another ID.
contract OtherMessageYaho is MessageIdCalculator, MessageHashCalculator {
    uint256 public constant OTHER_MESSAGE_ID = 12345;
    uint256 public currentNonce;

    function dispatchMessageToAdapters(
        uint256,
        uint256,
        address,
        bytes calldata,
        IReporter[] calldata,
        IAdapter[] calldata
    ) external payable returns (uint256, bytes32[] memory) {
        return (OTHER_MESSAGE_ID, new bytes32[](0));
    }
}

/// @dev `_dispatchVouched` vouches for one message at a time, and only for the message Yaho really dispatched.
contract VouchedDispatcherTest is Test {
    address internal receiver = makeAddr("receiver");
    bytes internal data = "data";

    function test_nestedDispatch_reverts() public {
        SelfVouchingDispatcher dispatcher = new SelfVouchingDispatcher(address(new ReenteringYaho()));
        vm.expectRevert(VouchedDispatcher.NestedDispatch.selector);
        dispatcher.dispatch(block.chainid, 1, receiver, data, new IReporter[](1), new IAdapter[](1));
    }

    function test_unexpectedMessageId_reverts() public {
        OtherMessageYaho yaho = new OtherMessageYaho();
        SelfVouchingDispatcher dispatcher = new SelfVouchingDispatcher(address(yaho));
        Message memory message = Message(
            0,
            block.chainid,
            1,
            address(dispatcher),
            receiver,
            data,
            new IReporter[](1),
            new IAdapter[](1)
        );
        bytes32 messageHash = yaho.calculateMessageHash(message);
        uint256 expectedId = yaho.calculateMessageId(block.chainid, address(yaho), messageHash);

        vm.expectRevert(
            abi.encodeWithSelector(VouchedDispatcher.UnexpectedMessageId.selector, yaho.OTHER_MESSAGE_ID(), expectedId)
        );
        dispatcher.dispatch(block.chainid, 1, receiver, data, new IReporter[](1), new IAdapter[](1));
        assertFalse(dispatcher.isDispatching(messageHash), "not vouched");
    }
}

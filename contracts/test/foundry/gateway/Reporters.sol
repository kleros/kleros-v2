// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IDispatchVoucher} from "../../../src/gateway/interfaces/IDispatchVoucher.sol";
import {VouchedDispatcher} from "../../../src/gateway/VouchedDispatcher.sol";

/// @dev A reporter like the audited Veashi ones: called by its Yaho only, it accepts a message only while its single
/// dispatcher vouches for the message hash, and records what it was asked to dispatch.
contract VouchingReporter is IReporter {
    address public immutable YAHO;
    address public immutable owner;
    address public dispatcher; // Settable once the gateway proxy exists, which takes the reporters at `initialize`.

    uint256 public dispatchCount;
    uint256 public lastTargetChainId;
    IAdapter public lastAdapter;
    uint256 public lastMessageId;
    bytes32 public lastMessageHash;
    bool public otherHashVouched; // Whether the dispatcher also vouched for a hash other than the dispatched one.

    error OwnerOnly();
    error NotVouched(bytes32 _messageHash);

    constructor(address _yaho) {
        YAHO = _yaho;
        owner = msg.sender;
    }

    function setDispatcher(address _dispatcher) external {
        if (msg.sender != owner) revert OwnerOnly();
        dispatcher = _dispatcher;
    }

    function dispatchBlocks(uint256, IAdapter, uint256[] memory) external payable returns (bytes32) {
        revert("Not supported");
    }

    function dispatchMessages(
        uint256 _targetChainId,
        IAdapter _adapter,
        uint256[] memory _messageIds,
        bytes32[] memory _messageHashes
    ) external payable returns (bytes32) {
        if (msg.sender != YAHO) revert NotYaho(msg.sender, YAHO);
        if (!IDispatchVoucher(dispatcher).isDispatching(_messageHashes[0])) revert NotVouched(_messageHashes[0]);
        otherHashVouched = IDispatchVoucher(dispatcher).isDispatching(_messageHashes[0] ^ bytes32(uint256(1)));
        lastTargetChainId = _targetChainId;
        lastAdapter = _adapter;
        lastMessageId = _messageIds[0];
        lastMessageHash = _messageHashes[0];
        emit MessageDispatched(_targetChainId, _adapter, _messageIds[0], _messageHashes[0]);
        return bytes32(++dispatchCount);
    }
}

/// @dev A reporter whose bridge is down: every dispatch reverts.
contract RevertingReporter is IReporter {
    error ReporterDown();

    function dispatchBlocks(uint256, IAdapter, uint256[] memory) external payable returns (bytes32) {
        revert ReporterDown();
    }

    function dispatchMessages(
        uint256,
        IAdapter,
        uint256[] memory,
        bytes32[] memory
    ) external payable returns (bytes32) {
        revert ReporterDown();
    }
}

/// @dev Another contract dispatching through the same Yaho with a gateway's reporters, vouching for its own message.
contract SelfVouchingDispatcher is VouchedDispatcher {
    address internal immutable yaho;

    constructor(address _yahoAddress) {
        yaho = _yahoAddress;
    }

    function dispatch(
        uint256 _targetChainId,
        uint256 _threshold,
        address _receiver,
        bytes memory _data,
        IReporter[] memory _reporters,
        IAdapter[] memory _adapters
    ) external returns (uint256 messageId) {
        (messageId, ) = _dispatchVouched(_targetChainId, _threshold, _receiver, _data, _reporters, _adapters);
    }

    function _yaho() internal view override returns (address) {
        return yaho;
    }
}

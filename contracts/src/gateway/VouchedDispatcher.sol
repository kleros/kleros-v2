// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.28;

import {Yaho} from "@kleros/veashi-sdk/contracts/Yaho.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IDispatchVoucher} from "./interfaces/IDispatchVoucher.sol";

/// @title VouchedDispatcher
/// @dev Copied from kleros/vea veashi-contracts/src/VouchedDispatcher.sol (fix/veashi-audit a04190b), with the
/// imports pointed at the Veashi SDK package. Replace with the SDK's copy once the SDK ships it.
/// Inherited by gateways: dispatches a message through Hashi's Yaho and, for the length of that call,
/// vouches for its hash so the reporters (whose dispatcher this contract is) agree to pay for it.
/// It has no constructor and only a transient variable, which lives outside persistent storage, so an
/// upgradeable gateway can inherit it without moving its storage layout.
abstract contract VouchedDispatcher is IDispatchVoucher {
    /// @dev The hash of the message being dispatched, zero outside a dispatch; cleared at the end of every transaction.
    bytes32 private transient _dispatchingHash;

    error NestedDispatch();
    error UnexpectedMessageId(uint256 messageId, uint256 expectedMessageId);

    /// @dev The Yaho this contract dispatches through.
    function _yaho() internal view virtual returns (address);

    /// @inheritdoc IDispatchVoucher
    function isDispatching(bytes32 messageHash) external view returns (bool) {
        return _dispatchingHash != bytes32(0) && _dispatchingHash == messageHash;
    }

    /// @dev Dispatches a message through `Yaho.dispatchMessageToAdapters`, vouching for its hash meanwhile.
    function _dispatchVouched(
        uint256 targetChainId,
        uint256 threshold,
        address receiver,
        bytes memory data,
        IReporter[] memory reporters,
        IAdapter[] memory adapters
    ) internal returns (uint256 messageId, bytes32[] memory reportersReceipts) {
        if (_dispatchingHash != bytes32(0)) revert NestedDispatch();
        Yaho yaho = Yaho(_yaho());

        // The message exactly as Yaho will build it: Yaho reads `currentNonce` before incrementing it.
        Message memory message = Message(
            yaho.currentNonce(),
            targetChainId,
            threshold,
            address(this),
            receiver,
            data,
            reporters,
            adapters
        );
        bytes32 messageHash = yaho.calculateMessageHash(message);
        uint256 expectedMessageId = yaho.calculateMessageId(block.chainid, address(yaho), messageHash);

        _dispatchingHash = messageHash;
        (messageId, reportersReceipts) = yaho.dispatchMessageToAdapters(
            targetChainId,
            threshold,
            receiver,
            data,
            reporters,
            adapters
        );
        if (messageId != expectedMessageId) revert UnexpectedMessageId(messageId, expectedMessageId);
        _dispatchingHash = bytes32(0);
    }
}

// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.28;

import {IYaho} from "@kleros/veashi-sdk/contracts/interfaces/IYaho.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IDispatchVoucher} from "./interfaces/IDispatchVoucher.sol";

/// @dev Yaho's public nonce, which `IYaho` does not declare. Importing the Yaho contract for it would compile Yaho
/// into every build of a gateway, and Yaho compiles only with via-IR.
interface IYahoNonce {
    function currentNonce() external view returns (uint256);
}

/// @title VouchedDispatcher
/// @dev Copied from kleros/vea veashi-contracts/src/VouchedDispatcher.sol (fix/veashi-audit a04190b), with the
/// imports pointed at the Veashi SDK package, Yaho called through its interface, and the transient variable replaced
/// by a fixed storage slot, so it compiles without via-IR and for EVM versions before Cancun (kleros-v2 targets
/// paris). Replace with the SDK's copy once the SDK ships one that does the same.
/// Inherited by gateways: dispatches a message through Hashi's Yaho and, for the length of that call,
/// vouches for its hash so the reporters (whose dispatcher this contract is) agree to pay for it.
/// It has no constructor and no declared state variable: the hash lives in an ERC-7201 slot, so an upgradeable
/// gateway can inherit it without moving its storage layout.
abstract contract VouchedDispatcher is IDispatchVoucher {
    /// @dev Holds the hash of the message being dispatched, zero outside a dispatch: set before the Yaho call and
    /// cleared right after it, so a dispatch that reverts leaves it zero too.
    /// @custom:storage-location erc7201:kleros.storage.VouchedDispatcher
    // keccak256(abi.encode(uint256(keccak256("kleros.storage.VouchedDispatcher")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant _DISPATCHING_HASH_SLOT =
        0x526d482aa211ef6c532310be10c350affd8ad93f6ef862b938be5cdbd3ca2300;

    error NestedDispatch();
    error UnexpectedMessageId(uint256 messageId, uint256 expectedMessageId);

    /// @dev The Yaho this contract dispatches through.
    function _yaho() internal view virtual returns (address);

    /// @inheritdoc IDispatchVoucher
    function isDispatching(bytes32 messageHash) external view returns (bool) {
        bytes32 dispatchingHash = _dispatchingHash();
        return dispatchingHash != bytes32(0) && dispatchingHash == messageHash;
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
        if (_dispatchingHash() != bytes32(0)) revert NestedDispatch();
        IYaho yaho = IYaho(_yaho());

        // The message exactly as Yaho will build it: Yaho reads `currentNonce` before incrementing it.
        Message memory message = Message(
            IYahoNonce(address(yaho)).currentNonce(),
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

        _setDispatchingHash(messageHash);
        (messageId, reportersReceipts) = yaho.dispatchMessageToAdapters(
            targetChainId,
            threshold,
            receiver,
            data,
            reporters,
            adapters
        );
        if (messageId != expectedMessageId) revert UnexpectedMessageId(messageId, expectedMessageId);
        _setDispatchingHash(bytes32(0));
    }

    /// @dev The hash of the message being dispatched, zero outside a dispatch.
    function _dispatchingHash() private view returns (bytes32 messageHash) {
        bytes32 slot = _DISPATCHING_HASH_SLOT;
        assembly ("memory-safe") {
            messageHash := sload(slot)
        }
    }

    /// @dev Stores the hash of the message being dispatched.
    function _setDispatchingHash(bytes32 messageHash) private {
        bytes32 slot = _DISPATCHING_HASH_SLOT;
        assembly ("memory-safe") {
            sstore(slot, messageHash)
        }
    }
}

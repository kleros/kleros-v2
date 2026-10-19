// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IHashi} from "@kleros/veashi-sdk/contracts/interfaces/IHashi.sol";
import {IJushin} from "@kleros/veashi-sdk/contracts/interfaces/IJushin.sol";
import {IYaru} from "@kleros/veashi-sdk/contracts/interfaces/IYaru.sol";
import {Message} from "@kleros/veashi-sdk/contracts/interfaces/IMessage.sol";
import {Adapter} from "@kleros/veashi-sdk/contracts/adapters/Adapter.sol";
import {MessageIdCalculator} from "@kleros/veashi-sdk/contracts/utils/MessageIdCalculator.sol";
import {MessageHashCalculator} from "@kleros/veashi-sdk/contracts/utils/MessageHashCalculator.sol";
import {Hashi} from "@kleros/veashi-sdk/contracts/Hashi.sol"; // Compiled so the Hardhat fixture can deploy it.
import {IDispatchVoucher} from "../interfaces/IDispatchVoucher.sol";

// Veashi messaging in one EVM for the Hardhat fixture (deploy/03-veashi-mock.ts), next to the SDK's own Yaho and
// Hashi: a reporter bridges a message hash by storing it straight into the adapter of the other leg, and Yaru
// executes a message once enough of its adapters hold its hash.

/// @title ReporterMock
/// @dev Like the audited Veashi reporters, it accepts a message only from its Yaho and only while its dispatcher
/// vouches for the message hash. Instead of paying a bridge, it stores the hash into the target `AdapterMock`.
contract ReporterMock is IReporter {
    address public immutable yaho;
    address public immutable owner;
    address public dispatcher; // Set once the gateway proxy exists, since the gateway takes its reporters at `initialize`.

    error OwnerOnly();
    error NotVouched(bytes32 _messageHash);

    constructor(address _yaho) {
        yaho = _yaho;
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
        if (msg.sender != yaho) revert NotYaho(msg.sender, yaho);
        for (uint256 i = 0; i < _messageIds.length; i++) {
            if (!IDispatchVoucher(dispatcher).isDispatching(_messageHashes[i])) revert NotVouched(_messageHashes[i]);
            emit MessageDispatched(_targetChainId, _adapter, _messageIds[i], _messageHashes[i]);
        }
        // The domain is the source chain, which Yaru passes to Hashi.
        AdapterMock(address(_adapter)).storeHashes(block.chainid, _messageIds, _messageHashes);
        return bytes32(0);
    }
}

/// @title AdapterMock
/// @dev The SDK adapter storage, written by a single reporter.
contract AdapterMock is Adapter {
    address public immutable reporter;

    error ReporterOnly();

    constructor(address _reporter) {
        reporter = _reporter;
    }

    function storeHashes(uint256 _domain, uint256[] memory _ids, bytes32[] memory _hashes) external {
        if (msg.sender != reporter) revert ReporterOnly();
        _storeHashes(_domain, _ids, _hashes);
    }
}

/// @title YaruMock
/// @dev The SDK's Yaru without OpenZeppelin v4's ReentrancyGuard, whose import path OpenZeppelin v5 no longer has.
/// Nothing in the fixture re-enters it.
contract YaruMock is IYaru, MessageIdCalculator, MessageHashCalculator {
    address public immutable HASHI;
    address public immutable YAHO;
    uint256 public immutable SOURCE_CHAIN_ID;

    mapping(uint256 => bool) public executed;

    constructor(address _hashi, address _yaho, uint256 _sourceChainId) {
        HASHI = _hashi;
        YAHO = _yaho;
        SOURCE_CHAIN_ID = _sourceChainId;
    }

    /// @inheritdoc IYaru
    function executeMessages(Message[] calldata messages) external returns (bytes[] memory) {
        bytes[] memory returnDatas = new bytes[](messages.length);
        for (uint256 i = 0; i < messages.length; i++) {
            Message memory message = messages[i];

            bytes32 messageHash = calculateMessageHash(message);
            uint256 messageId = calculateMessageId(SOURCE_CHAIN_ID, YAHO, messageHash);

            if (message.targetChainId != block.chainid) revert InvalidToChainId(message.targetChainId, block.chainid);

            if (executed[messageId]) revert MessageIdAlreadyExecuted(messageId);
            executed[messageId] = true;

            if (
                !IHashi(HASHI).checkHashWithThresholdFromAdapters(
                    SOURCE_CHAIN_ID,
                    messageId,
                    message.threshold,
                    message.adapters
                )
            ) revert ThresholdNotMet();

            try
                IJushin(message.receiver).onMessage(
                    messageId,
                    SOURCE_CHAIN_ID,
                    message.sender,
                    message.threshold,
                    message.adapters,
                    message.data
                )
            returns (bytes memory returnData) {
                returnDatas[i] = returnData;
            } catch {
                revert CallFailed();
            }

            emit MessageExecuted(messageId, message);
        }
        return returnDatas;
    }
}

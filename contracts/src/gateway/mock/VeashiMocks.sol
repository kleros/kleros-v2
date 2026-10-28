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

// Veashi messaging in one EVM for the Hardhat fixture (deploy/03-veashi-mock.ts), next to the SDK's own Hashi:
// Yaho dispatches a message to its reporters, a reporter bridges the message hash by storing it straight into the
// adapter of the other leg, and Yaru executes a message once enough of its adapters hold its hash.

/// @title YahoMock
/// @dev The SDK's Yaho reduced to `dispatchMessageToAdapters`, the only dispatch the gateways use, with the same
/// message, hash, ID, event and reporter calls. The SDK contract compiles only with via-IR, and a via-IR override for
/// it in hardhat.config.ts would make solidity-coverage instrument every contract for via-IR.
contract YahoMock is MessageIdCalculator, MessageHashCalculator {
    uint256 public currentNonce;

    error NoReportersGiven();
    error NoAdaptersGiven();
    error UnequalArrayLengths(uint256 arrayOne, uint256 arrayTwo);
    error InvalidThreshold(uint256 threshold, uint256 maxThreshold);

    event MessageDispatched(uint256 indexed messageId, Message message);

    function dispatchMessageToAdapters(
        uint256 targetChainId,
        uint256 threshold,
        address receiver,
        bytes calldata data,
        IReporter[] calldata reporters,
        IAdapter[] calldata adapters
    ) external payable returns (uint256, bytes32[] memory) {
        _checkReportersAndAdapters(threshold, reporters, adapters);
        (uint256 messageId, bytes32 messageHash) = _dispatchMessage(
            targetChainId,
            threshold,
            receiver,
            data,
            reporters,
            adapters
        );
        bytes32[] memory reportersReceipts = _dispatchMessageToAdapters(
            targetChainId,
            messageId,
            messageHash,
            reporters,
            adapters
        );
        return (messageId, reportersReceipts);
    }

    function _checkReportersAndAdapters(
        uint256 threshold,
        IReporter[] calldata reporters,
        IAdapter[] calldata adapters
    ) internal pure {
        if (reporters.length == 0) revert NoReportersGiven();
        if (adapters.length == 0) revert NoAdaptersGiven();
        if (reporters.length != adapters.length) revert UnequalArrayLengths(reporters.length, adapters.length);
        if (threshold > reporters.length || threshold == 0) revert InvalidThreshold(threshold, reporters.length);
    }

    function _dispatchMessage(
        uint256 targetChainId,
        uint256 threshold,
        address receiver,
        bytes calldata data,
        IReporter[] calldata reporters,
        IAdapter[] calldata adapters
    ) internal returns (uint256, bytes32) {
        Message memory message = Message(
            currentNonce,
            targetChainId,
            threshold,
            msg.sender,
            receiver,
            data,
            reporters,
            adapters
        );
        bytes32 messageHash = calculateMessageHash(message);
        uint256 messageId = calculateMessageId(block.chainid, address(this), messageHash);
        unchecked {
            ++currentNonce;
        }
        emit MessageDispatched(messageId, message);
        return (messageId, messageHash);
    }

    function _dispatchMessageToAdapters(
        uint256 targetChainId,
        uint256 messageId,
        bytes32 messageHash,
        IReporter[] memory reporters,
        IAdapter[] memory adapters
    ) internal returns (bytes32[] memory reportersReceipts) {
        uint256[] memory messageIds = new uint256[](1);
        bytes32[] memory messageHashes = new bytes32[](1);
        messageIds[0] = messageId;
        messageHashes[0] = messageHash;
        reportersReceipts = new bytes32[](reporters.length);
        for (uint256 i = 0; i < reporters.length; i++) {
            if (address(reporters[i]) != address(0)) {
                reportersReceipts[i] = reporters[i].dispatchMessages(
                    targetChainId,
                    adapters[i],
                    messageIds,
                    messageHashes
                );
            }
        }
    }
}

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

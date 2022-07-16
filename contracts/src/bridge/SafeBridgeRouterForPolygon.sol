// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere @hrishibhat]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/ISafeBridgeReceiver.sol";
import "./interfaces/ISafeBridgeSender.sol";
import "./canonical/polygon/FxBaseRootTunnel.sol";
import "./canonical/arbitrum/IInbox.sol";
import "./canonical/arbitrum/IOutbox.sol";

/**
 * Router on Ethereum from Arbitrum to Polygon Chain.
 */
contract SafeBridgeRouter is ISafeBridgeReceiver, ISafeBridgeSender, FxBaseRootTunnel {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event safeRelayed(bytes32 indexed txID);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IInbox public immutable inbox; // The address of the Arbitrum Inbox contract.
    address public immutable safeBridgeSender; // The address of the Safe Bridge sender on Arbitrum.

    /**
     * @dev Constructor.
     * @param _inbox The address of the inbox contract on Ethereum.
     * @param _fxRoot The address of the fxRoot contract in Ethereum.
     * @param _safeBridgeSender The safe bridge sender on Arbitrum.
     * @param _fastBridgeReceiverOnPolygon The fast bridge receiver on Polygon Chain.
     */

    constructor(
        IInbox _inbox,
        address _checkpointManager,
        address _fxRoot,
        address _safeBridgeSender,
        address _fastBridgeReceiverOnPolygon
    ) FxBaseRootTunnel(_checkpointManager, _fxRoot) {
        inbox = _inbox;
        safeBridgeSender = _safeBridgeSender;
        setFxChildTunnel(_fastBridgeReceiverOnPolygon);
    }

    /**
     * Routes an arbitrary message from one domain to another.
     * Note: Access restricted to the Safe Bridge.
     * @param _epoch The epoch associated with the _batchmerkleRoot.
     * @param _batchMerkleRoot The true batchP merkle root for the epoch sent by the safe bridge.     * @return Unique id to track the message request/transaction.
     */
    function verifySafe(uint256 _epoch, bytes32 _batchMerkleRoot) external override onlyFromSafeBridge {
        // Note: fxRoot sends message directly to fxchild hence no need for encodeWithSelector
        bytes memory safeMessageData = abi.encode(_epoch, _batchMerkleRoot);

        // replace maxGasPerTx with safe level for production deployment
        _sendSafe(safeMessageData);
        // TODO: Consider an event emit here
    }

    function _sendSafe(bytes memory _calldata) internal {
        _sendMessageToChild(_calldata);
    }

    function _processMessageFromChild(bytes memory message) internal override {}

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (bytes32) {}

    // ************************************* //
    // *              Views                * //
    // ************************************* //

    function isSentBySafeBridge() internal view override returns (bool) {
        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        return outbox.l2ToL1Sender() == safeBridgeSender;
    }
}

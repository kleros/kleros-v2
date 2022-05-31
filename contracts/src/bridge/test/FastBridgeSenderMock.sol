// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../FastBridgeSenderBase.sol";
import "../interfaces/arbitrum/IArbSys.sol";

/**
 * Fast Sender from Arbitrum Mock
 * Counterpart of `FastReceiverOnEthereum`
 */
contract FastBridgeSenderMock is FastBridgeSenderBase {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event L2ToL1TxCreated(uint256 indexed txID);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IArbSys public immutable arbsys;

    /**
     * @dev Constructor.
     * @param _epochPeriod The immutable period between epochs.
     * @param _fastBridgeReceiver The address of the Fast Bridge on Ethereum.
     * @param _arbsys The address of the mock ArbSys contract.
     */
    constructor(
        uint256 _epochPeriod,
        address _fastBridgeReceiver,
        address _arbsys
    ) FastBridgeSenderBase(_epochPeriod, _fastBridgeReceiver) {
        arbsys = IArbSys(address(_arbsys));
    }

    /**
     * @dev Sends the merkle root state for _epoch to Ethereum using the Safe Bridge, which relies on Arbitrum's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _epoch The blocknumber of the batch
     */
    function sendSafeFallback(uint256 _epoch) external payable override {
        bytes32 batchMerkleRoot = fastOutbox[_epoch];

        // Safe Bridge message envelope
        bytes4 methodSelector = ISafeBridgeReceiver.verifySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _epoch, batchMerkleRoot);

        _sendSafe(safeBridgeReceiver, safeMessageData);
    }

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (bytes32) {
        uint256 txID = arbsys.sendTxToL1(_receiver, _calldata);

        emit L2ToL1TxCreated(txID);
        return bytes32(txID);
    }
}

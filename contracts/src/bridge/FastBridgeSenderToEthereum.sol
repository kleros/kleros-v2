// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/FastBridgeSenderBase.sol";
import "./interfaces/arbitrum/IArbSys.sol";

/**
 * Fast Bridge Sender to Ethereum from Arbitrum
 * Counterpart of `FastBridgeReceiverOnEthereum`
 */
contract FastBridgeSenderToEthereum is FastBridgeSenderBase {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event L2ToL1TxCreated(uint256 indexed txID);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IArbSys public constant ARB_SYS = IArbSys(address(100));
    IFastBridgeReceiver public immutable fastBridgeReceiver;

    /**
     * @dev Constructor.
     * @param _fastBridgeReceiver The address of the Fast Bridge on Ethereum.
     * @param _epochPeriod The immutable period between epochs.
     * @param _genesis The immutable genesis state variable from the FastBridgeSeneder.
     */
    constructor(
        uint256 _epochPeriod,
        uint256 _genesis,
        IFastBridgeReceiver _fastBridgeReceiver
    ) FastBridgeSenderBase(_epochPeriod, _genesis) {
        fastBridgeReceiver = _fastBridgeReceiver;
    }

    /**
     * @dev Sends the merkle root state for _epoch to Ethereum using the Safe Bridge, which relies on Arbitrum's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _epoch The blocknumber of the batch
     */
    function sendSafeFallback(uint256 _epoch) external payable override {
        bytes32 batchMerkleRoot = fastOutbox[_epoch];

        // Safe Bridge message envelope
        bytes4 methodSelector = IFastBridgeReceiver.verifySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _epoch, batchMerkleRoot);

        _sendSafe(address(fastBridgeReceiver), safeMessageData);
    }

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (uint256) {
        uint256 txID = ARB_SYS.sendTxToL1(_receiver, _calldata);

        emit L2ToL1TxCreated(txID);
        return txID;
    }
}

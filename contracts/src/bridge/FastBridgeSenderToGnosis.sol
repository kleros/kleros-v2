// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/FastBridgeSenderBase.sol";
import "./interfaces/arbitrum/IArbSys.sol";
import "./interfaces/ISafeBridgeRouter.sol";

/**
 * Fast Bridge Sender to Gnosis from Arbitrum
 * Counterpart of `FastBridgeReceiverOnGnosis`
 */
contract FastBridgeSenderToGnosis is FastBridgeSenderBase {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event L2ToL1TxCreated(uint256 indexed txID);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IArbSys public constant ARB_SYS = IArbSys(address(100));
    address public immutable safeBridgeRouter;

    /**
     * @dev Constructor.
     * @param _epochPeriod The duration between epochs.
     * @param _genesis The genesis time to synchronize epochs with the FastBridgeReceiverOnGnosis.
     * @param _safeBridgeRouter The the Safe Bridge Router on Ethereum from Arbitrum to Gnosis Chain.
     */
    constructor(
        uint256 _epochPeriod,
        uint256 _genesis,
        address _safeBridgeRouter
    ) FastBridgeSenderBase(_epochPeriod, _genesis) {
        safeBridgeRouter = _safeBridgeRouter;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /**
     * @dev Sends the merkle root state for _epoch to Ethereum using the Safe Bridge, which relies on Arbitrum's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _epoch The blocknumber of the batch.
     */
    function sendSafeFallback(uint256 _epoch) external payable override {
        bytes32 batchMerkleRoot = fastOutbox[_epoch];

        // Safe Bridge message envelope.
        bytes4 methodSelector = IFastBridgeReceiver.verifySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _epoch, batchMerkleRoot);

        // Safe Router message envelope.
        bytes4 methodSelectorRelay = ISafeBridgeRouter.safeRelay.selector;
        bytes memory safeRelayData = abi.encodeWithSelector(methodSelectorRelay, safeMessageData);

        _sendSafe(safeBridgeRouter, safeRelayData);
    }

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (uint256) {
        uint256 txID = ARB_SYS.sendTxToL1(_receiver, _calldata);

        emit L2ToL1TxCreated(txID);
        return txID;
    }
}

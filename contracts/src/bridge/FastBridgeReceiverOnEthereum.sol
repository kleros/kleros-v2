// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/ISafeBridgeReceiver.sol";
import "./interfaces/FastBridgeReceiverBase.sol";
import "./interfaces/gnosis-chain/IAMB.sol";
import "./interfaces/arbitrum/IInbox.sol";
import "./interfaces/arbitrum/IOutbox.sol";

/**
 * Fast Bridge Receiver on Ethereum from Arbitrum
 * Counterpart of `FastBridgeSenderToEthereum`
 */
contract FastBridgeReceiverOnEthereum is ISafeBridgeReceiver, FastBridgeReceiverBase {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public immutable safeBridgeSender; // The address of the Safe Bridge sender on Arbitrum.
    address public immutable fastBridgeReceiverOnGC; // The address of the Fast Bridge Receiver on Gnosis Chain.
    IInbox public immutable inbox; // The address of the Arbitrum Inbox contract.
    IAMB public immutable amb; // The address of the AMB contract on Ethereum.

    /**
     * @dev Constructor.
     * @param _deposit The deposit amount to submit a claim in wei.
     * @param _epochPeriod The duration of the period allowing to challenge a claim.
     */
    constructor(
        uint256 _deposit,
        uint256 _epochPeriod,
        uint256 _genesis,
        address _inbox,
        address _safeBridgeSender,
        IAMB _amb,
        address _fastBridgeReceiverOnGC
    ) FastBridgeReceiverBase(_deposit, _epochPeriod, _genesis) {
        inbox = IInbox(_inbox);
        safeBridgeSender = _safeBridgeSender;
        amb = _amb;
        fastBridgeReceiverOnGC = _fastBridgeReceiverOnGC;
    }

    /**
     * Note: Access restricted to the Safe Bridge.
     * @dev Relays safe epoch merkle root state to Gnosis Chain to resolve challenges.
     * @param _epoch The epoch to verify.
     * @param _batchMerkleRoot The true batch merkle root for the epoch.
     */
    function verifySafeGnosisRelay(uint256 _epoch, bytes32 _batchMerkleRoot) external {
        require(isSentBySafeBridge(), "Access not allowed: SafeBridgeSender only.");

        bytes4 methodSelector = IFastBridgeReceiver.verifySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _epoch, _batchMerkleRoot);
        amb.requireToPassMessage(fastBridgeReceiverOnGC, safeMessageData, amb.maxGasPerTx());
    }

    // ************************************* //
    // *              Views                * //
    // ************************************* //

    function isSentBySafeBridge() internal view override returns (bool) {
        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        return outbox.l2ToL1Sender() == safeBridgeSender;
    }
}

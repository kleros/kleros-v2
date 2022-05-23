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
import "./interfaces/IFastBridgeReceiver.sol";
import "./interfaces/gnosis-chain/IAMB.sol";
import "./interfaces/FastBridgeReceiverBase.sol";
import "./merkle/MerkleProof.sol";

/**
 * Fast Bridge Receiver on Ethereum from Arbitrum
 * Counterpart of `FastBridgeSenderToGnosis`
 */
contract FastBridgeReceiverOnGnosis is ISafeBridgeReceiver, FastBridgeReceiverBase {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public immutable safeBridgeRelayer; // The address of the Safe Bridge relayer on Ethereum.
    IAMB public immutable amb; // The address of the AMB contract on GC.

    /**
     * @dev Constructor.
     * @param _deposit The deposit amount to submit a claim in wei.
     * @param _epochPeriod The duration of the period allowing to challenge a claim.
     * @param _genesis The genesis time to synchronize epochs.
     * @param _amb The address of the AMB contract on GC.
     * @param _safeBridgeRelayer The safe bridge relayer on Ethereum.
     */
    constructor(
        uint256 _deposit,
        uint256 _epochPeriod,
        uint256 _genesis,
        address _amb,
        address _safeBridgeRelayer
    ) FastBridgeReceiverBase(_deposit, _epochPeriod, _genesis) {
        amb = IAMB(_amb);
        safeBridgeRelayer = _safeBridgeRelayer;
    }

    // ************************************* //
    // *              Views                * //
    // ************************************* //

    function isSentBySafeBridge() internal view override returns (bool) {
        return (msg.sender == address(amb)) && (amb.messageSender() == safeBridgeRelayer);
    }
}

// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./FastBridgeReceiverBase.sol";
import "./interfaces/gnosis-chain/IAMB.sol";

/**
 * Fast Bridge Receiver on Ethereum from Arbitrum
 * Counterpart of `FastBridgeSenderToGnosis`
 */
contract FastBridgeReceiverOnGnosis is FastBridgeReceiverBase {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IAMB public immutable amb; // The address of the AMB contract on GC.

    /**
     * @dev Constructor.
     * @param _deposit The deposit amount to submit a claim in wei.
     * @param _epochPeriod The duration of the period allowing to challenge a claim.
     * @param _challengePeriod The duration of the period allowing to challenge a claim.
     * @param _safeRouter The address of the Safe Bridge Router on Ethereum.
     * @param _amb The the AMB contract on Gnosis Chain.
     */
    constructor(
        uint256 _deposit,
        uint256 _epochPeriod,
        uint256 _challengePeriod,
        address _safeRouter,
        address _amb
    ) FastBridgeReceiverBase(_deposit, _epochPeriod, _challengePeriod, _safeRouter) {
        amb = IAMB(_amb);
    }

    // ************************************* //
    // *              Views                * //
    // ************************************* //

    function isSentBySafeBridge() internal view override returns (bool) {
        return (msg.sender == address(amb)) && (amb.messageSender() == safeRouter);
    }
}

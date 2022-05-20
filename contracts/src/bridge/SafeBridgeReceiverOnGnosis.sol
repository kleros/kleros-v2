// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/ISafeBridgeReceiver.sol";
import "./interfaces/gnosis-chain/IAMB.sol";

/**
 * Safe Bridge Receiver on Gnosis from Arbitrum
 * Counterpart of `SafeBridgeSenderToGnosis`
 */
contract SafeBridgeReceiverOnGnosis is ISafeBridgeReceiver {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    // will be set as immutable in production deployment for gas optimization
    address public immutable safeBridgeSender; // The address of the Safe Bridge sender on Arbitrum.
    IAMB public immutable amb; // The address of the AMB contract.

    /**
     * @dev Constructor.
     * @param _amb The address of the AMB contract.
     */
    constructor(IAMB _amb, address _safeBridgeSender) {
        amb = _amb;
        safeBridgeSender = _safeBridgeSender;
    }

    // ************************************* //
    // *              Views                * //
    // ************************************* //

    function isSentBySafeBridge() internal view override returns (bool) {
        return amb.messageSender() == safeBridgeSender;
    }
}

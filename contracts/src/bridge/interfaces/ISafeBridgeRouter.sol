// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./ISafeBridgeReceiver.sol";
import "./ISafeBridgeSender.sol";

/**
 * Abstract Router to forward messages between Safe Bridges.
 */
abstract contract ISafeBridgeRouter is ISafeBridgeReceiver, ISafeBridgeSender {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * @dev Event emitted when a message is relayed to another Safe Bridge.
     * @param _ticketID The unique identifier provided by the underlying canonical bridge.
     */
    event SafeRelayed(bytes32 indexed _ticketID);
}

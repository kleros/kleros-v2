// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../interfaces/ISafeBridgeReceiver.sol";
import "../interfaces/arbitrum/IInbox.sol";
import "../interfaces/arbitrum/IOutbox.sol";

/**
 * Safe Bridge Receiver on Ethereum from Arbitrum
 * Counterpart of `SafeBridgeSenderToEthereum`
 */
contract SafeBridgeReceiverOnEthereum is ISafeBridgeReceiver {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public immutable safeBridgeSender; // The address of the Safe Bridge sender on Arbitrum.
    IInbox public immutable inbox; // The address of the Arbitrum Inbox contract.

    /**
     * @dev Constructor.
     * @param _inbox The address of the Arbitrum Inbox contract.
     */
    constructor(address _inbox, address _safeBridgeSender) {
        inbox = IInbox(_inbox);
        safeBridgeSender = _safeBridgeSender;
    }

    // ************************************* //
    // *              Views                * //
    // ************************************* //

    function isSentBySafeBridge() internal view override returns (bool) {
        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        return outbox.l2ToL1Sender() == safeBridgeSender;
    }
}

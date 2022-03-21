// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/ISafeBridgeReceiver.sol";
import "./interfaces/arbitrum/IInbox.sol";
import "./interfaces/arbitrum/IOutbox.sol";

/**
 * Safe Bridge Receiver on Ethereum from Arbitrum
 * Counterpart of `SafeBridgeSenderToEthereum`
 */
contract SafeBridgeReceiverOnEthereum is ISafeBridgeReceiver {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor;
    address public safeBridgeSender;
    IInbox public inbox;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(
        address _governor,
        address _safeBridgeSender,
        address _inbox
    ) {
        governor = _governor;
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

    // ************************ //
    // *      Governance      * //
    // ************************ //

    function setSafeBridgeSender(address _safeBridgeSender) external onlyByGovernor {
        safeBridgeSender = _safeBridgeSender;
    }

    function setInbox(address _inbox) external onlyByGovernor {
        inbox = IInbox(_inbox);
    }
}

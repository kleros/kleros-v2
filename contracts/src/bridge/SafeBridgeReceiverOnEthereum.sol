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

    address public governor; // The governor of the contract.
    address public safeBridgeSender; // The address of the Safe Bridge sender on Arbitrum.
    IInbox public inbox; // The address of the Arbitrum Inbox contract.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    /**
     * @dev Constructor.
     * @param _governor The governor's address.
     * @param _safeBridgeSender The address of the Safe Bridge sender on Arbitrum.
     * @param _inbox The address of the Arbitrum Inbox contract.
     */
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

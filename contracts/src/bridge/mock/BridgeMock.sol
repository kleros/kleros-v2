// SPDX-License-Identifier: MIT

/**
 *  @authors: [@hrishibhat]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../interfaces/arbitrum/IInbox.sol";

contract BridgeMock is IBridge {
    address public outbox;

    constructor(address _outbox) {
        outbox = _outbox;
    }

    function activeOutbox() external view returns (address _outbox) {
        return address(outbox);
    }

    function deliverMessageToInbox(
        uint8 kind,
        address sender,
        bytes32 messageDataHash
    ) external payable returns (uint256) {}

    function executeCall(
        address destAddr,
        uint256 amount,
        bytes calldata data
    ) external returns (bool success, bytes memory returnData) {}

    // These are only callable by the admin
    function setInbox(address inbox, bool enabled) external {}

    function setOutbox(address inbox, bool enabled) external {}

    // View functions

    function allowedInboxes(address inbox) external view returns (bool) {}

    function allowedOutboxes(address outbox) external view returns (bool) {}

    function inboxAccs(uint256 index) external view returns (bytes32) {}

    function messageCount() external view returns (uint256) {}
}

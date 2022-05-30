// SPDX-License-Identifier: MIT

/**
 *  @authors: [@hrishibhat]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../../interfaces/arbitrum/IOutbox.sol";

contract OutboxMock is IOutbox {
    address public safeBridgeSender;

    constructor(address _safeBridgeSender) {
        safeBridgeSender = _safeBridgeSender;
    }

    function l2ToL1Sender() external view returns (address) {
        return address(safeBridgeSender);
    }

    function l2ToL1Block() external view returns (uint256) {}

    function l2ToL1EthBlock() external view returns (uint256) {}

    function l2ToL1Timestamp() external view returns (uint256) {}

    function processOutgoingMessages(bytes calldata sendsData, uint256[] calldata sendLengths) external {}
}

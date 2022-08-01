// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./IReceiverGatewayMock.sol";
import "../../interfaces/ISenderGateway.sol";

/**
 * Sender Gateway
 * Counterpart of `ReceiverGatewayMock`
 */
contract SenderGatewayMock is ISenderGateway {
    IFastBridgeSender public immutable fastBridgeSender;
    address public override receiverGateway;
    uint256 public immutable override receiverChainID;

    struct RelayedData {
        uint256 arbitrationCost;
        address relayer;
    }
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    constructor(
        IFastBridgeSender _fastBridgeSender,
        address _receiverGateway,
        uint256 _receiverChainID
    ) {
        fastBridgeSender = _fastBridgeSender;
        receiverGateway = _receiverGateway;
        receiverChainID = _receiverChainID;
    }

    function sendFastMessage(uint256 _data) external {
        bytes4 methodSelector = IReceiverGatewayMock.receiveMessage.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, _data);

        fastBridgeSender.sendFast(receiverGateway, data);
    }
}

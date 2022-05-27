// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../interfaces/IForeignGatewayBase.sol";
import "../interfaces/IHomeGatewayBase.sol";

/**
 * Home Gateway
 * Counterpart of `ForeignGatewayMock`
 */
contract HomeGatewayMock is IHomeGatewayBase {
    IFastBridgeSender public immutable fastBridgeSender;
    address public override foreignGateway;
    uint256 public immutable override foreignChainID;

    struct RelayedData {
        uint256 arbitrationCost;
        address relayer;
    }
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    constructor(
        IFastBridgeSender _fastBridgeSender,
        address _foreignGateway,
        uint256 _foreignChainID
    ) {
        fastBridgeSender = _fastBridgeSender;
        foreignGateway = _foreignGateway;
        foreignChainID = _foreignChainID;
    }

    function sendFastMessage() external {
        bytes4 methodSelector = IForeignGatewayBase.receiveMessage.selector;
        bytes memory data;

        fastBridgeSender.sendFast(foreignGateway, methodSelector, data);
    }

    function sendFastMessage(uint256 _data) external {
        bytes4 methodSelector = IForeignGatewayBase.receiveMessage.selector;
        bytes memory data = abi.encode(_data);

        fastBridgeSender.sendFast(foreignGateway, methodSelector, data);
    }
}

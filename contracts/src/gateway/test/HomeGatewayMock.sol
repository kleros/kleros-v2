// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../interfaces/IForeignGatewayMock.sol";
import "../interfaces/IHomeGatewayBase.sol";

/**
 * Home Gateway
 * Counterpart of `ForeignGatewayMock`
 */
contract HomeGatewayMock is IHomeGatewayBase {
    IFastBridgeSender public immutable fastbridge;
    address public override foreignGateway;
    uint256 public immutable override foreignChainID;
    uint256 public immutable override chainID;

    struct RelayedData {
        uint256 arbitrationCost;
        address relayer;
    }
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    constructor(
        IFastBridgeSender _fastbridge,
        address _foreignGateway,
        uint256 _foreignChainID
    ) {
        fastbridge = _fastbridge;
        foreignGateway = _foreignGateway;
        foreignChainID = _foreignChainID;
        uint256 id;
        assembly {
            id := chainid()
        }
        chainID = id;
    }

    function sendFastMessage() external {
        bytes4 methodSelector = IForeignGatewayMock.receiveMessage.selector;
        bytes memory data;

        fastbridge.sendFast(foreignGateway, methodSelector, data);
    }

    function sendFastMessage(uint256 _data) external {
        bytes4 methodSelector = IForeignGatewayMock.receiveMessage.selector;
        bytes memory data = abi.encode(_data);

        fastbridge.sendFast(foreignGateway, methodSelector, data);
    }
}

// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../../bridge/interfaces/IFastBridgeReceiver.sol";

interface IForeignGatewayBase {
    function fastbridge() external view returns (IFastBridgeReceiver);

    function chainID() external view returns (uint256);

    function homeChainID() external view returns (uint256);

    function homeGateway() external view returns (address);
}

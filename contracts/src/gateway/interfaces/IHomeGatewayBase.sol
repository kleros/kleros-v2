// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../../bridge/interfaces/IFastBridgeSender.sol";

interface IHomeGatewayBase {
    function fastbridge() external view returns (IFastBridgeSender);

    function chainID() external view returns (uint256);

    function foreignChainID() external view returns (uint256);

    function foreignGateway() external view returns (address);
}

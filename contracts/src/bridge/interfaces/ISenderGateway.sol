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

interface ISenderGateway {
    function fastBridgeSender() external view returns (IFastBridgeSender);

    function receiverChainID() external view returns (uint256);

    function receiverGateway() external view returns (address);
}

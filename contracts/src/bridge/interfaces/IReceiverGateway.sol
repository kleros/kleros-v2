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

interface IReceiverGateway {
    function fastBridgeReceiver() external view returns (IFastBridgeReceiver);

    function senderChainID() external view returns (uint256);

    function senderGateway() external view returns (address);
}

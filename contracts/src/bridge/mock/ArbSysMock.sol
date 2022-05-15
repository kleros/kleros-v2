// SPDX-License-Identifier: MIT

/**
 *  @authors: [@hrishibhat]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../interfaces/arbitrum/IArbSys.sol";

contract ArbSysMock {
    function sendTxToL1(address destination, bytes calldata calldataForL1)
        external
        payable
        returns (uint256 _withdrawal_ID)
    {
        bool success;
        (success, ) = address(destination).call(calldataForL1);
        return _withdrawal_ID;
    }
}

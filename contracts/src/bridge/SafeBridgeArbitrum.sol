// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz*, @hrishibhat]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/arbitrum/IArbSys.sol";
import "./interfaces/arbitrum/AddressAliasHelper.sol";

import "./interfaces/ISafeBridge.sol";
import "./interfaces/IFastBridgeSender.sol";

contract SafeBridgeArbitrum is ISafeBridge {
    IArbSys constant arbsys = IArbSys(address(100));
    IFastBridgeSender public fastBridgeSender;

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    constructor(IFastBridgeSender _fastBridgeSender) {
        fastBridgeSender = _fastBridgeSender;
    }
    function sendSafe(address _receiver, bytes memory _calldata) external payable override returns (uint256) {
        require(msg.sender == address(fastBridgeSender), "Access not allowed: Fast Bridge Sender only.");

        uint256 withdrawalId = arbsys.sendTxToL1(_receiver, _calldata);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }
}

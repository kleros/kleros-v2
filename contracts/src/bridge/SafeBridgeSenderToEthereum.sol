// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/arbitrum/IArbSys.sol";
import "./interfaces/arbitrum/AddressAliasHelper.sol";

import "./interfaces/ISafeBridge.sol";

/**
 * Safe Bridge Sender to Ethereum from Arbitrum
 * Counterpart of `SafeBridgeReceiverOnEthereum` if any
 */
contract SafeBridgeSenderToEthereum is ISafeBridge {
    IArbSys public constant ARB_SYS = IArbSys(address(100));

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    function sendSafe(address _receiver, bytes memory _calldata) external payable override returns (uint256) {
        uint256 withdrawalId = ARB_SYS.sendTxToL1(_receiver, _calldata);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }
}

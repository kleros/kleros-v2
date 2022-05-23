// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz, @shtoaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../interfaces/gnosis-chain/IAMB.sol";
import "../interfaces/arbitrum/IArbSys.sol";
import "../interfaces/arbitrum/AddressAliasHelper.sol";
import "../interfaces/ISafeBridgeSender.sol";

/**
 * Safe Bridge Sender to Gnosis from Ethereum
 * Counterpart of `SafeBridgeReceiverOnGnosis`
 */
contract SafeBridgeSenderToGnosisFromArbitrum is ISafeBridgeSender {
    IAMB public immutable amb;

    constructor(IAMB _amb) {
        amb = _amb;
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IArbSys public constant ARB_SYS = IArbSys(address(100));

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (uint256) {
        // Safe Bridge message envelope
        bytes4 methodSelector = IAMB.requireToPassMessage.selector;
        // 4000000 is the max gas fee, set at a resonable level for deployment
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _receiver, _calldata, 4000000);
        uint256 withdrawalId = ARB_SYS.sendTxToL1(address(amb), safeMessageData);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }
}

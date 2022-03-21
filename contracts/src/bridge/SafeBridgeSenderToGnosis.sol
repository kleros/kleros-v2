// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/gnosis-chain/IAMB.sol";
import "./interfaces/ISafeBridgeSender.sol";

/**
 * Safe Bridge Sender to Gnosis from Ethereum
 * Counterpart of `SafeBridgeReceiverOnGnosis` if any
 */
contract SafeBridgeSenderToGnosis is ISafeBridgeSender {
    IAMB public immutable amb;

    constructor(IAMB _amb) {
        amb = _amb;
    }

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (uint256) {
        bytes32 id = amb.requireToPassMessage(_receiver, _calldata, amb.maxGasPerTx());
        return uint256(id);
    }
}

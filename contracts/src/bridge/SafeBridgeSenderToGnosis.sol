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
import "./interfaces/ISafeBridge.sol";

/**
 * Safe Bridge Sender to Gnosis from Ethereum
 * Counterpart of `SafeBridgeReceiverOnGnosis` if any
 */
contract SafeBridgeSenderToGnosis is ISafeBridge {
    IAMB public immutable amb;

    constructor(IAMB _amb) {
        amb = _amb;
    }

    function sendSafe(address _receiver, bytes memory _calldata) external payable override returns (uint256) {
        bytes32 id = amb.requireToPassMessage(_receiver, _calldata, amb.maxGasPerTx());
        return uint256(id);
    }
}

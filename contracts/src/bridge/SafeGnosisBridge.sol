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

contract GnosisL2Bridge is ISafeBridge {
    IAMB amb;

    constructor(IAMB _amb) {
        amb = _amb;
    }

    function sendCrossDomainMessage(address _receiver, bytes memory _calldata) external override returns (uint256) {
        bytes32 id = amb.requireToPassMessage(_receiver, _calldata, amb.maxGasPerTx());
        return uint256(id);
    }
}

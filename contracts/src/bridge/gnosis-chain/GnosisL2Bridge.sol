// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/IAMB.sol";

import "../IL2Bridge.sol";

contract GnosisL2Bridge is IL2Bridge {
    address public l1Target;
    IAMB amb;

    constructor(address _l1Target, IAMB _amb) {
        l1Target = _l1Target;
        amb = _amb;
    }

    function sendCrossDomainMessage(bytes memory _calldata) internal override returns (uint256) {
        bytes32 id = amb.requireToPassMessage(l1Target, _calldata, amb.maxGasPerTx());
        return uint256(id);
    }

    function onlyCrossChainSender() internal override {
        require(msg.sender == address(amb), "Only AMB allowed");
        // require(amb.messageSourceChainId() == homeChainId, "Only home chain allowed");
        require(amb.messageSender() == l1Target, "Only home gateway allowed");
    }
}

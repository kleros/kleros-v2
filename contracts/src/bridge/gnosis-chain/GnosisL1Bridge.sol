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

import "../ISafeBridge.sol";

contract GnosisL1Bridge is ISafeBridge {
    address public crossDomainTarget;
    IAMB amb;

    constructor(address _crossDomainTarget, IAMB _amb) {
        crossDomainTarget = _crossDomainTarget;
        amb = _amb;
    }

    function sendCrossDomainMessage(
        bytes memory _calldata,
        uint256 _maxGas,
        uint256 _gasPriceBid
    ) internal override returns (uint256) {
        bytes32 id = amb.requireToPassMessage(crossDomainTarget, _calldata, amb.maxGasPerTx());
        return uint256(id);
    }

    /**
     * @dev The Gnosis Chain AMB bridge gas cost doesn't depend on the calldata size
     *
     */
    function bridgingCost(
        uint256 /* _calldatasize */
    ) internal view override returns (uint256) {
        return 0;
    }

    function onlyCrossChainSender() internal override {
        require(msg.sender == address(amb), "Only AMB allowed");
        // require(amb.messageSourceChainId() == foreignChainId, "Only foreign chain allowed");
        require(amb.messageSender() == crossDomainTarget, "Only foreign gateway allowed");
    }
}

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

import "../IL1Bridge.sol";

contract GnosisL1Bridge is IL1Bridge {
    address public l2Target;
    IAMB amb;

    constructor(address _l2Target, IAMB _amb) {
        l2Target = _l2Target;
        amb = _amb;
    }

    function sendCrossDomainMessage(
        bytes memory _calldata,
        uint256 _maxGas,
        uint256 _gasPriceBid
    ) internal override returns (uint256) {
        bytes32 id = amb.requireToPassMessage(l2Target, _calldata, amb.maxGasPerTx());
        return uint256(id);
    }

    /**
     * @dev The xDai bridge gas cost doesn't depend on the calldata size
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
        require(amb.messageSender() == l2Target, "Only foreign gateway allowed");
    }
}

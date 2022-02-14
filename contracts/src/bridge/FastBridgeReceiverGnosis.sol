// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/gnosis-chain/IAMB.sol";

import "./BaseFastBridgeReceiver.sol";

contract FastBridgeReceiverGnosis is BaseFastBridgeReceiver {
    address public crossDomainSender;
    IAMB public amb;

    constructor(
        address _governor,
        uint256 _claimDeposit,
        uint256 _challengeDuration,
        address _crossDomainSender,
        IAMB _amb
    ) BaseFastBridgeReceiver(_governor, _claimDeposit, _challengeDuration) {
        crossDomainSender = _crossDomainSender;
        amb = _amb;
    }

    function onlyCrossChainSender() external override {
        require(msg.sender == address(amb), "Only AMB allowed");
        // require(amb.messageSourceChainId() == homeChainId, "Only home chain allowed");
        require(amb.messageSender() == crossDomainSender, "Only home gateway allowed");
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/arbitrum/IInbox.sol";
import "./interfaces/arbitrum/IOutbox.sol";

import "./BaseFastBridgeReceiver.sol";

contract FastBridgeReceiverArbitrum is BaseFastBridgeReceiver {
    address public crossDomainSender;
    IInbox public inbox;

    constructor(
        address _governor,
        uint256 _claimDeposit,
        uint256 _challengeDuration,
        address _crossDomainSender,
        address _inbox
    ) BaseFastBridgeReceiver(_governor, _claimDeposit, _challengeDuration) {
        crossDomainSender = _crossDomainSender;
        inbox = IInbox(_inbox);
    }

    function onlyCrossChainSender() external override {
        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        address l2Sender = outbox.l2ToL1Sender();
        require(l2Sender == crossDomainSender, "Only L2 target");
    }
}

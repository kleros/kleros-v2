// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IArbitratorV2, IDisputeTemplateRegistry, IERC20, ArbitrableExample} from "../arbitration/arbitrables/ArbitrableExample.sol";

/// @title MaliciousArbitrableMock
/// A mock contract to check intentional rule() revert.
contract MaliciousArbitrableMock is ArbitrableExample {
    bool public doRevert;

    function changeBehaviour(bool _doRevert) external {
        doRevert = _doRevert;
    }

    constructor(
        IArbitratorV2 _arbitrator,
        string memory _templateData,
        string memory _templateDataMappings,
        bytes memory _arbitratorExtraData,
        IDisputeTemplateRegistry _templateRegistry,
        IERC20 _weth
    )
        ArbitrableExample(
            _arbitrator,
            _templateData,
            _templateDataMappings,
            _arbitratorExtraData,
            _templateRegistry,
            _weth
        )
    {
        doRevert = true;
    }

    function rule(uint256 _arbitratorDisputeID, uint256 _ruling) external override {
        require(!doRevert, RuleReverted());

        uint256 localDisputeID = externalIDtoLocalID[_arbitratorDisputeID];
        DisputeStruct storage dispute = disputes[localDisputeID];
        require(msg.sender == address(arbitrator), ArbitratorOnly());
        require(_ruling <= dispute.numberOfRulingOptions, RulingOutOfBounds());
        require(!dispute.isRuled, DisputeAlreadyRuled());

        dispute.isRuled = true;
        dispute.ruling = _ruling;

        emit Ruling(IArbitratorV2(msg.sender), _arbitratorDisputeID, dispute.ruling);
    }

    error RuleReverted();
}

// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/IArbSys.sol";
import "./AddressAliasHelper.sol";

import "../ISafeBridge.sol";

contract ArbL2Bridge is ISafeBridge {
    address public crossDomainTarget;
    IArbSys constant arbsys = IArbSys(address(100));

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    constructor(address _crossDomainTarget) {
        crossDomainTarget = _crossDomainTarget;
    }

    /**
     * Sends an arbitrary message from one domain to another.
     *
     * @param _calldata The receiving domain encoded message data.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(
        bytes memory _calldata,
        uint256, /* _maxGas */
        uint256 /* _gasPriceBid */
    ) internal override returns (uint256) {
        uint256 withdrawalId = arbsys.sendTxToL1(crossDomainTarget, _calldata);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }

    function bridgingCost(
        uint256 /* _calldatasize */
    ) internal view override returns (uint256) {
        return 0;
    }

    function onlyCrossChainSender() internal override {
        require(msg.sender == AddressAliasHelper.applyL1ToL2Alias(crossDomainTarget), "Only L1 target");
    }
}

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

import "../IL2Bridge.sol";

contract ArbL2Bridge is IL2Bridge {
    address public l2Gateway;
    address public l1Target;
    IArbSys constant arbsys = IArbSys(address(100));

    event L2ToL1TxCreated(uint256 indexed withdrawalId);

    constructor(address _l2Gateway, address _l1Target) {
        l2Gateway = _l2Gateway;
        l1Target = _l1Target;
    }

    /**
     * Sends an arbitrary message from one domain to another.
     *
     * @param _calldata The L1 encoded message data.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(bytes memory _calldata) public payable override returns (uint256) {
        require(msg.sender == l2Gateway, "Only L2 gateway");
        uint256 withdrawalId = arbsys.sendTxToL1(l1Target, _calldata);

        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }

    function onlyAuthorized() public view override {
        require(msg.sender == AddressAliasHelper.applyL1ToL2Alias(l1Target), "Only L1 target");
    }
}

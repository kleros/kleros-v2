// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrator.sol";
import "../../bridge/arbitrum/L2Bridge.sol";

import "../IHomeGateway.sol";
import "../IForeignGateway.sol";

contract ArbitrumGateway is IHomeGateway {
    // L2 bridge with the ForeignGateway as the l1target

    L2Bridge internal l2bridge;
    IArbitrator public arbitrator;
    mapping(uint256 => bytes32) disputeIDtoHash;

    modifier onlyFromL1() {
        l2bridge.onlyAuthorized(msg.sender);
        _;
    }

    constructor(IArbitrator _arbitrator, L2Bridge _l2bridge) {
        arbitrator = _arbitrator;
        l2bridge = _l2bridge;
    }

    function rule(uint256 _disputeID, uint256 _ruling) external {
        require(msg.sender == address(arbitrator), "Only Arbitrator");

        bytes4 methodSelector = IForeignGateway.relayRule.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, disputeIDtoHash[_disputeID], _ruling);

        l2bridge.sendCrossDomainMessage(data);
    }

    /**
     * Relay the createDispute call from the foreign gateway to the arbitrator.
     *
     * // TODO: Implement the evidence redirection from the Evidence v2 standard.
     */
    function relayCreateDispute(
        bytes32 _disputeHash,
        uint256 _choices,
        bytes calldata _extraData
    ) external onlyFromL1 {
        uint256 disputeID = arbitrator.createDispute(_choices, _extraData);
        disputeIDtoHash[disputeID] = _disputeHash;
    }
}

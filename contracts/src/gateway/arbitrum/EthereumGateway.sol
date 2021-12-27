// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrable.sol";
import "../../bridge/arbitrum/L1Bridge.sol";

import "../IHomeGateway.sol";
import "../IForeignGateway.sol";

contract EthereumGateway is IForeignGateway {
    // L1 bridge with the HomeGateway as the l2target
    L1Bridge internal l1bridge;

    // For now this is just a constant, but we'd probably need to
    // implement the same arbitrationCost calculation code we'll have
    // in the V2 court.
    uint256 internal internalArbitrationCost;

    constructor(uint256 _arbitrationCost, L1Bridge _l1bridge) {
        internalArbitrationCost = _arbitrationCost;
        l1bridge = _l1bridge;
    }

    function createDispute(uint256 _choices, bytes calldata _extraData) external payable returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "Not paid enough for arbitration");

        bytes4 methodSelector = IHomeGateway.relayCreateDispute.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, msg.data);

        uint256 bridgeCost = l1bridge.getSubmissionPrice(data.length);
        // We only pay for the submissionPrice gas cost
        // which is minimum gas cost required for submitting a
        // arbitrum retryable ticket to the retry buffer for
        // bridge to L2.
        // For immediate inclusion a user/bot needs to pay (GasPrice x MaxGas)
        // with the associated ticketId that is emitted by this function
        // after the ticket is successfully submitted.
        // For more details, see:
        // https://developer.offchainlabs.com/docs/l1_l2_messages#retryable-tickets-contract-api
        //
        // We do NOT forward the arbitrationCost to the HomeGateway yet,
        // only the calldata.
        l1bridge.sendCrossDomainMessage{value: bridgeCost}(data, 0, 0);

        disputeID = 0; // TODO: map to the actual disputeID we get from the V2 court
        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
        return disputeID;
    }

    function arbitrationCost(bytes calldata _extraData) public view returns (uint256 cost) {
        // Calculate the size of calldata that will be passed to the L2 bridge
        // as that is a factor for the bridging cost.
        // Calldata size of relayCreateDispute:
        // relayCreateDispute methodId +
        //      (createDispute methodId + uint256 _choices + bytes _extraData)
        //   4      +      4            +   32             + dynamic
        uint256 calldatasize = 40 + _extraData.length;

        uint256 bridgeCost = l1bridge.getSubmissionPrice(calldatasize);
        return bridgeCost + internalArbitrationCost;
    }

    /**
     * Relay the rule call from the home gateway to the arbitrable.
     *
     * @param _data The calldata to relay
     */
    function relayRule(bytes memory _data) external {
        address arbitrable = address(0); // see the TODO above about the disputeId

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = arbitrable.call(_data);
        require(success, "Failed to call contract");
    }
}

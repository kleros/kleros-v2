// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrable.sol";
import "../../arbitration/IArbitrator.sol";
import "../../bridge/arbitrum/L2Bridge.sol";

import "./ForeignGateway.sol";

contract HomeGateway is IArbitrable {
    // L2 bridge with the ForeignGateway as the l1target
    L2Bridge internal l2bridge;
    address public arbitrator;

    constructor(address _arbitrator, L2Bridge _l2bridge) {
        arbitrator = _arbitrator;
        l2bridge = _l2bridge;
    }

    function rule(uint256, uint256) external {
        require(msg.sender == arbitrator, "Only Arbitrator");

        bytes4 methodSelector = ForeignGateway.relayRule.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, msg.data);

        l2bridge.sendCrossDomainMessage(data);
    }

    /**
     * Relay the createDispute call from the foreign gateway to the arbitrator.
     *
     * // TODO: Implement the evidence redirection from the Evidence v2 standard.
     * // TODO: Return the actual disputeId from the court to the ForeignGateway
     *          for it to maintain it's internal mapping.
     * @param _data The calldata to relay
     */
    function relayCreateDispute(bytes memory _data) external {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = arbitrator.call(_data);
        require(success, "Failed to call contract");
    }
}

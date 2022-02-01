// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/arbitrum/ArbL2Bridge.sol";
import "../BaseHomeGateway.sol";

contract ArbitrumGateway is BaseHomeGateway {
    constructor(
        ArbL2Bridge _l2Bridge,
        IArbitrator _arbitrator,
        IForeignGateway _foreignGateway,
        address _l1Target
    ) BaseHomeGateway(_l2Bridge, _arbitrator, _foreignGateway) {}
}

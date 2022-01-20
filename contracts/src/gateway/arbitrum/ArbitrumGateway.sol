// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrator.sol";
import "../../bridge/arbitrum/ArbL2Bridge.sol";

import "../interfaces/IHomeGateway.sol";
import "../BaseHomeGateway.sol";

contract ArbitrumGateway is BaseHomeGateway, ArbL2Bridge {
    constructor(
        IArbitrator _arbitrator,
        IForeignGateway _foreignGateway,
        address _l1Target
    ) BaseHomeGateway(_arbitrator, _foreignGateway) ArbL2Bridge(_l1Target) {}
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrator.sol";
import "../../bridge/xdai/xDaiL2Bridge.sol";
import "../../bridge/xdai/interfaces/IAMB.sol";

import "../interfaces/IHomeGateway.sol";
import "../BaseHomeGateway.sol";

contract xDaiGateway is BaseHomeGateway, xDaiL2Bridge {
    constructor(
        IArbitrator _arbitrator,
        IForeignGateway _foreignGateway,
        address _l1Target,
        IAMB _amb
    ) BaseHomeGateway(_arbitrator, _foreignGateway) xDaiL2Bridge(_l1Target, _amb) {}
}

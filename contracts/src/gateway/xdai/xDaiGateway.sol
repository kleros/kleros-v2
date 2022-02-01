// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/xdai/xDaiL2Bridge.sol";
import "../BaseHomeGateway.sol";

contract xDaiGateway is BaseHomeGateway {
    constructor(
        xDaiL2Bridge _l2Bridge,
        IArbitrator _arbitrator,
        IForeignGateway _foreignGateway,
        address _l1Target,
        IAMB _amb
    ) BaseHomeGateway(_l2Bridge, _arbitrator, _foreignGateway) {}
}

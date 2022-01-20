// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/xdai/xDaiL1Bridge.sol";
import "../../bridge/xdai/interfaces/IAMB.sol";

import "../interfaces/IForeignGateway.sol";
import "../BaseForeignGateway.sol";

contract EthereumGateway is BaseForeignGateway, xDaiL1Bridge {
    constructor(
        uint256 _arbitrationCost,
        IHomeGateway _homeGateway,
        address _l2Target,
        IAMB _amb
    ) BaseForeignGateway(_arbitrationCost, _homeGateway) xDaiL1Bridge(_l2Target, _amb) {}
}

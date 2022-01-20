// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/arbitrum/ArbL1Bridge.sol";

import "../interfaces/IForeignGateway.sol";
import "../BaseForeignGateway.sol";

contract EthereumGateway is BaseForeignGateway, ArbL1Bridge {
    constructor(
        uint256 _arbitrationCost,
        IHomeGateway _homeGateway,
        address _l2Target,
        address _inbox
    ) BaseForeignGateway(_arbitrationCost, _homeGateway) ArbL1Bridge(_l2Target, _inbox) {}
}

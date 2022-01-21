// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/xdai/xDaiL1Bridge.sol";
import "../../bridge/xdai/interfaces/IAMB.sol";

import "../interfaces/IForeignGateway.sol";
import "../BaseForeignGateway.sol";

contract EthereumGateway is BaseForeignGateway, xDaiL1Bridge {
    constructor(
        address _governor,
        IHomeGateway _homeGateway,
        uint256[] memory _feeForJuror,
        address _l2Target,
        IAMB _amb
    ) BaseForeignGateway(_governor, _homeGateway, _feeForJuror) xDaiL1Bridge(_l2Target, _amb) {}
}

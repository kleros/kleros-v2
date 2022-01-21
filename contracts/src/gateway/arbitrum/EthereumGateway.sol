// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/arbitrum/ArbL1Bridge.sol";

import "../interfaces/IForeignGateway.sol";
import "../BaseForeignGateway.sol";

contract EthereumGateway is BaseForeignGateway, ArbL1Bridge {
    constructor(
        address _governor,
        IHomeGateway _homeGateway,
        uint256[] memory _feeForJuror,
        address _l2Target,
        address _inbox
    ) BaseForeignGateway(_governor, _homeGateway, _feeForJuror) ArbL1Bridge(_l2Target, _inbox) {}
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/arbitrum/ArbL1Bridge.sol";

import "../BaseForeignGateway.sol";

contract EthereumGateway is BaseForeignGateway {
    constructor(
        address _governor,
        ArbL1Bridge _l1Bridge,
        IHomeGateway _homeGateway,
        uint256[] memory _feeForJuror,
        address _l2Target,
        address _inbox
    ) BaseForeignGateway(_governor, _l1Bridge, _homeGateway, _feeForJuror) {}
}

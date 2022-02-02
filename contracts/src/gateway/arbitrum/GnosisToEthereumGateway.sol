// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/gnosis-chain/GnosisL1Bridge.sol";
import "../../bridge/gnosis-chain/interfaces/IAMB.sol";

import "../interfaces/IForeignGateway.sol";
import "../BaseForeignGateway.sol";

contract EthereumGateway is BaseForeignGateway, GnosisL1Bridge {
    constructor(
        address _governor,
        IHomeGateway _homeGateway,
        uint256[] memory _feeForJuror,
        address _l2Target,
        IAMB _amb
    ) BaseForeignGateway(_governor, _homeGateway, _feeForJuror) GnosisL1Bridge(_l2Target, _amb) {}
}

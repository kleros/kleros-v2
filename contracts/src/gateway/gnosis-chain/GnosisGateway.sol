// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrator.sol";
import "../../bridge/gnosis-chain/GnosisL2Bridge.sol";
import "../../bridge/gnosis-chain/interfaces/IAMB.sol";

import "../interfaces/IHomeGateway.sol";
import "../BaseHomeGateway.sol";

contract GnosisToEthereumGateway is BaseHomeGateway, GnosisL2Bridge {
    constructor(
        IArbitrator _arbitrator,
        IForeignGateway _foreignGateway,
        address _l1Target,
        IAMB _amb
    ) BaseHomeGateway(_arbitrator, _foreignGateway) GnosisL2Bridge(_l1Target, _amb) {}
}

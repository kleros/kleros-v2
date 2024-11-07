//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "./UUPSProxy.sol";

/// Workaround to get meaningful names for the proxy contracts
/// Otherwise all the contracts are called `UUPSProxy` on the chain explorers

contract DisputeKitClassicNeoProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract DisputeKitClassicUniversityProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract DisputeKitClassicProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract DisputeTemplateRegistryProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract EvidenceModuleProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract ForeignGatewayOnEthereumProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract HomeGatewayToEthereumProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract KlerosCoreNeoProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract KlerosCoreRulerProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract KlerosCoreUniversityProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract KlerosCoreProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract PolicyRegistryProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract RandomizerRNGProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract SortitionModuleNeoProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract SortitionModuleUniversityProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

contract SortitionModuleProxy is UUPSProxy {
    constructor(address _implementation, bytes memory _data) UUPSProxy(_implementation, _data) {}
}

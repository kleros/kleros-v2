//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/proxy/UUPSUpgradeableMock.sol>

pragma solidity 0.8.18;

import "../UUPSProxiable.sol";
import "../Initializable.sol";

contract NonUpgradeableMock {
    uint256 public _counter;

    function counter() external view returns (uint256) {
        return _counter;
    }

    function increment() external {
        _counter++;
    }

    function version() external pure virtual returns (string memory) {
        return "NonUpgradeableMock 0.0.0";
    }
}

contract UUPSUpgradeableMock is UUPSProxiable, NonUpgradeableMock {
    bool public initialized;
    address public governor;

    uint256[50] __gap;

    constructor() {
        initialized = true;
    }

    function initialize(address _governor) external {
        require(!initialized, "Contract instance has already been initialized");
        governor = _governor;
        initialized = true;
    }

    function _authorizeUpgrade(address) internal view override {
        require(governor == msg.sender, "No privilege to upgrade");
    }

    function version() external pure virtual override returns (string memory) {
        return "UUPSUpgradeableMock 1.0.0";
    }
}

contract UUPSUpgradeableMockV2 is UUPSUpgradeableMock {
    function version() external pure override returns (string memory) {
        return "UUPSUpgradeableMock 2.0.0";
    }
}

contract UUPSUnsupportedProxiableUUID is UUPSUpgradeableMock {
    function proxiableUUID() external pure override returns (bytes32) {
        return keccak256("invalid UUID");
    }

    function version() external pure override returns (string memory) {
        return "UUPSUnsupportedProxiableUUID 1.0.0";
    }
}

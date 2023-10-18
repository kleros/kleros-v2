//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/proxy/UUPSUpgradeableMock.sol>

pragma solidity 0.8.18;

import "../../UUPSProxiable.sol";
import "../../Initializable.sol";

contract UpgradedByInheritanceV1 is UUPSProxiable, Initializable {
    address public governor;
    uint256 public counter;
    uint256[50] __gap;

    constructor() {
        _disableInitializers();
    }

    function initialize(address _governor) external virtual reinitializer(1) {
        governor = _governor;
        counter = 1;
    }

    function _authorizeUpgrade(address) internal view override {
        require(governor == msg.sender, "No privilege to upgrade");
    }

    function increment() external {
        ++counter;
    }

    function version() external pure virtual returns (string memory) {
        return "V1";
    }
}

contract UpgradedByInheritanceV2 is UpgradedByInheritanceV1 {
    string public newVariable;
    uint256[50] __gap2;

    constructor() {
        _disableInitializers();
    }

    function initializeV2(string memory _newVariable) external reinitializer(2) {
        newVariable = _newVariable;
        this.increment();
    }

    function version() external pure virtual override returns (string memory) {
        return "V2";
    }
}

contract UpgradedByInheritanceV3Bad is UpgradedByInheritanceV2 {
    constructor() {
        _disableInitializers();
    }

    function initializeV3() external reinitializer(1) {
        // Wrong reinitializer version.
    }
}

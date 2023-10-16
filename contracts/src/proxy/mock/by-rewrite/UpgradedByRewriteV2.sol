//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/proxy/UUPSUpgradeableMock.sol>

pragma solidity 0.8.18;

import "../../UUPSProxiable.sol";
import "../../Initializable.sol";

contract UpgradedByRewrite is UUPSProxiable, Initializable {
    //------------------------
    // V1 State
    //------------------------
    address public governor;
    uint256 public counter;
    uint256[50] __gap;

    //------------------------
    // V2 State
    //------------------------
    string public newVariable;

    constructor() {
        _disableInitializers();
    }

    function initialize(string memory _newVariable) external reinitializer(2) {
        newVariable = _newVariable;
        this.increment();
    }

    function _authorizeUpgrade(address) internal view override {
        require(governor == msg.sender, "No privilege to upgrade");
    }

    function increment() external {
        ++counter;
    }

    function version() external pure virtual returns (string memory) {
        return "V2";
    }
}

//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/proxy/UUPSUpgradeableMock.sol>

pragma solidity 0.8.24;

import "../../UUPSProxiable.sol";
import "../../Initializable.sol";

contract UpgradedByInheritanceV1 is UUPSProxiable, Initializable {
    /// @custom:storage-location erc7201:kleros.storage.UpgradedByInheritance
    struct UpgradedByInheritanceV1Storage {
        address governor;
        uint256 counter;
    }

    // keccak256(abi.encode(uint256(keccak256("kleros.storage.UpgradedByInheritance")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 internal constant INITIALIZABLE_STORAGE =
        0xc17f29fd370bc39e93d9cb5467cf50e6788d12416f3c204ddea24c4b47412a00;

    constructor() {
        _disableInitializers();
    }

    function initialize(address _governor) external virtual reinitializer(1) {
        UpgradedByInheritanceV1Storage storage $ = _getInheritanceV1Storage();
        $.governor = _governor;
        $.counter = 1;
    }

    function _authorizeUpgrade(address) internal view override {
        UpgradedByInheritanceV1Storage storage $ = _getInheritanceV1Storage();
        require($.governor == msg.sender, "No privilege to upgrade");
    }

    function increment() external {
        UpgradedByInheritanceV1Storage storage $ = _getInheritanceV1Storage();
        ++$.counter;
    }

    function version() external pure virtual returns (string memory) {
        return "V1";
    }
    function _getInheritanceV1Storage() private pure returns (UpgradedByInheritanceV1Storage storage $) {
        assembly {
            $.slot := INITIALIZABLE_STORAGE
        }
    }
    function governor() external view virtual returns (address) {
        return _getInheritanceV1Storage().governor;
    }
    function counter() external view virtual returns (uint256) {
        return _getInheritanceV1Storage().counter;
    }
}

contract UpgradedByInheritanceV2 is UpgradedByInheritanceV1 {
    /// @custom:storage-location erc7201:kleros.storage.UpgradedByInheritance
    struct UpgradedByInheritanceV2Storage {
        address governor;
        uint256 counter;
        string newVariable;
    }
    constructor() {
        _disableInitializers();
    }

    function initializeV2(string memory _newVariable) external reinitializer(2) {
        UpgradedByInheritanceV2Storage storage $ = _getInheritanceV2Storage();
        $.newVariable = _newVariable;
        this.increment();
    }

    function version() external pure virtual override returns (string memory) {
        return "V2";
    }
    function _getInheritanceV2Storage() private pure returns (UpgradedByInheritanceV2Storage storage $) {
        assembly {
            $.slot := INITIALIZABLE_STORAGE
        }
    }
    function governor() external view virtual override returns (address) {
        return _getInheritanceV2Storage().governor;
    }
    function counter() external view virtual override returns (uint256) {
        return _getInheritanceV2Storage().counter;
    }
    function newVariable() external view returns (string memory) {
        return _getInheritanceV2Storage().newVariable;
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

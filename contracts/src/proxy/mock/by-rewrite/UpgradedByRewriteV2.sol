//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/proxy/UUPSUpgradeableMock.sol>

pragma solidity 0.8.24;

import "../../UUPSProxiable.sol";
import "../../Initializable.sol";

contract UpgradedByRewrite is UUPSProxiable, Initializable {
    /// @custom:storage-location erc7201:kleros.storage.UpgradedByRewriteStorage
    struct UpgradedByRewriteV2 {
        address governor;
        uint256 counter;
        string newVariable;
    }

    // keccak256(abi.encode(uint256(keccak256("kleros.storage.UpgradedByRewriteStorage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant INITIALIZABLE_STORAGE = 0xbe8e07ee0d0f4fb183890b4b70057ae173e7270304bf720861e275e28be01e00;

    constructor() {
        _disableInitializers();
    }

    function initialize(string memory _newVariable) external reinitializer(2) {
        UpgradedByRewriteV2 storage $ = _getStorageUpgradedByRewrite();
        $.newVariable = _newVariable;
        this.increment();
    }

    function _authorizeUpgrade(address) internal view override {
        UpgradedByRewriteV2 storage $ = _getStorageUpgradedByRewrite();
        require($.governor == msg.sender, "No privilege to upgrade");
    }

    function increment() external {
        UpgradedByRewriteV2 storage $ = _getStorageUpgradedByRewrite();
        ++$.counter;
    }

    function version() external pure virtual returns (string memory) {
        return "V2";
    }

    function _getStorageUpgradedByRewrite() private pure returns (UpgradedByRewriteV2 storage $) {
        assembly {
            $.slot := INITIALIZABLE_STORAGE
        }
    }
    function governor() external view returns (address) {
        return _getStorageUpgradedByRewrite().governor;
    }
    function counter() external view returns (uint256) {
        return _getStorageUpgradedByRewrite().counter;
    }
    function newVariable() external view returns (string memory) {
        return _getStorageUpgradedByRewrite().newVariable;
    }
}

//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/proxy/UUPSUpgradeableMock.sol>

pragma solidity 0.8.24;

import "../../UUPSProxiable.sol";
import "../../Initializable.sol";

contract UpgradedByRewrite is UUPSProxiable, Initializable {
    /// @custom:storage-location erc7201:kleros.storage.UpgradedByRewriteStorage
    struct UpgradedByRewriteStorage {
        address governor;
        uint256 counter;
    }

    // keccak256(abi.encode(uint256(keccak256("kleros.storage.UpgradedByRewriteStorage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant INITIALIZABLE_STORAGE = 0xbe8e07ee0d0f4fb183890b4b70057ae173e7270304bf720861e275e28be01e00;

    constructor() {
        _disableInitializers();
    }

    function initialize(address _governor) external virtual reinitializer(1) {
        UpgradedByRewriteStorage storage $ = _getUpgradedByRewriteStorage();
        $.governor = _governor;
        $.counter = 1;
    }

    function _authorizeUpgrade(address) internal view override {
        UpgradedByRewriteStorage storage $ = _getUpgradedByRewriteStorage();
        require($.governor == msg.sender, "No privilege to upgrade");
    }

    function increment() external {
        UpgradedByRewriteStorage storage $ = _getUpgradedByRewriteStorage();
        ++$.counter;
    }

    function version() external pure virtual returns (string memory) {
        return "V1";
    }
    function _getUpgradedByRewriteStorage() private pure returns (UpgradedByRewriteStorage storage $) {
        assembly {
            $.slot := INITIALIZABLE_STORAGE
        }
    }

    function governor() external view returns (address) {
        return _getUpgradedByRewriteStorage().governor;
    }
    function counter() external view returns (uint256) {
        return _getUpgradedByRewriteStorage().counter;
    }
}

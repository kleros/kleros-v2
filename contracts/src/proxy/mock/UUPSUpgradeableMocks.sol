//SPDX-License-Identifier: MIT
// Adapted from <https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/proxy/UUPSUpgradeableMock.sol>

pragma solidity 0.8.24;

import "../UUPSProxiable.sol";
import "../Initializable.sol";

contract NonUpgradeableMock {
    /// @custom:storage-location erc7201:kleros.storage.NonUpgradeableMockStorage
    struct NonUpgradeableMockStorage {
        uint256 counter;
    }
    // keccak256(abi.encode(uint256(keccak256("kleros.storage.NonUpgradeableMockStorage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant INITIALIZABLE_STORAGE = 0x203890a1e96eaf39c35df205fbcedb580d4552ae7ac40780014dc281a7acd500;

    function counter() external view returns (uint256) {
        NonUpgradeableMockStorage storage $ = _getNonUpgradeableMockStorage();
        return $.counter;
    }

    function increment() external {
        NonUpgradeableMockStorage storage $ = _getNonUpgradeableMockStorage();
        $.counter++;
    }

    function version() external pure virtual returns (string memory) {
        return "NonUpgradeableMock 0.0.0";
    }
    /**
     * @dev Returns a pointer to the storage namespace.
     */
    // solhint-disable-next-line var-name-mixedcase
    function _getNonUpgradeableMockStorage() private pure returns (NonUpgradeableMockStorage storage $) {
        assembly {
            $.slot := INITIALIZABLE_STORAGE
        }
    }
}

contract UUPSUpgradeableMock is UUPSProxiable, NonUpgradeableMock {
    /// @custom:storage-location erc7201:kleros.storage.UUPSUpgradeableMock
    struct UUPSUpgradeableMockStorage {
        bool initialized;
        address governor;
    }

    // keccak256(abi.encode(uint256(keccak256("kleros.storage.UUPSUpgradeableMock")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant INITIALIZABLE_STORAGE = 0x30d370aa3c43b12c906d59e729739fe781988b5aeb55fa9fb184b45129d6f900;

    constructor() {
        UUPSUpgradeableMockStorage storage $ = _getInitializableStorage();
        $.initialized = true;
    }

    function initialize(address _governor) external {
        UUPSUpgradeableMockStorage storage $ = _getInitializableStorage();
        require(!$.initialized, "Contract instance has already been initialized");
        $.governor = _governor;
        $.initialized = true;
    }

    function _authorizeUpgrade(address) internal view override {
        UUPSUpgradeableMockStorage storage $ = _getInitializableStorage();
        require($.governor == msg.sender, "No privilege to upgrade");
    }

    function version() external pure virtual override returns (string memory) {
        return "UUPSUpgradeableMock 1.0.0";
    }
    /**
     * @dev Returns a pointer to the storage namespace.
     */
    // solhint-disable-next-line var-name-mixedcase
    function _getInitializableStorage() private pure returns (UUPSUpgradeableMockStorage storage $) {
        assembly {
            $.slot := INITIALIZABLE_STORAGE
        }
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

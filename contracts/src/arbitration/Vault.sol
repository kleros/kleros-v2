// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {VaultBase, IERC20} from "./VaultBase.sol";

/// @title Vault
/// @notice PNK Vault for handling deposits, withdrawals, locks, and penalties
contract Vault is VaultBase {
    string public constant override version = "0.10.0";

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _governor The governor's address.
    /// @param _pnk The address of the PNK token contract.
    /// @param _stakeController The address of the stake controller.
    /// @param _core The address of the KlerosCore contract.
    function initialize(
        address _governor,
        IERC20 _pnk,
        address _stakeController,
        address _core
    ) external reinitializer(1) {
        __VaultBase_initialize(_governor, _pnk, _stakeController, _core);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }
}

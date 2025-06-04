// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title stPNK
/// @notice Non-transferable liquid staking token representing staked PNK
/// @dev Only transferable within Kleros protocol contracts to prevent external trading
/// @custom:security-contact contact@kleros.io
contract stPNK is ERC20 {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public immutable vault;

    // Whitelist of protocol contracts that can receive stPNK
    mapping(address => bool) public protocolContracts;

    // Track if an address is a regular user (not a protocol contract)
    mapping(address => bool) public isUser;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event ProtocolContractUpdated(address indexed contract_, bool allowed);

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error TransferNotAllowed();
    error OnlyVault();
    error OnlyProtocolContracts();
    error ArrayLengthMismatch();

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyVault() {
        if (msg.sender != vault) revert OnlyVault();
        _;
    }

    modifier onlyProtocolContracts() {
        if (!protocolContracts[msg.sender]) revert OnlyProtocolContracts();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor(address _vault) ERC20("Staked Pinakion", "stPNK") {
        vault = _vault;

        // Automatically whitelist vault
        protocolContracts[_vault] = true;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Mint stPNK tokens (only vault)
    /// @param _to The address to mint tokens to
    /// @param _amount The amount of tokens to mint
    function mint(address _to, uint256 _amount) external onlyVault {
        isUser[_to] = true;
        _mint(_to, _amount);
    }

    /// @notice Burn stPNK tokens from account (only vault)
    /// @param _from The address to burn tokens from
    /// @param _amount The amount of tokens to burn
    function burnFrom(address _from, uint256 _amount) external onlyVault {
        _burn(_from, _amount);
    }

    /// @notice Update protocol contract whitelist for multiple contracts (only via governance)
    /// @param _contracts Array of contract addresses to update
    /// @param _allowed Array of boolean values for each contract
    function setProtocolContracts(
        address[] calldata _contracts,
        bool[] calldata _allowed
    ) external onlyProtocolContracts {
        if (_contracts.length != _allowed.length) revert ArrayLengthMismatch();

        for (uint256 i = 0; i < _contracts.length; i++) {
            protocolContracts[_contracts[i]] = _allowed[i];
            emit ProtocolContractUpdated(_contracts[i], _allowed[i]);
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Check if transfer is allowed (view function for frontends)
    /// @param _from The sender address
    /// @param _to The recipient address
    /// @return Whether the transfer is allowed
    function isTransferAllowed(address _from, address _to) external view returns (bool) {
        if (_from == address(0) || _to == address(0)) return true;
        if (protocolContracts[_from] && protocolContracts[_to]) return true;
        if (protocolContracts[_from] && !protocolContracts[_to]) return true;
        if (!protocolContracts[_from] && protocolContracts[_to]) return true;
        return false;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @notice Override update to prevent external trading
    /// @param _from The sender address
    /// @param _to The recipient address
    /// @param _value The amount to transfer
    function _update(address _from, address _to, uint256 _value) internal override {
        // Allow minting (_from == address(0)) and burning (_to == address(0))
        if (_from == address(0) || _to == address(0)) {
            super._update(_from, _to, _value);
            return;
        }

        // Allow transfers between protocol contracts
        if (protocolContracts[_from] && protocolContracts[_to]) {
            super._update(_from, _to, _value);
            return;
        }

        // Allow transfers from protocol contracts to users (e.g., rewards)
        if (protocolContracts[_from] && !protocolContracts[_to]) {
            isUser[_to] = true;
            super._update(_from, _to, _value);
            return;
        }

        // Allow transfers from users to protocol contracts (e.g., for operations)
        if (!protocolContracts[_from] && protocolContracts[_to]) {
            super._update(_from, _to, _value);
            return;
        }

        // Block all other transfers (user-to-user, external contracts)
        revert TransferNotAllowed();
    }
}

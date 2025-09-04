// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";

/// @title PolicyRegistry
/// @dev A contract to maintain a policy for each court.
contract PolicyRegistry is UUPSProxiable, Initializable {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev Emitted when a policy is updated.
    /// @param _courtID The ID of the policy's court.
    /// @param _courtName The name of the policy's court.
    /// @param _policy The URI of the policy JSON.
    event PolicyUpdate(uint256 indexed _courtID, string _courtName, string _policy);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner;
    mapping(uint256 => string) public policies;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @dev Requires that the sender is the owner.
    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Constructs the `PolicyRegistry` contract.
    /// @param _owner The owner's address.
    function initialize(address _owner) external initializer {
        owner = _owner;
    }

    // ************************************* //
    // *            Governance             * //
    // ************************************* //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the owner can perform upgrades (`onlyByOwner`)
     */
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @dev Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Sets the policy for the specified court.
    /// @param _courtID The ID of the specified court.
    /// @param _courtName The name of the specified court.
    /// @param _policy The URI of the policy JSON.
    function setPolicy(uint256 _courtID, string calldata _courtName, string calldata _policy) external onlyByOwner {
        policies[_courtID] = _policy;
        emit PolicyUpdate(_courtID, _courtName, policies[_courtID]);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
}

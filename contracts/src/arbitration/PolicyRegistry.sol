// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";

/// @title PolicyRegistry
/// @dev A contract to maintain a policy for each court.
contract PolicyRegistry is UUPSProxiable, Initializable {
    string public constant override version = "0.8.0";

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

    address public governor;
    mapping(uint256 => string) public policies;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @dev Requires that the sender is the governor.
    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
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
    /// @param _governor The governor's address.
    function initialize(address _governor) external reinitializer(1) {
        governor = _governor;
    }

    function initialize2() external reinitializer(2) {
        // NOP
    }

    // ************************************* //
    // *            Governance             * //
    // ************************************* //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the governor can perform upgrades (`onlyByGovernor`)
     */
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Changes the `governor` storage variable.
    /// @param _governor The new value for the `governor` storage variable.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Sets the policy for the specified court.
    /// @param _courtID The ID of the specified court.
    /// @param _courtName The name of the specified court.
    /// @param _policy The URI of the policy JSON.
    function setPolicy(uint256 _courtID, string calldata _courtName, string calldata _policy) external onlyByGovernor {
        policies[_courtID] = _policy;
        emit PolicyUpdate(_courtID, _courtName, policies[_courtID]);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
}

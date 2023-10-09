// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";

/// @title PolicyRegistry
/// @dev A contract to maintain a policy for each court.
contract PolicyRegistry is UUPSProxiable, Initializable {
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
        require(governor == msg.sender, "No allowed: governor only");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Constructs the `PolicyRegistry` contract.
    /// @param _governor The governor's address.
    function initialize(address _governor) external reinitializer(1) {
        governor = _governor;
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
}

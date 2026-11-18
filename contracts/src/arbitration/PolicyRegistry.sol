// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title PolicyRegistry
/// @notice A contract to maintain a policy for each court.
contract PolicyRegistry is Initializable {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a policy is updated.
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

    /// @notice Requires that the sender is the owner.
    modifier onlyOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Constructs the `PolicyRegistry` contract.
    /// @param _owner The owner's address.
    function initialize(address _owner) external initializer {
        owner = _owner;
    }

    // ************************************* //
    // *            Governance             * //
    // ************************************* //

    /// @notice Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Sets the policy for the specified court.
    /// @param _courtID The ID of the specified court.
    /// @param _courtName The name of the specified court.
    /// @param _policy The URI of the policy JSON.
    function setPolicy(uint256 _courtID, string calldata _courtName, string calldata _policy) external onlyOwner {
        policies[_courtID] = _policy;
        emit PolicyUpdate(_courtID, _courtName, policies[_courtID]);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title LeaderboardOffset
/// @notice Emits event to offset juror score for coherency
contract LeaderboardOffset {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event Offset(address indexed user, int256 offset, address indexed arbitrator);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner;

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor() {
        owner = msg.sender;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Updates the owner address.
    /// @param newOwner The new owner address.
    function updateOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Emits an offset event for a given juror.
    /// @param juror The address of the affected juror.
    /// @param offset The signed integer offset (+ or -).
    /// @param arbitrator The arbitrator address.
    function addOffset(address juror, int256 offset, address arbitrator) external onlyOwner {
        emit Offset(juror, offset, arbitrator);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OnlyOwner();
}

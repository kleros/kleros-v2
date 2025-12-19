// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title LeaderboardOffset
 * @notice Emits event to offset juror score for coherency
 */
contract LeaderboardOffset {
    // ************************************* //
    // *              Events               * //
    // ************************************* //
    event Offset(address indexed user, int256 offset, address indexed arbitrator);

    event GovernorUpdated(address indexed oldGovernor, address indexed newGovernor);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor;

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //
    constructor(address governor_) {
        if (governor_ == address(0)) revert InvalidGovernor();
        governor = governor_;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //
    modifier onlyGovernor() {
        if (msg.sender != governor) revert NotGovernor();
        _;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /**
     * @notice Emits an offset event for a given juror.
     * @param juror The address of the affected juror.
     * @param offset The signed integer offset (+ or -).
     * @param arbitrator The arbitrator address.
     */
    function setOffset(address juror, int256 offset, address arbitrator) external onlyGovernor {
        emit Offset(juror, offset, arbitrator);
    }

    /**
     * @notice Updates the governor address.
     * @param newGovernor The new governor address.
     */
    function updateGovernor(address newGovernor) external onlyGovernor {
        if (newGovernor == address(0)) revert InvalidGovernor();

        emit GovernorUpdated(governor, newGovernor);
        governor = newGovernor;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //
    error NotGovernor();
    error InvalidGovernor();
}

// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title ICourtEligibility
/// @notice Interface for the court eligibility predicate.
interface ICourtEligibility {
    /// @notice Checks if the juror is eligible to stake or to vote in the court.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return True if the juror is eligible, false otherwise.
    function isEligible(address _juror, uint96 _courtID) external view returns (bool);
}

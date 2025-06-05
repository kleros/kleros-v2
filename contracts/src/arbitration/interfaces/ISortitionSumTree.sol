// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "../../libraries/Constants.sol";

/// @title ISortitionSumTree
/// @notice Interface for pure sortition operations without phase management or token operations
/// @dev This interface contains only tree management and drawing logic
interface ISortitionSumTree {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a juror's stake is set in a court
    /// @param _address The address of the juror
    /// @param _courtID The ID of the court
    /// @param _amount The amount of tokens staked in the court
    /// @param _amountAllCourts The amount of tokens staked in all courts
    event StakeSet(address indexed _address, uint256 _courtID, uint256 _amount, uint256 _amountAllCourts);

    // ************************************* //
    // *          Tree Management          * //
    // ************************************* //

    /// @notice Create a sortition sum tree
    /// @param _key The key of the new tree
    /// @param _extraData Extra data that contains the number of children each node in the tree should have
    function createTree(bytes32 _key, bytes memory _extraData) external;

    /// @notice Set a juror's stake in a court (pure sortition tree operation)
    /// @param _account The address of the juror
    /// @param _courtID The ID of the court
    /// @param _newStake The new stake amount
    /// @return success Whether the operation was successful
    function setStake(address _account, uint96 _courtID, uint256 _newStake) external returns (bool success);

    // ************************************* //
    // *            Drawing                * //
    // ************************************* //

    /// @notice Draw a juror from a court's sortition tree
    /// @param _court The court identifier
    /// @param _coreDisputeID Index of the dispute in Kleros Core
    /// @param _nonce Nonce to hash with random number
    /// @param _randomNumber The random number to use for drawing
    /// @return drawnAddress The drawn juror address
    function draw(
        bytes32 _court,
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 _randomNumber
    ) external view returns (address drawnAddress);

    // ************************************* //
    // *           View Functions          * //
    // ************************************* //

    /// @notice Get the stake of a juror in a court
    /// @param _juror The address of the juror
    /// @param _courtID The ID of the court
    /// @return value The stake of the juror in the court
    function stakeOf(address _juror, uint96 _courtID) external view returns (uint256 value);

    /// @notice Get the stake of a juror in a court by tree key and stake path ID
    /// @param _key The key of the tree, corresponding to a court
    /// @param _ID The stake path ID, corresponding to a juror
    /// @return value The stake of the juror in the court
    function stakeOf(bytes32 _key, bytes32 _ID) external view returns (uint256 value);

    /// @notice Get juror information for a specific court
    /// @param _juror The juror address
    /// @param _courtID The court ID
    /// @return totalStaked Total staked amount (from external source)
    /// @return stakedInCourt Amount staked in specific court
    /// @return nbCourts Number of courts staked in
    function getJurorInfo(
        address _juror,
        uint96 _courtID
    ) external view returns (uint256 totalStaked, uint256 stakedInCourt, uint256 nbCourts);

    /// @notice Get court IDs where juror has stakes
    /// @param _juror The juror address
    /// @return Array of court IDs
    function getJurorCourtIDs(address _juror) external view returns (uint96[] memory);

    /// @notice Check if juror has any stakes in sortition trees
    /// @param _juror The juror address
    /// @return Whether the juror has stakes
    function hasStakes(address _juror) external view returns (bool);

    /// @notice Get the total stake in a court's tree
    /// @param _courtID The court ID
    /// @return Total stake in the court
    function getTotalStakeInCourt(uint96 _courtID) external view returns (uint256);

    // ************************************* //
    // *           Utility Functions       * //
    // ************************************* //

    /// @notice Convert account and court ID to stake path ID
    /// @param _account The juror address
    /// @param _courtID The court ID
    /// @return stakePathID The generated stake path ID
    function accountAndCourtIDToStakePathID(
        address _account,
        uint96 _courtID
    ) external pure returns (bytes32 stakePathID);

    /// @notice Convert stake path ID back to account address
    /// @param _stakePathID The stake path ID
    /// @return account The account address
    function stakePathIDToAccount(bytes32 _stakePathID) external pure returns (address account);
}

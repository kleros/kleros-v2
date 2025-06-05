// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "../../libraries/Constants.sol";

/// @title ISortitionSumTree
/// @notice Interface for pure sortition operations without phase management or token operations
/// @dev This interface contains only tree management and drawing logic
interface ISortitionSumTree {
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
    /// @return stakingResult The result of the staking operation
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) external returns (StakingResult stakingResult);

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

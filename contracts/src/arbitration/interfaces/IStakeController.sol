// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {ISortitionModule} from "./ISortitionModule.sol";
import "../../libraries/Constants.sol";

/// @title IStakeController
/// @notice Interface for the Stake Controller that coordinates between PNKVault and SortitionModule
/// @dev Combines phase management, delayed stakes, and coordination between vault and sortition
interface IStakeController {
    // ************************************* //
    // *             Events                * //
    // ************************************* //

    event NewPhase(ISortitionModule.Phase phase);
    event JurorPenaltyExecuted(address indexed account, uint256 requestedPenalty, uint256 actualPenalty);
    event StakeUnlocked(address indexed account, uint256 amount);
    event JurorSetInactive(address indexed account);

    // Migration events
    event StakeImported(address indexed account, uint96 indexed courtID, uint256 stake);
    event DelayedStakeImported(address indexed account, uint96 indexed courtID, uint256 stake, uint256 index);
    event MigrationCompleted(uint256 totalAttempted, uint256 totalImported);
    event PhaseStateMigrated(ISortitionModule.Phase phase, uint256 lastPhaseChange, uint256 disputesWithoutJurors);
    event EmergencyReset(uint256 timestamp);

    // ************************************* //
    // *          Phase Management         * //
    // ************************************* //

    /// @notice Pass to the next phase
    function passPhase() external;

    /// @notice Get the current phase
    /// @return The current phase
    function getPhase() external view returns (ISortitionModule.Phase);

    /// @notice Execute delayed stakes during staking phase
    /// @param _iterations The number of delayed stakes to execute
    function executeDelayedStakes(uint256 _iterations) external;

    // ************************************* //
    // *         Stake Management          * //
    // ************************************* //

    /// @notice Set stake for a juror with vault coordination
    /// @param _account The address of the juror
    /// @param _courtID The ID of the court
    /// @param _newStake The new stake amount
    /// @param _alreadyTransferred Whether the tokens were already transferred
    /// @return pnkDeposit The amount of PNK to deposit
    /// @return pnkWithdrawal The amount of PNK to withdraw
    /// @return stakingResult The result of the staking operation
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _alreadyTransferred
    ) external returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult);

    /// @notice Lock stake for dispute participation
    /// @param _account The account to lock stake for
    /// @param _amount The amount to lock
    function lockStake(address _account, uint256 _amount) external;

    /// @notice Unlock stake after dispute resolution
    /// @param _account The account to unlock stake for
    /// @param _amount The amount to unlock
    function unlockStake(address _account, uint256 _amount) external;

    /// @notice Execute penalty on juror through vault coordination
    /// @param _account The account to penalize
    /// @param _penalty The penalty amount
    /// @param _totalStake The total stake amount (for inactivity check)
    /// @return actualPenalty The actual penalty applied
    function executeJurorPenalty(
        address _account,
        uint256 _penalty,
        uint256 _totalStake
    ) external returns (uint256 actualPenalty);

    /// @notice Set juror as inactive and remove from all sortition trees
    /// @param _account The juror to set inactive
    function setJurorInactive(address _account) external;

    /// @notice Check if a juror should be set inactive after penalty
    /// @param _account The juror account
    /// @param _disputeID The dispute ID
    /// @param _round The round number
    /// @param _repartition The repartition index
    /// @return shouldSet Whether the juror should be set inactive
    function shouldSetJurorInactive(
        address _account,
        uint256 _disputeID,
        uint256 _round,
        uint256 _repartition
    ) external view returns (bool shouldSet);

    // ************************************* //
    // *         Sortition Delegation      * //
    // ************************************* //

    /// @notice Create a sortition tree (delegated to SortitionModule)
    /// @param _key The key of the tree
    /// @param _extraData Extra data for tree configuration
    function createTree(bytes32 _key, bytes memory _extraData) external;

    /// @notice Draw a juror for dispute (delegated to SortitionModule)
    /// @param _court The court identifier
    /// @param _coreDisputeID The core dispute ID
    /// @param _nonce The drawing nonce
    /// @return The drawn juror address
    function draw(bytes32 _court, uint256 _coreDisputeID, uint256 _nonce) external view returns (address);

    /// @notice Create dispute hook (delegated to SortitionModule)
    /// @param _disputeID The dispute ID
    /// @param _roundID The round ID
    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external;

    /// @notice Post draw hook (delegated to SortitionModule)
    /// @param _disputeID The dispute ID
    /// @param _roundID The round ID
    function postDrawHook(uint256 _disputeID, uint256 _roundID) external;

    /// @notice Notify random number (delegated to SortitionModule)
    /// @param _drawnNumber The random number
    function notifyRandomNumber(uint256 _drawnNumber) external;

    // ************************************* //
    // *           View Functions          * //
    // ************************************* //

    /// @notice Get juror balance information
    /// @param _juror The juror address
    /// @param _courtID The court ID
    /// @return totalStaked Total staked amount
    /// @return totalLocked Total locked amount
    /// @return stakedInCourt Amount staked in specific court
    /// @return nbCourts Number of courts staked in
    function getJurorBalance(
        address _juror,
        uint96 _courtID
    ) external view returns (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts);

    /// @notice Get court IDs where juror has stakes
    /// @param _juror The juror address
    /// @return Array of court IDs
    function getJurorCourtIDs(address _juror) external view returns (uint96[] memory);

    /// @notice Check if juror is staked
    /// @param _juror The juror address
    /// @return Whether the juror is staked
    function isJurorStaked(address _juror) external view returns (bool);

    /// @notice Get available balance from vault
    /// @param _account The account to check
    /// @return The available balance
    function getAvailableBalance(address _account) external view returns (uint256);

    /// @notice Get deposited balance from vault
    /// @param _account The account to check
    /// @return The deposited balance
    function getDepositedBalance(address _account) external view returns (uint256);
}

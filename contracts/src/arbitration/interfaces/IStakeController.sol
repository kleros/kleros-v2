// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {KlerosCoreXBase} from "../KlerosCoreXBase.sol";
import "../../libraries/Constants.sol";

/// @title IStakeController
/// @notice Interface for the Stake Controller that coordinates between Vault and SortitionSumTree
/// @dev Combines phase management, delayed stakes, and coordination between vault and sortition
interface IStakeController {
    // ************************************* //
    // *             Enums                 * //
    // ************************************* //

    enum Phase {
        staking, // Stake sum trees can be updated. Pass after `minStakingTime` passes and there is at least one dispute without jurors.
        generating, // Waiting for a random number. Pass as soon as it is ready.
        drawing // Jurors can be drawn. Pass after all disputes have jurors or `maxDrawingTime` passes.
    }

    // ************************************* //
    // *             Events                * //
    // ************************************* //

    event NewPhase(Phase _phase);
    event JurorPenaltyExecuted(address indexed _account, uint256 _penalty, uint256 _actualPenalty);
    event StakeLocked(address indexed _account, uint256 _amount);
    event StakeUnlocked(address indexed _account, uint256 _amount);
    event JurorSetInactive(address indexed _account);

    /// @notice Emitted when a juror's stake is set in a court
    /// @param _account The address of the juror
    /// @param _courtID The ID of the court
    /// @param _stakeInCourt The amount of tokens staked in the court
    /// @param _totalStake The amount of tokens staked in all courts
    event StakeSet(address indexed _account, uint96 indexed _courtID, uint256 _stakeInCourt, uint256 _totalStake);

    // Migration events
    event StakeImported(address indexed _juror, uint96 indexed _courtID, uint256 _stake);
    event DelayedStakeImported(address indexed _juror, uint96 indexed _courtID, uint256 _stake, uint256 _index);
    event MigrationCompleted(uint256 _totalAccounts, uint256 _totalStakesImported);
    event PhaseStateMigrated(Phase _phase, uint256 _lastPhaseChange, uint256 _disputesWithoutJurors);
    event EmergencyReset(uint256 _timestamp);

    // ************************************* //
    // *          Phase Management         * //
    // ************************************* //

    /// @notice Pass to the next phase
    function passPhase() external;

    /// @notice Get the current phase
    /// @return The current phase
    function phase() external view returns (Phase);

    /// @notice Execute delayed stakes during staking phase
    /// @param _iterations The number of delayed stakes to execute
    function executeDelayedStakes(uint256 _iterations) external;

    // ************************************* //
    // *         Stake Management          * //
    // ************************************* //

    /// @notice Set stake for a juror with vault coordination
    /// @param _account The juror's account
    /// @param _courtID The ID of the court
    /// @param _newStake The new stake amount
    /// @return pnkDeposit The amount of PNK to deposit
    /// @return pnkWithdrawal The amount of PNK to withdraw
    /// @return stakingResult The result of the staking operation
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
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
    /// @return pnkBalance The balance of PNK after penalty application, including locked PNK
    /// @return actualPenalty The actual penalty applied
    function setJurorPenalty(
        address _account,
        uint256 _penalty
    ) external returns (uint256 pnkBalance, uint256 actualPenalty);

    /// @notice Set juror as inactive and remove from all sortition trees
    /// @param _account The juror to set inactive
    /// @return pnkToWithdraw The amount of PNK to withdraw
    function setJurorInactive(address _account) external returns (uint256 pnkToWithdraw);

    /// @notice Create dispute hook
    /// @param _disputeID The dispute ID
    /// @param _roundID The round ID
    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external;

    /// @notice Post draw hook
    /// @param _disputeID The dispute ID
    /// @param _roundID The round ID
    function postDrawHook(uint256 _disputeID, uint256 _roundID) external;

    // ************************************* //
    // *         Sortition Delegation      * //
    // ************************************* //

    /// @notice Create a sortition tree (delegated to SortitionSumTree)
    /// @param _key The key of the tree
    /// @param _extraData Extra data for tree configuration
    function createTree(bytes32 _key, bytes memory _extraData) external;

    /// @notice Draw a juror for dispute (delegated to SortitionSumTree)
    /// @param _court The court identifier
    /// @param _coreDisputeID The core dispute ID
    /// @param _nonce The drawing nonce
    /// @return The drawn juror address
    function draw(bytes32 _court, uint256 _coreDisputeID, uint256 _nonce) external view returns (address);

    // ************************************* //
    // *           View Functions          * //
    // ************************************* //

    /// @notice Get juror balance information
    /// @param _juror The juror address
    /// @param _courtID The court ID
    /// @return availablePnk Available PNK
    /// @return lockedPnk Locked PNK
    /// @return penaltyPnk Penalty PNK
    /// @return totalStaked Total staked amount
    /// @return stakedInCourt Amount staked in specific court
    /// @return nbCourts Number of courts staked in
    function getJurorBalance(
        address _juror,
        uint96 _courtID
    )
        external
        view
        returns (
            uint256 availablePnk,
            uint256 lockedPnk,
            uint256 penaltyPnk,
            uint256 totalStaked,
            uint256 stakedInCourt,
            uint256 nbCourts
        );

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

    /// @notice Get the core arbitrator contract
    /// @return The core contract
    function core() external view returns (KlerosCoreXBase);
}

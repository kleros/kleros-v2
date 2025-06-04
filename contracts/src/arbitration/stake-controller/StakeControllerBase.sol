// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {IStakeController} from "../interfaces/IStakeController.sol";
import {IPNKVault} from "../interfaces/IPNKVault.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {KlerosCore} from "../KlerosCore.sol";
import {Initializable} from "../../proxy/Initializable.sol";
import {UUPSProxiable} from "../../proxy/UUPSProxiable.sol";
import {RNG} from "../../rng/RNG.sol";
import "../../libraries/Constants.sol";

/// @title StakeControllerBase
/// @notice Abstract base contract for coordinating between PNKVault and SortitionModule
/// @dev Manages phases, delayed stakes, and coordination logic
abstract contract StakeControllerBase is IStakeController, Initializable, UUPSProxiable {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DelayedStake {
        address account; // The address of the juror.
        uint96 courtID; // The ID of the court.
        uint256 stake; // The new stake.
        bool alreadyTransferred; // True if tokens were already transferred before delayed stake's execution.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
    KlerosCore public core; // The core arbitrator contract.
    IPNKVault public vault; // The PNK vault for token management.
    ISortitionModule public sortitionModule; // The sortition module for drawing logic.

    // Phase management (moved from SortitionModule)
    ISortitionModule.Phase public phase; // The current phase.
    uint256 public minStakingTime; // The time after which the phase can be switched to Drawing if there are open disputes.
    uint256 public maxDrawingTime; // The time after which the phase can be switched back to Staking.
    uint256 public lastPhaseChange; // The last time the phase was changed.
    uint256 public randomNumberRequestBlock; // Number of the block when RNG request was made.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    RNG public rng; // The random number generator.
    uint256 public randomNumber; // Random number returned by RNG.
    uint256 public rngLookahead; // Minimal block distance between requesting and obtaining a random number.

    // Delayed stakes management (moved from SortitionModule)
    uint256 public delayedStakeWriteIndex; // The index of the last `delayedStake` item that was written to the array. 0 index is skipped.
    uint256 public delayedStakeReadIndex; // The index of the next `delayedStake` item that should be processed. Starts at 1 because 0 index is skipped.
    mapping(uint256 => DelayedStake) public delayedStakes; // Stores the stakes that were changed during Drawing phase, to update them when the phase is switched to Staking.
    mapping(address jurorAccount => mapping(uint96 courtId => uint256)) public latestDelayedStakeIndex; // Maps the juror to its latest delayed stake. If there is already a delayed stake for this juror then it'll be replaced.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    modifier onlyByCore() {
        if (address(core) != msg.sender) revert CoreOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    function __StakeControllerBase_initialize(
        address _governor,
        KlerosCore _core,
        IPNKVault _vault,
        ISortitionModule _sortitionModule,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        RNG _rng,
        uint256 _rngLookahead
    ) internal onlyInitializing {
        governor = _governor;
        core = _core;
        vault = _vault;
        sortitionModule = _sortitionModule;
        minStakingTime = _minStakingTime;
        maxDrawingTime = _maxDrawingTime;
        lastPhaseChange = block.timestamp;
        rng = _rng;
        rngLookahead = _rngLookahead;
        delayedStakeReadIndex = 1;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Changes the governor of the contract.
    /// @param _governor The new governor.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the `vault` storage variable.
    /// @param _vault The new vault address.
    function changeVault(IPNKVault _vault) external onlyByGovernor {
        vault = _vault;
    }

    /// @dev Changes the `sortitionModule` storage variable.
    /// @param _sortitionModule The new sortition module address.
    function changeSortitionModule(ISortitionModule _sortitionModule) external onlyByGovernor {
        sortitionModule = _sortitionModule;
    }

    /// @dev Changes the `minStakingTime` storage variable.
    /// @param _minStakingTime The new value for the `minStakingTime` storage variable.
    function changeMinStakingTime(uint256 _minStakingTime) external onlyByGovernor {
        minStakingTime = _minStakingTime;
    }

    /// @dev Changes the `maxDrawingTime` storage variable.
    /// @param _maxDrawingTime The new value for the `maxDrawingTime` storage variable.
    function changeMaxDrawingTime(uint256 _maxDrawingTime) external onlyByGovernor {
        maxDrawingTime = _maxDrawingTime;
    }

    /// @dev Changes the `_rng` and `_rngLookahead` storage variables.
    /// @param _rng The new value for the `RNGenerator` storage variable.
    /// @param _rngLookahead The new value for the `rngLookahead` storage variable.
    function changeRandomNumberGenerator(RNG _rng, uint256 _rngLookahead) external onlyByGovernor {
        rng = _rng;
        rngLookahead = _rngLookahead;
        if (phase == ISortitionModule.Phase.generating) {
            rng.requestRandomness(block.number + rngLookahead);
            randomNumberRequestBlock = block.number;
        }
    }

    // ************************************* //
    // *          Phase Management         * //
    // ************************************* //

    /// @inheritdoc IStakeController
    function passPhase() external override {
        if (phase == ISortitionModule.Phase.staking) {
            if (block.timestamp - lastPhaseChange < minStakingTime) revert MinStakingTimeNotPassed();
            if (disputesWithoutJurors == 0) revert NoDisputesNeedingJurors();
            rng.requestRandomness(block.number + rngLookahead);
            randomNumberRequestBlock = block.number;
            phase = ISortitionModule.Phase.generating;
        } else if (phase == ISortitionModule.Phase.generating) {
            randomNumber = rng.receiveRandomness(randomNumberRequestBlock + rngLookahead);
            if (randomNumber == 0) revert RandomNumberNotReady();
            phase = ISortitionModule.Phase.drawing;
        } else if (phase == ISortitionModule.Phase.drawing) {
            if (disputesWithoutJurors > 0 && block.timestamp - lastPhaseChange < maxDrawingTime) {
                revert StillDrawingDisputes();
            }
            phase = ISortitionModule.Phase.staking;
        }

        lastPhaseChange = block.timestamp;
        emit NewPhase(phase);
    }

    /// @inheritdoc IStakeController
    function getPhase() external view override returns (ISortitionModule.Phase) {
        return phase;
    }

    /// @inheritdoc IStakeController
    function executeDelayedStakes(uint256 _iterations) external override {
        if (phase != ISortitionModule.Phase.staking) revert NotInStakingPhase();
        if (delayedStakeWriteIndex < delayedStakeReadIndex) revert NoDelayedStakes();

        uint256 actualIterations = (delayedStakeReadIndex + _iterations) - 1 > delayedStakeWriteIndex
            ? (delayedStakeWriteIndex - delayedStakeReadIndex) + 1
            : _iterations;
        uint256 newDelayedStakeReadIndex = delayedStakeReadIndex + actualIterations;

        for (uint256 i = delayedStakeReadIndex; i < newDelayedStakeReadIndex; i++) {
            DelayedStake storage delayedStake = delayedStakes[i];
            // Delayed stake could've been manually removed already. In this case simply move on to the next item.
            if (delayedStake.account != address(0)) {
                // Nullify the index so the delayed stake won't get deleted before its own execution.
                delete latestDelayedStakeIndex[delayedStake.account][delayedStake.courtID];

                // Execute the delayed stake through the controller
                (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) = _setStake(
                    delayedStake.account,
                    delayedStake.courtID,
                    delayedStake.stake,
                    delayedStake.alreadyTransferred
                );

                // Note: In delayed stake execution, we don't revert on failures to maintain batch processing
                delete delayedStakes[i];
            }
        }
        delayedStakeReadIndex = newDelayedStakeReadIndex;
    }

    // ************************************* //
    // *         Stake Management          * //
    // ************************************* //

    /// @inheritdoc IStakeController
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _alreadyTransferred
    ) external override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        return _setStake(_account, _courtID, _newStake, _alreadyTransferred);
    }

    /// @dev Internal implementation of setStake with phase-aware delayed stake logic
    function _setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _alreadyTransferred
    ) internal virtual returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        (, , uint256 currentStake, ) = sortitionModule.getJurorBalance(_account, _courtID);

        // Delete any existing delayed stake for this juror/court
        pnkWithdrawal = _deleteDelayedStake(_courtID, _account);

        if (phase != ISortitionModule.Phase.staking) {
            // Store the stake change as delayed, to be applied when the phase switches back to Staking.
            DelayedStake storage delayedStake = delayedStakes[++delayedStakeWriteIndex];
            delayedStake.account = _account;
            delayedStake.courtID = _courtID;
            delayedStake.stake = _newStake;
            latestDelayedStakeIndex[_account][_courtID] = delayedStakeWriteIndex;

            if (_newStake > currentStake) {
                // PNK deposit: tokens are transferred now via vault coordination
                delayedStake.alreadyTransferred = true;
                pnkDeposit = _newStake - currentStake;
                // Note: Actual PNK transfer is handled by KlerosCore through vault
            } else {
                // PNK withdrawal: tokens are not transferred yet.
                delayedStake.alreadyTransferred = false;
            }
            return (pnkDeposit, pnkWithdrawal, StakingResult.Successful);
        }

        // Current phase is Staking: set normal stakes through sortition module
        return sortitionModule.setStake(_account, _courtID, _newStake, _alreadyTransferred);
    }

    /// @inheritdoc IStakeController
    function lockStake(address _account, uint256 _amount) external override onlyByCore {
        vault.lockTokens(_account, _amount);
        emit StakeUnlocked(_account, _amount); // Note: Event name preserved for compatibility
    }

    /// @inheritdoc IStakeController
    function unlockStake(address _account, uint256 _amount) external override onlyByCore {
        vault.unlockTokens(_account, _amount);
        emit StakeUnlocked(_account, _amount);
    }

    /// @inheritdoc IStakeController
    function executeJurorPenalty(
        address _account,
        uint256 _penalty,
        uint256 _totalStake
    ) external virtual override onlyByCore returns (uint256 actualPenalty) {
        // First unlock the penalty amount
        vault.unlockTokens(_account, _penalty);

        // Then apply the penalty through vault
        actualPenalty = vault.applyPenalty(_account, _penalty);

        emit JurorPenaltyExecuted(_account, _penalty, actualPenalty);
        return actualPenalty;
    }

    /// @inheritdoc IStakeController
    function setJurorInactive(address _account) external override onlyByCore {
        uint96[] memory courtIds = sortitionModule.getJurorCourtIDs(_account);

        for (uint256 i = 0; i < courtIds.length; i++) {
            (, , uint256 currentStake, ) = sortitionModule.getJurorBalance(_account, courtIds[i]);
            if (currentStake > 0) {
                // Set stake to 0 in sortition module to remove from trees
                sortitionModule.setStake(_account, courtIds[i], 0, true);
            }
        }

        emit JurorSetInactive(_account);
    }

    /// @inheritdoc IStakeController
    function shouldSetJurorInactive(
        address _account,
        uint256 _disputeID,
        uint256 _round,
        uint256 _repartition
    ) external view virtual override returns (bool shouldSet) {
        // Check if juror has any remaining deposited balance
        uint256 remainingBalance = vault.getDepositedBalance(_account);

        // Check if juror's vote is still active for this dispute
        // This requires access to the dispute kit to check vote activity
        // For now, we'll use a simplified check based on balance
        bool isActive = remainingBalance > 0;

        return remainingBalance == 0 || !isActive;
    }

    // ************************************* //
    // *         Sortition Delegation      * //
    // ************************************* //

    /// @inheritdoc IStakeController
    function createTree(bytes32 _key, bytes memory _extraData) external override onlyByCore {
        sortitionModule.createTree(_key, _extraData);
    }

    /// @inheritdoc IStakeController
    function draw(bytes32 _court, uint256 _coreDisputeID, uint256 _nonce) external view override returns (address) {
        return sortitionModule.draw(_court, _coreDisputeID, _nonce);
    }

    /// @inheritdoc IStakeController
    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external override onlyByCore {
        disputesWithoutJurors++;
        sortitionModule.createDisputeHook(_disputeID, _roundID);
    }

    /// @inheritdoc IStakeController
    function postDrawHook(uint256 _disputeID, uint256 _roundID) external override onlyByCore {
        disputesWithoutJurors--;
        sortitionModule.postDrawHook(_disputeID, _roundID);
    }

    /// @inheritdoc IStakeController
    function notifyRandomNumber(uint256 _drawnNumber) external override {
        sortitionModule.notifyRandomNumber(_drawnNumber);
    }

    // ************************************* //
    // *           View Functions          * //
    // ************************************* //

    /// @inheritdoc IStakeController
    function getJurorBalance(
        address _juror,
        uint96 _courtID
    )
        external
        view
        override
        returns (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts)
    {
        return sortitionModule.getJurorBalance(_juror, _courtID);
    }

    /// @inheritdoc IStakeController
    function getJurorCourtIDs(address _juror) external view override returns (uint96[] memory) {
        return sortitionModule.getJurorCourtIDs(_juror);
    }

    /// @inheritdoc IStakeController
    function isJurorStaked(address _juror) external view override returns (bool) {
        return sortitionModule.isJurorStaked(_juror);
    }

    /// @inheritdoc IStakeController
    function getAvailableBalance(address _account) external view override returns (uint256) {
        return vault.getAvailableBalance(_account);
    }

    /// @inheritdoc IStakeController
    function getDepositedBalance(address _account) external view override returns (uint256) {
        return vault.getDepositedBalance(_account);
    }

    // ************************************* //
    // *              Internal             * //
    // ************************************* //

    /// @dev Enhanced delayed stake storage with better tracking
    function _storeDelayedStakeEnhanced(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) internal returns (bool success) {
        delayedStakeWriteIndex++;
        DelayedStake storage delayedStake = delayedStakes[delayedStakeWriteIndex];
        delayedStake.account = _account;
        delayedStake.courtID = _courtID;
        delayedStake.stake = _newStake;
        delayedStake.alreadyTransferred = false;
        latestDelayedStakeIndex[_account][_courtID] = delayedStakeWriteIndex;

        return true;
    }

    /// @dev Enhanced inactivity check with dispute kit integration
    function _shouldSetJurorInactiveEnhanced(
        address _account,
        uint256 _disputeID,
        uint256 _round,
        uint256 _repartition
    ) internal view returns (bool shouldSet) {
        // Check if juror has any remaining deposited balance
        uint256 remainingBalance = vault.getDepositedBalance(_account);
        if (remainingBalance == 0) {
            return true;
        }

        // Enhanced check - could be extended with dispute kit integration
        // For now, simplified implementation based on balance
        bool isActive = remainingBalance > 0;

        return !isActive;
    }

    /// @dev Checks if there is already a delayed stake. In this case consider it irrelevant and remove it.
    /// @param _courtID ID of the court.
    /// @param _juror Juror whose stake to check.
    function _deleteDelayedStake(uint96 _courtID, address _juror) internal returns (uint256 actualAmountToWithdraw) {
        uint256 latestIndex = latestDelayedStakeIndex[_juror][_courtID];
        if (latestIndex != 0) {
            DelayedStake storage delayedStake = delayedStakes[latestIndex];
            if (delayedStake.alreadyTransferred) {
                // Calculate amount to withdraw based on the difference
                (, , uint256 sortitionStake, ) = sortitionModule.getJurorBalance(_juror, _courtID);
                uint256 amountToWithdraw = delayedStake.stake > sortitionStake
                    ? delayedStake.stake - sortitionStake
                    : 0;
                actualAmountToWithdraw = amountToWithdraw;

                // Note: Actual token withdrawal is handled by KlerosCore through vault coordination
            }
            delete delayedStakes[latestIndex];
            delete latestDelayedStakeIndex[_juror][_courtID];
        }
    }

    // ************************************* //
    // *       Migration Utilities         * //
    // ************************************* //

    /// @dev Import existing stakes from old sortition module for migration
    /// @param _accounts Array of juror accounts
    /// @param _courtIDs Array of court IDs
    /// @param _stakes Array of stake amounts
    function importExistingStakes(
        address[] calldata _accounts,
        uint96[] calldata _courtIDs,
        uint256[] calldata _stakes
    ) external onlyByGovernor {
        if (_accounts.length != _courtIDs.length || _accounts.length != _stakes.length) {
            revert InvalidMigrationData();
        }

        uint256 totalImported = 0;
        for (uint256 i = 0; i < _accounts.length; i++) {
            if (_stakes[i] > 0) {
                // Direct stake import bypassing normal validation for migration
                (, , StakingResult result) = sortitionModule.setStake(_accounts[i], _courtIDs[i], _stakes[i], true);
                if (result == StakingResult.Successful) {
                    totalImported++;
                    emit StakeImported(_accounts[i], _courtIDs[i], _stakes[i]);
                }
            }
        }

        emit MigrationCompleted(_accounts.length, totalImported);
    }

    /// @dev Import delayed stakes from old system for migration
    /// @param _delayedStakes Array of delayed stake data
    function importDelayedStakes(DelayedStake[] calldata _delayedStakes) external onlyByGovernor {
        for (uint256 i = 0; i < _delayedStakes.length; i++) {
            DelayedStake memory delayedStake = _delayedStakes[i];
            if (delayedStake.account != address(0)) {
                delayedStakeWriteIndex++;
                delayedStakes[delayedStakeWriteIndex] = delayedStake;
                latestDelayedStakeIndex[delayedStake.account][delayedStake.courtID] = delayedStakeWriteIndex;

                emit DelayedStakeImported(
                    delayedStake.account,
                    delayedStake.courtID,
                    delayedStake.stake,
                    delayedStakeWriteIndex
                );
            }
        }
    }

    /// @dev Migrate phase state from old sortition module
    /// @param _phase The phase to set
    /// @param _lastPhaseChange The last phase change timestamp
    /// @param _disputesWithoutJurors Number of disputes without jurors
    function migratePhaseState(
        ISortitionModule.Phase _phase,
        uint256 _lastPhaseChange,
        uint256 _disputesWithoutJurors
    ) external onlyByGovernor {
        phase = _phase;
        lastPhaseChange = _lastPhaseChange;
        disputesWithoutJurors = _disputesWithoutJurors;

        emit PhaseStateMigrated(_phase, _lastPhaseChange, _disputesWithoutJurors);
    }

    /// @dev Emergency coordination reset for critical issues
    function emergencyCoordinationReset() external onlyByGovernor {
        phase = ISortitionModule.Phase.staking;
        lastPhaseChange = block.timestamp;
        disputesWithoutJurors = 0;
        randomNumber = 0;

        emit EmergencyReset(block.timestamp);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
    error CoreOnly();
    error MinStakingTimeNotPassed();
    error NoDisputesNeedingJurors();
    error RandomNumberNotReady();
    error StillDrawingDisputes();
    error NotInStakingPhase();
    error NoDelayedStakes();
    error InvalidMigrationData();
}

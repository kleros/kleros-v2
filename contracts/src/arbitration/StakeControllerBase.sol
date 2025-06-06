// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {IStakeController} from "./interfaces/IStakeController.sol";
import {IVault} from "./interfaces/IVault.sol";
import {ISortitionSumTree} from "./interfaces/ISortitionSumTree.sol";
import {IDisputeKit} from "./interfaces/IDisputeKit.sol";
import {KlerosCoreXBase} from "./KlerosCoreXBase.sol";
import {Initializable} from "../proxy/Initializable.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import {RNG} from "../rng/RNG.sol";
import "../libraries/Constants.sol";

/// @title StakeControllerBase
/// @notice Abstract base contract for coordinating between Vault and SortitionModule
/// @dev Manages phases, delayed stakes, and coordination logic
abstract contract StakeControllerBase is IStakeController, Initializable, UUPSProxiable {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DelayedStake {
        address account; // The address of the juror.
        uint96 courtID; // The ID of the court.
        uint256 stake; // The new stake.
    }

    struct JurorStake {
        uint256 totalStake;
        uint96[] stakedCourtIDs;
        mapping(uint96 courtID => uint256 stake) stakes;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
    KlerosCoreXBase public core; // The core arbitrator contract.
    IVault public vault; // The PNK vault for token management.
    ISortitionSumTree public sortitionModule; // The sortition module for drawing logic.

    // Phase management
    Phase public override phase; // The current phase. Uses Phase from IStakeController.
    uint256 public minStakingTime; // The time after which the phase can be switched to Drawing if there are open disputes.
    uint256 public maxDrawingTime; // The time after which the phase can be switched back to Staking.
    uint256 public lastPhaseChange; // The last time the phase was changed.
    uint256 public randomNumberRequestBlock; // Number of the block when RNG request was made.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    RNG public rng; // The random number generator.
    uint256 public randomNumber; // Random number returned by RNG.
    uint256 public rngLookahead; // Minimal block distance between requesting and obtaining a random number.

    // Delayed stakes management
    uint256 public delayedStakeWriteIndex; // The index of the last `delayedStake` item that was written to the array. 0 index is skipped.
    uint256 public delayedStakeReadIndex; // The index of the next `delayedStake` item that should be processed. Starts at 1 because 0 index is skipped.
    mapping(uint256 index => DelayedStake) public delayedStakes; // Stores the stakes that were changed during Drawing phase, to update them when the phase is switched to Staking.

    // Stake management
    mapping(address => JurorStake) internal jurorStakes;

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
        KlerosCoreXBase _core,
        IVault _vault,
        ISortitionSumTree _sortitionModule,
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
    function changeVault(IVault _vault) external onlyByGovernor {
        vault = _vault;
    }

    /// @dev Changes the `sortitionModule` storage variable.
    /// @param _sortitionModule The new sortition module address.
    function changeSortitionModule(ISortitionSumTree _sortitionModule) external onlyByGovernor {
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
        if (phase == Phase.generating) {
            rng.requestRandomness(block.number + rngLookahead);
            randomNumberRequestBlock = block.number;
        }
    }

    // ************************************* //
    // *          Phase Management         * //
    // ************************************* //

    /// @inheritdoc IStakeController
    function passPhase() external override {
        if (phase == Phase.staking) {
            if (block.timestamp - lastPhaseChange < minStakingTime) revert MinStakingTimeNotPassed();
            if (disputesWithoutJurors == 0) revert NoDisputesNeedingJurors();
            rng.requestRandomness(block.number + rngLookahead);
            randomNumberRequestBlock = block.number;
            phase = Phase.generating;
        } else if (phase == Phase.generating) {
            randomNumber = rng.receiveRandomness(randomNumberRequestBlock + rngLookahead);
            if (randomNumber == 0) revert RandomNumberNotReady();
            phase = Phase.drawing;
        } else if (phase == Phase.drawing) {
            if (disputesWithoutJurors > 0 && block.timestamp - lastPhaseChange < maxDrawingTime) {
                revert StillDrawingDisputes();
            }
            phase = Phase.staking;
        }

        lastPhaseChange = block.timestamp;
        emit NewPhase(phase);
    }

    /// @inheritdoc IStakeController
    function executeDelayedStakes(uint256 _iterations) external override {
        if (phase != Phase.staking) revert NotInStakingPhase();
        if (delayedStakeWriteIndex < delayedStakeReadIndex) revert NoDelayedStakes();

        uint256 actualIterations = (delayedStakeReadIndex + _iterations) - 1 > delayedStakeWriteIndex
            ? (delayedStakeWriteIndex - delayedStakeReadIndex) + 1
            : _iterations;
        uint256 newDelayedStakeReadIndex = delayedStakeReadIndex + actualIterations;

        for (uint256 i = delayedStakeReadIndex; i < newDelayedStakeReadIndex; i++) {
            DelayedStake storage delayedStake = delayedStakes[i];
            if (delayedStake.account == address(0)) continue;

            // Let KlerosCore coordinate stake update and vault deposit/withdrawal.
            core.setStakeBySystem(delayedStake.account, delayedStake.courtID, delayedStake.stake);
            delete delayedStakes[i];
        }
        delayedStakeReadIndex = newDelayedStakeReadIndex;
    }

    // ************************************* //
    // *         Stake Management          * //
    // ************************************* //

    /// @inheritdoc IStakeController
    function setStakeBySystem(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) external override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        return _setStakeBySystem(_account, _courtID, _newStake);
    }

    /// @inheritdoc IStakeController
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) public override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        return _setStake(_account, _courtID, _newStake);
    }

    /// @inheritdoc IStakeController
    function lockStake(address _account, uint256 _amount) external override onlyByCore {
        vault.lockTokens(_account, _amount);
        emit StakeLocked(_account, _amount); // Event name might be misleading, should be StakeLocked. Preserved for compatibility if so.
    }

    /// @inheritdoc IStakeController
    function unlockStake(address _account, uint256 _amount) external override onlyByCore {
        vault.unlockTokens(_account, _amount);
        emit StakeUnlocked(_account, _amount);
    }

    /// @inheritdoc IStakeController
    function setJurorPenalty(
        address _account,
        uint256 _penalty
    ) external virtual override onlyByCore returns (uint256 pnkBalance, uint256 actualPenalty) {
        vault.unlockTokens(_account, _penalty);
        (pnkBalance, actualPenalty) = vault.applyPenalty(_account, _penalty);
        emit JurorPenaltyExecuted(_account, _penalty, actualPenalty);
    }

    /// @inheritdoc IStakeController
    function setJurorInactive(address _account) external override onlyByCore returns (uint256 pnkToWithdraw) {
        uint96[] storage courtIDsForJuror = jurorStakes[_account].stakedCourtIDs;
        while (courtIDsForJuror.length > 0) {
            uint96 courtID = courtIDsForJuror[0];
            _setStakeBySystem(_account, courtID, 0);
        }
        jurorStakes[_account].totalStake = 0;
        pnkToWithdraw = vault.getAvailableBalance(_account);
        emit JurorSetInactive(_account);
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
        if (phase != Phase.drawing) revert NotDrawingPhase();
        if (randomNumber == 0) revert RandomNumberNotReadyYet();
        return sortitionModule.draw(_court, _coreDisputeID, _nonce, randomNumber);
    }

    /// @inheritdoc IStakeController
    function createDisputeHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors++;
    }

    /// @inheritdoc IStakeController
    function postDrawHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors--;
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
        returns (
            uint256 availablePnk,
            uint256 lockedPnk,
            uint256 penaltyPnk,
            uint256 totalStaked,
            uint256 stakedInCourt,
            uint256 nbCourts
        )
    {
        availablePnk = vault.getAvailableBalance(_juror);
        lockedPnk = vault.getLockedBalance(_juror);
        penaltyPnk = vault.getPenaltyBalance(_juror);
        totalStaked = jurorStakes[_juror].totalStake;
        stakedInCourt = jurorStakes[_juror].stakes[_courtID];
        nbCourts = jurorStakes[_juror].stakedCourtIDs.length;
    }

    /// @inheritdoc IStakeController
    function getJurorCourtIDs(address _juror) external view override returns (uint96[] memory) {
        return jurorStakes[_juror].stakedCourtIDs;
    }

    /// @inheritdoc IStakeController
    function isJurorStaked(address _juror) external view override returns (bool) {
        return jurorStakes[_juror].totalStake > 0;
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
    // *            Internal               * //
    // ************************************* //

    /// @dev Internal implementation of setStakeBySystem
    /// @param _account The account to set the stake for.
    /// @param _courtID The ID of the court to set the stake for.
    /// @param _newStake The new stake.
    /// @return pnkDeposit The amount of PNK to deposit.
    /// @return pnkWithdrawal The amount of PNK to withdraw.
    /// @return stakingResult The result of the staking operation.
    function _setStakeBySystem(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) internal virtual returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        JurorStake storage currentJurorStake = jurorStakes[_account];
        uint256 currentStakeInCourt = currentJurorStake.stakes[_courtID];

        if (currentStakeInCourt == 0) {
            if (_newStake == 0)
                // No change needed
                return (0, 0, StakingResult.CannotStakeZeroWhenNoStake);
            else if (_newStake > 0 && currentJurorStake.stakedCourtIDs.length >= MAX_STAKE_PATHS)
                // Cannot stake in more courts
                return (0, 0, StakingResult.CannotStakeInMoreCourts);
        }

        currentJurorStake.stakes[_courtID] = _newStake;

        if (_newStake > currentStakeInCourt) {
            pnkDeposit = _newStake - currentStakeInCourt;
            currentJurorStake.totalStake += pnkDeposit;
        } else if (_newStake < currentStakeInCourt) {
            pnkWithdrawal = currentStakeInCourt - _newStake;
            currentJurorStake.totalStake -= pnkWithdrawal;
        }

        // Manage stakedCourtIDs
        if (currentStakeInCourt == 0 && _newStake > 0) {
            currentJurorStake.stakedCourtIDs.push(_courtID);
        } else if (currentStakeInCourt > 0 && _newStake == 0) {
            _removeCourt(currentJurorStake.stakedCourtIDs, _courtID);
        }

        sortitionModule.setStake(_account, _courtID, _newStake);

        emit StakeSet(_account, _courtID, _newStake, currentJurorStake.totalStake);
    }

    /// @dev Internal implementation of setStake with phase-aware delayed stake logic
    /// @param _account The account to set the stake for.
    /// @param _courtID The ID of the court to set the stake for.
    /// @param _newStake The new stake.
    /// @return pnkDeposit The amount of PNK to deposit.
    /// @return pnkWithdrawal The amount of PNK to withdraw.
    /// @return stakingResult The result of the staking operation.
    function _setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) internal virtual returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        if (phase == Phase.staking) {
            return _setStakeBySystem(_account, _courtID, _newStake);
        }

        JurorStake storage currentJurorStake = jurorStakes[_account];
        uint256 currentStakeInCourt = currentJurorStake.stakes[_courtID];

        if (_newStake > currentStakeInCourt) {
            pnkDeposit = _newStake - currentStakeInCourt;
        } else if (_newStake < currentStakeInCourt) {
            pnkWithdrawal = currentStakeInCourt - _newStake;
        }

        // MAX_STAKE_PATHS is checked by _setStakeBySystem() called during executeDelayedStakes().
        DelayedStake storage delayedStake = delayedStakes[++delayedStakeWriteIndex];
        delayedStake.account = _account;
        delayedStake.courtID = _courtID;
        delayedStake.stake = _newStake;
        return (pnkDeposit, pnkWithdrawal, StakingResult.Delayed);
    }

    /// @dev Removes a court from a juror's list of staked courts.
    /// @param _stakedCourts Storage pointer to the juror's array of staked court IDs.
    /// @param _courtID The ID of the court to remove.
    function _removeCourt(uint96[] storage _stakedCourts, uint96 _courtID) internal {
        uint256 length = _stakedCourts.length;
        if (length == 0) {
            return; // Nothing to remove
        }

        uint256 courtIndexToRemove = type(uint256).max; // Sentinel value indicates not found
        for (uint256 i = 0; i < length; i++) {
            if (_stakedCourts[i] == _courtID) {
                courtIndexToRemove = i;
                break;
            }
        }

        if (courtIndexToRemove != type(uint256).max) {
            // If the courtID was found in the array
            // If it's not the last element, swap the last element into its place
            if (courtIndexToRemove != length - 1) {
                _stakedCourts[courtIndexToRemove] = _stakedCourts[length - 1];
            }
            // Remove the last element (either the original last, or the one that was swapped)
            _stakedCourts.pop();
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

        uint256 totalImportedSuccess = 0;
        for (uint256 i = 0; i < _accounts.length; i++) {
            if (_stakes[i] > 0) {
                address account = _accounts[i];
                uint96 courtID = _courtIDs[i];
                uint256 stakeToImport = _stakes[i];

                // Ensure no prior stake exists for this specific account/courtID combination in this contract's state for a clean import.
                // This check assumes importExistingStakes is for a fresh population or controlled append.
                // If overwriting/updating was intended, this check might differ.
                if (jurorStakes[account].stakes[courtID] > 0) {
                    // Skip or revert, depending on desired import semantics. For now, skip and log.
                    // emit ImportSkippedDuplicate(account, courtID, stakeToImport);
                    continue;
                }

                // _setStakeBySystem will update local juror stake mappings (jurorStakes)
                // AND call sortitionModule.setStake.
                // The pnkDeposit/pnkWithdrawal are calculated but not used by this import function.
                (, , StakingResult stakingResult) = _setStakeBySystem(account, courtID, stakeToImport);

                if (stakingResult == StakingResult.Successful) {
                    totalImportedSuccess++;
                    emit StakeImported(account, courtID, stakeToImport);
                } else {
                    // Log or handle failed import for a specific entry
                    // emit StakeImportFailed(account, courtID, stakeToImport, stakingResult);
                }
            }
        }

        emit MigrationCompleted(_accounts.length, totalImportedSuccess);
    }

    /// @dev Import delayed stakes from old system for migration
    /// @param _delayedStakes Array of delayed stake data
    function importDelayedStakes(DelayedStake[] calldata _delayedStakes) external onlyByGovernor {
        for (uint256 i = 0; i < _delayedStakes.length; i++) {
            DelayedStake memory delayedStake = _delayedStakes[i];
            if (delayedStake.account != address(0)) {
                delayedStakeWriteIndex++;
                delayedStakes[delayedStakeWriteIndex] = delayedStake;

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
        Phase _phase,
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
        phase = Phase.staking;
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
    error RandomNumberNotReadyYet();
    error StillDrawingDisputes();
    error NotInStakingPhase();
    error NotDrawingPhase();
    error NoDelayedStakes();
    error InvalidMigrationData();
}

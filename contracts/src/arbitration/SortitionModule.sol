// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {KlerosCore} from "./KlerosCore.sol";
import {ISortitionModule} from "./interfaces/ISortitionModule.sol";
import {IDisputeKit} from "./interfaces/IDisputeKit.sol";
import {Initializable} from "../proxy/Initializable.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import {SortitionTrees, TreeKey, CourtID} from "../libraries/SortitionTrees.sol";
import {IRNG} from "../rng/IRNG.sol";
import "../libraries/Constants.sol";

/// @title SortitionModule
/// @notice A factory of trees that keeps track of staked values for sortition.
contract SortitionModule is ISortitionModule, Initializable, UUPSProxiable {
    using SortitionTrees for SortitionTrees.Tree;
    using SortitionTrees for mapping(TreeKey key => SortitionTrees.Tree);

    string public constant override version = "2.0.0";

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DelayedStake {
        address account; // The address of the juror.
        uint96 courtID; // The ID of the court.
        uint256 stake; // The new stake.
    }

    struct Juror {
        uint96[] courtIDs; // The IDs of courts where the juror's stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        uint256 stakedPnk; // The juror's total amount of tokens staked in subcourts. PNK balance including locked PNK and penalty deductions.
        uint256 lockedPnk; // The juror's total amount of tokens locked in disputes.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The owner of the contract.
    KlerosCore public core; // The core arbitrator contract.
    Phase public phase; // The current phase.
    uint256 public minStakingTime; // The time after which the phase can be switched to Drawing if there are open disputes.
    uint256 public maxDrawingTime; // The time after which the phase can be switched back to Staking.
    uint256 public lastPhaseChange; // The last time the phase was changed.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    IRNG public rng; // The random number generator.
    uint256 public randomNumber; // Random number returned by RNG.
    uint256 public delayedStakeWriteIndex; // The index of the last `delayedStake` item that was written to the array. 0 index is skipped.
    uint256 public delayedStakeReadIndex; // The index of the next `delayedStake` item that should be processed. Starts at 1 because 0 index is skipped.
    mapping(TreeKey key => SortitionTrees.Tree) sortitionSumTrees; // The mapping of sortition trees by keys.
    mapping(address account => Juror) public jurors; // The jurors.
    mapping(uint256 => DelayedStake) public delayedStakes; // Stores the stakes that were changed during Drawing phase, to update them when the phase is switched to Staking.
    uint256 public maxStakePerJuror; // The maximum amount of PNK that a juror can stake across the courts.
    uint256 public maxTotalStaked; // The maximum amount of PNK that all the jurors can stake across the courts.
    uint256 public totalStaked; // The amount of PNK that is currently staked across the courts.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a juror stakes in a court.
    /// @param _address The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _amount The amount of tokens staked in the court.
    /// @param _amountAllCourts The amount of tokens staked in all courts.
    event StakeSet(address indexed _address, uint256 _courtID, uint256 _amount, uint256 _amountAllCourts);

    /// @notice Emitted when a juror's stake is delayed.
    /// @param _address The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _amount The amount of tokens staked in the court.
    event StakeDelayed(address indexed _address, uint96 indexed _courtID, uint256 _amount);

    /// @notice Emitted when a juror's stake is delayed execution fails.
    /// @param _address The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _amount The amount of tokens staked in the court.
    event StakeDelayedExecutionFailed(address indexed _address, uint96 indexed _courtID, uint256 _amount);

    /// @notice Emitted when a juror's stake is locked.
    /// @param _address The address of the juror.
    /// @param _relativeAmount The amount of tokens locked.
    /// @param _unlock Whether the stake is locked or unlocked.
    event StakeLocked(address indexed _address, uint256 _relativeAmount, bool _unlock);

    /// @notice Emitted when leftover PNK is available.
    /// @param _account The account of the juror.
    /// @param _amount The amount of PNK available.
    event LeftoverPNK(address indexed _account, uint256 _amount);

    /// @notice Emitted when leftover PNK is withdrawn.
    /// @param _account The account of the juror withdrawing PNK.
    /// @param _amount The amount of PNK withdrawn.
    event LeftoverPNKWithdrawn(address indexed _account, uint256 _amount);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer (constructor equivalent for upgradable contracts).
    /// @param _owner The owner.
    /// @param _core The KlerosCore.
    /// @param _minStakingTime Minimal time to stake
    /// @param _maxDrawingTime Time after which the drawing phase can be switched
    /// @param _rng The random number generator.
    /// @param _maxStakePerJuror The maximum amount of PNK a juror can stake across the courts.
    /// @param _maxTotalStaked The maximum amount of PNK that all the jurors can stake across the courts.
    function initialize(
        address _owner,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        IRNG _rng,
        uint256 _maxStakePerJuror,
        uint256 _maxTotalStaked
    ) external initializer {
        owner = _owner;
        core = _core;
        minStakingTime = _minStakingTime;
        maxDrawingTime = _maxDrawingTime;
        lastPhaseChange = block.timestamp;
        rng = _rng;
        maxStakePerJuror = _maxStakePerJuror;
        maxTotalStaked = _maxTotalStaked;
        delayedStakeReadIndex = 1;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    modifier onlyByCore() {
        if (address(core) != msg.sender) revert KlerosCoreOnly();
        _;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @notice Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Changes the `minStakingTime` storage variable.
    /// @param _minStakingTime The new value for the `minStakingTime` storage variable.
    function changeMinStakingTime(uint256 _minStakingTime) external onlyByOwner {
        minStakingTime = _minStakingTime;
    }

    /// @notice Changes the `maxDrawingTime` storage variable.
    /// @param _maxDrawingTime The new value for the `maxDrawingTime` storage variable.
    function changeMaxDrawingTime(uint256 _maxDrawingTime) external onlyByOwner {
        maxDrawingTime = _maxDrawingTime;
    }

    /// @notice Changes the `rng` storage variable.
    /// @param _rng The new random number generator.
    function changeRandomNumberGenerator(IRNG _rng) external onlyByOwner {
        rng = _rng;
        if (phase == Phase.generating) {
            rng.requestRandomness();
        }
    }

    /// @notice Changes the `maxStakePerJuror` storage variable.
    /// @param _maxStakePerJuror The new `maxStakePerJuror` storage variable.
    function changeMaxStakePerJuror(uint256 _maxStakePerJuror) external onlyByOwner {
        maxStakePerJuror = _maxStakePerJuror;
    }

    /// @notice Changes the `maxTotalStaked` storage variable.
    /// @param _maxTotalStaked The new `maxTotalStaked` storage variable.
    function changeMaxTotalStaked(uint256 _maxTotalStaked) external onlyByOwner {
        maxTotalStaked = _maxTotalStaked;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc ISortitionModule
    function passPhase() external override {
        if (phase == Phase.staking) {
            if (block.timestamp - lastPhaseChange < minStakingTime) revert MinStakingTimeNotPassed();
            if (disputesWithoutJurors == 0) revert NoDisputesThatNeedJurors();
            rng.requestRandomness();
            phase = Phase.generating;
        } else if (phase == Phase.generating) {
            randomNumber = rng.receiveRandomness();
            if (randomNumber == 0) revert RandomNumberNotReady();
            phase = Phase.drawing;
        } else if (phase == Phase.drawing) {
            if (disputesWithoutJurors > 0 && block.timestamp - lastPhaseChange < maxDrawingTime) {
                revert DisputesWithoutJurorsAndMaxDrawingTimeNotPassed();
            }
            phase = Phase.staking;
        }

        lastPhaseChange = block.timestamp;
        emit NewPhase(phase);
    }

    /// @inheritdoc ISortitionModule
    function createTree(uint96 _courtID, bytes memory _extraData) external override onlyByCore {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        uint256 K = _extraDataToTreeK(_extraData);
        sortitionSumTrees.createTree(key, K);
    }

    /// @inheritdoc ISortitionModule
    function executeDelayedStakes(uint256 _iterations) external override {
        if (phase != Phase.staking) revert NotStakingPhase();
        if (delayedStakeWriteIndex < delayedStakeReadIndex) revert NoDelayedStakeToExecute();

        uint256 actualIterations = (delayedStakeReadIndex + _iterations) - 1 > delayedStakeWriteIndex
            ? (delayedStakeWriteIndex - delayedStakeReadIndex) + 1
            : _iterations;
        uint256 newDelayedStakeReadIndex = delayedStakeReadIndex + actualIterations;

        for (uint256 i = delayedStakeReadIndex; i < newDelayedStakeReadIndex; i++) {
            DelayedStake storage delayedStake = delayedStakes[i];
            if (!core.setStakeBySortitionModule(delayedStake.account, delayedStake.courtID, delayedStake.stake)) {
                emit StakeDelayedExecutionFailed(delayedStake.account, delayedStake.courtID, delayedStake.stake);
            }
            delete delayedStakes[i];
        }
        delayedStakeReadIndex = newDelayedStakeReadIndex;
    }

    /// @inheritdoc ISortitionModule
    function createDisputeHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors++;
    }

    /// @inheritdoc ISortitionModule
    function postDrawHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors--;
    }

    /// @inheritdoc ISortitionModule
    function validateStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _noDelay
    ) external override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        (pnkDeposit, pnkWithdrawal, stakingResult) = _validateStake(_account, _courtID, _newStake, _noDelay);
    }

    function _validateStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _noDelay
    ) internal returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        Juror storage juror = jurors[_account];
        uint256 currentStake = _stakeOf(_account, _courtID);
        bool stakeIncrease = _newStake > currentStake;
        uint256 stakeChange = stakeIncrease ? _newStake - currentStake : currentStake - _newStake;

        uint256 nbCourts = juror.courtIDs.length;
        if (currentStake == 0 && nbCourts >= MAX_STAKE_PATHS) {
            return (0, 0, StakingResult.CannotStakeInMoreCourts); // Prevent staking beyond MAX_STAKE_PATHS but unstaking is always allowed.
        }

        if (currentStake == 0 && _newStake == 0) {
            return (0, 0, StakingResult.CannotStakeZeroWhenNoStake); // Forbid staking 0 amount when current stake is 0 to avoid flaky behaviour.
        }

        if (stakeIncrease) {
            // Check if the stake increase is within the limits.
            if (juror.stakedPnk + stakeChange > maxStakePerJuror || currentStake + stakeChange > maxStakePerJuror) {
                return (0, 0, StakingResult.CannotStakeMoreThanMaxStakePerJuror);
            }
            if (totalStaked + stakeChange > maxTotalStaked) {
                return (0, 0, StakingResult.CannotStakeMoreThanMaxTotalStaked);
            }
        }

        if (phase != Phase.staking && !_noDelay) {
            // Store the stake change as delayed, to be applied when the phase switches back to Staking.
            DelayedStake storage delayedStake = delayedStakes[++delayedStakeWriteIndex];
            delayedStake.account = _account;
            delayedStake.courtID = _courtID;
            delayedStake.stake = _newStake;
            emit StakeDelayed(_account, _courtID, _newStake);
            return (pnkDeposit, pnkWithdrawal, StakingResult.Delayed);
        }

        // Current phase is Staking: set stakes.
        if (stakeIncrease) {
            pnkDeposit = stakeChange;
            totalStaked += stakeChange;
        } else {
            pnkWithdrawal = stakeChange;
            uint256 possibleWithdrawal = juror.stakedPnk > juror.lockedPnk ? juror.stakedPnk - juror.lockedPnk : 0;
            if (pnkWithdrawal > possibleWithdrawal) {
                // Ensure locked tokens remain in the contract. They can only be released during Execution.
                pnkWithdrawal = possibleWithdrawal;
            }
            totalStaked -= pnkWithdrawal;
        }
        return (pnkDeposit, pnkWithdrawal, StakingResult.Successful);
    }

    /// @inheritdoc ISortitionModule
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _pnkDeposit,
        uint256 _pnkWithdrawal,
        uint256 _newStake
    ) external override onlyByCore {
        _setStake(_account, _courtID, _pnkDeposit, _pnkWithdrawal, _newStake);
    }

    /// @inheritdoc ISortitionModule
    function setStakePenalty(
        address _account,
        uint96 _courtID,
        uint256 _penalty
    ) external override onlyByCore returns (uint256 pnkBalance, uint256 newCourtStake, uint256 availablePenalty) {
        Juror storage juror = jurors[_account];
        availablePenalty = _penalty;
        newCourtStake = _stakeOf(_account, _courtID);
        if (juror.stakedPnk < _penalty) {
            availablePenalty = juror.stakedPnk;
        }

        if (availablePenalty == 0) return (juror.stakedPnk, newCourtStake, 0); // No penalty to apply.

        uint256 currentStake = newCourtStake;
        uint256 newStake = 0;
        if (currentStake >= availablePenalty) {
            newStake = currentStake - availablePenalty;
        }
        _setStake(_account, _courtID, 0, availablePenalty, newStake);
        pnkBalance = juror.stakedPnk; // updated by _setStake()
        newCourtStake = newStake;
    }

    /// @inheritdoc ISortitionModule
    function setStakeReward(
        address _account,
        uint96 _courtID,
        uint256 _reward
    ) external override onlyByCore returns (bool success) {
        if (_reward == 0) return true; // No reward to add.

        uint256 currentStake = _stakeOf(_account, _courtID);
        if (currentStake == 0) return false; // Juror has been unstaked, don't increase their stake.

        uint256 newStake = currentStake + _reward;
        _setStake(_account, _courtID, _reward, 0, newStake);
        return true;
    }

    function _setStake(
        address _account,
        uint96 _courtID,
        uint256 _pnkDeposit,
        uint256 _pnkWithdrawal,
        uint256 _newStake
    ) internal {
        Juror storage juror = jurors[_account];
        if (_pnkDeposit > 0) {
            uint256 currentStake = _stakeOf(_account, _courtID);
            if (currentStake == 0) {
                juror.courtIDs.push(_courtID);
            }
            // Increase juror's balance by deposited amount.
            juror.stakedPnk += _pnkDeposit;
        } else {
            juror.stakedPnk -= _pnkWithdrawal;
            if (_newStake == 0) {
                // Cleanup
                for (uint256 i = juror.courtIDs.length; i > 0; i--) {
                    if (juror.courtIDs[i - 1] == _courtID) {
                        juror.courtIDs[i - 1] = juror.courtIDs[juror.courtIDs.length - 1];
                        juror.courtIDs.pop();
                        break;
                    }
                }
            }
        }

        // Update the sortition sum tree.
        bytes32 stakePathID = SortitionTrees.toStakePathID(_account, _courtID);
        bool finished = false;
        uint96 currentCourtID = _courtID;
        while (!finished) {
            // Tokens are also implicitly staked in parent courts through sortition module to increase the chance of being drawn.
            TreeKey key = CourtID.wrap(currentCourtID).toTreeKey();
            sortitionSumTrees[key].set(_newStake, stakePathID);
            if (currentCourtID == GENERAL_COURT) {
                finished = true;
            } else {
                (currentCourtID, , , , , ) = core.courts(currentCourtID); // Get the parent court.
            }
        }
        emit StakeSet(_account, _courtID, _newStake, juror.stakedPnk);
    }

    /// @inheritdoc ISortitionModule
    function lockStake(address _account, uint256 _relativeAmount) external override onlyByCore {
        jurors[_account].lockedPnk += _relativeAmount;
        emit StakeLocked(_account, _relativeAmount, false);
    }

    /// @inheritdoc ISortitionModule
    function unlockStake(address _account, uint256 _relativeAmount) external override onlyByCore {
        Juror storage juror = jurors[_account];
        juror.lockedPnk -= _relativeAmount;
        emit StakeLocked(_account, _relativeAmount, true);

        uint256 amount = getJurorLeftoverPNK(_account);
        if (amount > 0) {
            emit LeftoverPNK(_account, amount);
        }
    }

    /// @inheritdoc ISortitionModule
    function forcedUnstakeAllCourts(address _account) external override onlyByCore {
        uint96[] memory courtIDs = getJurorCourtIDs(_account);
        for (uint256 j = courtIDs.length; j > 0; j--) {
            core.setStakeBySortitionModule(_account, courtIDs[j - 1], 0);
        }
    }

    /// @inheritdoc ISortitionModule
    function forcedUnstake(address _account, uint96 _courtID) external override onlyByCore {
        core.setStakeBySortitionModule(_account, _courtID, 0);
    }

    /// @inheritdoc ISortitionModule
    function withdrawLeftoverPNK(address _account) external override {
        // Can withdraw the leftover PNK if fully unstaked, has no tokens locked and has positive balance.
        // This withdrawal can't be triggered by calling setStake() in KlerosCore because current stake is technically 0, thus it is done via separate function.
        uint256 amount = getJurorLeftoverPNK(_account);
        if (amount == 0) revert NotEligibleForWithdrawal();
        jurors[_account].stakedPnk = 0;
        core.transferBySortitionModule(_account, amount);
        emit LeftoverPNKWithdrawn(_account, amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @inheritdoc ISortitionModule
    function draw(
        uint96 _courtID,
        uint256 _coreDisputeID,
        uint256 _nonce
    ) public view override returns (address drawnAddress, uint96 fromSubcourtID) {
        if (phase != Phase.drawing) revert NotDrawingPhase();

        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        (drawnAddress, fromSubcourtID) = sortitionSumTrees[key].draw(_coreDisputeID, _nonce, randomNumber);
    }

    /// @inheritdoc ISortitionModule
    function getJurorBalance(
        address _juror,
        uint96 _courtID
    )
        external
        view
        override
        returns (uint256 totalStakedPnk, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts)
    {
        Juror storage juror = jurors[_juror];
        totalStakedPnk = juror.stakedPnk;
        totalLocked = juror.lockedPnk;
        stakedInCourt = _stakeOf(_juror, _courtID);
        nbCourts = juror.courtIDs.length;
    }

    /// @inheritdoc ISortitionModule
    function getJurorCourtIDs(address _juror) public view override returns (uint96[] memory) {
        return jurors[_juror].courtIDs;
    }

    /// @inheritdoc ISortitionModule
    function isJurorStaked(address _juror) external view override returns (bool) {
        return jurors[_juror].stakedPnk > 0;
    }

    /// @inheritdoc ISortitionModule
    function getJurorLeftoverPNK(address _juror) public view override returns (uint256) {
        Juror storage juror = jurors[_juror];
        if (juror.courtIDs.length == 0 && juror.lockedPnk == 0) {
            return juror.stakedPnk;
        } else {
            return 0;
        }
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @notice Get the stake of a juror in a court.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return value The stake of the juror in the court.
    function _stakeOf(address _juror, uint96 _courtID) internal view returns (uint256) {
        bytes32 stakePathID = SortitionTrees.toStakePathID(_juror, _courtID);
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        return sortitionSumTrees[key].stakeOf(stakePathID);
    }

    /// @notice Converts sortition extradata into K value of sortition tree.
    /// @param _extraData Sortition extra data.
    /// @return K The value of K.
    function _extraDataToTreeK(bytes memory _extraData) internal pure returns (uint256 K) {
        if (_extraData.length >= 32) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                K := mload(add(_extraData, 0x20))
            }
        } else {
            K = DEFAULT_K;
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error KlerosCoreOnly();
    error MinStakingTimeNotPassed();
    error NoDisputesThatNeedJurors();
    error RandomNumberNotReady();
    error DisputesWithoutJurorsAndMaxDrawingTimeNotPassed();
    error NotStakingPhase();
    error NoDelayedStakeToExecute();
    error NotEligibleForWithdrawal();
    error NotDrawingPhase();
}

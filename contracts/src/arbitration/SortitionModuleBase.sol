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

/// @title SortitionModuleBase
/// @dev A factory of trees that keeps track of staked values for sortition.
abstract contract SortitionModuleBase is ISortitionModule, Initializable, UUPSProxiable {
    using SortitionTrees for SortitionTrees.Tree;
    using SortitionTrees for mapping(TreeKey key => SortitionTrees.Tree);

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DelayedStake {
        address account; // The address of the juror.
        uint96 courtID; // The ID of the court.
        uint256 stake; // The new stake.
        bool alreadyTransferred; // DEPRECATED. True if tokens were already transferred before delayed stake's execution.
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
    uint256 public randomNumberRequestBlock; // DEPRECATED: to be removed in the next redeploy
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    IRNG public rng; // The random number generator.
    uint256 public randomNumber; // Random number returned by RNG.
    uint256 public rngLookahead; // DEPRECATED: to be removed in the next redeploy
    uint256 public delayedStakeWriteIndex; // The index of the last `delayedStake` item that was written to the array. 0 index is skipped.
    uint256 public delayedStakeReadIndex; // The index of the next `delayedStake` item that should be processed. Starts at 1 because 0 index is skipped.
    mapping(TreeKey key => SortitionTrees.Tree) sortitionSumTrees; // The mapping of sortition trees by keys.
    mapping(address account => Juror) public jurors; // The jurors.
    mapping(uint256 => DelayedStake) public delayedStakes; // Stores the stakes that were changed during Drawing phase, to update them when the phase is switched to Staking.
    mapping(address jurorAccount => mapping(uint96 courtId => uint256)) public latestDelayedStakeIndex; // DEPRECATED. Maps the juror to its latest delayed stake. If there is already a delayed stake for this juror then it'll be replaced. latestDelayedStakeIndex[juror][courtID].

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

    /// @notice Emitted when a juror's stake is locked.
    /// @param _address The address of the juror.
    /// @param _relativeAmount The amount of tokens locked.
    /// @param _unlock Whether the stake is locked or unlocked.
    event StakeLocked(address indexed _address, uint256 _relativeAmount, bool _unlock);

    /// @dev Emitted when leftover PNK is available.
    /// @param _account The account of the juror.
    /// @param _amount The amount of PNK available.
    event LeftoverPNK(address indexed _account, uint256 _amount);

    /// @dev Emitted when leftover PNK is withdrawn.
    /// @param _account The account of the juror withdrawing PNK.
    /// @param _amount The amount of PNK withdrawn.
    event LeftoverPNKWithdrawn(address indexed _account, uint256 _amount);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    function __SortitionModuleBase_initialize(
        address _owner,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        IRNG _rng
    ) internal onlyInitializing {
        owner = _owner;
        core = _core;
        minStakingTime = _minStakingTime;
        maxDrawingTime = _maxDrawingTime;
        lastPhaseChange = block.timestamp;
        rng = _rng;
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

    /// @dev Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @dev Changes the `minStakingTime` storage variable.
    /// @param _minStakingTime The new value for the `minStakingTime` storage variable.
    function changeMinStakingTime(uint256 _minStakingTime) external onlyByOwner {
        minStakingTime = _minStakingTime;
    }

    /// @dev Changes the `maxDrawingTime` storage variable.
    /// @param _maxDrawingTime The new value for the `maxDrawingTime` storage variable.
    function changeMaxDrawingTime(uint256 _maxDrawingTime) external onlyByOwner {
        maxDrawingTime = _maxDrawingTime;
    }

    /// @dev Changes the `rng` storage variable.
    /// @param _rng The new random number generator.
    function changeRandomNumberGenerator(IRNG _rng) external onlyByOwner {
        rng = _rng;
        if (phase == Phase.generating) {
            rng.requestRandomness();
        }
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function passPhase() external {
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

    /// @dev Create a sortition sum tree at the specified key.
    /// @param _courtID The ID of the court.
    /// @param _extraData Extra data that contains the number of children each node in the tree should have.
    function createTree(uint96 _courtID, bytes memory _extraData) external override onlyByCore {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        uint256 K = _extraDataToTreeK(_extraData);
        sortitionSumTrees.createTree(key, K);
    }

    /// @dev Executes the next delayed stakes.
    /// @param _iterations The number of delayed stakes to execute.
    function executeDelayedStakes(uint256 _iterations) external {
        if (phase != Phase.staking) revert NotStakingPhase();
        if (delayedStakeWriteIndex < delayedStakeReadIndex) revert NoDelayedStakeToExecute();

        uint256 actualIterations = (delayedStakeReadIndex + _iterations) - 1 > delayedStakeWriteIndex
            ? (delayedStakeWriteIndex - delayedStakeReadIndex) + 1
            : _iterations;
        uint256 newDelayedStakeReadIndex = delayedStakeReadIndex + actualIterations;

        for (uint256 i = delayedStakeReadIndex; i < newDelayedStakeReadIndex; i++) {
            DelayedStake storage delayedStake = delayedStakes[i];
            core.setStakeBySortitionModule(delayedStake.account, delayedStake.courtID, delayedStake.stake);
            delete delayedStakes[i];
        }
        delayedStakeReadIndex = newDelayedStakeReadIndex;
    }

    function createDisputeHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors++;
    }

    function postDrawHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors--;
    }

    /// @dev Saves the random number to use it in sortition. Not used by this contract because the storing of the number is inlined in passPhase().
    /// @param _randomNumber Random number returned by RNG contract.
    function notifyRandomNumber(uint256 _randomNumber) public override {}

    /// @dev Validate the specified juror's new stake for a court.
    /// Note: no state changes should be made when returning stakingResult != Successful, otherwise delayed stakes might break invariants.
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// @param _noDelay True if the stake change should not be delayed.
    /// @return pnkDeposit The amount of PNK to be deposited.
    /// @return pnkWithdrawal The amount of PNK to be withdrawn.
    /// @return stakingResult The result of the staking operation.
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
    ) internal virtual returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        Juror storage juror = jurors[_account];
        uint256 currentStake = stakeOf(_account, _courtID);

        uint256 nbCourts = juror.courtIDs.length;
        if (currentStake == 0 && nbCourts >= MAX_STAKE_PATHS) {
            return (0, 0, StakingResult.CannotStakeInMoreCourts); // Prevent staking beyond MAX_STAKE_PATHS but unstaking is always allowed.
        }

        if (currentStake == 0 && _newStake == 0) {
            return (0, 0, StakingResult.CannotStakeZeroWhenNoStake); // Forbid staking 0 amount when current stake is 0 to avoid flaky behaviour.
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
        if (_newStake >= currentStake) {
            pnkDeposit = _newStake - currentStake;
        } else {
            pnkWithdrawal = currentStake - _newStake;
            // Ensure locked tokens remain in the contract. They can only be released during Execution.
            uint256 possibleWithdrawal = juror.stakedPnk > juror.lockedPnk ? juror.stakedPnk - juror.lockedPnk : 0;
            if (pnkWithdrawal > possibleWithdrawal) {
                pnkWithdrawal = possibleWithdrawal;
            }
        }
        return (pnkDeposit, pnkWithdrawal, StakingResult.Successful);
    }

    /// @dev Update the state of the stakes, called by KC at the end of setStake flow.
    /// `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _pnkDeposit The amount of PNK to be deposited.
    /// @param _pnkWithdrawal The amount of PNK to be withdrawn.
    /// @param _newStake The new stake.
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _pnkDeposit,
        uint256 _pnkWithdrawal,
        uint256 _newStake
    ) external override onlyByCore {
        _setStake(_account, _courtID, _pnkDeposit, _pnkWithdrawal, _newStake);
    }

    /// @dev Update the state of the stakes with a PNK reward deposit, called by KC during rewards execution.
    /// `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _penalty The amount of PNK to be deducted.
    /// @return pnkBalance The updated total PNK balance of the juror, including the penalty.
    /// @return newCourtStake The updated stake of the juror in the court.
    /// @return availablePenalty The amount of PNK that was actually deducted.
    function setStakePenalty(
        address _account,
        uint96 _courtID,
        uint256 _penalty
    ) external override onlyByCore returns (uint256 pnkBalance, uint256 newCourtStake, uint256 availablePenalty) {
        Juror storage juror = jurors[_account];
        availablePenalty = _penalty;
        newCourtStake = stakeOf(_account, _courtID);
        if (juror.stakedPnk < _penalty) {
            availablePenalty = juror.stakedPnk;
        }

        if (availablePenalty == 0) return (juror.stakedPnk, newCourtStake, 0); // No penalty to apply.

        uint256 currentStake = stakeOf(_account, _courtID);
        uint256 newStake = 0;
        if (currentStake >= availablePenalty) {
            newStake = currentStake - availablePenalty;
        }
        _setStake(_account, _courtID, 0, availablePenalty, newStake);
        pnkBalance = juror.stakedPnk; // updated by _setStake()
        newCourtStake = stakeOf(_account, _courtID); // updated by _setStake()
    }

    /// @dev Update the state of the stakes with a PNK reward deposit, called by KC during rewards execution.
    /// `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _reward The amount of PNK to be deposited as a reward.
    function setStakeReward(
        address _account,
        uint96 _courtID,
        uint256 _reward
    ) external override onlyByCore returns (bool success) {
        if (_reward == 0) return true; // No reward to add.

        uint256 currentStake = stakeOf(_account, _courtID);
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
    ) internal virtual {
        Juror storage juror = jurors[_account];
        if (_pnkDeposit > 0) {
            uint256 currentStake = stakeOf(_account, _courtID);
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
                (currentCourtID, , , , , , ) = core.courts(currentCourtID); // Get the parent court.
            }
        }
        emit StakeSet(_account, _courtID, _newStake, juror.stakedPnk);
    }

    function lockStake(address _account, uint256 _relativeAmount) external override onlyByCore {
        jurors[_account].lockedPnk += _relativeAmount;
        emit StakeLocked(_account, _relativeAmount, false);
    }

    function unlockStake(address _account, uint256 _relativeAmount) external override onlyByCore {
        Juror storage juror = jurors[_account];
        juror.lockedPnk -= _relativeAmount;
        emit StakeLocked(_account, _relativeAmount, true);

        uint256 amount = getJurorLeftoverPNK(_account);
        if (amount > 0) {
            emit LeftoverPNK(_account, amount);
        }
    }

    /// @dev Unstakes the inactive juror from all courts.
    /// `O(n * (p * log_k(j)) )` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The juror to unstake.
    function forcedUnstakeAllCourts(address _account) external override onlyByCore {
        uint96[] memory courtIDs = getJurorCourtIDs(_account);
        for (uint256 j = courtIDs.length; j > 0; j--) {
            core.setStakeBySortitionModule(_account, courtIDs[j - 1], 0);
        }
    }

    /// @dev Unstakes the inactive juror from a specific court.
    /// `O(n * (p * log_k(j)) )` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The juror to unstake.
    /// @param _courtID The ID of the court.
    function forcedUnstake(address _account, uint96 _courtID) external override onlyByCore {
        core.setStakeBySortitionModule(_account, _courtID, 0);
    }

    /// @dev Gives back the locked PNKs in case the juror fully unstaked earlier.
    /// Note that since locked and staked PNK are async it is possible for the juror to have positive staked PNK balance
    /// while having 0 stake in courts and 0 locked tokens (eg. when the juror fully unstaked during dispute and later got his tokens unlocked).
    /// In this case the juror can use this function to withdraw the leftover tokens.
    /// Also note that if the juror has some leftover PNK while not fully unstaked he'll have to manually unstake from all courts to trigger this function.
    /// @param _account The juror whose PNK to withdraw.
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

    /// @dev Draw an ID from a tree using a number.
    /// Note that this function reverts if the sum of all values in the tree is 0.
    /// @param _courtID The ID of the court.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _nonce Nonce to hash with random number.
    /// @return drawnAddress The drawn address.
    /// `O(k * log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    function draw(
        uint96 _courtID,
        uint256 _coreDisputeID,
        uint256 _nonce
    ) public view override returns (address drawnAddress, uint96 fromSubcourtID) {
        if (phase != Phase.drawing) revert NotDrawingPhase();

        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        (drawnAddress, fromSubcourtID) = sortitionSumTrees[key].draw(_coreDisputeID, _nonce, randomNumber);
    }

    /// @dev Get the stake of a juror in a court.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return value The stake of the juror in the court.
    function stakeOf(address _juror, uint96 _courtID) public view returns (uint256) {
        bytes32 stakePathID = SortitionTrees.toStakePathID(_juror, _courtID);
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        return sortitionSumTrees[key].stakeOf(stakePathID);
    }

    /// @dev Gets the balance of a juror in a court.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return totalStaked The total amount of tokens staked including locked tokens and penalty deductions. Equivalent to the effective stake in the General court.
    /// @return totalLocked The total amount of tokens locked in disputes.
    /// @return stakedInCourt The amount of tokens staked in the specified court including locked tokens and penalty deductions.
    /// @return nbCourts The number of courts the juror has directly staked in.
    function getJurorBalance(
        address _juror,
        uint96 _courtID
    )
        external
        view
        override
        returns (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts)
    {
        Juror storage juror = jurors[_juror];
        totalStaked = juror.stakedPnk;
        totalLocked = juror.lockedPnk;
        stakedInCourt = stakeOf(_juror, _courtID);
        nbCourts = juror.courtIDs.length;
    }

    /// @dev Gets the court identifiers where a specific `_juror` has staked.
    /// @param _juror The address of the juror.
    function getJurorCourtIDs(address _juror) public view override returns (uint96[] memory) {
        return jurors[_juror].courtIDs;
    }

    function isJurorStaked(address _juror) external view override returns (bool) {
        return jurors[_juror].stakedPnk > 0;
    }

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

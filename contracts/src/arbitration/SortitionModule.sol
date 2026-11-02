// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {KlerosCore} from "./KlerosCore.sol";
import {ISortitionModule} from "./interfaces/ISortitionModule.sol";
import {ICourtEligibility} from "./interfaces/ICourtEligibility.sol";
import {SortitionTrees} from "../libraries/SortitionTrees.sol";
import {IRNG} from "../rng/IRNG.sol";
import "../libraries/Constants.sol";

/// @title SortitionModule
/// @notice A factory of trees that keeps track of staked values for sortition.
contract SortitionModule is ISortitionModule, Initializable {
    using SortitionTrees for SortitionTrees.SortitionSumTrees;

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DelayedStake {
        uint256 stake; // The new stake.
        bool forced; // Whether the stake was forced (e.g. forcedUnstakeAllCourts) or not. Forced stakes will not be replaced with manual stakes.
        bool pending; // Whether the stake is pending or not, to distinguish between 0 stake and no entry.
        uint256 activationTime; // Time after which delayed stake can be executed.
        uint256 reservedStake; // Additional PNK reserved for this delayed stake above the currently active stake in the court.
    }

    struct Juror {
        uint96[] courtIDs; // The IDs of courts where the juror's stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        uint256 stakedPnk; // The juror's total amount of tokens staked in courts.
        uint256 lockedPnk; // The juror's total amount of tokens locked in disputes.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The owner of the contract.
    KlerosCore public core; // The core arbitrator contract.
    Phase public phase; // The current phase.
    uint256 public minStakingTime; // The time after which the phase can be switched to Drawing if there are open disputes.
    uint256 public maxDrawingTime; // The time after which the phase can be switched back to Staking even if there are disputes still pending drawing.
    uint256 public lastPhaseChange; // The last time the phase was changed.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    IRNG public rng; // The random number generator.
    uint256 public randomNumber; // Random number returned by RNG.
    uint256 public stakingDelay; // Delay in seconds before a delayed stake can be executed.
    mapping(address account => Juror) public jurors; // The jurors.
    mapping(address juror => mapping(uint96 courtID => DelayedStake)) public delayedStakes; // Stores stake changes waiting for their activation time.

    uint256 public sessionID; // ID of the Staking-Generating-Drawing cycle.
    mapping(uint256 sessionID => mapping(uint256 disputeID => bool delayed)) public delayedDisputes; // True if the dispute was delayed until the next session.
    mapping(uint256 sessionID => uint256 count) public delayedDisputesCount; // Counts delayed disputes in the session.
    mapping(address juror => uint256 reservedValue) public totalReservedStake; // Total additional PNK reserved by delayed stake increases.

    SortitionTrees.SortitionSumTrees internal sortitionSumTrees; // The sortition sum trees.

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

    /// @notice Emitted when a juror's stake delayed execution fails.
    /// @param _address The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _amount The amount of tokens staked in the court.
    event StakeDelayedExecutionFailed(address indexed _address, uint96 indexed _courtID, uint256 _amount);

    /// @notice Emitted when a juror's stake is locked.
    /// @param _address The address of the juror.
    /// @param _amount The amount of tokens locked.
    /// @param _unlock Whether the stake is locked or unlocked.
    event StakeLocked(address indexed _address, uint256 _amount, bool _unlock);

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
    /// @param _minStakingTime Minimal time to stake.
    /// @param _maxDrawingTime The time after which the phase can be switched back to Staking even if there are disputes still pending drawing.
    /// @param _rng The random number generator.
    /// @param _stakingDelay Time after which delayed stake can be executed.
    function initialize(
        address _owner,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        IRNG _rng,
        uint256 _stakingDelay
    ) external initializer {
        owner = _owner;
        core = _core;
        minStakingTime = _minStakingTime;
        maxDrawingTime = _maxDrawingTime;
        lastPhaseChange = block.timestamp;
        rng = _rng;
        stakingDelay = _stakingDelay;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    modifier onlyCore() {
        require(address(core) == msg.sender, KlerosCoreOnly());
        _;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Changes the owner of the contract.
    /// @param _owner The new owner.
    function changeOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    /// @notice Changes the `minStakingTime` storage variable.
    /// @param _minStakingTime The new value for the `minStakingTime` storage variable.
    function changeMinStakingTime(uint256 _minStakingTime) external onlyOwner {
        minStakingTime = _minStakingTime;
    }

    /// @notice Changes the `maxDrawingTime` storage variable.
    /// @param _maxDrawingTime The new value for the `maxDrawingTime` storage variable.
    function changeMaxDrawingTime(uint256 _maxDrawingTime) external onlyOwner {
        maxDrawingTime = _maxDrawingTime;
    }

    /// @notice Changes the `rng` storage variable.
    /// @param _rng The new random number generator.
    function changeRandomNumberGenerator(IRNG _rng) external onlyOwner {
        rng = _rng;
        if (phase == Phase.generating) {
            rng.requestRandomness();
        }
    }

    /// @notice Changes the `stakingDelay` storage variable.
    /// @param _stakingDelay The new value for the `stakingDelay` storage variable.
    function changeStakingDelay(uint256 _stakingDelay) external onlyOwner {
        stakingDelay = _stakingDelay;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Passes the phase. TRUSTED.
    function passPhase() external {
        if (phase == Phase.staking) {
            require(block.timestamp - lastPhaseChange >= minStakingTime, MinStakingTimeNotPassed());
            require(disputesWithoutJurors > 0, NoDisputesThatNeedJurors());
            rng.requestRandomness();
            phase = Phase.generating;
        } else if (phase == Phase.generating) {
            randomNumber = rng.receiveRandomness();
            require(randomNumber != 0, RandomNumberNotReady());
            phase = Phase.drawing;
        } else if (phase == Phase.drawing) {
            require(
                disputesWithoutJurors == 0 || block.timestamp - lastPhaseChange >= maxDrawingTime,
                DisputesWithoutJurorsAndMaxDrawingTimeNotPassed()
            );
            phase = Phase.staking;
            // Delayed disputes will become eligible for drawing in the next cycle.
            disputesWithoutJurors += delayedDisputesCount[sessionID];
            sessionID++;
        }

        lastPhaseChange = block.timestamp;
        emit NewPhase(phase);
    }

    /// @notice Create a sortition sum tree at the specified key.
    /// @param _courtID The ID of the court.
    function createTree(uint96 _courtID) external onlyCore {
        sortitionSumTrees.createTree(bytes32(uint256(_courtID)), DEFAULT_K);
    }

    /// @notice Executes the delayed stakes.
    /// @dev `O(n)` where `n` is the number of processed delayed stakes.
    /// @param _accounts Accounts to process.
    /// @param _courtIDs Courts to process, respective to each account.
    function executeDelayedStakes(address[] memory _accounts, uint96[] memory _courtIDs) external {
        require(phase == Phase.staking, NotStakingPhase());
        require(_accounts.length == _courtIDs.length, AccountsCourtsLengthMismatch());

        for (uint256 i = 0; i < _accounts.length; i++) {
            address account = _accounts[i];
            uint96 courtID = _courtIDs[i];
            DelayedStake storage delayedStake = delayedStakes[account][courtID];
            require(block.timestamp >= delayedStake.activationTime, ActivationTimeNotReached());
            if (delayedStake.pending) {
                // `forced` parameter is irrelevant during execution, so set it to false by default.
                if (!_setStake(account, courtID, delayedStake.stake, false, true)) {
                    emit StakeDelayedExecutionFailed(account, courtID, delayedStake.stake);
                }
                totalReservedStake[account] -= delayedStake.reservedStake;
                delete delayedStakes[account][courtID];
            }
        }
    }

    /// @notice Triggers the state changes after dispute creation.
    /// @param _disputeID The ID of the dispute.
    function registerDisputeForDrawing(uint256 _disputeID) external onlyCore {
        // If the disputes were created during Drawing/Generating phase don't let them use the existing random number.
        if (phase != Phase.staking) {
            delayedDisputesCount[sessionID]++;
            delayedDisputes[sessionID][_disputeID] = true;
        } else {
            disputesWithoutJurors++;
        }
    }

    /// @notice Triggers the state changes after drawing.
    function completeDisputeDrawing() external onlyCore {
        disputesWithoutJurors--;
    }

    /// @notice Update the state of the stakes.
    ///
    /// @dev `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// @param _forced Whether the stake is forced (e.g forcedUnstake) or not.
    /// @return Whether all requirements for staking bypassed or not.
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _forced
    ) external onlyCore returns (bool) {
        return _setStake(_account, _courtID, _newStake, _forced, false);
    }

    /// @notice Locks the tokens of the drawn juror.
    /// @param _account The address of the juror.
    /// @param _amount The amount to lock.
    function lockStake(address _account, uint256 _amount) external onlyCore {
        jurors[_account].lockedPnk += _amount;
        emit StakeLocked(_account, _amount, false);
    }

    /// @notice Unlocks the tokens of the drawn juror.
    /// @param _account The address of the juror.
    /// @param _amount The amount to unlock.
    function unlockStake(address _account, uint256 _amount) external onlyCore {
        jurors[_account].lockedPnk -= _amount;
        emit StakeLocked(_account, _amount, true);
    }

    /// @notice Unstakes the inactive juror from all courts.
    ///
    /// @dev `O(n * (p * log_k(j)) )` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The juror to unstake.
    function forcedUnstakeAllCourts(address _account) external onlyCore {
        uint96[] memory courtIDs = getJurorCourtIDs(_account);
        for (uint256 j = courtIDs.length; j > 0; j--) {
            uint96 courtID = courtIDs[j - 1];
            _setStake(_account, courtID, 0, true, false);
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Draw an ID from a tree using a number.
    ///
    /// @dev This function returns 0 address if the sum of all values in the tree is 0.
    /// `O(k * log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    ///
    /// @param _courtID The ID of the court.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _nonce Nonce to hash with random number.
    /// @return drawnAddress The drawn address.
    /// @return fromSubcourtID The court ID where the tokens were explicitly staked.
    function draw(
        uint96 _courtID,
        uint256 _coreDisputeID,
        uint256 _nonce
    ) public view returns (address drawnAddress, uint96 fromSubcourtID) {
        require(phase == Phase.drawing, NotDrawingPhase());
        require(!delayedDisputes[sessionID][_coreDisputeID], DisputeIsDelayed());

        (drawnAddress, fromSubcourtID) = sortitionSumTrees.draw(
            bytes32(uint256(_courtID)),
            uint256(keccak256(abi.encodePacked(randomNumber, _coreDisputeID, _nonce)))
        );
    }

    /// @notice Gets the juror's total staked and locked PNK.
    /// @param _juror The address of the juror.
    /// @return stakedPnk The total amount of PNK staked.
    /// @return lockedPnk The total amount of PNK locked in disputes.
    function getJurorBalance(address _juror) external view returns (uint256 stakedPnk, uint256 lockedPnk) {
        Juror storage juror = jurors[_juror];
        return (juror.stakedPnk, juror.lockedPnk);
    }

    /// @notice Gets the stake of a juror in a court.
    /// @dev Returns the direct stake of the chosen court and doesn't include children stake.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return The stake of the juror in the court.
    function stakeOf(address _juror, uint96 _courtID) public view returns (uint256) {
        bytes32 stakePathID = SortitionTrees.toStakePathID(_juror, _courtID);
        return sortitionSumTrees.stakeOf(bytes32(uint256(_courtID)), stakePathID);
    }

    /// @notice Gets the court identifiers where a specific `_juror` has staked.
    /// @param _juror The address of the juror.
    /// @return Array of courts where the juror has staked.
    function getJurorCourtIDs(address _juror) public view returns (uint96[] memory) {
        return jurors[_juror].courtIDs;
    }

    /// @notice Checks if the juror is staked in any court.
    /// @param _juror The address of the juror.
    /// @return Whether the juror is staked or not.
    function isJurorStaked(address _juror) external view returns (bool) {
        return jurors[_juror].stakedPnk > 0;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @notice Update the state of the stakes.
    ///
    /// @dev `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// @param _forced Whether the stake is forced (e.g forcedUnstake) or not.
    /// @param _executeDelayed True if the function is called by `executeDelayedStakes`.
    /// @return Whether all requirements for staking bypassed or not.
    function _setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _forced,
        bool _executeDelayed
    ) internal returns (bool) {
        Juror storage juror = jurors[_account];
        uint256 currentStake = stakeOf(_account, _courtID);

        uint256 newTotalStake = juror.stakedPnk - currentStake + _newStake;
        uint256 nbCourts = juror.courtIDs.length;
        (, uint256 minStake, , , ICourtEligibility eligibility) = core.courts(_courtID);

        if (_newStake != 0 && _newStake < minStake) return false;
        if (_newStake != 0 && core.balances(_account) < newTotalStake) return false; // Not enough balance to cover new stake.
        if (currentStake == 0 && nbCourts >= MAX_STAKE_PATHS) {
            return false; // Prevent staking beyond MAX_STAKE_PATHS but unstaking is always allowed.
        }
        if (
            _newStake != 0 && eligibility != NULL_ELIGIBILITY_REQUIREMENT && !eligibility.isEligible(_account, _courtID)
        ) {
            return false;
        }

        if (!_executeDelayed) {
            DelayedStake storage delayedStake = delayedStakes[_account][_courtID];

            // All manual stakes will be delayed and can be activated once staking delay passes. Forced stakes can be activated right away during Staking phase.
            if (!_forced || phase != Phase.staking) {
                // Do not replace forced stakes to avoid bypassing forced unstaking.
                if (!delayedStake.forced) {
                    uint256 reservedStake = _newStake > currentStake ? _newStake - currentStake : 0;
                    uint256 newTotalReservedStake = totalReservedStake[_account] -
                        delayedStake.reservedStake +
                        reservedStake;
                    // Check that the juror's balance can cover the delayed stakes. The check doesn't apply on stake decrease.
                    if (
                        newTotalReservedStake > totalReservedStake[_account] &&
                        juror.stakedPnk + newTotalReservedStake > core.balances(_account)
                    ) return false;

                    totalReservedStake[_account] = newTotalReservedStake;

                    delayedStake.stake = _newStake;
                    delayedStake.forced = _forced;
                    delayedStake.pending = true;
                    delayedStake.activationTime = block.timestamp + stakingDelay;
                    delayedStake.reservedStake = reservedStake;
                    emit StakeDelayed(_account, _courtID, _newStake);
                    return true;
                } else {
                    return false;
                }
            } else if (delayedStake.pending) {
                // Delete an existing delayed stake when forced stake is being set.
                totalReservedStake[_account] -= delayedStake.reservedStake;
                delete delayedStakes[_account][_courtID];
            }
        }

        juror.stakedPnk = newTotalStake;

        if (_newStake == 0) {
            // Cleanup
            for (uint256 i = juror.courtIDs.length; i > 0; i--) {
                if (juror.courtIDs[i - 1] == _courtID) {
                    juror.courtIDs[i - 1] = juror.courtIDs[juror.courtIDs.length - 1];
                    juror.courtIDs.pop();
                    break;
                }
            }
        } else if (currentStake == 0) juror.courtIDs.push(_courtID);

        // Update the sortition sum tree.
        bytes32 stakePathID = SortitionTrees.toStakePathID(_account, _courtID);
        bool finished = false;
        uint96 currentCourtID = _courtID;
        while (!finished) {
            // Tokens are also implicitly staked in parent courts through sortition module to increase the chance of being drawn.
            sortitionSumTrees.set(bytes32(uint256(currentCourtID)), _newStake, stakePathID);
            if (currentCourtID == GENERAL_COURT) {
                finished = true;
            } else {
                (currentCourtID, , , , ) = core.courts(currentCourtID); // Get the parent court.
            }
        }
        emit StakeSet(_account, _courtID, _newStake, juror.stakedPnk);
        return true;
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
    error AccountsCourtsLengthMismatch();
    error NotDrawingPhase();
    error DisputeIsDelayed();
    error ActivationTimeNotReached();
}

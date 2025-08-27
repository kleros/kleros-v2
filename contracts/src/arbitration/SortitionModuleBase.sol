// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {KlerosCore} from "./KlerosCore.sol";
import {ISortitionModule} from "./interfaces/ISortitionModule.sol";
import {IDisputeKit} from "./interfaces/IDisputeKit.sol";
import {Initializable} from "../proxy/Initializable.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import {IRNG} from "../rng/IRNG.sol";
import {DelayedStakes} from "../libraries/DelayedStakes.sol";
import "../libraries/Constants.sol";

/// @title SortitionModuleBase
/// @dev A factory of trees that keeps track of staked values for sortition.
abstract contract SortitionModuleBase is ISortitionModule, Initializable, UUPSProxiable {
    using DelayedStakes for DelayedStakes.Queue;

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct SortitionSumTree {
        uint256 K; // The maximum number of children per node.
        uint256[] stack; // We use this to keep track of vacant positions in the tree after removing a leaf. This is for keeping the tree as balanced as possible without spending gas on moving nodes around.
        uint256[] nodes; // The tree nodes.
        // Two-way mapping of IDs to node indexes. Note that node index 0 is reserved for the root node, and means the ID does not have a node.
        mapping(bytes32 stakePathID => uint256 nodeIndex) IDsToNodeIndexes;
        mapping(uint256 nodeIndex => bytes32 stakePathID) nodeIndexesToIDs;
    }

    struct Juror {
        uint96[] courtIDs; // The IDs of courts where the juror's stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        uint256 stakedPnk; // The juror's total amount of tokens staked in subcourts. PNK balance including locked PNK and penalty deductions.
        uint256 lockedPnk; // The juror's total amount of tokens locked in disputes.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
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
    DelayedStakes.Queue public delayedStakesQueue; // Queue for managing delayed stakes during Drawing phase.
    mapping(bytes32 treeHash => SortitionSumTree) sortitionSumTrees; // The mapping trees by keys.
    mapping(address account => Juror) public jurors; // The jurors.

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
        address _governor,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        IRNG _rng
    ) internal onlyInitializing {
        governor = _governor;
        core = _core;
        minStakingTime = _minStakingTime;
        maxDrawingTime = _maxDrawingTime;
        lastPhaseChange = block.timestamp;
        rng = _rng;
        delayedStakesQueue.initialize();
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    modifier onlyByCore() {
        if (address(core) != msg.sender) revert KlerosCoreOnly();
        _;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Changes the governor of the contract.
    /// @param _governor The new governor.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
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

    /// @dev Changes the `rng` storage variable.
    /// @param _rng The new random number generator.
    function changeRandomNumberGenerator(IRNG _rng) external onlyByGovernor {
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
    /// @param _key The key of the new tree.
    /// @param _extraData Extra data that contains the number of children each node in the tree should have.
    function createTree(bytes32 _key, bytes memory _extraData) external override onlyByCore {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint256 K = _extraDataToTreeK(_extraData);
        if (tree.K != 0) revert TreeAlreadyExists();
        if (K <= 1) revert KMustBeGreaterThanOne();
        tree.K = K;
        tree.nodes.push(0);
    }

    /// @dev Executes the next delayed stakes.
    /// @param _iterations The number of delayed stakes to execute.
    function executeDelayedStakes(uint256 _iterations) external {
        if (phase != Phase.staking) revert NotStakingPhase();
        if (!delayedStakesQueue.execute(core, _iterations)) {
            revert NoDelayedStakeToExecute();
        }
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
    /// @return pnkDeposit The amount of PNK to be deposited.
    /// @return pnkWithdrawal The amount of PNK to be withdrawn.
    /// @return stakingResult The result of the staking operation.
    function validateStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) external override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        (pnkDeposit, pnkWithdrawal, stakingResult) = _validateStake(_account, _courtID, _newStake);
    }

    function _validateStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
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

        if (phase != Phase.staking) {
            // Store the stake change as delayed, to be applied when the phase switches back to Staking.
            delayedStakesQueue.add(_account, _courtID, _newStake);
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
        bytes32 stakePathID = _accountAndCourtIDToStakePathID(_account, _courtID);
        bool finished = false;
        uint96 currentCourtID = _courtID;
        while (!finished) {
            // Tokens are also implicitly staked in parent courts through sortition module to increase the chance of being drawn.
            _set(bytes32(uint256(currentCourtID)), _newStake, stakePathID);
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
    function setJurorInactive(address _account) external override onlyByCore {
        uint96[] memory courtIDs = getJurorCourtIDs(_account);
        for (uint256 j = courtIDs.length; j > 0; j--) {
            core.setStakeBySortitionModule(_account, courtIDs[j - 1], 0);
        }
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
    /// @param _key The key of the tree.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _nonce Nonce to hash with random number.
    /// @return drawnAddress The drawn address.
    /// `O(k * log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    function draw(
        bytes32 _key,
        uint256 _coreDisputeID,
        uint256 _nonce
    ) public view override returns (address drawnAddress, uint96 fromSubcourtID) {
        if (phase != Phase.drawing) revert NotDrawingPhase();
        SortitionSumTree storage tree = sortitionSumTrees[_key];

        if (tree.nodes[0] == 0) {
            return (address(0), 0); // No jurors staked.
        }

        uint256 currentDrawnNumber = uint256(keccak256(abi.encodePacked(randomNumber, _coreDisputeID, _nonce))) %
            tree.nodes[0];

        // While it still has children
        uint256 treeIndex = 0;
        while ((tree.K * treeIndex) + 1 < tree.nodes.length) {
            for (uint256 i = 1; i <= tree.K; i++) {
                // Loop over children.
                uint256 nodeIndex = (tree.K * treeIndex) + i;
                uint256 nodeValue = tree.nodes[nodeIndex];

                if (currentDrawnNumber >= nodeValue) {
                    // Go to the next child.
                    currentDrawnNumber -= nodeValue;
                } else {
                    // Pick this child.
                    treeIndex = nodeIndex;
                    break;
                }
            }
        }

        bytes32 stakePathID = tree.nodeIndexesToIDs[treeIndex];
        (drawnAddress, fromSubcourtID) = _stakePathIDToAccountAndCourtID(stakePathID);
    }

    /// @dev Get the stake of a juror in a court.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return value The stake of the juror in the court.
    function stakeOf(address _juror, uint96 _courtID) public view returns (uint256) {
        bytes32 stakePathID = _accountAndCourtIDToStakePathID(_juror, _courtID);
        return stakeOf(bytes32(uint256(_courtID)), stakePathID);
    }

    /// @dev Get the stake of a juror in a court.
    /// @param _key The key of the tree, corresponding to a court.
    /// @param _stakePathID The stake path ID, corresponding to a juror.
    /// @return The stake of the juror in the court.
    function stakeOf(bytes32 _key, bytes32 _stakePathID) public view returns (uint256) {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint treeIndex = tree.IDsToNodeIndexes[_stakePathID];
        if (treeIndex == 0) {
            return 0;
        }
        return tree.nodes[treeIndex];
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

    /// @dev Get a specific delayed stake by index
    function delayedStakes(uint256 index) external view returns (DelayedStakes.Stake memory) {
        return delayedStakesQueue.stakes[index];
    }

    /// @dev Get the number of pending delayed stakes
    function pendingDelayedStakesCount() external view returns (uint256) {
        return delayedStakesQueue.pendingStakesCount();
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Update all the parents of a node.
    /// @param _key The key of the tree to update.
    /// @param _treeIndex The index of the node to start from.
    /// @param _plusOrMinus Whether to add (true) or substract (false).
    /// @param _value The value to add or substract.
    /// `O(log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    function _updateParents(bytes32 _key, uint256 _treeIndex, bool _plusOrMinus, uint256 _value) private {
        SortitionSumTree storage tree = sortitionSumTrees[_key];

        uint256 parentIndex = _treeIndex;
        while (parentIndex != 0) {
            parentIndex = (parentIndex - 1) / tree.K;
            tree.nodes[parentIndex] = _plusOrMinus
                ? tree.nodes[parentIndex] + _value
                : tree.nodes[parentIndex] - _value;
        }
    }

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

    /// @dev Set a value in a tree.
    /// @param _key The key of the tree.
    /// @param _value The new value.
    /// @param _stakePathID The ID of the value.
    /// `O(log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    function _set(bytes32 _key, uint256 _value, bytes32 _stakePathID) internal {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint256 treeIndex = tree.IDsToNodeIndexes[_stakePathID];

        if (treeIndex == 0) {
            // No existing node.
            if (_value != 0) {
                // Non zero value.
                // Append.
                // Add node.
                if (tree.stack.length == 0) {
                    // No vacant spots.
                    // Get the index and append the value.
                    treeIndex = tree.nodes.length;
                    tree.nodes.push(_value);

                    // Potentially append a new node and make the parent a sum node.
                    if (treeIndex != 1 && (treeIndex - 1) % tree.K == 0) {
                        // Is first child.
                        uint256 parentIndex = treeIndex / tree.K;
                        bytes32 parentID = tree.nodeIndexesToIDs[parentIndex];
                        uint256 newIndex = treeIndex + 1;
                        tree.nodes.push(tree.nodes[parentIndex]);
                        delete tree.nodeIndexesToIDs[parentIndex];
                        tree.IDsToNodeIndexes[parentID] = newIndex;
                        tree.nodeIndexesToIDs[newIndex] = parentID;
                    }
                } else {
                    // Some vacant spot.
                    // Pop the stack and append the value.
                    treeIndex = tree.stack[tree.stack.length - 1];
                    tree.stack.pop();
                    tree.nodes[treeIndex] = _value;
                }

                // Add label.
                tree.IDsToNodeIndexes[_stakePathID] = treeIndex;
                tree.nodeIndexesToIDs[treeIndex] = _stakePathID;

                _updateParents(_key, treeIndex, true, _value);
            }
        } else {
            // Existing node.
            if (_value == 0) {
                // Zero value.
                // Remove.
                // Remember value and set to 0.
                uint256 value = tree.nodes[treeIndex];
                tree.nodes[treeIndex] = 0;

                // Push to stack.
                tree.stack.push(treeIndex);

                // Clear label.
                delete tree.IDsToNodeIndexes[_stakePathID];
                delete tree.nodeIndexesToIDs[treeIndex];

                _updateParents(_key, treeIndex, false, value);
            } else if (_value != tree.nodes[treeIndex]) {
                // New, non zero value.
                // Set.
                bool plusOrMinus = tree.nodes[treeIndex] <= _value;
                uint256 plusOrMinusValue = plusOrMinus
                    ? _value - tree.nodes[treeIndex]
                    : tree.nodes[treeIndex] - _value;
                tree.nodes[treeIndex] = _value;

                _updateParents(_key, treeIndex, plusOrMinus, plusOrMinusValue);
            }
        }
    }

    /// @dev Packs an account and a court ID into a stake path ID: [20 bytes of address][12 bytes of courtID] = 32 bytes total.
    /// @param _account The address of the juror to pack.
    /// @param _courtID The court ID to pack.
    /// @return stakePathID The stake path ID.
    function _accountAndCourtIDToStakePathID(
        address _account,
        uint96 _courtID
    ) internal pure returns (bytes32 stakePathID) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)

            // Write account address (first 20 bytes)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(ptr, i), byte(add(0x0c, i), _account))
            }

            // Write court ID (last 12 bytes)
            for {
                let i := 0x14
            } lt(i, 0x20) {
                i := add(i, 0x01)
            } {
                mstore8(add(ptr, i), byte(i, _courtID))
            }
            stakePathID := mload(ptr)
        }
    }

    /// @dev Retrieves both juror's address and court ID from the stake path ID.
    /// @param _stakePathID The stake path ID to unpack.
    /// @return account The account.
    /// @return courtID The court ID.
    function _stakePathIDToAccountAndCourtID(
        bytes32 _stakePathID
    ) internal pure returns (address account, uint96 courtID) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)

            // Read account address (first 20 bytes)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(add(ptr, 0x0c), i), byte(i, _stakePathID))
            }
            account := mload(ptr)

            // Read court ID (last 12 bytes)
            for {
                let i := 0x00
            } lt(i, 0x0c) {
                i := add(i, 0x01)
            } {
                mstore8(add(add(ptr, 0x14), i), byte(add(i, 0x14), _stakePathID))
            }
            courtID := mload(ptr)
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
    error KlerosCoreOnly();
    error MinStakingTimeNotPassed();
    error NoDisputesThatNeedJurors();
    error RandomNumberNotReady();
    error DisputesWithoutJurorsAndMaxDrawingTimeNotPassed();
    error TreeAlreadyExists();
    error KMustBeGreaterThanOne();
    error NotStakingPhase();
    error NoDelayedStakeToExecute();
    error NotEligibleForWithdrawal();
    error NotDrawingPhase();
}

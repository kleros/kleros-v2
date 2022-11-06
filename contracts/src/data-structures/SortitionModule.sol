// SPDX-License-Identifier: MIT

/**
 *  @authors: [@epiqueras, @unknownunknown1]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8;

import "../arbitration/KlerosCore.sol";
import "./ISortitionModule.sol";
import "../arbitration/IDisputeKit.sol";

/**
 *  @title SortitionModule
 *  @dev A factory of trees that keeps track of staked values for sortition.
 */
contract SortitionModule is ISortitionModule {
    /* Structs */

    struct SortitionSumTree {
        uint256 K; // The maximum number of children per node.
        // We use this to keep track of vacant positions in the tree after removing a leaf. This is for keeping the tree as balanced as possible without spending gas on moving nodes around.
        uint256[] stack;
        uint256[] nodes;
        // Two-way mapping of IDs to node indexes. Note that node index 0 is reserved for the root node, and means the ID does not have a node.
        mapping(bytes32 => uint256) IDsToNodeIndexes;
        mapping(uint256 => bytes32) nodeIndexesToIDs;
    }

    struct DelayedStake {
        address account; // The address of the juror.
        uint96 subcourtID; // The ID of the subcourt.
        uint256 stake; // The new stake.
        uint256 penalty; // Penalty value, in case the stake was set during execution.
    }

    uint256 public constant MAX_STAKE_PATHS = 4; // The maximum number of stake paths a juror can have.
    uint256 public constant DEFAULT_K = 6; // Default number of children per node.

    KlerosCore public core;
    Phase public phase; // The current phase.

    uint256 public minStakingTime; // The time after which the phase can be switched to Freezing if there are open disputes.
    uint256 public maxFreezingTime; // The time after which the phase can be switched back to Staking.
    uint256 public lastPhaseChange; // The last time the phase was changed.
    uint256 public freezeBlock; // Number of the block when Core was frozen.

    IDisputeKit[] public disputesKitsThatNeedFreezing; // The disputeKits that need switching to Freezing phase.

    uint256 public delayedStakeWriteIndex; // The index of the last `delayedStake` item that was written to the array. 0 index is skipped.
    uint256 public delayedStakeReadIndex = 1; // The index of the next `delayedStake` item that should be processed. Starts at 1 because 0 index is skipped.

    mapping(bytes32 => SortitionSumTree) sortitionSumTrees;
    mapping(uint256 => DelayedStake) public delayedStakes; // Stores the stakes that were changed during Freezing phase, to update them when the phase is switched to Staking.
    mapping(IDisputeKit => bool) public needsFreezing;

    mapping(address => uint256) public randomNumbers; // Random number for sortition per each dispute kit.

    event NewPhase(Phase _phase);

    modifier onlyByCore() {
        require(address(core) == msg.sender, "Access not allowed: KlerosCore only.");
        _;
    }

    /** @dev Constructor.
     *  @param _core The KlerosCore.
     *  @param _minStakingTime Minimal time to stake
     *  @param _maxFreezingTime Time after which the freezing phase can be switched
     */
    constructor(
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxFreezingTime
    ) {
        core = _core;
        minStakingTime = _minStakingTime;
        maxFreezingTime = _maxFreezingTime;
        lastPhaseChange = block.timestamp;
    }

    /* Public */

    /** @dev Changes the `minStakingTime` storage variable.
     *  @param _minStakingTime The new value for the `minStakingTime` storage variable.
     */
    function changeMinStakingTime(uint256 _minStakingTime) external onlyByCore {
        minStakingTime = _minStakingTime;
    }

    /** @dev Changes the `maxFreezingTime` storage variable.
     *  @param _maxFreezingTime The new value for the `maxFreezingTime` storage variable.
     */
    function changeMaxFreezingTime(uint256 _maxFreezingTime) external onlyByCore {
        maxFreezingTime = _maxFreezingTime;
    }

    /** @dev Executes the next delayed stakes.
     *  @param _iterations The number of delayed stakes to execute.
     */
    function executeDelayedStakes(uint256 _iterations) external {
        require(phase == Phase.staking, "Should be in Staking phase.");

        uint256 actualIterations = (delayedStakeReadIndex + _iterations) - 1 > delayedStakeWriteIndex
            ? (delayedStakeWriteIndex - delayedStakeReadIndex) + 1
            : _iterations;
        uint256 newDelayedStakeReadIndex = delayedStakeReadIndex + actualIterations;

        for (uint256 i = delayedStakeReadIndex; i < newDelayedStakeReadIndex; i++) {
            DelayedStake storage delayedStake = delayedStakes[i];
            core.setStakeBySortitionModule(
                delayedStake.account,
                delayedStake.subcourtID,
                delayedStake.stake,
                delayedStake.penalty
            );
            delete delayedStakes[i];
        }
        delayedStakeReadIndex = newDelayedStakeReadIndex;
    }

    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external override onlyByCore {
        (, , , , , uint256 disputeKitID) = core.getRoundInfo(_disputeID, _roundID);
        IDisputeKit disputeKit = core.getDisputeKit(disputeKitID);
        // Ensures uniqueness in the disputesKitsThatNeedFreezing array.
        if (!needsFreezing[disputeKit]) {
            needsFreezing[disputeKit] = true;
            disputesKitsThatNeedFreezing.push(disputeKit);
        }
    }

    /** @dev Switches the phases between Staking and Freezing, also signal the switch to the dispute kits.
     */
    function passPhase() external {
        if (phase == Phase.staking) {
            require(block.timestamp - lastPhaseChange >= minStakingTime, "The minimal staking time has not passed yet");
            require(disputesKitsThatNeedFreezing.length > 0, "There are no dispute kit which need freezing");
            phase = Phase.freezing;
            freezeBlock = block.number;
        } else {
            // phase == Phase.freezing
            bool timeout = this.freezingPhaseTimeout();
            for (int256 i = int256(disputesKitsThatNeedFreezing.length) - 1; i >= 0; --i) {
                IDisputeKit disputeKit = disputesKitsThatNeedFreezing[uint256(i)];
                if (timeout && !disputeKit.isResolving()) {
                    // Force the dispute kit to be ready for Staking phase.
                    disputeKit.passPhase(); // Should not be called if already in Resolving phase, because it reverts.
                    require(disputeKit.isResolving(), "A dispute kit has not passed to Resolving phase");
                } else {
                    // Check if the dispute kit is ready for Staking phase.
                    require(disputeKit.isResolving(), "A dispute kit has not passed to Resolving phase");
                    if (disputeKit.disputesWithoutJurors() == 0) {
                        // The dispute kit had time to finish drawing jurors for all its disputes.
                        needsFreezing[disputeKit] = false;
                        if (i < int256(disputesKitsThatNeedFreezing.length) - 1) {
                            // This is not the last element so copy the last element to the current one, then pop.
                            disputesKitsThatNeedFreezing[uint256(i)] = disputesKitsThatNeedFreezing[
                                disputesKitsThatNeedFreezing.length - 1
                            ];
                        }
                        disputesKitsThatNeedFreezing.pop();
                    }
                }
            }
            phase = Phase.staking;
        }
        // Should not be reached if the phase is unchanged.
        lastPhaseChange = block.timestamp;
        emit NewPhase(phase);
    }

    function preStakeHook(
        address _account,
        uint96 _subcourtID,
        uint256 _stake,
        uint256 _penalty
    ) external override onlyByCore returns (Result result) {
        (uint256 currentStake, , uint256 nbSubcourts) = core.getJurorBalance(_account, _subcourtID);
        if (currentStake == 0 && nbSubcourts >= MAX_STAKE_PATHS) {
            result = Result.False;
        } else {
            if (phase != Phase.staking) {
                delayedStakes[++delayedStakeWriteIndex] = DelayedStake({
                    account: _account,
                    subcourtID: _subcourtID,
                    stake: _stake,
                    penalty: _penalty
                });
                result = Result.True;
            }
        }
        return result;
    }

    /**
     *  @dev Create a sortition sum tree at the specified key.
     *  @param _key The key of the new tree.
     *  @param _extraData Extra data that contains the number of children each node in the tree should have.
     */
    function initialize(bytes32 _key, bytes memory _extraData) external override onlyByCore {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint256 K = extraDataToTreeK(_extraData);
        require(tree.K == 0, "Tree already exists.");
        require(K > 1, "K must be greater than one.");
        tree.K = K;
        tree.nodes.push(0);
    }

    /**
     *  @dev Saves the random number to use it in sortition.
     *  @param _randomNumber Random number returned by RNG contract.
     */
    function notifyRandomNumber(uint256 _randomNumber) public override {
        randomNumbers[msg.sender] = _randomNumber;
    }

    /**
     *  @dev Set a value of a tree.
     *  @param _key The key of the tree.
     *  @param _value The new value.
     *  @param _ID The ID of the value.
     *  `O(log_k(n))` where
     *  `k` is the maximum number of children per node in the tree,
     *   and `n` is the maximum number of nodes ever appended.
     */
    function set(
        bytes32 _key,
        uint256 _value,
        bytes32 _ID
    ) external override onlyByCore {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint256 treeIndex = tree.IDsToNodeIndexes[_ID];

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
                tree.IDsToNodeIndexes[_ID] = treeIndex;
                tree.nodeIndexesToIDs[treeIndex] = _ID;

                updateParents(_key, treeIndex, true, _value);
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
                delete tree.IDsToNodeIndexes[_ID];
                delete tree.nodeIndexesToIDs[treeIndex];

                updateParents(_key, treeIndex, false, value);
            } else if (_value != tree.nodes[treeIndex]) {
                // New, non zero value.
                // Set.
                bool plusOrMinus = tree.nodes[treeIndex] <= _value;
                uint256 plusOrMinusValue = plusOrMinus
                    ? _value - tree.nodes[treeIndex]
                    : tree.nodes[treeIndex] - _value;
                tree.nodes[treeIndex] = _value;

                updateParents(_key, treeIndex, plusOrMinus, plusOrMinusValue);
            }
        }
    }

    /* Public Views */

    /**
     *  @dev Query the leaves of a tree. Note that if `startIndex == 0`, the tree is empty and the root node will be returned.
     *  @param _key The key of the tree to get the leaves from.
     *  @param _cursor The pagination cursor.
     *  @param _count The number of items to return.
     *  @return startIndex The index at which leaves start.
     *  @return values The values of the returned leaves.
     *  @return hasMore Whether there are more for pagination.
     *  `O(n)` where
     *  `n` is the maximum number of nodes ever appended.
     */
    function queryLeafs(
        bytes32 _key,
        uint256 _cursor,
        uint256 _count
    )
        external
        view
        returns (
            uint256 startIndex,
            uint256[] memory values,
            bool hasMore
        )
    {
        SortitionSumTree storage tree = sortitionSumTrees[_key];

        // Find the start index.
        for (uint256 i = 0; i < tree.nodes.length; i++) {
            if ((tree.K * i) + 1 >= tree.nodes.length) {
                startIndex = i;
                break;
            }
        }

        // Get the values.
        uint256 loopStartIndex = startIndex + _cursor;
        values = new uint256[](
            loopStartIndex + _count > tree.nodes.length ? tree.nodes.length - loopStartIndex : _count
        );
        uint256 valuesIndex = 0;
        for (uint256 j = loopStartIndex; j < tree.nodes.length; j++) {
            if (valuesIndex < _count) {
                values[valuesIndex] = tree.nodes[j];
                valuesIndex++;
            } else {
                hasMore = true;
                break;
            }
        }
    }

    /**
     *  @dev Draw an ID from a tree using a number. Note that this function reverts if the sum of all values in the tree is 0.
     *  @param _key The key of the tree.
     *  @param _coreDisputeID Index of the dispute in Kleros Core.
     *  @param _voteID ID of the voter.
     *  @return drawnAddress The drawn address.
     *  `O(k * log_k(n))` where
     *  `k` is the maximum number of children per node in the tree,
     *   and `n` is the maximum number of nodes ever appended.
     */
    function draw(
        bytes32 _key,
        uint256 _coreDisputeID,
        uint256 _voteID
    ) public view override returns (address drawnAddress) {
        require(phase == Phase.freezing, "Wrong phase.");
        SortitionSumTree storage tree = sortitionSumTrees[_key];

        uint256 treeIndex = 0;
        uint256 currentDrawnNumber = uint256(
            keccak256(abi.encodePacked(randomNumbers[msg.sender], _coreDisputeID, _voteID))
        ) % tree.nodes[0];

        // While it still has children
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
        drawnAddress = stakePathIDToAccount(tree.nodeIndexesToIDs[treeIndex]);
    }

    /** @dev Returns true if dispute kit can switch phase to Resolving.
     *  @return True if DK can be resolved.
     */
    function isPhaseStaking() external view returns (bool) {
        return phase == Phase.staking || freezingPhaseTimeout();
    }

    function getDisputesKitsThatNeedFreezing() external view returns (IDisputeKit[] memory) {
        return disputesKitsThatNeedFreezing;
    }

    function getFreezeBlock() external view returns (uint256) {
        return freezeBlock;
    }

    function freezingPhaseTimeout() public view returns (bool) {
        return phase == Phase.freezing && block.timestamp - lastPhaseChange >= maxFreezingTime;
    }

    /* Private */

    /**
     *  @dev Update all the parents of a node.
     *  @param _key The key of the tree to update.
     *  @param _treeIndex The index of the node to start from.
     *  @param _plusOrMinus Whether to add (true) or substract (false).
     *  @param _value The value to add or substract.
     *  `O(log_k(n))` where
     *  `k` is the maximum number of children per node in the tree,
     *   and `n` is the maximum number of nodes ever appended.
     */
    function updateParents(
        bytes32 _key,
        uint256 _treeIndex,
        bool _plusOrMinus,
        uint256 _value
    ) private {
        SortitionSumTree storage tree = sortitionSumTrees[_key];

        uint256 parentIndex = _treeIndex;
        while (parentIndex != 0) {
            parentIndex = (parentIndex - 1) / tree.K;
            tree.nodes[parentIndex] = _plusOrMinus
                ? tree.nodes[parentIndex] + _value
                : tree.nodes[parentIndex] - _value;
        }
    }

    /** @dev Retrieves a juror's address from the stake path ID.
     *  @param _stakePathID The stake path ID to unpack.
     *  @return account The account.
     */
    function stakePathIDToAccount(bytes32 _stakePathID) internal pure returns (address account) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(add(ptr, 0x0c), i), byte(i, _stakePathID))
            }
            account := mload(ptr)
        }
    }

    function extraDataToTreeK(bytes memory _extraData) internal pure returns (uint256 K) {
        if (_extraData.length >= 32) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                K := mload(add(_extraData, 0x20))
            }
        } else {
            K = DEFAULT_K;
        }
    }
}

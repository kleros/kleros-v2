// SPDX-License-Identifier: MIT

/**
 *  @custom:authors: [@epiqueras, @unknownunknown1, @jaybuidl, @shotaronowhere]
 *  @custom:reviewers: []
 *  @custom:auditors: []
 *  @custom:bounties: []
 *  @custom:deployments: []
 */

pragma solidity 0.8.24;

import {ISortitionModuleV2} from "../interfaces/ISortitionModuleV2.sol";
import {IStakeController} from "../interfaces/IStakeController.sol";
import {KlerosCoreV2Base} from "../core-v2/KlerosCoreV2Base.sol";
import {Initializable} from "../../proxy/Initializable.sol";
import {UUPSProxiable} from "../../proxy/UUPSProxiable.sol";
import "../../libraries/Constants.sol";

/// @title SortitionModuleV2Base
/// @notice Abstract base contract for pure sortition operations
/// @dev Contains only tree management and drawing logic, no phase management or token operations
abstract contract SortitionModuleV2Base is ISortitionModuleV2, Initializable, UUPSProxiable {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct SortitionSumTree {
        uint256 K; // The maximum number of children per node.
        // We use this to keep track of vacant positions in the tree after removing a leaf. This is for keeping the tree as balanced as possible without spending gas on moving nodes around.
        uint256[] stack;
        uint256[] nodes;
        // Two-way mapping of IDs to node indexes. Note that node index 0 is reserved for the root node, and means the ID does not have a node.
        mapping(bytes32 => uint256) IDsToNodeIndexes;
        mapping(uint256 => bytes32) nodeIndexesToIDs;
    }

    struct JurorStakeInfo {
        uint96[] courtIDs; // The IDs of courts where the juror has stakes
        mapping(uint96 => uint256) stakes; // Court ID -> stake amount
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
    IStakeController public stakeController; // The stake controller for coordination.

    mapping(bytes32 treeHash => SortitionSumTree) internal sortitionSumTrees; // The mapping trees by keys.
    mapping(address account => JurorStakeInfo) internal jurorStakeInfo; // Juror stake information for sortition

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    modifier onlyByStakeController() {
        if (address(stakeController) != msg.sender) revert StakeControllerOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    function __SortitionModuleV2Base_initialize(
        address _governor,
        IStakeController _stakeController
    ) internal onlyInitializing {
        governor = _governor;
        stakeController = _stakeController;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Changes the governor of the contract.
    /// @param _governor The new governor.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the `stakeController` storage variable.
    /// @param _stakeController The new stake controller address.
    function changeStakeController(IStakeController _stakeController) external onlyByGovernor {
        stakeController = _stakeController;
    }

    // ************************************* //
    // *          Tree Management          * //
    // ************************************* //

    /// @inheritdoc ISortitionModuleV2
    function createTree(bytes32 _key, bytes memory _extraData) external override onlyByStakeController {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint256 K = _extraDataToTreeK(_extraData);
        if (tree.K != 0) revert TreeAlreadyExists();
        if (K <= 1) revert InvalidTreeK();
        tree.K = K;
        tree.nodes.push(0);
    }

    /// @inheritdoc ISortitionModuleV2
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) external virtual override onlyByStakeController returns (bool success) {
        return _setStake(_account, _courtID, _newStake);
    }

    // ************************************* //
    // *            Drawing                * //
    // ************************************* //

    /// @inheritdoc ISortitionModuleV2
    function draw(
        bytes32 _court,
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 _randomNumber
    ) external view virtual override returns (address drawnAddress) {
        SortitionSumTree storage tree = sortitionSumTrees[_court];

        if (tree.nodes.length == 0 || tree.nodes[0] == 0) {
            return address(0); // No jurors staked.
        }

        uint256 currentDrawnNumber = uint256(keccak256(abi.encodePacked(_randomNumber, _coreDisputeID, _nonce))) %
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
        drawnAddress = _stakePathIDToAccount(tree.nodeIndexesToIDs[treeIndex]);
    }

    // ************************************* //
    // *           View Functions          * //
    // ************************************* //

    /// @inheritdoc ISortitionModuleV2
    function stakeOf(address _juror, uint96 _courtID) external view override returns (uint256 value) {
        bytes32 stakePathID = _accountAndCourtIDToStakePathID(_juror, _courtID);
        return stakeOf(bytes32(uint256(_courtID)), stakePathID);
    }

    /// @inheritdoc ISortitionModuleV2
    function stakeOf(bytes32 _key, bytes32 _ID) public view override returns (uint256) {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        uint treeIndex = tree.IDsToNodeIndexes[_ID];
        if (treeIndex == 0) {
            return 0;
        }
        return tree.nodes[treeIndex];
    }

    /// @inheritdoc ISortitionModuleV2
    function getJurorInfo(
        address _juror,
        uint96 _courtID
    )
        external
        view
        override
        returns (uint256 totalStaked, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts)
    {
        JurorStakeInfo storage info = jurorStakeInfo[_juror];

        // Get total staked and locked from stake controller
        totalStaked = stakeController.getDepositedBalance(_juror);
        totalLocked = 0; // Will be retrieved from vault through stake controller if needed

        // Get stake in specific court from sortition tree
        stakedInCourt = this.stakeOf(_juror, _courtID);

        // Number of courts from local tracking
        nbCourts = info.courtIDs.length;
    }

    /// @inheritdoc ISortitionModuleV2
    function getJurorCourtIDs(address _juror) external view override returns (uint96[] memory) {
        return jurorStakeInfo[_juror].courtIDs;
    }

    /// @inheritdoc ISortitionModuleV2
    function hasStakes(address _juror) external view override returns (bool) {
        return jurorStakeInfo[_juror].courtIDs.length > 0;
    }

    /// @inheritdoc ISortitionModuleV2
    function getTotalStakeInCourt(uint96 _courtID) external view override returns (uint256) {
        SortitionSumTree storage tree = sortitionSumTrees[bytes32(uint256(_courtID))];
        if (tree.nodes.length == 0) return 0;
        return tree.nodes[0]; // Root node contains total stake
    }

    /// @inheritdoc ISortitionModuleV2
    function accountAndCourtIDToStakePathID(
        address _account,
        uint96 _courtID
    ) external pure override returns (bytes32 stakePathID) {
        return _accountAndCourtIDToStakePathID(_account, _courtID);
    }

    /// @inheritdoc ISortitionModuleV2
    function stakePathIDToAccount(bytes32 _stakePathID) external pure override returns (address account) {
        return _stakePathIDToAccount(_stakePathID);
    }

    // ************************************* //
    // *              Internal             * //
    // ************************************* //

    /// @dev Internal implementation of setStake with court hierarchy updates
    function _setStake(address _account, uint96 _courtID, uint256 _newStake) internal returns (bool success) {
        uint256 currentStake = this.stakeOf(_account, _courtID);

        if (currentStake == 0 && _newStake == 0) {
            return false; // No change needed
        }

        JurorStakeInfo storage info = jurorStakeInfo[_account];
        uint256 nbCourts = info.courtIDs.length;

        if (currentStake == 0 && nbCourts >= MAX_STAKE_PATHS) {
            return false; // Prevent staking beyond MAX_STAKE_PATHS
        }

        // Update the sortition sum tree in court hierarchy
        bytes32 stakePathID = _accountAndCourtIDToStakePathID(_account, _courtID);
        bool finished = false;
        uint96 currentCourtID = _courtID;
        KlerosCoreV2Base core = stakeController.core();
        while (!finished) {
            // Tokens are also implicitly staked in parent courts through sortition module to increase the chance of being drawn.
            _set(bytes32(uint256(currentCourtID)), _newStake, stakePathID);
            if (currentCourtID == GENERAL_COURT) {
                finished = true;
            } else {
                (currentCourtID, , , , , , ) = core.courts(currentCourtID); // Get the parent court.
            }
        }

        // Update local stake tracking (inlined from _updateJurorStakeInfo)
        uint256 currentStakeInInfo = info.stakes[_courtID];

        if (currentStakeInInfo == 0 && _newStake > 0) {
            // Adding new court
            info.courtIDs.push(_courtID);
        } else if (currentStakeInInfo > 0 && _newStake == 0) {
            // Removing court
            for (uint256 i = 0; i < info.courtIDs.length; i++) {
                if (info.courtIDs[i] == _courtID) {
                    info.courtIDs[i] = info.courtIDs[info.courtIDs.length - 1];
                    info.courtIDs.pop();
                    break;
                }
            }
        }

        info.stakes[_courtID] = _newStake;

        // Get total staked amount from stake controller for event
        uint256 totalStaked = stakeController.getDepositedBalance(_account);
        emit StakeSet(_account, _courtID, _newStake, totalStaked);

        return true;
    }

    /// @dev Set a value in a tree.
    function _set(bytes32 _key, uint256 _value, bytes32 _ID) internal {
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
                delete tree.IDsToNodeIndexes[_ID];
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

    /// @dev Update all the parents of a node.
    function _updateParents(bytes32 _key, uint256 _treeIndex, bool _plusOrMinus, uint256 _value) internal {
        SortitionSumTree storage tree = sortitionSumTrees[_key];

        uint256 parentIndex = _treeIndex;
        while (parentIndex != 0) {
            parentIndex = (parentIndex - 1) / tree.K;
            tree.nodes[parentIndex] = _plusOrMinus
                ? tree.nodes[parentIndex] + _value
                : tree.nodes[parentIndex] - _value;
        }
    }

    /// @dev Retrieves a juror's address from the stake path ID.
    function _stakePathIDToAccount(bytes32 _stakePathID) internal pure returns (address account) {
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

    /// @dev Extract tree K parameter from extra data
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

    /// @dev Packs an account and a court ID into a stake path ID.
    function _accountAndCourtIDToStakePathID(
        address _account,
        uint96 _courtID
    ) internal pure returns (bytes32 stakePathID) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(ptr, i), byte(add(0x0c, i), _account))
            }
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

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
    error StakeControllerOnly();
    error TreeAlreadyExists();
    error InvalidTreeK();
}

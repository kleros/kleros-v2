// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

type TreeKey is bytes32;
type CourtID is uint96;

using {SortitionTrees.toTreeKey} for CourtID global;

library SortitionTrees {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Tree {
        uint256 K; // The maximum number of children per node.
        uint256[] stack; // We use this to keep track of vacant positions in the tree after removing a leaf. This is for keeping the tree as balanced as possible without spending gas on moving nodes around.
        uint256[] nodes; // The tree nodes.
        // Two-way mapping of IDs to node indexes. Note that node index 0 is reserved for the root node, and means the ID does not have a node.
        mapping(bytes32 stakePathID => uint256 nodeIndex) IDsToNodeIndexes;
        mapping(uint256 nodeIndex => bytes32 stakePathID) nodeIndexesToIDs;
    }

    function toTreeKey(CourtID _courtID) internal pure returns (TreeKey) {
        return TreeKey.wrap(bytes32(uint256(CourtID.unwrap(_courtID))));
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Create a sortition sum tree at the specified key.
    /// @param _trees The mapping of sortition sum trees.
    /// @param _key The key of the new tree.
    /// @param _k The maximum number of children per node.
    function createTree(mapping(TreeKey key => Tree) storage _trees, TreeKey _key, uint256 _k) internal {
        Tree storage tree = _trees[_key];
        if (tree.K != 0) revert TreeAlreadyExists();
        if (_k <= 1) revert KMustBeGreaterThanOne();
        tree.K = _k;
        tree.nodes.push(0);
    }

    /// @notice Draw an ID from a tree using a number.
    ///
    /// @dev This function reverts if the sum of all values in the tree is 0.
    /// `O(k * log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    ///
    /// @param _tree The sortition sum tree.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _nonce Nonce to hash with random number.
    /// @return drawnAddress The drawn address.
    function draw(
        Tree storage _tree,
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 _randomNumber
    ) internal view returns (address drawnAddress, uint96 fromSubcourtID) {
        if (_tree.nodes[0] == 0) {
            return (address(0), 0); // No jurors staked.
        }

        uint256 currentDrawnNumber = uint256(keccak256(abi.encodePacked(_randomNumber, _coreDisputeID, _nonce))) %
            _tree.nodes[0];

        // While it still has children
        uint256 treeIndex = 0;
        while ((_tree.K * treeIndex) + 1 < _tree.nodes.length) {
            for (uint256 i = 1; i <= _tree.K; i++) {
                // Loop over children.
                uint256 nodeIndex = (_tree.K * treeIndex) + i;
                uint256 nodeValue = _tree.nodes[nodeIndex];

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

        bytes32 stakePathID = _tree.nodeIndexesToIDs[treeIndex];
        (drawnAddress, fromSubcourtID) = toAccountAndCourtID(stakePathID);
    }

    /// @notice Set a value in a tree.
    ///
    /// @dev `O(log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    ///
    /// @param _tree The sortition sum tree.
    /// @param _value The new value.
    /// @param _stakePathID The ID of the value.
    function set(Tree storage _tree, uint256 _value, bytes32 _stakePathID) internal {
        uint256 treeIndex = _tree.IDsToNodeIndexes[_stakePathID];

        if (treeIndex == 0) {
            // No existing node.
            if (_value != 0) {
                // Non zero value.
                // Append.
                // Add node.
                if (_tree.stack.length == 0) {
                    // No vacant spots.
                    // Get the index and append the value.
                    treeIndex = _tree.nodes.length;
                    _tree.nodes.push(_value);

                    // Potentially append a new node and make the parent a sum node.
                    if (treeIndex != 1 && (treeIndex - 1) % _tree.K == 0) {
                        // Is first child.
                        uint256 parentIndex = treeIndex / _tree.K;
                        bytes32 parentID = _tree.nodeIndexesToIDs[parentIndex];
                        uint256 newIndex = treeIndex + 1;
                        _tree.nodes.push(_tree.nodes[parentIndex]);
                        delete _tree.nodeIndexesToIDs[parentIndex];
                        _tree.IDsToNodeIndexes[parentID] = newIndex;
                        _tree.nodeIndexesToIDs[newIndex] = parentID;
                    }
                } else {
                    // Some vacant spot.
                    // Pop the stack and append the value.
                    treeIndex = _tree.stack[_tree.stack.length - 1];
                    _tree.stack.pop();
                    _tree.nodes[treeIndex] = _value;
                }

                // Add label.
                _tree.IDsToNodeIndexes[_stakePathID] = treeIndex;
                _tree.nodeIndexesToIDs[treeIndex] = _stakePathID;

                updateParents(_tree, treeIndex, true, _value);
            }
        } else {
            // Existing node.
            if (_value == 0) {
                // Zero value.
                // Remove.
                // Remember value and set to 0.
                uint256 value = _tree.nodes[treeIndex];
                _tree.nodes[treeIndex] = 0;

                // Push to stack.
                _tree.stack.push(treeIndex);

                // Clear label.
                delete _tree.IDsToNodeIndexes[_stakePathID];
                delete _tree.nodeIndexesToIDs[treeIndex];

                updateParents(_tree, treeIndex, false, value);
            } else if (_value != _tree.nodes[treeIndex]) {
                // New, non zero value.
                // Set.
                bool plusOrMinus = _tree.nodes[treeIndex] <= _value;
                uint256 plusOrMinusValue = plusOrMinus
                    ? _value - _tree.nodes[treeIndex]
                    : _tree.nodes[treeIndex] - _value;
                _tree.nodes[treeIndex] = _value;

                updateParents(_tree, treeIndex, plusOrMinus, plusOrMinusValue);
            }
        }
    }

    /// @notice Update all the parents of a node.
    ///
    /// @dev `O(log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    ///
    /// @param _tree The sortition sum tree.
    /// @param _treeIndex The index of the node to start from.
    /// @param _plusOrMinus Whether to add (true) or substract (false).
    /// @param _value The value to add or substract.
    function updateParents(Tree storage _tree, uint256 _treeIndex, bool _plusOrMinus, uint256 _value) private {
        uint256 parentIndex = _treeIndex;
        while (parentIndex != 0) {
            parentIndex = (parentIndex - 1) / _tree.K;
            _tree.nodes[parentIndex] = _plusOrMinus
                ? _tree.nodes[parentIndex] + _value
                : _tree.nodes[parentIndex] - _value;
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Get the stake of a juror in a court.
    /// @param _tree The sortition sum tree.
    /// @param _stakePathID The stake path ID, corresponding to a juror.
    /// @return The stake of the juror in the court.
    function stakeOf(Tree storage _tree, bytes32 _stakePathID) internal view returns (uint256) {
        uint256 treeIndex = _tree.IDsToNodeIndexes[_stakePathID];
        if (treeIndex == 0) {
            return 0;
        }
        return _tree.nodes[treeIndex];
    }

    /// @notice Packs an account and a court ID into a stake path ID
    /// @dev [20 bytes of address][12 bytes of courtID] = 32 bytes total.
    /// @param _account The address of the juror to pack.
    /// @param _courtID The court ID to pack.
    /// @return stakePathID The stake path ID.
    function toStakePathID(address _account, uint96 _courtID) internal pure returns (bytes32 stakePathID) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            // Pack address (20 bytes) and courtID (12 bytes) into a single bytes32
            stakePathID := or(shl(96, _account), _courtID)
        }
    }

    /// @notice Retrieves both juror's address and court ID from the stake path ID.
    /// @param _stakePathID The stake path ID to unpack.
    /// @return account The account.
    /// @return courtID The court ID.
    function toAccountAndCourtID(bytes32 _stakePathID) internal pure returns (address account, uint96 courtID) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            // Unpack address (first 20 bytes) and courtID (last 12 bytes) from the stake path ID
            account := shr(96, _stakePathID) // Right shift by 96 bits to get the address
            courtID := and(_stakePathID, 0xffffffffffffffffffffffff) // Mask the lower 96 bits to get the court ID
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error TreeAlreadyExists();
    error KMustBeGreaterThanOne();
}

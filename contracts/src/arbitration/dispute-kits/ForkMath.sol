// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

/// @title ForkMath
/// @notice Pure library implementing the forking "removal fixed point" (yellow paper Prop. 4,
///         specialised to single-choice votes — see `docs/layer-1-core/07-forking.md`).
///
///         For each losing option, the voters who chose it form a threshold-sorted doubly-linked
///         list. Finalization walks the list from the highest threshold downward, evicting any member
///         whose forking threshold exceeds the current support `S` (subtracting their weight), and
///         stops at the first satisfied member. The survivors are the maximal self-consistent set that
///         materializes the minority fork; if every member is evicted the fork is empty.
///
/// @dev `internal`-only by design: with `via_ir = true` the compiler forbids public/external library
///      functions (see `contracts/CLAUDE.md`). Tests exercise it through `src/test/ForkMathHarness.sol`.
///      All bodies currently revert `NotImplemented()` — this is a TDD skeleton; the storage layout and
///      function surface are final, the logic lands in the implementation pass.
library ForkMath {
    // ************************************* //
    // *             Structs               * //
    // ************************************* //

    /// @dev A single voter's node in an option's threshold-sorted list.
    struct VoterNode {
        uint256 prev; // Previous node ID in the sorted list (lower threshold side).
        uint256 next; // Next node ID in the sorted list (higher threshold side).
        uint256 threshold; // The minimum fork size (in PNK weight) at which this voter joins.
        uint256 weight; // The voter's weight (frozen stake + escrow).
        address account; // The voter.
        bool evicted; // True once finalization has cut this voter off (they stay on the main fork).
        uint256[5] __gap; // Reserved slots for future upgrades.
    }

    /// @dev One per losing option. Holds the option's voter list and finalization state.
    struct OptionList {
        mapping(uint256 nodeID => VoterNode) nodes; // Nodes by ID. ID 0 is the HEAD sentinel.
        uint256 lastNodeID; // The most recently inserted node ID; also the node count.
        uint256 totalWeight; // Running sum of all (non-evicted) members' weight = current support `S`.
        uint256 finalSupport; // The fork size after finalization (survivors' total weight).
        uint256 cutOffNodeID; // The descending-walk cursor / last evicted boundary.
        bool finalized; // True once the descending cut-off walk has completed.
        uint256[5] __gap; // Reserved slots for future upgrades.
    }

    // ************************************* //
    // *             Errors                * //
    // ************************************* //

    error NotImplemented();

    // ************************************* //
    // *            Functions              * //
    // ************************************* //

    /// @notice Finds the insertion point for a new node of the given threshold, starting the walk from
    ///         `_searchStart`. Used as a UI gas hint so insertion amortizes to O(1) across reveals.
    /// @param _list The option's list.
    /// @param _threshold The threshold of the node to insert.
    /// @param _searchStart The node ID to begin searching from.
    /// @return nextID The node ID before which the new node should be inserted.
    function search(
        OptionList storage _list,
        uint256 _threshold,
        uint256 _searchStart
    ) internal view returns (uint256 nextID) {
        _list; // silence unused warnings in the skeleton
        _threshold;
        _searchStart;
        revert NotImplemented();
    }

    /// @notice Inserts a voter into the option's threshold-sorted list and adds their weight to support.
    /// @param _list The option's list.
    /// @param _account The voter.
    /// @param _threshold The voter's forking threshold.
    /// @param _weight The voter's weight.
    /// @param _hint The insertion hint from `search` (the node to insert before).
    /// @return nodeID The newly created node ID.
    function insert(
        OptionList storage _list,
        address _account,
        uint256 _threshold,
        uint256 _weight,
        uint256 _hint
    ) internal returns (uint256 nodeID) {
        _list;
        _account;
        _threshold;
        _weight;
        _hint;
        revert NotImplemented();
    }

    /// @notice Performs up to `_maxIt` steps of the descending cut-off walk. Evicts members whose
    ///         threshold exceeds the current support; stops at the first satisfied member, sets
    ///         `finalSupport`, and marks the list finalized.
    /// @param _list The option's list.
    /// @param _maxIt The maximum number of nodes to process this call (pagination bound).
    /// @return done True once the walk has completed for this option.
    function finalizeStep(OptionList storage _list, uint256 _maxIt) internal returns (bool done) {
        _list;
        _maxIt;
        revert NotImplemented();
    }

    /// @notice Returns whether a node is a survivor of the finalized fork (not evicted).
    /// @param _list The option's list.
    /// @param _nodeID The node to query.
    /// @return survivor True if the node survived the cut-off.
    function isSurvivor(OptionList storage _list, uint256 _nodeID) internal view returns (bool survivor) {
        _list;
        _nodeID;
        revert NotImplemented();
    }
}

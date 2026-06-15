// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {ForkMath} from "../arbitration/dispute-kits/ForkMath.sol";

/// @title ForkMathHarness
/// @notice Thin external wrapper around the `internal`-only `ForkMath` library so Foundry tests can
///         exercise it directly. Owns a small set of `OptionList`s keyed by option ID, mirroring how
///         `DisputeKitForking` will hold one list per losing option.
/// @dev Test-only contract (lives under `src/test`, like the other `*Mock` harnesses).
contract ForkMathHarness {
    using ForkMath for ForkMath.OptionList;

    mapping(uint256 optionID => ForkMath.OptionList) internal lists;

    /// @notice Inserts a voter into an option's list, searching from `_searchStart` for the spot.
    function insert(
        uint256 _optionID,
        address _account,
        uint256 _threshold,
        uint256 _weight,
        uint256 _searchStart
    ) external returns (uint256 nodeID) {
        ForkMath.OptionList storage list = lists[_optionID];
        uint256 hint = list.search(_threshold, _searchStart);
        return list.insert(_account, _threshold, _weight, hint);
    }

    /// @notice Runs the paginated descending cut-off walk for an option.
    function finalizeStep(uint256 _optionID, uint256 _maxIt) external returns (bool done) {
        return lists[_optionID].finalizeStep(_maxIt);
    }

    /// @notice The fork size (survivors' total weight) after finalization.
    function finalSupport(uint256 _optionID) external view returns (uint256) {
        return lists[_optionID].finalSupport;
    }

    /// @notice The running support before/while finalizing.
    function totalWeight(uint256 _optionID) external view returns (uint256) {
        return lists[_optionID].totalWeight;
    }

    /// @notice Whether the option's walk has completed.
    function finalized(uint256 _optionID) external view returns (bool) {
        return lists[_optionID].finalized;
    }

    /// @notice Whether a given node survived the cut-off.
    function isSurvivor(uint256 _optionID, uint256 _nodeID) external view returns (bool) {
        return lists[_optionID].isSurvivor(_nodeID);
    }

    /// @notice Reads back a node's stored fields for assertions.
    function getNode(
        uint256 _optionID,
        uint256 _nodeID
    ) external view returns (uint256 threshold, uint256 weight, address account, bool evicted) {
        ForkMath.VoterNode storage node = lists[_optionID].nodes[_nodeID];
        return (node.threshold, node.weight, node.account, node.evicted);
    }
}

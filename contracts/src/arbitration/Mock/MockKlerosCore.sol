// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import {SortitionSumTreeFactory} from "../../data-structures/SortitionSumTreeFactory.sol";
import {DisputeKitPlurality} from "../DisputeKitPlurality.sol";

contract MockKlerosCore {
    using SortitionSumTreeFactory for SortitionSumTreeFactory.SortitionSumTrees; // Use library functions for sortition sum trees.
    SortitionSumTreeFactory.SortitionSumTrees internal sortitionSumTrees; // The sortition sum trees.

    DisputeKitPlurality disputeKit;

    constructor() {
        sortitionSumTrees.createTree(bytes32(0), 3);
    }

    // function getSortitionSumTrees() view public returns(SortitionSumTreeFactory.SortitionSumTrees calldata) {
    //     return sortitionSumTrees;
    // }

    function drawJurors(uint256 _disputeID, uint256 _iterations) public {
        disputeKit.draw(sortitionSumTrees);
    }
}

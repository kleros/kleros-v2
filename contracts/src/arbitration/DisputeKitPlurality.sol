// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "./IArbitrator.sol";
import "../rng/RNG.sol";
import "../data-structures/SortitionSumTreeFactory.sol";

contract DisputeKitPlurality {
    // Core --> IN
    // createDispute

    // OUT -> Core
    // report drawn jurors
    // report ruling

    // Jurors -> IN
    // vote

    // Anyone -> IN
    // requestAppeal

    // INTERNAL
    // draw jurors <-> RNG
    // receive evidence
    // aggregate votes
    // incentive (who earns how much PNK and ETH)
    // appeal crowdfunding
    // redistribution when ruling is final

    IArbitrator public immutable core;
    RNG public immutable rng;

    using SortitionSumTreeFactory for SortitionSumTreeFactory.SortitionSumTrees; // Use library functions for sortition sum trees.

    // SortitionSumTreeFactory.SortitionSumTrees internal sortitionSumTrees; // The sortition sum trees.

    constructor(IArbitrator _core, RNG _rng) {
        core = _core;
        rng = _rng;
    }

    /**
     * Note: disputeID is maintained by Kleros Core, not the dispute kit
     * Note: the dispute kit does not receive any payment, Kleros Core does
     * Note: Permissioned
     */
    function createDispute(
        uint256 _disputeID,
        uint256 _minJuror,
        uint256 _choices,
        bytes calldata _extraData
    ) external {
        require(msg.sender == address(core), "Not allowed: sender is not core");

        // -- dispute specific --
        //

        // -- subcourt specific --
        // uint minStake: min tokens required to stake on this subcourt
        // bool hiddenVotes:
        // uint alpha: bps of tokens lost when incoherent
        // uint feeForJuror: paid per juror
        // uint jurorsForCourtJump: evaluated by the appeal logic

        // PROBLEM: have an interface that works for  and "1 human 1 vote"

        // votes = msg.value / subcourt.feeForJuror
        // tokenAtStakePerJuror = (subcourt.minStake * subcourt.alpha) / ALPHA_DIVISOR
        // ALPHA_DIVISOR = 10000
    }

    function drawJurors(SortitionSumTreeFactory.SortitionSumTrees calldata tree) public {}
}

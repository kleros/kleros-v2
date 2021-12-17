// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "./IArbitrator.sol";
import "../rng/RNG.sol";
import "./mock/MockKlerosCore.sol";

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

    // TODO: extract the necessary interfaces
    MockKlerosCore public immutable core;

    RNG public immutable rng;

    constructor(MockKlerosCore _core, RNG _rng) {
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

    /**
     *  @dev Draws jurors for a dispute. Can be called in parts.
     *  @param _disputeID The ID of the dispute.
     *  @param _iterations The number of iterations to run.
     */
    function drawJurors(uint256 _disputeID, uint256 _iterations) public {
        uint96 subcourtID = core.getDispute(_disputeID).subcourtID;
        bytes32 key = bytes32(bytes12(subcourtID)); // due to new conversion restrictions in v0.8
        (
            uint256 k, /* stack */
            ,
            uint256[] memory nodes
        ) = core.getSortitionSumTree(key);

        // TODO: run this only when starting the drawing period
        uint256 randomNumber = rng.getUncorrelatedRN(block.number);

        // TODO: batching with boundary checks
        for (uint256 i = 0; i < _iterations; i++) {
            uint256 treeIndex = draw(uint256(keccak256(abi.encodePacked(randomNumber, _disputeID, i))), k, nodes);
            bytes32 id = core.getSortitionSumTreeID(key, treeIndex);
            (
                address drawnAddress, /* subcourtID */

            ) = stakePathIDToAccountAndSubcourtID(id);

            // TODO: Save the vote.
            // dispute.votes[dispute.votes.length - 1][i].account = drawnAddress;
            // jurors[drawnAddress].lockedTokens += dispute.tokensAtStakePerJuror[dispute.tokensAtStakePerJuror.length - 1];
            // emit Draw(drawnAddress, _disputeID, dispute.votes.length - 1, i);

            // TODO: Stop if dispute is fully drawn.
            // if (i == dispute.votes[dispute.votes.length - 1].length - 1) break;
        }
    }

    function draw(
        uint256 _drawnNumber,
        uint256 _k,
        uint256[] memory _nodes
    ) private pure returns (uint256 treeIndex) {
        uint256 currentDrawnNumber = _drawnNumber % _nodes[0];
        while ((_k * treeIndex) + 1 < _nodes.length) {
            // While it still has children.
            for (uint256 i = 1; i <= _k; i++) {
                // Loop over children.
                uint256 nodeIndex = (_k * treeIndex) + i;
                uint256 nodeValue = _nodes[nodeIndex];

                if (currentDrawnNumber >= nodeValue)
                    currentDrawnNumber -= nodeValue; // Go to the next child.
                else {
                    // Pick this child.
                    treeIndex = nodeIndex;
                    break;
                }
            }
        }
    }

    /**
     *  @dev Unpacks a stake path ID into an account and a subcourt ID.
     *  @param _stakePathID The stake path ID to unpack.
     *  @return account The account.
     *  @return subcourtID The subcourt ID.
     */
    function stakePathIDToAccountAndSubcourtID(bytes32 _stakePathID)
        internal
        pure
        returns (address account, uint96 subcourtID)
    {
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
            subcourtID := _stakePathID
        }
    }
}

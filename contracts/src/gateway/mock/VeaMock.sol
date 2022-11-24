// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@kleros/vea-contracts/interfaces/IFastBridgeSender.sol";
import "@kleros/vea-contracts/interfaces/IFastBridgeReceiver.sol";

contract VeaMock is IFastBridgeSender, IFastBridgeReceiver {
    /* solhint-disable */

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /**
     * Note: Access must be restricted by the receiving gateway by checking the sender argument.
     * @dev Sends an arbitrary message across domain using the Fast Bridge.
     * @param _receiver The cross-domain contract address which receives the calldata.
     * @param _calldata The receiving domain encoded message data.
     */
    function sendFast(address _receiver, bytes memory _calldata) external {
        // Dirty workaround: Solidity does not support array slices for memory arrays and the sender interface cannot be changed.
        (bytes4 selector, bytes memory payload) = this.decode(_calldata);

        bytes32 sender = bytes32(uint256(uint160(msg.sender)));
        bytes memory data = abi.encodePacked(selector, sender, payload);
        (bool success, bytes memory res) = _receiver.call(data);
        require(success, "Call failure");
    }

    function decode(bytes calldata data) external pure returns (bytes4, bytes memory) {
        return (bytes4(data[:4]), data[4:]);
    }

    /**
     * Sends a batch of arbitrary message from one domain to another
     * via the fast bridge mechanism.
     */
    function sendBatch() external {
        revert("Not Implemented");
    }

    /**
     * @dev Sends a markle root representing an arbitrary batch of messages across domain using the Safe Bridge, which relies on the chain's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _epoch block number of batch
     */
    function sendSafeFallback(uint256 _epoch) external payable {
        revert("Not Implemented");
    }

    /**
     * @dev Submit a claim about the `_batchMerkleRoot` for the latests completed Fast bridge epoch and submit a deposit. The `_batchMerkleRoot` should match the one on the sending side otherwise the sender will lose his deposit.
     * @param _epoch The epoch of the claim to claim.
     * @param _batchMerkleRoot The hash claimed for the ticket.
     */
    function claim(uint256 _epoch, bytes32 _batchMerkleRoot) external payable {
        revert("Not Implemented");
    }

    /**
     * @dev Submit a challenge for the claim of the current epoch's Fast Bridge batch merkleroot state and submit a deposit. The `batchMerkleRoot` in the claim already made for the last finalized epoch should be different from the one on the sending side, otherwise the sender will lose his deposit.
     * @param _epoch The epoch of the claim to challenge.
     */
    function challenge(uint256 _epoch) external payable {
        revert("Not Implemented");
    }

    /**
     * @dev Resolves the optimistic claim for '_epoch'.
     * @param _epoch The epoch of the optimistic claim.
     */
    function verifyBatch(uint256 _epoch) external {
        revert("Not Implemented");
    }

    /**
     * @dev Verifies merkle proof for the given message and associated nonce for the most recent possible epoch and relays the message.
     * @param _epoch The epoch in which the message was batched by the bridge.
     * @param _proof The merkle proof to prove the membership of the message and nonce in the merkle tree for the epoch.
     * @param _message The data on the cross-domain chain for the message.
     */
    function verifyAndRelayMessage(uint256 _epoch, bytes32[] calldata _proof, bytes calldata _message) external {
        revert("Not Implemented");
    }

    /**
     * @dev Sends the deposit back to the Bridger if their claim is not successfully challenged. Includes a portion of the Challenger's deposit if unsuccessfully challenged.
     * @param _epoch The epoch associated with the claim deposit to withraw.
     */
    function withdrawClaimDeposit(uint256 _epoch) external {
        revert("Not Implemented");
    }

    /**
     * @dev Sends the deposit back to the Challenger if his challenge is successful. Includes a portion of the Bridger's deposit.
     * @param _epoch The epoch associated with the challenge deposit to withraw.
     */
    function withdrawChallengeDeposit(uint256 _epoch) external {
        revert("Not Implemented");
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     * @dev Returns the `start` and `end` time of challenge period for this `epoch`.
     * @param _epoch The epoch of the claim to request the challenge period.
     * @return start The start time of the challenge period.
     * @return end The end time of the challenge period.
     */
    function claimChallengePeriod(uint256 _epoch) external view returns (uint256 start, uint256 end) {
        revert("Not Implemented");
    }

    /**
     * @dev Returns the epoch period.
     */
    function epochPeriod() external view returns (uint256 epochPeriod) {
        revert("Not Implemented");
    }

    /**
     * @dev Returns the challenge period.
     */
    function challengePeriod() external view returns (uint256 challengePeriod) {
        revert("Not Implemented");
    }

    /* solhint-enable */
}

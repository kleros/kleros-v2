// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/IFastBridgeReceiver.sol";
import "./interfaces/ISafeBridgeReceiver.sol";
import "./merkle/MerkleProof.sol";

/**
 * Fast Receiver Base
 * Counterpart of `FastSenderBase`
 */
abstract contract FastBridgeReceiverBase is MerkleProof, IFastBridgeReceiver, ISafeBridgeReceiver {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Claim {
        bytes32 batchMerkleRoot;
        address bridger;
        uint32 timestamp;
        bool honest;
        bool depositAndRewardWithdrawn;
    }

    struct Challenge {
        address challenger;
        bool honest;
        bool depositAndRewardWithdrawn;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public immutable deposit; // The deposit required to submit a claim or challenge
    uint256 public immutable override epochPeriod; // Epochs mark the period between potential batches of messages.
    uint256 public immutable override challengePeriod; // Epochs mark the period between potential batches of messages.

    address public immutable safeRouter; // The address of the Safe Router on the connecting chain.

    mapping(uint256 => bytes32) public fastInbox; // epoch => validated batch merkle root(optimistically, or challenged and verified with the safe bridge)
    mapping(uint256 => Claim) public claims; // epoch => claim
    mapping(uint256 => Challenge) public challenges; // epoch => challenge
    mapping(uint256 => mapping(uint256 => bytes32)) public relayed; // epoch => packed replay bitmap

    /**
     * @dev Constructor.
     * @param _deposit The deposit amount to submit a claim in wei.
     * @param _epochPeriod The duration of each epoch.
     * @param _challengePeriod The duration of the period allowing to challenge a claim.
     * @param _safeRouter The address of the Safe Router on Ethereum.
     */
    constructor(
        uint256 _deposit,
        uint256 _epochPeriod,
        uint256 _challengePeriod,
        address _safeRouter
    ) {
        deposit = _deposit;
        epochPeriod = _epochPeriod;
        challengePeriod = _challengePeriod;
        safeRouter = _safeRouter;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Submit a claim about the `_batchMerkleRoot` for the last completed epoch from the Fast Bridge  and submit a deposit. The `_batchMerkleRoot` should match the one on the sending side otherwise the sender will lose his deposit.
     * @param _epoch The epoch in which the batch to claim.
     * @param _batchMerkleRoot The batch merkle root claimed for the last completed epoch.
     */
    function claim(uint256 _epoch, bytes32 _batchMerkleRoot) external payable override {
        require(msg.value >= deposit, "Insufficient claim deposit.");
        require(_batchMerkleRoot != bytes32(0), "Invalid claim.");

        uint256 epoch = block.timestamp / epochPeriod;
        // allow claim about current or previous epoch
        require(_epoch == epoch || _epoch == epoch + 1, "Invalid Claim");

        require(claims[_epoch].bridger == address(0), "Claim already made for most recent finalized epoch.");

        claims[_epoch] = Claim({
            batchMerkleRoot: _batchMerkleRoot,
            bridger: msg.sender,
            timestamp: uint32(block.timestamp),
            honest: false,
            depositAndRewardWithdrawn: false
        });

        emit ClaimReceived(_epoch, _batchMerkleRoot);
    }

    /**
     * @dev Submit a challenge for the claim of the current epoch's Fast Bridge batch merkleroot state and submit a deposit. The `batchMerkleRoot` in the claim already made for the last finalized epoch should be different from the one on the sending side, otherwise the sender will lose his deposit.
     * @param _epoch The epoch of the claim to challenge.
     */
    function challenge(uint256 _epoch) external payable override {
        require(msg.value >= deposit, "Not enough claim deposit");

        // can only challenge the only active claim, about the previous epoch
        require(claims[_epoch].bridger != address(0), "No claim to challenge.");
        require(block.timestamp < uint256(claims[_epoch].timestamp) + challengePeriod, "Challenge period elapsed.");

        challenges[_epoch] = Challenge({challenger: msg.sender, honest: false, depositAndRewardWithdrawn: false});

        emit ClaimChallenged(_epoch);
    }

    /**
     * @dev Resolves the optimistic claim for '_epoch'.
     * @param _epoch The epoch of the optimistic claim.
     */
    function verify(uint256 _epoch) public {
        Claim storage claim = claims[_epoch];
        require(claim.bridger != address(0), "Invalid epoch, no claim to verify.");
        require(
            block.timestamp > uint256(claims[_epoch].timestamp) + challengePeriod,
            "Challenge period has not yet elapsed."
        );

        if (challenges[_epoch].challenger == address(0)) {
            // optimistic happy path
            claim.honest = true;
            fastInbox[_epoch] = claim.batchMerkleRoot;
        }
    }

    /**
     * @dev Verifies merkle proof for the given message and associated nonce for the epoch and relays the message.
     * @param _epoch The epoch in which the message was batched by the bridge.
     * @param _proof The merkle proof to prove the membership of the message and nonce in the merkle tree for the epoch.
     * @param _message The data on the cross-domain chain for the message.
     * @param _nonce The nonce (index in the merkle tree) to avoid replay.
     */
    function verifyAndRelay(
        uint256 _epoch,
        bytes32[] calldata _proof,
        bytes calldata _message,
        uint256 _nonce
    ) external override {
        bytes32 batchMerkleRoot = fastInbox[_epoch];
        require(batchMerkleRoot != bytes32(0), "Invalid epoch.");

        uint256 index = _nonce / 256;
        uint256 offset = _nonce - index * 256;

        bytes32 replay = relayed[_epoch][index];
        require(((replay >> offset) & bytes32(uint256(1))) == 0, "Message already relayed");
        relayed[_epoch][index] = replay | bytes32(1 << offset);

        // Claim assessment if any
        bytes32 messageHash = sha256(abi.encode(_message, _nonce));

        require(validateProof(_proof, messageHash, batchMerkleRoot) == true, "Invalid proof.");
        require(_relay(_message), "Failed to call contract"); // Checks-Effects-Interaction
    }

    /**
     * Note: Access restricted to the Safe Bridge.
     * @dev Resolves any challenge of the optimistic claim for '_epoch'.
     * @param _epoch The epoch to verify.
     * @param _batchMerkleRoot The true batch merkle root for the epoch.
     */
    function verifySafe(uint256 _epoch, bytes32 _batchMerkleRoot) external override onlyFromSafeBridge {
        require(isSentBySafeBridge(), "Access not allowed: SafeBridgeSender only.");

        fastInbox[_epoch] = _batchMerkleRoot;

        if (_batchMerkleRoot == claims[_epoch].batchMerkleRoot) {
            claims[_epoch].honest = true;
        } else {
            challenges[_epoch].honest = true;
        }
    }

    /**
     * @dev Sends the deposit back to the Bridger if their claim is not successfully challenged. Includes a portion of the Challenger's deposit if unsuccessfully challenged.
     * @param _epoch The epoch associated with the claim deposit to withraw.
     */
    function withdrawClaimDeposit(uint256 _epoch) external override {
        Claim storage claim = claims[_epoch];

        require(claim.bridger != address(0), "Claim does not exist");
        require(claim.honest == true, "Claim not verified.");
        require(claim.depositAndRewardWithdrawn == false, "Claim deposit and any rewards already withdrawn.");

        uint256 amount = deposit;
        if (challenges[_epoch].challenger != address(0)) amount = amount + deposit / 2; // half burnt

        claim.depositAndRewardWithdrawn = true;

        payable(claim.bridger).send(amount); // Use of send to prevent reverting fallback. User is responsibility for accepting ETH.
        // Checks-Effects-Interaction
    }

    /**
     * @dev Sends the deposit back to the Challenger if their challenge is successful. Includes a portion of the Bridger's deposit.
     * @param _epoch The epoch associated with the challenge deposit to withraw.
     */
    function withdrawChallengeDeposit(uint256 _epoch) external override {
        Challenge storage challenge = challenges[_epoch];

        require(challenge.challenger != address(0), "Challenge does not exist");
        require(challenge.honest == true, "Challenge not verified.");
        require(challenge.depositAndRewardWithdrawn == false, "Challenge deposit and rewards already withdrawn.");

        uint256 amount = deposit + deposit / 2;
        challenge.depositAndRewardWithdrawn = true;

        payable(challenge.challenger).send(amount); // Use of send to prevent reverting fallback. User is responsibility for accepting ETH.
        // Checks-Effects-Interaction
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     *  Returns the `start` and `end` time of challenge period for the claim for this `_epoch`.
     *  start The start time of the challenge period.
     *  end The end time of the challenge period.
     */
    function claimChallengePeriod(uint256 _epoch) external view override returns (uint256 start, uint256 end) {
        // start begins latest after the claim deadline expiry
        // however can begin as soon as a claim is made
        // can only challenge the only active claim, about the previous epoch
        start = claims[_epoch].timestamp;
        end = start + challengePeriod;
        return (start, end);
    }

    // ************************ //
    // *       Internal       * //
    // ************************ //

    function _relay(bytes calldata _messageData) internal returns (bool success) {
        // Decode the receiver address from the data encoded by the IFastBridgeSender
        (address receiver, bytes memory data) = abi.decode(_messageData, (address, bytes));
        (success, ) = receiver.call(data);
    }
}

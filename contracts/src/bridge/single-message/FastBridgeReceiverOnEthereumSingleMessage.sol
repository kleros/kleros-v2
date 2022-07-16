// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./SafeBridgeReceiverOnEthereum.sol";
import "./interfaces/IFastBridgeReceiver.sol";

/**
 * Fast Bridge Receiver on Ethereum from Arbitrum
 * Counterpart of `FastBridgeSenderToEthereum`
 */
contract FastBridgeReceiverOnEthereumSingleMessage is SafeBridgeReceiverOnEthereum, IFastBridgeReceiver {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Claim {
        bytes32 messageHash;
        address bridger;
        uint256 claimedAt;
        uint256 claimDeposit;
        bool verified;
    }

    struct Challenge {
        address challenger;
        uint256 challengedAt;
        uint256 challengeDeposit;
    }

    struct Ticket {
        Claim claim;
        Challenge challenge;
        bool relayed;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant ONE_BASIS_POINT = 1e4; // One basis point, for scaling.
    uint256 public override claimDeposit; // The deposit required to submit a claim.
    uint256 public override challengeDeposit; // The deposit required to submit a challenge.
    uint256 public override challengeDuration; // The duration of the period allowing to challenge a claim.
    uint256 public override alpha; // Basis point of claim or challenge deposit that are lost when dishonest.
    mapping(uint256 => Ticket) public tickets; // The tickets by ticketID.

    /**
     * @dev Constructor.
     * @param _governor The governor's address.
     * @param _safeBridgeSender The address of the Safe Bridge sender on Arbitrum.
     * @param _inbox The address of the Arbitrum Inbox contract.
     * @param _claimDeposit The deposit amount to submit a claim in wei.
     * @param _challengeDeposit The deposit amount to submit a challenge in wei.
     * @param _challengeDuration The duration of the period allowing to challenge a claim.
     * @param _alpha Basis point of claim or challenge deposit that are lost when dishonest.
     */
    constructor(
        address _governor,
        address _safeBridgeSender,
        address _inbox,
        uint256 _claimDeposit,
        uint256 _challengeDeposit,
        uint256 _challengeDuration,
        uint256 _alpha
    ) SafeBridgeReceiverOnEthereum(_governor, _safeBridgeSender, _inbox) {
        claimDeposit = _claimDeposit;
        challengeDeposit = _challengeDeposit;
        challengeDuration = _challengeDuration;
        alpha = _alpha;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Submit a claim about the `messageHash` for a particular Fast Bridge `ticketID` and submit a deposit. The `messageHash` should match the one on the sending side otherwise the sender will lose his deposit.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     * @param _messageHash The hash claimed for the ticket.
     */
    function claim(uint256 _ticketID, bytes32 _messageHash) external payable override {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.claim.bridger == address(0), "Claim already made");
        require(ticket.relayed == false, "Claim already relayed"); // already relayed via verifyAndRelaySafe() without claim.
        require(msg.value >= claimDeposit, "Not enough claim deposit");

        ticket.claim = Claim({
            messageHash: _messageHash,
            bridger: msg.sender,
            claimedAt: block.timestamp,
            claimDeposit: msg.value,
            verified: false
        });

        emit ClaimReceived(_ticketID, _messageHash, block.timestamp);
    }

    /**
     * @dev Submit a challenge for a particular Fast Bridge `ticketID` and submit a deposit. The `messageHash` in the claim already made for this `ticketID` should be different from the one on the sending side, otherwise the sender will lose his deposit.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     */
    function challenge(uint256 _ticketID) external payable override {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.claim.bridger != address(0), "Claim does not exist");
        require(block.timestamp - ticket.claim.claimedAt < challengeDuration, "Challenge period over");
        require(ticket.challenge.challenger == address(0), "Claim already challenged");
        require(msg.value >= challengeDeposit, "Not enough challenge deposit");

        ticket.challenge = Challenge({
            challenger: msg.sender,
            challengedAt: block.timestamp,
            challengeDeposit: msg.value
        });

        emit ClaimChallenged(_ticketID, block.timestamp);
    }

    /**
     * @dev Relay the message for this `ticketID` if the challenge period has passed and the claim is unchallenged. The hash computed over `messageData` and the other parameters must match the hash provided by the claim.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     * @param _blockNumber The block number on the cross-domain chain when the message with this ticketID has been sent.
     * @param _messageData The data on the cross-domain chain for the message sent with this ticketID.
     */
    function verifyAndRelay(
        uint256 _ticketID,
        uint256 _blockNumber,
        bytes calldata _messageData
    ) external override {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.claim.bridger != address(0), "Claim does not exist");
        require(
            ticket.claim.messageHash == keccak256(abi.encode(_ticketID, _blockNumber, _messageData)),
            "Invalid hash"
        );
        require(ticket.claim.claimedAt + challengeDuration < block.timestamp, "Challenge period not over");
        require(ticket.challenge.challenger == address(0), "Claim is challenged");
        require(ticket.relayed == false, "Message already relayed");

        ticket.claim.verified = true;
        ticket.relayed = true;
        require(_relay(_messageData), "Failed to call contract"); // Checks-Effects-Interaction
    }

    /**
     * Note: Access restricted to the Safe Bridge.
     * @dev Relay the message for this `ticketID` as provided by the Safe Bridge. Resolve a challenged claim for this `ticketID` if any.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     * @param _blockNumber The block number on the cross-domain chain when the message with this ticketID has been sent.
     * @param _messageData The data on the cross-domain chain for the message sent with this ticketID.
     */
    function verifyAndRelaySafe(
        uint256 _ticketID,
        uint256 _blockNumber,
        bytes calldata _messageData
    ) external override {
        require(isSentBySafeBridge(), "Access not allowed: SafeBridgeSender only.");

        Ticket storage ticket = tickets[_ticketID];
        require(ticket.relayed == false, "Message already relayed");

        // Claim assessment if any
        bytes32 messageHash = keccak256(abi.encode(_ticketID, _blockNumber, _messageData));
        if (ticket.claim.bridger != address(0) && ticket.claim.messageHash == messageHash) {
            ticket.claim.verified = true;
        }

        ticket.relayed = true;
        require(_relay(_messageData), "Failed to call contract"); // Checks-Effects-Interaction
    }

    /**
     * @dev Sends the deposit back to the Bridger if his claim is not successfully challenged. Includes a portion of the Challenger's deposit if unsuccessfully challenged.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     */
    function withdrawClaimDeposit(uint256 _ticketID) external override {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.relayed == true, "Message not relayed yet");
        require(ticket.claim.bridger != address(0), "Claim does not exist");
        require(ticket.claim.verified == true, "Claim not verified: deposit forfeited");

        uint256 amount = ticket.claim.claimDeposit + (ticket.challenge.challengeDeposit * alpha) / ONE_BASIS_POINT;
        ticket.claim.claimDeposit = 0;
        ticket.challenge.challengeDeposit = 0;
        payable(ticket.claim.bridger).send(amount); // Use of send to prevent reverting fallback. User is responsibility for accepting ETH.
        // Checks-Effects-Interaction
    }

    /**
     * @dev Sends the deposit back to the Challenger if his challenge is successful. Includes a portion of the Bridger's deposit.
     * @param _ticketID The ticket identifier referring to a message going through the bridge.
     */
    function withdrawChallengeDeposit(uint256 _ticketID) external override {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.relayed == true, "Message not relayed");
        require(ticket.challenge.challenger != address(0), "Challenge does not exist");
        require(ticket.claim.verified == false, "Claim verified: deposit forfeited");

        uint256 amount = ticket.challenge.challengeDeposit + (ticket.claim.claimDeposit * alpha) / ONE_BASIS_POINT;
        ticket.claim.claimDeposit = 0;
        ticket.challenge.challengeDeposit = 0;
        payable(ticket.challenge.challenger).send(amount); // Use of send to prevent reverting fallback. User is responsibility for accepting ETH.
        // Checks-Effects-Interaction
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     * @dev Returns the `start` and `end` time of challenge period for this `ticketID`.
     * @return start The start time of the challenge period.
     * @return end The end time of the challenge period.
     */
    function challengePeriod(uint256 _ticketID) external view override returns (uint256 start, uint256 end) {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.claim.bridger != address(0), "Claim does not exist");

        start = ticket.claim.claimedAt;
        end = start + challengeDuration;
        return (start, end);
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    function changeClaimDeposit(uint256 _claimDeposit) external onlyByGovernor {
        claimDeposit = _claimDeposit;
    }

    function changeChallengeDeposit(uint256 _challengeDeposit) external onlyByGovernor {
        challengeDeposit = _challengeDeposit;
    }

    function changeChallengePeriodDuration(uint256 _challengeDuration) external onlyByGovernor {
        challengeDuration = _challengeDuration;
    }

    function changeAlpha(uint256 _alpha) external onlyByGovernor {
        alpha = _alpha;
    }

    // ************************ //
    // *       Internal       * //
    // ************************ //

    function _relay(bytes calldata _messageData) internal returns (bool success) {
        // Decode the receiver address from the data encoded by the IFastBridgeSender
        (address receiver, bytes memory data) = abi.decode(_messageData, (address, bytes));
        (success, ) = address(receiver).call(data);
    }
}

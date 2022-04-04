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
contract FastBridgeReceiverOnEthereum is SafeBridgeReceiverOnEthereum, IFastBridgeReceiver {
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

    uint256 public override claimDeposit;
    uint256 public override challengeDeposit;
    uint256 public override challengeDuration;
    mapping(uint256 => Ticket) public tickets; // The tickets by ticketID.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event ClaimReceived(uint256 indexed _ticketID, bytes32 indexed messageHash, uint256 claimedAt);
    event ClaimChallenged(uint256 indexed _ticketID, bytes32 indexed _messageHash, uint256 challengedAt);

    constructor(
        address _governor,
        address _safeBridgeSender,
        address _inbox,
        uint256 _claimDeposit,
        uint256 _challengeDeposit,
        uint256 _challengeDuration
    ) SafeBridgeReceiverOnEthereum(_governor, _safeBridgeSender, _inbox) {
        claimDeposit = _claimDeposit;
        challengeDeposit = _challengeDeposit;
        challengeDuration = _challengeDuration;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function claim(uint256 _ticketID, bytes32 _messageHash) external payable override {
        require(msg.value >= claimDeposit, "Not enough claim deposit");
        require(tickets[_ticketID].claim.bridger == address(0), "Claim already made");

        tickets[_ticketID].claim = Claim({
            messageHash: _messageHash,
            bridger: msg.sender,
            claimedAt: block.timestamp,
            claimDeposit: msg.value,
            verified: false
        });

        emit ClaimReceived(_ticketID, _messageHash, block.timestamp);
    }

    function challenge(uint256 _ticketID) external payable override {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.claim.bridger != address(0), "Claim does not exist");
        require(block.timestamp - ticket.claim.claimedAt < challengeDuration, "Challenge period over");
        require(msg.value >= challengeDeposit, "Not enough challenge deposit");
        require(ticket.challenge.challenger == address(0), "Claim already challenged");

        ticket.challenge = Challenge({
            challenger: msg.sender,
            challengedAt: block.timestamp,
            challengeDeposit: msg.value
        });

        emit ClaimChallenged(_ticketID, ticket.claim.messageHash, block.timestamp);
    }

    function verifyAndRelay(
        uint256 _ticketID,
        bytes32 _messageHash,
        bytes memory _messageData
    ) external override {
        require(_verify(_messageHash, _ticketID, _messageData), "Invalid hash");

        Ticket storage ticket = tickets[_ticketID];
        require(ticket.claim.bridger != address(0), "Claim does not exist");
        require(ticket.claim.claimedAt + challengeDuration < block.timestamp, "Challenge period not over");
        require(ticket.challenge.challenger == address(0), "Claim is challenged");
        require(ticket.relayed == false, "Message already relayed");

        ticket.claim.verified = true;
        ticket.relayed = true;
        require(_relay(_messageData), "Failed to call contract"); // Checks-Effects-Interaction
    }

    function verifyAndRelaySafe(
        uint256 _ticketID,
        bytes32 _messageHash,
        bytes memory _messageData
    ) external override {
        require(isSentBySafeBridge(), "Access not allowed: SafeBridgeSender only.");
        require(_verify(_messageHash, _ticketID, _messageData), "Invalid hash");

        Ticket storage ticket = tickets[_ticketID];
        require(ticket.relayed == false, "Message already relayed");

        // Claim assessment if any
        if (ticket.claim.bridger != address(0) && ticket.claim.messageHash == _messageHash) {
            ticket.claim.verified = true;
        }

        ticket.relayed = true;
        require(_relay(_messageData), "Failed to call contract"); // Checks-Effects-Interaction
    }

    function withdrawClaimDeposit(uint256 _ticketID) external override {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.relayed == true, "Message not relayed yet");
        require(ticket.claim.bridger != address(0), "Claim does not exist");
        require(ticket.claim.verified == true, "Claim not verified: deposit forfeited");

        uint256 amount = ticket.claim.claimDeposit + ticket.challenge.challengeDeposit;
        ticket.claim.claimDeposit = 0;
        ticket.challenge.challengeDeposit = 0;
        payable(ticket.claim.bridger).send(amount); // Use of send to prevent reverting fallback. User is responsibility for accepting ETH.
        // Checks-Effects-Interaction
    }

    function withdrawChallengeDeposit(uint256 _ticketID) external override {
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.relayed == true, "Message not relayed");
        require(ticket.challenge.challenger != address(0), "Challenge does not exist");
        require(ticket.claim.verified == false, "Claim verified: deposit forfeited");

        uint256 amount = ticket.claim.claimDeposit + ticket.challenge.challengeDeposit;
        ticket.claim.claimDeposit = 0;
        ticket.challenge.challengeDeposit = 0;
        payable(ticket.challenge.challenger).send(amount); // Use of send to prevent reverting fallback. User is responsibility for accepting ETH.
        // Checks-Effects-Interaction
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    function challengePeriod(uint256 _ticketID) public view returns (uint256 start, uint256 end) {
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

    // ************************ //
    // *       Internal       * //
    // ************************ //

    function _verify(
        bytes32 _expectedHash,
        uint256 _ticketID,
        bytes memory _messageData
    ) internal pure returns (bool) {
        return _expectedHash == keccak256(abi.encode(_ticketID, _messageData));
    }

    function _relay(bytes memory _messageData) internal returns (bool success) {
        // Decode the receiver address from the data encoded by the IFastBridgeSender
        (address receiver, bytes memory data) = abi.decode(_messageData, (address, bytes));
        (success, ) = address(receiver).call(data);
    }
}

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
        address bridger;
        uint256 claimedAt;
        uint256 claimDeposit;
        bool relayed;
    }

    struct Challenge {
        address challenger;
        uint256 challengedAt;
        uint256 challengeDeposit;
        bool relayed;
    }    

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public override claimDeposit;
    uint256 public override challengeDeposit;
    uint256 public override challengeDuration;
    uint256 public override safeBridgeTimeout;
    mapping(bytes32 => Claim) public claims; // The claims by message hash.
    mapping(bytes32 => Challenge) public challenges; // The challenges by message hash.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event ClaimReceived(bytes32 indexed messageHash, uint256 claimedAt);
    event ClaimChallenged(bytes32 indexed _messageHash, uint256 challengedAt);

    constructor(
        address _governor,
        address _safeBridgeSender,
        address _inbox,
        uint256 _claimDeposit,
        uint256 _challengeDeposit,
        uint256 _challengeDuration,
        uint256 _safeBridgeTimeout
    ) SafeBridgeReceiverOnEthereum(_governor, _safeBridgeSender, _inbox) {
        claimDeposit = _claimDeposit;
        challengeDeposit = _challengeDeposit;
        challengeDuration = _challengeDuration;
        safeBridgeTimeout - _safeBridgeTimeout;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function claim(bytes32 _messageHash) external payable override {
        require(msg.value >= claimDeposit, "Not enough claim deposit");
        require(claims[_messageHash].bridger == address(0), "Claimed already made");

        claims[_messageHash] = Claim({
            bridger: msg.sender,
            claimedAt: block.timestamp,
            claimDeposit: msg.value,
            relayed: false
        });

        emit ClaimReceived(_messageHash, block.timestamp);
    }

    function challenge(bytes32 _messageHash) external payable override {
        Claim memory claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");        
        require(block.timestamp - claim.claimedAt <  challengeDuration, "Challenge period over");
        require(msg.value >= challengeDeposit, "Not enough challenge deposit");
        require(challenges[_messageHash].challenger == address(0), "Claim already challenged");

        challenges[_messageHash] = Challenge({
            challenger: msg.sender,
            challengedAt: block.timestamp,
            challengeDeposit: msg.value,
            relayed: false
        });

        emit ClaimChallenged(_messageHash, block.timestamp);
    }

    function verifyAndRelay(bytes32 _messageHash, bytes memory _encodedData) external override {
        require(keccak256(_encodedData) == _messageHash, "Invalid hash");

        Claim storage claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");
        require(claim.claimedAt + challengeDuration < block.timestamp, "Challenge period not over");
        require(claim.relayed == false, "Message already relayed");
        require(challenges[_messageHash].challenger == address(0), "Claim is challenged");

        // Decode the receiver address from the data encoded by the IFastBridgeSender
        (address receiver, bytes memory data) = abi.decode(_encodedData, (address, bytes));
        (bool success, ) = address(receiver).call(data);
        require(success, "Failed to call contract");

        claim.relayed = true;
    }

    function verifyAndRelaySafe(bytes32 _messageHash, bytes memory _encodedData) external override {
        require(isSentBySafeBridge(), "Access not allowed: SafeBridgeSender only.");

        Challenge storage challenge = challenges[_messageHash];
        Claim storage claim = claims[_messageHash];
        require(claim.relayed != true, "Claim already relayed");
        require(challenge.relayed != true, "Challenge already relayed");

        // Decode the receiver address from the data encoded by the SafeBridgeSenderToEthereum
        (address receiver, bytes memory data) = abi.decode(_encodedData, (address, bytes));
        (bool success, ) = address(receiver).call(data);
        require(success, "Failed to call contract");

        challenge.relayed == true;
    }

    function withdrawClaimDeposit(bytes32 _messageHash) external override {
        Claim storage claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");
        require(claim.relayed == true, "Claim not relayed yet");

        uint256 amount = claim.claimDeposit;
        claim.claimDeposit = 0;
        payable(claim.bridger).send(amount);
    }

    function withdrawChallengeDeposit(bytes32 _messageHash) external override {
        Challenge storage challenge = challenges[_messageHash];
        require(challenge.challenger != address(0), "Challenge does not exist");
        require(challenge.relayed == true || block.timestamp > challenge.challengedAt + safeBridgeTimeout, "Challenge not relayed or timed out");

        uint256 amount = challenge.challengeDeposit + claims[_messageHash].claimDeposit;
        challenge.challengeDeposit = 0;
        payable(challenge.challenger).send(amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    function challengePeriod(bytes32 _messageHash) public view returns (uint256 start, uint256 end) {
        Claim storage claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");

        start = claim.claimedAt;
        end = start + challengeDuration;
        return (start, end);
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    function setClaimDeposit(uint256 _claimDeposit) external onlyByGovernor {
        claimDeposit = _claimDeposit;
    }

    function setChallengeDeposit(uint256 _challengeDeposit) external onlyByGovernor {
        challengeDeposit = _challengeDeposit;
    }

    function setChallengePeriodDuration(uint256 _challengeDuration) external onlyByGovernor {
        challengeDuration = _challengeDuration;
    }

    function setSafeBridgeTimeout(uint256 _safeBridgeTimeout) external onlyByGovernor {
        safeBridgeTimeout = _safeBridgeTimeout;
    }
}

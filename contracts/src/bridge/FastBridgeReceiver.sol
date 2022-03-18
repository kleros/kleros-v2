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
import "./interfaces/arbitrum/IInbox.sol";
import "./interfaces/arbitrum/IOutbox.sol";

contract FastBridgeReceiver is IFastBridgeReceiver {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Claim {
        address bridger;
        uint256 claimedAt;
        uint256 claimDeposit;
        bool relayed;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor;
    uint256 public override claimDeposit;
    uint256 public override challengeDeposit;
    uint256 public override challengeDuration;
    mapping(bytes32 => Claim) public claims; // The claims by message hash.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event ClaimReceived(bytes32 indexed messageHash, uint256 claimedAt);
    event ClaimChallenged(bytes32 indexed _messageHash, uint256 challengedAt);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(
        address _governor,
        uint256 _claimDeposit,
        uint256 _challengeDeposit,
        uint256 _challengeDuration
    ) {
        governor = _governor;
        claimDeposit = _claimDeposit;
        challengeDeposit = _challengeDeposit;
        challengeDuration = _challengeDuration;
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
        // TODO
        revert("Not Implemented");
    }

    function verifyAndRelay(bytes32 _messageHash, bytes memory _encodedData) external override {
        require(keccak256(_encodedData) == _messageHash, "Invalid hash");

        Claim storage claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");
        require(claim.claimedAt + challengeDuration < block.timestamp, "Challenge period not over");
        require(claim.relayed == false, "Message already relayed");

        // Decode the receiver address from the data encoded by the IFastBridgeSender
        (address receiver, bytes memory data) = abi.decode(_encodedData, (address, bytes));
        (bool success, ) = address(receiver).call(data);
        require(success, "Failed to call contract");

        claim.relayed = true;
    }

    function verifyAndRelaySafe(bytes32 _messageHash, bytes memory _encodedData) external override {
        // TODO
        revert("Not Implemented");
    }

    function withdrawClaimDeposit(bytes32 _messageHash) external override {
        Claim storage claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");
        require(claim.claimedAt + challengeDuration < block.timestamp, "Challenge period not over");

        uint256 amount = claim.claimDeposit;
        claim.claimDeposit = 0;
        payable(claim.bridger).send(amount);
    }

    function withdrawChallengeDeposit(bytes32 _messageHash) external override {
        // TODO
        revert("Not Implemented");
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
}

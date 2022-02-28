// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz, @hrishibhat]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/IFastBridgeReceiver.sol";
import "./interfaces/arbitrum/Inbox.sol";
import "./interfaces/arbitrum/Outbox.sol";

contract FastBridgeReceiver is IFastBridgeReceiver {
    IInbox public inbox;
    address public safebridge;
    address public fastBridgeSender;
    address public governor;
    uint256 public claimDeposit;
    uint256 public challengeDuration;

    struct Claim {
        address bridger;
        uint256 claimedAt;
        uint256 claimDeposit;
        bool relayed;
        bool honest;
    }

    struct Challenge {
        address challenge;
        uint256 challengedAt;        
        uint256 challengeDeposit;
        bool challenged;
        bool honest;
    }    

    // messageHash => Claim
    mapping(bytes32 => Claim) public claims;
    mapping(bytes32 => Challenge) public challenges;

    event ClaimReceived(bytes32 messageHash, uint256 claimedAt);
    event ClaimChallenged(bytes32 messageHash, uint256 challengedAt);

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(
        address _inbox,
        address _safebridge,    
        address _fastBridgeSender,
        address _governor,
        uint256 _claimDeposit,
        uint256 _challengeDuration
    ) {
        inbox = IInbox(_inbox);
        safebridge = _safebridge;
        fastBridgeSender = _fastBridgeSender;
        governor = _governor;
        claimDeposit = _claimDeposit;
        challengeDuration = _challengeDuration;
    }

    function claim(bytes32 _messageHash) external payable {
        require(msg.value >= claimDeposit, "Not enough claim deposit");
        require(claims[_messageHash].bridger == address(0), "Claimed already made");

        claims[_messageHash] = Claim({
            bridger: msg.sender,
            claimedAt: block.timestamp,
            claimDeposit: msg.value,
            honest: false,
            relayed: false
        });

        emit ClaimReceived(_messageHash, block.timestamp);
    }

    function verifyAndRelay(bytes32 _messageHash, bytes memory _encodedData) external {

        Claim storage claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");
        require(claim.claimedAt + challengeDuration < block.timestamp, "Challenge period not over");
        require(claim.relayed == false, "Message already relayed");

        Challenge storage challenge = challenges[_messageHash];
        if(challenge.challenged == true){
            if(keccak256(_encodedData) == _messageHash){
                challenge.honest == false;
                claim.honest == true;
                // Decode the receiver address from the data encoded by the IFastBridgeSender
                (address receiver, bytes memory data) = abi.decode(_encodedData, (address, bytes));
                (bool success, ) = address(receiver).call(data);
                require(success, "Failed to call contract");

                claim.relayed = true;    
            }
            else{
                challenge.honest == true;
                claim.honest == false;                
            }
        }
    }

    function relayRule(bytes memory _encodedData) external {  
        IBridge bridge = inbox.bridge();
        require(msg.sender == address(bridge), "Not called by the Bridge");

        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        address l2Sender = outbox.l2ToL1Sender();
        require(l2Sender == safebridge, "Can be relayed only by Safe Bridge");

        Challenge storage challenge = challenges[_messageHash];
        Claim storage claim = claims[_messageHash];

        require(challenge.honest == true, "This claim is not challenged");

        if(keccak256(_encodedData) == _messageHash){
            challenge.honest == false;
            claim.honest == true;
            // Decode the receiver address from the data encoded by the IFastBridgeSender
            (address receiver, bytes memory data) = abi.decode(_encodedData, (address, bytes));
            (bool success, ) = address(receiver).call(data);
            require(success, "Failed to call contract");

            claim.relayed = true;    
        }
    }

    function withdrawClaimDeposit(bytes32 _messageHash) external {
        Claim storage claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");
        require(claim.claimedAt + challengeDuration < block.timestamp, "Challenge period not over");
        require(claim.relayed == true, "Claim not relayed");

        Challenge storage challenge = challenges[_messageHash];
        uint256 amount = claim.claimDeposit;
        if(challenge.honest == false){
            amount += challenge.challengeDeposit;
            challenge.challengeDeposit = 0;
        }

        claim.claimDeposit = 0;
        payable(claim.bridger).send(amount);
    }

    function challenge(bytes32 _messageHash) external payable {
        Claim storage claim = claims[_messageHash];
        require(claim.bridger != address(0), "Claim does not exist");        
        require(block.timestamp - claim.claimedAt <  challengeDuration, "Challenge period over");
        require(msg.value >= challengeDeposit, "Not enough challenge deposit");
        require(challenges[_messageHash].challenger == address(0), "Claim already challenged");

        challenges[_messageHash] = Challenge({
            challenger: msg.sender,
            challengedAt: block.timestamp,
            challengeDeposit: msg.value,
            challenged: true,
            honest: false
        });

        emit ClaimChallenged(_messageHash, block.timestamp);
    
    }

    function withdrawChallengeDeposit(bytes32 _messageHash) external {
        Challenge storage challenge = challenges[_messageHash];
        require(challenge.challenger != address(0), "Challenge does not exist");
        require(challenge.honest == true, "Challenge not honest");

        Claim storage claim = claims[_messageHash];
        require(block.timestamp > claim.claimedAt + challengeDuration, "Challenge period not over");
        require(claim.relayed == true, "Claim not relayed");

        uint256 amount = challenge.challengeDeposit;
        if(claim.honest == false){
            amount += claim.claimDeposit;
            claim.claimDeposit = 0;
        }

        challenge.challengeDeposit = 0;
        payable(challenge.challenger).send(amount);
    }
     //**** View Functions ****//
    function challengePeriod(bytes messageHash) public view returns(uint start, uint end) {
        start = claims[_messageHash].claimedAt;
        end = start + challengeDuration;
        return (start, end);
    }
    //**** Governor functions ****//

    function setClaimDeposit(uint256 _claimDeposit) external onlyByGovernor {
        claimDeposit = _claimDeposit;
    }

    function setChallengePeriodDuration(uint256 _challengeDuration) external onlyByGovernor {
        challengeDuration = _challengeDuration;
    }
}

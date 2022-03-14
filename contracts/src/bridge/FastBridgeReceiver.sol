// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz*, @hrishibhat*, @shotaronowhere]
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
    uint256 public challengeDeposit;
    uint256 public challengeDuration;

    struct Claim {
        address bridger;
        bytes32 messageHash;
        uint256 claimedAt;
        uint256 claimDeposit;
        bool honest;
    }

    struct Challenge {
        address challenger;
        uint256 challengedAt;        
        uint256 challengeDeposit;
        bool honest;
    }    

    // fastMessageIndex => Claim[]
    mapping(uint256 => Claim[]) public claims;
    mapping(uint256 => Challenge[]) public challenges;
    mapping(uint256 => bool) public relayed;

    event ClaimReceived(uint256 _fastMessageIndex, bytes32 _messageHash, uint256 claimedAt);
    event ClaimChallenged(uint256 _fastMessageIndex, uint256 _claimIndex, bytes32 _messageHash, uint256 challengedAt);

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

    function claim(uint256 _fastMessageIndex, bytes32 _messageHash) external payable override {
        require(msg.value >= claimDeposit, "Not enough claim deposit");
        require(relayed[_fastMessageIndex] == false, "Message already relayed.");
        // only accept additional claims if the previous claims are successfully challenged
        // AND the message is not yet relayed
        require(claims[_fastMessageIndex].length == 0 || challenges[_fastMessageIndex][claims[_fastMessageIndex].length-1].honest, "There is a previous unresolved claim");

        claims[_fastMessageIndex].push( Claim({
            bridger: msg.sender,
            messageHash: _messageHash,
            claimedAt: block.timestamp,
            claimDeposit: msg.value,
            honest: false
        }));

        emit ClaimReceived(_fastMessageIndex, _messageHash, block.timestamp);
    }

    function verifyAndRelay(uint _fastMessageIndex, bytes memory _encodedData) external override{

        Claim[] storage claimsForIndex = claims[_fastMessageIndex];
        require(claimsForIndex.length>0, "Claim does not exist");


        require(claimsForIndex[claimsForIndex.length-1].claimedAt + challengeDuration < block.timestamp, "Challenge period not over");
        require(relayed[_fastMessageIndex] == false, "Message already relayed");

        Challenge[] storage challengesForIndex = challenges[_fastMessageIndex];

        require(challengesForIndex.length<claimsForIndex.length, "This claim is Challenged");

        if(keccak256(_encodedData) == claimsForIndex[claimsForIndex.length-1].messageHash){
            claimsForIndex[claimsForIndex.length-1].honest = true;
            // Decode the receiver address from the data encoded by the IFastBridgeSender
            (address receiver, bytes memory data) = abi.decode(_encodedData, (address, bytes));
            (bool success, ) = address(receiver).call(data);
            require(success, "Failed to call contract");

            relayed[_fastMessageIndex] = true;    
        }
        
    }

    function relayRule(bytes memory _encodedData) external override{  
        IBridge bridge = inbox.bridge();
        require(msg.sender == address(bridge), "Not called by the Bridge");

        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        address l2Sender = outbox.l2ToL1Sender();
        require(l2Sender == safebridge, "Can be relayed only by Safe Bridge");

        (uint256 _fastMessageIndex, bytes memory dataWithReceiver) = abi.decode(_encodedData, (uint256, bytes));
        bytes32 messageHash = keccak256(dataWithReceiver);

        require(relayed[_fastMessageIndex] != true, "Claim already relayed");

        Claim[] storage claimsForIndex = claims[_fastMessageIndex];
        Challenge[] storage challengesForIndex = challenges[_fastMessageIndex];

        if (claimsForIndex.length > 0){
            // has claims
            if (claimsForIndex[claimsForIndex.length-1].messageHash == messageHash){
                claimsForIndex[claimsForIndex.length-1].honest = true;
            } else if(challengesForIndex.length > 0){
                // has challenges
                challengesForIndex[challengesForIndex.length - 1].honest = true;
            } 
        } else{
            // no claims, no challenges
        }
        // dispute ruled
        if (dataWithReceiver.length != 0){
            // Decode the receiver address from the data encoded by the IFastBridgeSender
            (address receiver, bytes memory data) = abi.decode(dataWithReceiver, (address, bytes));
            (bool success, ) = address(receiver).call(data);
            require(success, "Failed to call contract");

            relayed[_fastMessageIndex] = true;
        } 
            
        
    }

    function withdrawClaimDeposit(uint256 _fastMessageIndex) external override{
        Claim[] storage claimsForIndex = claims[_fastMessageIndex];
        require(claimsForIndex.length>0, "Claim does not exist");


        require(claimsForIndex[claimsForIndex.length-1].claimedAt + challengeDuration < block.timestamp, "Challenge period not over");
        require(relayed[_fastMessageIndex] == true, "Claim not relayed");

        Challenge[] storage challengesForIndex = challenges[_fastMessageIndex];

        uint256 amount = 0;
        if(claimsForIndex[claimsForIndex.length-1].honest == true){
            amount += claimsForIndex[claimsForIndex.length-1].claimDeposit;
                if(challengesForIndex.length == claimsForIndex.length){
                    if(challengesForIndex[challengesForIndex.length - 1].honest == false){
                    amount += challengesForIndex[challengesForIndex.length - 1].challengeDeposit;
                    challengesForIndex[challengesForIndex.length - 1].challengeDeposit = 0;
                }
            }
        }

        claimsForIndex[claimsForIndex.length-1].claimDeposit = 0;
        payable(claimsForIndex[claimsForIndex.length-1].bridger).send(amount);
    }

    function challenge(uint256 _fastMessageIndex) external payable {
        Claim[] memory claimsForIndex = claims[_fastMessageIndex];
        require(claimsForIndex.length > 0, "Claim does not exist");        
        require(relayed[_fastMessageIndex] == false, "Message already relayed");        
        require(block.timestamp - claimsForIndex[claimsForIndex.length-1].claimedAt <  challengeDuration, "Challenge period over");
        require(msg.value >= challengeDeposit, "Not enough challenge deposit");
        require(challenges[_fastMessageIndex].length < claimsForIndex.length, "Claim already challenged");

        challenges[_fastMessageIndex].push(Challenge({
            challenger: msg.sender,
            challengedAt: block.timestamp,
            challengeDeposit: msg.value,
            honest: false
        }));

        emit ClaimChallenged(_fastMessageIndex,claimsForIndex.length-1, claimsForIndex[claimsForIndex.length-1].messageHash, block.timestamp);
    }

    function withdrawChallengeDeposit(uint256 _fastMessageIndex, uint256 challengeIndex) external {
        Challenge[] storage challengesForIndex = challenges[_fastMessageIndex];
        require(challengesForIndex.length>0 && challengeIndex < challengesForIndex.length, "Challenge does not exist");

        Claim[] storage claimsForIndex = claims[_fastMessageIndex];

        uint256 amount = 0;
        if(challengesForIndex[challengeIndex].honest == true){
            amount += challengesForIndex[challengeIndex].challengeDeposit;
            if(claimsForIndex[challengeIndex].honest == false){
                amount += claimsForIndex[challengeIndex].claimDeposit;
                claimsForIndex[challengeIndex].claimDeposit = 0;
            }
        }


        challengesForIndex[challengeIndex].challengeDeposit = 0;
        payable(challengesForIndex[challengeIndex].challenger).send(amount);
    }
     //**** View Functions ****//
    function challengePeriod(uint256 _fastMessageIndex) public view returns(uint start, uint end) {
        if (claims[_fastMessageIndex].length > 0){
            start = claims[_fastMessageIndex][claims[_fastMessageIndex].length-1].claimedAt;
            end = start + challengeDuration;
        }
       
        return (start, end);
    }

    //**** Governor functions ****//

    function setClaimDeposit(uint256 _claimDeposit) external onlyByGovernor {
        claimDeposit = _claimDeposit;
    }
    //TODO
    function viewClaimDeposit() external override view returns (uint256 amount){
        return 0;
    }

    function setChallengePeriodDuration(uint256 _challengeDuration) external onlyByGovernor {
        challengeDuration = _challengeDuration;
    }
}

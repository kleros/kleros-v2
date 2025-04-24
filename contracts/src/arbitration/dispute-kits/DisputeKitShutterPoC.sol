// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract DisputeKitShutterPoC {
    struct Vote {
        address account; // The address of the juror.
        bytes commit; // The commit of the juror. For courts with hidden votes.
        bytes32 identity; // The Shutter identity.
        uint256 choice; // The choice of the juror.
        bool voted; // True if the vote has been cast.
    }

    address public revealer;
    Vote[] public votes;
    uint256 public winningChoice; // The choice with the most votes. Note that in the case of a tie, it is the choice that reached the tied number of votes first.
    mapping(uint256 => uint256) public counts; // The sum of votes for each choice in the form `counts[choice]`.
    bool public tied; // True if there is a tie, false otherwise.
    uint256 public totalCommitted;
    uint256 public totalVoted;

    event CommitCast(
        uint256 indexed _coreDisputeID,
        address indexed _juror,
        uint256[] _voteIDs,
        bytes _commit,
        bytes32 _identity
    );

    event VoteCast(
        uint256 indexed _coreDisputeID,
        address indexed _juror,
        uint256[] _voteIDs,
        uint256 indexed _choice,
        string _justification
    );

    constructor() {
        revealer = msg.sender;
        address juror = msg.sender;
        votes.push(Vote({account: juror, commit: bytes(""), identity: bytes32(0), choice: 0, voted: false}));
    }

    function castCommit(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes calldata _commit,
        bytes32 _identity
    ) external {
        // Store the commitment and identity for each voteID
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            console.log("votes[_voteIDs[i]].account:", votes[_voteIDs[i]].account);
            console.log("msg.sender:", msg.sender);
            require(votes[_voteIDs[i]].account == msg.sender, "The caller has to own the vote.");
            votes[_voteIDs[i]].commit = _commit;
            votes[_voteIDs[i]].identity = _identity;
        }

        totalCommitted += _voteIDs.length;
        emit CommitCast(_coreDisputeID, msg.sender, _voteIDs, _commit, _identity);
    }

    function castVote(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        string memory _justification,
        bytes32 _identity
    ) external {
        require(_voteIDs.length > 0, "No voteID provided");
        require(revealer == msg.sender, "The caller has to own the vote.");
        // TODO: what happens if hiddenVotes are not enabled?
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            // Not useful to check the identity here?
            require(votes[_voteIDs[i]].identity == _identity, "The identity has to match the commitment.");

            require(!votes[_voteIDs[i]].voted, "Vote already cast.");
            votes[_voteIDs[i]].choice = _choice;
            votes[_voteIDs[i]].voted = true;
        }

        totalVoted += _voteIDs.length;

        counts[_choice] += _voteIDs.length;
        if (_choice == winningChoice) {
            if (tied) tied = false;
        } else {
            // Voted for another choice.
            if (counts[_choice] == counts[winningChoice]) {
                // Tie.
                if (!tied) tied = true;
            } else if (counts[_choice] > counts[winningChoice]) {
                // New winner.
                winningChoice = _choice;
                tied = false;
            }
        }
        emit VoteCast(_coreDisputeID, msg.sender, _voteIDs, _choice, _justification);
    }

    function maxVoteIDs() public view returns (uint256) {
        return votes.length - 1;
    }
}

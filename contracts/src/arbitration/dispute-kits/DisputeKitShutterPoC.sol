// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract DisputeKitShutterPoC {
    struct Vote {
        address account; // The address of the juror.
        bytes32 commit; // The hash of the encrypted message + salt
        uint256 choice; // The choice of the juror.
        bool voted; // True if the vote has been cast.
    }

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
        bytes32 _commit,
        bytes32 _identity,
        bytes _encryptedVote
    );

    event VoteCast(
        uint256 indexed _coreDisputeID,
        address indexed _juror,
        uint256[] _voteIDs,
        uint256 indexed _choice,
        string _justification
    );

    constructor() {
        address juror = msg.sender;
        votes.push(Vote({account: juror, commit: bytes32(0), choice: 0, voted: false}));
        votes.push(Vote({account: juror, commit: bytes32(0), choice: 0, voted: false}));
        votes.push(Vote({account: juror, commit: bytes32(0), choice: 0, voted: false}));
    }

    /**
     * @dev Computes the hash of a vote using ABI encoding
     * @param _choice The choice being voted for
     * @param _justification The justification for the vote
     * @param _salt A random salt for commitment
     * @return bytes32 The hash of the encoded vote parameters
     */
    function hashVote(uint256 _choice, bytes32 _salt, string memory _justification) public pure returns (bytes32) {
        bytes32 justificationHash = keccak256(bytes(_justification));
        return keccak256(abi.encode(_choice, _salt, justificationHash));
    }

    function castCommit(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes32 _commit,
        bytes32 _identity,
        bytes calldata _encryptedVote
    ) external {
        // Store the commitment hash for each voteID
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(votes[_voteIDs[i]].account == msg.sender, "The caller has to own the vote.");
            votes[_voteIDs[i]].commit = _commit;
        }

        totalCommitted += _voteIDs.length;
        emit CommitCast(_coreDisputeID, msg.sender, _voteIDs, _commit, _identity, _encryptedVote);
    }

    function castVote(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        bytes32 _salt,
        string memory _justification
    ) external {
        require(_voteIDs.length > 0, "No voteID provided");

        // TODO: what happens if hiddenVotes are not enabled?

        // Verify the commitment hash for all votes at once
        bytes32 computedHash = hashVote(_choice, _salt, _justification);

        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(votes[_voteIDs[i]].commit == computedHash, "The commitment hash does not match.");
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
}

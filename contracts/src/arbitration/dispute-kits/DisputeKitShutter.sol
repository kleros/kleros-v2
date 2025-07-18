// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";

/// @title DisputeKitShutter
/// Dispute kit implementation of the Kleros v1 features including:
/// - a drawing system: proportional to staked PNK,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
/// Added functionality: an Shutter-specific event emitted when a vote is cast.
contract DisputeKitShutter is DisputeKitClassicBase {
    string public constant override version = "0.11.1";

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev Emitted when a vote is cast.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _juror The address of the juror casting the vote commitment.
    /// @param _commit The commitment hash.
    /// @param _identity The Shutter identity used for encryption.
    /// @param _encryptedVote The Shutter encrypted vote.
    event CommitCastShutter(
        uint256 indexed _coreDisputeID,
        address indexed _juror,
        bytes32 indexed _commit,
        bytes32 _identity,
        bytes _encryptedVote
    );

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer.
    /// @param _governor The governor's address.
    /// @param _core The KlerosCore arbitrator.
    function initialize(address _governor, KlerosCore _core) external reinitializer(1) {
        __DisputeKitClassicBase_initialize(_governor, _core);
    }

    function initialize8() external reinitializer(8) {
        // NOP
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Sets the caller's commit for the specified votes. It can be called multiple times during the
    /// commit period, each call overrides the commits of the previous one.
    /// `O(n)` where
    /// `n` is the number of votes.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _commit The commitment hash including the justification.
    /// @param _identity The Shutter identity used for encryption.
    /// @param _encryptedVote The Shutter encrypted vote.
    function castCommitShutter(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes32 _commit,
        bytes32 _identity,
        bytes calldata _encryptedVote
    ) external notJumped(_coreDisputeID) {
        _castCommit(_coreDisputeID, _voteIDs, _commit);
        emit CommitCastShutter(_coreDisputeID, msg.sender, _commit, _identity, _encryptedVote);
    }

    function castVoteShutter(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        uint256 _salt,
        string memory _justification
    ) external {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        address juror = dispute.rounds[dispute.rounds.length - 1].votes[_voteIDs[0]].account;

        // _castVote() ensures that all the _voteIDs do belong to `juror`
        _castVote(_coreDisputeID, _voteIDs, _choice, _salt, _justification, juror);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     * @dev Computes the hash of a vote using ABI encoding
     * @param _choice The choice being voted for
     * @param _justification The justification for the vote
     * @param _salt A random salt for commitment
     * @return bytes32 The hash of the encoded vote parameters
     */
    function hashVote(
        uint256 _choice,
        uint256 _salt,
        string memory _justification
    ) public pure override returns (bytes32) {
        bytes32 justificationHash = keccak256(bytes(_justification));
        return keccak256(abi.encode(_choice, _salt, justificationHash));
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";

/// @title DisputeKitShutter
/// @notice Added functionality: shielded voting.
/// Dispute kit implementation of the Kleros v1 features including:
/// - a drawing system: proportional to staked PNK,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitShutter is DisputeKitClassicBase {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    mapping(uint256 localDisputeID => mapping(uint256 localRoundID => mapping(uint256 voteID => bytes32 recoveryCommitment)))
        public recoveryCommitments;

    // ************************************* //
    // *        Transient Storage          * //
    // ************************************* //

    bool transient callerIsJuror;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a vote is cast.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _juror The address of the juror casting the vote commitment.
    /// @param _commit The commitment hash.
    /// @param _recoveryCommit The commitment hash without the justification.
    /// @param _identity The Shutter identity used for encryption.
    /// @param _encryptedVote The Shutter encrypted vote.
    event CommitCastShutter(
        uint256 indexed _coreDisputeID,
        address indexed _juror,
        bytes32 indexed _commit,
        bytes32 _recoveryCommit,
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

    /// @notice Initializer.
    /// @param _owner The owner's address.
    /// @param _core The KlerosCore arbitrator.
    /// @param _wNative The wrapped native token address, typically wETH.
    /// @param _jumpDisputeKitID The ID of the dispute kit to switch to after the court jump.
    function initialize(
        address _owner,
        KlerosCore _core,
        address _wNative,
        uint256 _jumpDisputeKitID
    ) external initializer {
        __DisputeKitClassicBase_initialize(_owner, _core, _wNative, _jumpDisputeKitID);
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Sets the caller's commit for the specified votes.
    ///
    /// @dev It can be called multiple times during the commit period, each call overrides the commits of the previous one.
    /// `O(n)` where `n` is the number of votes.
    ///
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _commit The commitment hash including the justification.
    /// @param _recoveryCommit The commitment hash without the justification.
    /// @param _identity The Shutter identity used for encryption.
    /// @param _encryptedVote The Shutter encrypted vote.
    function castCommitShutter(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes32 _commit,
        bytes32 _recoveryCommit,
        bytes32 _identity,
        bytes calldata _encryptedVote
    ) external isActive(_coreDisputeID) {
        if (_recoveryCommit == bytes32(0)) revert EmptyRecoveryCommit();

        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        uint256 localRoundID = dispute.rounds.length - 1;
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            recoveryCommitments[localDisputeID][localRoundID][_voteIDs[i]] = _recoveryCommit;
        }

        // `_castCommit()` ensures that the caller owns the vote
        _castCommit(_coreDisputeID, _voteIDs, _commit);
        emit CommitCastShutter(_coreDisputeID, msg.sender, _commit, _recoveryCommit, _identity, _encryptedVote);
    }

    /// @notice Version of `castVote` function designed specifically for Shutter.
    /// @dev `O(n)` where `n` is the number of votes.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _choice The choice.
    /// @param _salt The salt for the commit if the votes were hidden.
    /// @param _justification Justification of the choice.
    function castVoteShutter(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        uint256 _salt,
        string memory _justification
    ) external {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        address juror = dispute.rounds[dispute.rounds.length - 1].votes[_voteIDs[0]].account;

        callerIsJuror = juror == msg.sender;

        // `_castVote()` ensures that all the `_voteIDs` do belong to `juror`
        _castVote(_coreDisputeID, _voteIDs, _choice, _salt, _justification, juror);

        callerIsJuror = false;
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Computes the hash of a vote using ABI encoding
    /// @param _choice The choice being voted for
    /// @param _salt A random salt for commitment
    /// @param _justification The justification for the vote
    /// @return bytes32 The hash of the encoded vote parameters
    function hashVote(
        uint256 _choice,
        uint256 _salt,
        string memory _justification
    ) public view override returns (bytes32) {
        if (callerIsJuror) {
            // Caller is the juror, hash without `_justification` to facilitate recovery.
            return keccak256(abi.encodePacked(_choice, _salt));
        } else {
            // Caller is not the juror, hash with `_justification`.
            bytes32 justificationHash = keccak256(bytes(_justification));
            return keccak256(abi.encode(_choice, _salt, justificationHash));
        }
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @notice Returns the expected vote hash for a given vote.
    /// @param _localDisputeID The ID of the dispute in the Dispute Kit.
    /// @param _localRoundID The ID of the round in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @return The expected vote hash.
    function _getExpectedVoteHash(
        uint256 _localDisputeID,
        uint256 _localRoundID,
        uint256 _voteID
    ) internal view override returns (bytes32) {
        if (callerIsJuror) {
            return recoveryCommitments[_localDisputeID][_localRoundID][_voteID];
        } else {
            return disputes[_localDisputeID].rounds[_localRoundID].votes[_voteID].commit;
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error EmptyRecoveryCommit();
}

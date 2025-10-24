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

    mapping(uint256 localDisputeID => mapping(uint256 localRoundID => mapping(uint256 voteID => bytes32 justificationCommitment)))
        public justificationCommitments;

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
    /// @param _choiceCommit The commitment hash without the justification.
    /// @param _justificationCommit The commitment hash for the justification.
    /// @param _identity The Shutter identity used for encryption.
    /// @param _encryptedVote The Shutter encrypted vote.
    event CommitCastShutter(
        uint256 indexed _coreDisputeID,
        address indexed _juror,
        bytes32 indexed _choiceCommit,
        bytes32 _justificationCommit,
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
    function initialize(address _owner, KlerosCore _core, address _wNative) external initializer {
        __DisputeKitClassicBase_initialize(_owner, _core, _wNative);
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
    /// @param _choiceCommit The commitment hash without the justification.
    /// @param _justificationCommit The commitment hash for justification.
    /// @param _identity The Shutter identity used for encryption.
    /// @param _encryptedVote The Shutter encrypted vote.
    function castCommitShutter(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes32 _choiceCommit,
        bytes32 _justificationCommit,
        bytes32 _identity,
        bytes calldata _encryptedVote
    ) external {
        if (_justificationCommit == bytes32(0)) revert EmptyJustificationCommit();

        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        uint256 localRoundID = dispute.rounds.length - 1;
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            justificationCommitments[localDisputeID][localRoundID][_voteIDs[i]] = _justificationCommit;
        }

        // `_castCommit()` ensures that the caller owns the vote and that dispute is active
        _castCommit(_coreDisputeID, _voteIDs, _choiceCommit);
        emit CommitCastShutter(
            _coreDisputeID,
            msg.sender,
            _choiceCommit,
            _justificationCommit,
            _identity,
            _encryptedVote
        );
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

    /// @notice Computes the hash of a justification using ABI encoding
    /// @param _salt A random salt for commitment
    /// @param _justification The justification for the vote
    /// @return bytes32 The hash of the encoded justification
    function hashJustification(uint256 _salt, string memory _justification) public pure returns (bytes32) {
        return keccak256(abi.encode(_salt, keccak256(bytes(_justification))));
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @inheritdoc DisputeKitClassicBase
    function _verifyHiddenVoteCommitments(
        uint256 _localDisputeID,
        uint256 _localRoundID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        string memory _justification,
        uint256 _salt
    ) internal view override {
        super._verifyHiddenVoteCommitments(_localDisputeID, _localRoundID, _voteIDs, _choice, _justification, _salt);

        // The juror is allowed to reveal without verifying the justification commitment for recovery purposes.
        if (callerIsJuror) return;

        bytes32 actualJustificationHash = hashJustification(_salt, _justification);
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            if (justificationCommitments[_localDisputeID][_localRoundID][_voteIDs[i]] != actualJustificationHash)
                revert JustificationCommitmentMismatch();
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error EmptyJustificationCommit();
    error JustificationCommitmentMismatch();
}

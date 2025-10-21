// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";

interface IBalanceHolder {
    /// @notice Returns the number of tokens in `owner` account.
    /// @dev Compatible with ERC-20 and ERC-721.
    /// @param owner The address of the owner.
    /// @return balance The number of tokens in `owner` account.
    function balanceOf(address owner) external view returns (uint256 balance);
}

interface IBalanceHolderERC1155 {
    /// @notice Returns the balance of an ERC-1155 token.
    /// @param account The address of the token holder
    /// @param id ID of the token
    /// @return The token balance
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

/// @title DisputeKitGatedShutter
/// @notice Added functionality: shielded voting.
/// Dispute kit implementation adapted from DisputeKitClassic
/// - a drawing system: proportional to staked PNK with a non-zero balance of `tokenGate` where `tokenGate` is an ERC20, ERC721 or ERC1155
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitGatedShutter is DisputeKitClassicBase {
    string public constant override version = "2.0.0";

    address private constant NO_TOKEN_GATE = address(0);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    mapping(address token => bool supported) public supportedTokens; // Whether the token is supported or not.
    mapping(uint256 localDisputeID => mapping(uint256 localRoundID => mapping(uint256 voteID => bytes32 justificationCommitment)))
        public justificationCommitments;

    // ************************************* //
    // *        Transient Storage          * //
    // ************************************* //

    bool transient callerIsJuror;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev Emitted when a vote is cast.
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
        supportedTokens[NO_TOKEN_GATE] = true; // Allows disputes without token gating
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @notice Changes the supported tokens.
    /// @param _tokens The tokens to support.
    /// @param _supported Whether the tokens are supported or not.
    function changeSupportedTokens(address[] memory _tokens, bool _supported) external onlyByOwner {
        for (uint256 i = 0; i < _tokens.length; i++) {
            supportedTokens[_tokens[i]] = _supported;
        }
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc DisputeKitClassicBase
    function createDispute(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _numberOfChoices,
        bytes calldata _extraData,
        uint256 _nbVotes
    ) public override {
        (address tokenGate, , ) = _extraDataToTokenInfo(_extraData);
        if (!supportedTokens[tokenGate]) revert TokenNotSupported(tokenGate);

        // super.createDispute() ensures access control onlyByCore.
        super.createDispute(_coreDisputeID, _coreRoundID, _numberOfChoices, _extraData, _nbVotes);
    }

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

    /// @notice Version of the `castVote` function designed specifically for Shutter.
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

    /// @notice Extracts token gating information from the extra data.
    /// @param _extraData The extra data bytes array with the following encoding:
    /// - bytes 0-31: uint96 courtID, not used here
    /// - bytes 32-63: uint256 minJurors, not used here
    /// - bytes 64-95: uint256 disputeKitID, not used here
    /// - bytes 96-127: uint256 packedTokenGateAndFlag (address tokenGate in bits 0-159, bool isERC1155 in bit 160)
    /// - bytes 128-159: uint256 tokenId
    /// @return tokenGate The address of the token contract used for gating access.
    /// @return isERC1155 True if the token is an ERC-1155, false for ERC-20/ERC-721.
    /// @return tokenId The token ID for ERC-1155 tokens (ignored for ERC-20/ERC-721).
    function _extraDataToTokenInfo(
        bytes memory _extraData
    ) internal pure returns (address tokenGate, bool isERC1155, uint256 tokenId) {
        // Need at least 160 bytes to safely read the parameters
        if (_extraData.length < 160) return (address(0), false, 0);

        assembly {
            // solium-disable-line security/no-inline-assembly
            let packedTokenGateIsERC1155 := mload(add(_extraData, 0x80)) // 4th parameter at offset 128
            tokenId := mload(add(_extraData, 0xA0)) // 5th parameter at offset 160 (moved up)

            // Unpack address from lower 160 bits and bool from bit 160
            tokenGate := and(packedTokenGateIsERC1155, 0xffffffffffffffffffffffffffffffffffffffff)
            isERC1155 := and(shr(160, packedTokenGateIsERC1155), 1)
        }
    }

    /// @inheritdoc DisputeKitClassicBase
    function _postDrawCheck(
        Round storage _round,
        uint256 _coreDisputeID,
        address _juror
    ) internal view override returns (bool) {
        if (!super._postDrawCheck(_round, _coreDisputeID, _juror)) return false;

        // Get the local dispute and extract token info from extraData
        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        (address tokenGate, bool isERC1155, uint256 tokenId) = _extraDataToTokenInfo(dispute.extraData);

        // If no token gate is specified, allow all jurors
        if (tokenGate == NO_TOKEN_GATE) return true;

        // Check juror's token balance
        if (isERC1155) {
            return IBalanceHolderERC1155(tokenGate).balanceOf(_juror, tokenId) > 0;
        } else {
            return IBalanceHolder(tokenGate).balanceOf(_juror) > 0;
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error TokenNotSupported(address tokenGate);
    error EmptyJustificationCommit();
    error JustificationCommitmentMismatch();
}

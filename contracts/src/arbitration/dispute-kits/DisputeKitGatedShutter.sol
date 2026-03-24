// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {Initializable} from "../../proxy/Initializable.sol";
import {UUPSProxiable} from "../../proxy/UUPSProxiable.sol";
import {SafeSend} from "../../libraries/SafeSend.sol";
import {ONE_BASIS_POINT} from "../../libraries/Constants.sol";
import {KlerosCore} from "../KlerosCore.sol";
import {ICourtEligibility} from "../interfaces/ICourtEligibility.sol";

interface IBalanceHolder {
    /// @notice Returns the number of tokens in `owner` account.
    /// @dev Compatible with ERC-721.
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
/// - a drawing system: proportional to staked PNK with a non-zero balance of `tokenGate` where `tokenGate` is ERC721 or ERC1155
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitGatedShutter is IDisputeKit, Initializable, UUPSProxiable, ICourtEligibility {
    string public constant override version = "2.0.0";

    using SafeSend for address payable;

    // ************************************* //
    // *             Structs               * //
    // ************************************* //

    struct Dispute {
        Round[] rounds; // Rounds of the dispute. 0 is the default round, and [1, ..n] are the appeal rounds.
        uint256 numberOfChoices; // The number of choices jurors have when voting. This does not include choice `0` which is reserved for "refuse to arbitrate".
        mapping(uint256 => uint256) coreRoundIDToLocal; // Maps id of the round in the core contract to the index of the round of related local dispute.
        bytes extraData; // Extradata for the dispute.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct Round {
        Vote[] votes; // Former votes[_appeal][].
        uint256 winningChoice; // The choice with the most votes. Note that in the case of a tie, it is the choice that reached the tied number of votes first.
        mapping(uint256 => uint256) counts; // The sum of votes for each choice in the form `counts[choice]`.
        bool tied; // True if there is a tie, false otherwise.
        uint256 totalVoted; // Former uint[_appeal] votesInEachRound.
        uint256 totalCommitted; // Former commitsInRound.
        mapping(uint256 choiceId => uint256) paidFees; // Tracks the fees paid for each choice in this round.
        mapping(uint256 choiceId => bool) hasPaid; // True if this choice was fully funded, false otherwise.
        mapping(address account => mapping(uint256 choiceId => uint256)) contributions; // Maps contributors to their contributions for each choice.
        uint256 feeRewards; // Sum of reimbursable appeal fees available to the parties that made contributions to the ruling that ultimately wins a dispute.
        uint256[] fundedChoices; // Stores the choices that are fully funded.
        mapping(address drawnAddress => bool) alreadyDrawn; // True if the address has already been drawn, false by default.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct Vote {
        bool voted; // True if the vote has been cast.
        address account; // The address of the juror.
        bytes32 commit; // The commit of the juror. For courts with hidden votes.
        uint256 choice; // The choice of the juror.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct Active {
        bool dispute; // True if at least one round in the dispute has been active on this Dispute Kit. False if the dispute is unknown to this Dispute Kit.
        bool currentRound; // True if the dispute's current round is active on this Dispute Kit. False if the dispute has jumped to another Dispute Kit.
    }

    struct NextRoundSettings {
        bool enabled; // True if the settings are enabled, false otherwise.
        uint96 jumpCourtID; // A non-zero value makes the next round use this court ID. Zero is considered as undefined.
        uint256 jumpDisputeKitID; // A non-zero value makes the next round use this dispute kit ID. Zero is considered as undefined.
        uint256 jumpDisputeKitIDOnCourtJump; // A non-zero value makes the next round use this dispute kit ID ONLY IF the court jumps and `jumpDisputeKitID` is undefined. Zero is considered as undefined.
        uint256 nbVotes; // A non-zero value makes the next round use this number of votes. Zero is considered as undefined.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant WINNER_STAKE_MULTIPLIER = 10000; // Multiplier of the appeal cost that the winner has to pay as fee stake for a round in basis points. Default is 1x of appeal fee.
    uint256 public constant LOSER_STAKE_MULTIPLIER = 20000; // Multiplier of the appeal cost that the loser has to pay as fee stake for a round in basis points. Default is 2x of appeal fee.
    uint256 public constant LOSER_APPEAL_PERIOD_MULTIPLIER = 5000; // Multiplier of the appeal period for the choice that wasn't voted for in the previous round, in basis points. Default is 1/2 of original appeal period.

    address public owner; // The owner of the contract.
    KlerosCore public core; // The Kleros Core arbitrator
    Dispute[] public disputes; // Array of the locally created disputes.
    mapping(uint256 coreDisputeID => uint256 localDisputeID) public coreDisputeIDToLocal; // Maps the dispute ID in Kleros Core to the local dispute ID.
    mapping(uint256 coreDisputeID => Active) public coreDisputeIDToActive; // Active status of the dispute and the current round.
    mapping(uint96 currentCourtID => NextRoundSettings) public courtIDToNextRoundSettings; // The settings for the next round.
    bool public singleDrawPerJuror; // Whether each juror can only draw once per round, false by default.
    address public wNative; // The wrapped native token for safeSend().

    uint256[50] private __gap; // Reserved slots for future upgrades.

    mapping(uint96 courtID => address[] tokens) public supportedErc721Tokens; // Supported ERC-721 token gates.
    mapping(uint96 courtID => mapping(address token => uint256 index)) public erc721TokenToIndex; // Index of the ERC-721 token in supported tokens array. Starts with 1.

    mapping(uint96 courtID => address[] tokens) public supportedErc1155Tokens; // Supported ERC-1155 token gates.
    mapping(uint96 courtID => mapping(address token => uint256 index)) public erc1155TokenToIndex; // Index of the ERC-1155 token in supported tokens array. Starts with 1.

    mapping(uint96 courtID => mapping(address token => uint256[] tokenIds)) public supportedErc1155TokenIds; // Supported ERC-1155 tokenIds for a particular ERC-1155 token contract.
    mapping(uint96 courtID => mapping(address token => mapping(uint256 tokenId => uint256 index)))
        public erc1155TokenIdToIndex; // Index of the tokenID in supported token IDs array. Starts with 1.

    mapping(uint256 localDisputeID => mapping(uint256 localRoundID => mapping(uint256 voteID => bytes32 justificationCommitment)))
        public justificationCommitments;

    // ************************************* //
    // *        Transient Storage          * //
    // ************************************* //

    bool transient callerIsJuror;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when a dispute is created.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _numberOfChoices The number of choices available in the dispute.
    /// @param _extraData The extra data for the dispute.
    event DisputeCreation(uint256 indexed _coreDisputeID, uint256 _numberOfChoices, bytes _extraData);

    /// @notice To be emitted when a vote commitment is cast.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _juror The address of the juror casting the vote commitment.
    /// @param _voteIDs The identifiers of the votes in the dispute.
    /// @param _commit The commitment of the juror.
    event CommitCast(uint256 indexed _coreDisputeID, address indexed _juror, uint256[] _voteIDs, bytes32 _commit);

    /// @notice To be emitted when a funding contribution is made.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _coreRoundID The identifier of the round in the Arbitrator contract.
    /// @param _choice The choice that is being funded.
    /// @param _contributor The address of the contributor.
    /// @param _amount The amount contributed.
    event Contribution(
        uint256 indexed _coreDisputeID,
        uint256 indexed _coreRoundID,
        uint256 _choice,
        address indexed _contributor,
        uint256 _amount
    );

    /// @notice To be emitted when the contributed funds are withdrawn.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _choice The choice that is being funded.
    /// @param _contributor The address of the contributor.
    /// @param _amount The amount withdrawn.
    event Withdrawal(uint256 indexed _coreDisputeID, uint256 _choice, address indexed _contributor, uint256 _amount);

    /// @notice To be emitted when a choice is fully funded for an appeal.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _coreRoundID The identifier of the round in the Arbitrator contract.
    /// @param _choice The choice that is being funded.
    event ChoiceFunded(uint256 indexed _coreDisputeID, uint256 indexed _coreRoundID, uint256 indexed _choice);

    /// @notice To be emitted when the next round settings are changed.
    /// @param _courtID The ID of the court that the settings are changed for.
    /// @param _nextRoundSettings The settings for the next round.
    event NextRoundSettingsChanged(uint96 indexed _courtID, NextRoundSettings _nextRoundSettings);

    /// @dev Emitted when the supported tokens for a court are changed.
    /// @param _courtID The ID of the court.
    /// @param _token The address of the token.
    /// @param _supported Whether the token is supported or not.
    event SupportedErc721TokenChanged(uint96 indexed _courtID, address indexed _token, bool _supported);

    /// @dev Emitted when supported ERC-1155 tokenIds for a token are changed.
    /// @param _courtID The ID of the court.
    /// @param _token The ERC-1155 token contract.
    /// @param _tokenId The ERC-1155 tokenId.
    /// @param _supported Whether the tokenId is supported or not.
    event SupportedErc1155TokenIdChanged(
        uint96 indexed _courtID,
        address indexed _token,
        uint256 indexed _tokenId,
        bool _supported
    );

    /// @dev Emitted when a Shutter vote commitment is cast.
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
    // *              Modifiers            * //
    // ************************************* //

    modifier onlyByOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    modifier onlyByCore() {
        require(address(core) == msg.sender, KlerosCoreOnly());
        _;
    }

    modifier isActive(uint256 _coreDisputeID) {
        require(coreDisputeIDToActive[_coreDisputeID].dispute, DisputeUnknownInThisDisputeKit());
        require(coreDisputeIDToActive[_coreDisputeID].currentRound, DisputeJumpedToAnotherDisputeKit());
        _;
    }

    modifier whenArbitrationNotPaused() {
        require(!core.arbitrationPaused(), WhenArbitrationNotPausedOnly());
        _;
    }

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
        owner = _owner;
        core = _core;
        wNative = _wNative;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @notice Allows the owner to call anything on behalf of the contract.
    /// @param _destination The destination of the call.
    /// @param _amount The value sent with the call.
    /// @param _data The data sent with the call.
    function executeOwnerProposal(address _destination, uint256 _amount, bytes memory _data) external onlyByOwner {
        (bool success, ) = _destination.call{value: _amount}(_data);
        require(success, UnsuccessfulCall());
    }

    /// @notice Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address payable _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Changes the `core` storage variable.
    /// @param _core The new value for the `core` storage variable.
    function changeCore(address _core) external onlyByOwner {
        core = KlerosCore(_core);
    }

    /// @notice Changes the settings for the next round.
    /// @param _courtID The ID of the court that the settings are changed for.
    /// @param _nextRoundSettings The settings for the next round.
    function changeNextRoundSettings(
        uint96 _courtID,
        NextRoundSettings memory _nextRoundSettings
    ) external onlyByOwner {
        courtIDToNextRoundSettings[_courtID] = _nextRoundSettings;
        emit NextRoundSettingsChanged(_courtID, _nextRoundSettings);
    }

    /// @notice Changes the supported ERC-721 tokens.
    /// @param _courtID The ID of the court.
    /// @param _tokens The tokens to support in the given court.
    /// @param _supported Whether the tokens are supported or not.
    function changeSupportedErc721Tokens(
        uint96 _courtID,
        address[] memory _tokens,
        bool _supported
    ) external onlyByOwner {
        address[] storage supportedTokens = supportedErc721Tokens[_courtID];
        for (uint256 i = 0; i < _tokens.length; i++) {
            address token = _tokens[i];
            require(token != address(0), TokenGateRequired());
            uint256 currentIndex = erc721TokenToIndex[_courtID][token];
            if (_supported && currentIndex == 0) {
                supportedTokens.push(token);
                erc721TokenToIndex[_courtID][token] = supportedTokens.length;
                emit SupportedErc721TokenChanged(_courtID, token, _supported);
            } else if (!_supported && currentIndex != 0) {
                uint256 lastIndex = supportedTokens.length;
                if (currentIndex != lastIndex) {
                    // Swap the last element. Note that index represents the length of the array, thus it should be deducted by 1.
                    address lastToken = supportedTokens[lastIndex - 1];
                    supportedTokens[currentIndex - 1] = lastToken;
                    erc721TokenToIndex[_courtID][lastToken] = currentIndex;
                }
                supportedTokens.pop();
                delete erc721TokenToIndex[_courtID][token];
                emit SupportedErc721TokenChanged(_courtID, token, _supported);
            }
        }
    }

    /// @notice Changes supported ERC-1155 tokenIds for a given token contract.
    /// @param _courtID The ID of the court.
    /// @param _token The ERC-1155 token contract.
    /// @param _tokenIds The ERC-1155 tokenIds to add/remove.
    /// @param _supported Whether the tokenIds are supported or not.
    function changeSupportedErc1155TokenIds(
        uint96 _courtID,
        address _token,
        uint256[] memory _tokenIds,
        bool _supported
    ) external onlyByOwner {
        require(_token != address(0), TokenGateRequired());

        address[] storage supportedTokens = supportedErc1155Tokens[_courtID];
        uint256[] storage supportedIds = supportedErc1155TokenIds[_courtID][_token];
        uint256 currentTokenIndex = erc1155TokenToIndex[_courtID][_token];
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uint256 tokenId = _tokenIds[i];
            uint256 currentTokenIdIndex = erc1155TokenIdToIndex[_courtID][_token][tokenId];
            if (_supported && currentTokenIdIndex == 0) {
                // Add token contract to supported tokens if not there yet.
                if (currentTokenIndex == 0) {
                    supportedTokens.push(_token);
                    // Assign the index so this clause can be skipped in future iterations.
                    currentTokenIndex = supportedTokens.length;
                    erc1155TokenToIndex[_courtID][_token] = currentTokenIndex;
                }
                // Add tokenId.
                supportedIds.push(tokenId);
                erc1155TokenIdToIndex[_courtID][_token][tokenId] = supportedIds.length;
                emit SupportedErc1155TokenIdChanged(_courtID, _token, tokenId, _supported);
            } else if (!_supported && currentTokenIdIndex != 0) {
                uint256 lastTokenIdIndex = supportedIds.length;
                if (currentTokenIdIndex != lastTokenIdIndex) {
                    // Swap the last element. Note that index represents the length of the array, thus it should be deducted by 1.
                    uint256 lastTokenId = supportedIds[lastTokenIdIndex - 1];
                    supportedIds[currentTokenIdIndex - 1] = lastTokenId;
                    erc1155TokenIdToIndex[_courtID][_token][lastTokenId] = currentTokenIdIndex;
                }
                supportedIds.pop();
                delete erc1155TokenIdToIndex[_courtID][_token][tokenId];

                // If no tokenIds left for this token contract, remove the token contract too.
                if (supportedIds.length == 0) {
                    uint256 lastTokenIndex = supportedTokens.length;
                    if (currentTokenIndex != lastTokenIndex) {
                        address lastToken = supportedTokens[lastTokenIndex - 1];
                        supportedTokens[currentTokenIndex - 1] = lastToken;
                        erc1155TokenToIndex[_courtID][lastToken] = currentTokenIndex;
                    }
                    supportedTokens.pop();
                    delete erc1155TokenToIndex[_courtID][_token];
                    currentTokenIndex = 0;
                }
                emit SupportedErc1155TokenIdChanged(_courtID, _token, tokenId, _supported);
            }
        }
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Creates a local dispute and maps it to the dispute ID in the Core contract.
    /// @dev Access restricted to Kleros Core only.
    /// @dev The new `KlerosCore.Round` must be created before calling this function.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _numberOfChoices Number of choices of the dispute
    /// @param _extraData Additional info about the dispute, for possible use in future dispute kits.
    /// @param - nbVotes Maximal number of votes this dispute can get. Added for future-proofing.
    /// @notice A token gate must be specified in the `extraData`, otherwise the transaction reverts.
    function createDispute(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _numberOfChoices,
        bytes calldata _extraData,
        uint256 /*_nbVotes*/
    ) public override onlyByCore {
        (uint96 courtID, address tokenGate, bool isERC1155, uint256 tokenId) = _extraDataToTokenInfo(_extraData);

        // DisputeKitGated must always be token-gated.
        require(tokenGate != address(0), TokenGateRequired());

        if (isERC1155) {
            require(erc1155TokenIdToIndex[courtID][tokenGate][tokenId] != 0, TokenNotSupported(courtID, tokenGate));
        } else {
            require(erc721TokenToIndex[courtID][tokenGate] != 0, TokenNotSupported(courtID, tokenGate));
        }

        uint256 localDisputeID;
        Dispute storage dispute;
        Active storage active = coreDisputeIDToActive[_coreDisputeID];
        if (active.dispute) {
            // The dispute has already been created in this DK in a previous round. E.g. if DK1 jumps to DK2 and then back to DK1.
            localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
            dispute = disputes[localDisputeID];
        } else {
            // The dispute has not been created in this DK yet.
            localDisputeID = disputes.length;
            dispute = disputes.push();
            coreDisputeIDToLocal[_coreDisputeID] = localDisputeID;
        }

        active.dispute = true;
        active.currentRound = true;
        dispute.numberOfChoices = _numberOfChoices;
        dispute.extraData = _extraData;

        // KlerosCore.Round must have been already created.
        dispute.coreRoundIDToLocal[_coreRoundID] = dispute.rounds.length;
        dispute.rounds.push().tied = true;

        emit DisputeCreation(_coreDisputeID, _numberOfChoices, _extraData);
    }

    /// @notice Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
    /// @dev Access restricted to Kleros Core only.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _nonce Nonce.
    /// @param - The number of votes in the round (unused, required by interface).
    /// @return drawnAddress The drawn address.
    /// @return fromSubcourtID The subcourt ID from which the juror was drawn.
    function draw(
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 /*_roundNbVotes*/
    ) public override onlyByCore isActive(_coreDisputeID) returns (address drawnAddress, uint96 fromSubcourtID) {
        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        uint256 localRoundID = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[localRoundID];

        ISortitionModule sortitionModule = core.sortitionModule();
        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        (drawnAddress, fromSubcourtID) = sortitionModule.draw(courtID, _coreDisputeID, _nonce);
        if (drawnAddress == address(0)) {
            // Sortition can return 0 address if no one has staked yet.
            return (drawnAddress, fromSubcourtID);
        }

        if (_postDrawCheck(_coreDisputeID, drawnAddress)) {
            Vote storage vote = round.votes.push();
            vote.account = drawnAddress;
            round.alreadyDrawn[drawnAddress] = true;
        } else {
            drawnAddress = address(0);
        }
    }

    /// @notice Sets the caller's commit for the specified votes.
    ///
    /// @dev It can be called multiple times during the commit period, each call overrides the commits of the previous one.
    /// `O(n)` where `n` is the number of votes.
    ///
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _commit The commitment hash.
    function castCommit(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes32 _commit
    ) public whenArbitrationNotPaused isActive(_coreDisputeID) {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period == KlerosCore.Period.commit, NotCommitPeriod());
        require(_voteIDs.length > 0, EmptyVoteIDs());
        require(_commit != bytes32(0), EmptyCommit());

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        // Introduce a counter so we don't count a re-commited votes.
        uint256 commitCount;
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(round.votes[_voteIDs[i]].account == msg.sender, JurorHasToOwnTheVote());
            if (round.votes[_voteIDs[i]].commit == bytes32(0)) {
                commitCount++;
            }
            round.votes[_voteIDs[i]].commit = _commit;
        }
        round.totalCommitted += commitCount;
        emit CommitCast(_coreDisputeID, msg.sender, _voteIDs, _commit);
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
        require(_justificationCommit != bytes32(0), EmptyJustificationCommit());

        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        uint256 localRoundID = dispute.rounds.length - 1;
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            justificationCommitments[localDisputeID][localRoundID][_voteIDs[i]] = _justificationCommit;
        }

        // `castCommit()` ensures that the caller owns the vote and that dispute is active
        castCommit(_coreDisputeID, _voteIDs, _choiceCommit);
        emit CommitCastShutter(
            _coreDisputeID,
            msg.sender,
            _choiceCommit,
            _justificationCommit,
            _identity,
            _encryptedVote
        );
    }

    /// @notice Sets the caller's choices for the specified votes.
    ///
    /// @dev `O(n)` where `n` is the number of votes.
    ///
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _choice The choice.
    /// @param _salt The salt for the commit if the votes were hidden.
    /// @param _justification Justification of the choice.
    function castVote(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        uint256 _salt,
        string memory _justification
    ) external {
        _castVote(_coreDisputeID, _voteIDs, _choice, _salt, _justification, msg.sender);
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

        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        uint256 courtParamsIndex = core.getCourtParametersIndex(
            _coreDisputeID,
            core.getNumberOfRounds(_coreDisputeID) - 1
        );
        bool hiddenVotes = core.getAdditionalCourtParams(courtID, courtParamsIndex).hiddenVotes;
        require(hiddenVotes || callerIsJuror, CallerMustBeJurorIfNoHiddenVotes());

        // `_castVote()` ensures that all the `_voteIDs` do belong to `juror`
        _castVote(_coreDisputeID, _voteIDs, _choice, _salt, _justification, juror);

        callerIsJuror = false;
    }

    /// @notice Manages contributions, and appeals a dispute if at least two choices are fully funded.
    /// Note that the surplus deposit will be reimbursed.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _choice A choice that receives funding.
    function fundAppeal(
        uint256 _coreDisputeID,
        uint256 _choice
    ) external payable whenArbitrationNotPaused isActive(_coreDisputeID) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        require(_choice <= dispute.numberOfChoices, ChoiceOutOfBounds());

        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = core.appealPeriod(_coreDisputeID);
        require(block.timestamp >= appealPeriodStart && block.timestamp < appealPeriodEnd, NotAppealPeriod());

        uint256 multiplier;
        (uint256 ruling, , ) = this.currentRuling(_coreDisputeID);
        if (ruling == _choice) {
            multiplier = WINNER_STAKE_MULTIPLIER;
        } else {
            require(
                block.timestamp - appealPeriodStart <
                    ((appealPeriodEnd - appealPeriodStart) * LOSER_APPEAL_PERIOD_MULTIPLIER) / ONE_BASIS_POINT,
                NotAppealPeriodForLoser()
            );
            multiplier = LOSER_STAKE_MULTIPLIER;
        }

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        uint256 coreRoundID = core.getNumberOfRounds(_coreDisputeID) - 1;

        require(!round.hasPaid[_choice], AppealFeeIsAlreadyPaid());
        uint256 appealCost = core.appealCost(_coreDisputeID);
        uint256 totalCost = appealCost + (appealCost * multiplier) / ONE_BASIS_POINT;

        // Take up to the amount necessary to fund the current round at the current costs.
        uint256 contribution;
        if (totalCost > round.paidFees[_choice]) {
            contribution = totalCost - round.paidFees[_choice] > msg.value // Overflows and underflows will be managed on the compiler level.
                ? msg.value
                : totalCost - round.paidFees[_choice];
            emit Contribution(_coreDisputeID, coreRoundID, _choice, msg.sender, contribution);
        }

        round.contributions[msg.sender][_choice] += contribution;
        round.paidFees[_choice] += contribution;
        if (round.paidFees[_choice] >= totalCost) {
            round.feeRewards += round.paidFees[_choice];
            round.fundedChoices.push(_choice);
            round.hasPaid[_choice] = true;
            emit ChoiceFunded(_coreDisputeID, coreRoundID, _choice);
        }

        if (round.fundedChoices.length > 1) {
            // At least two sides are fully funded.
            round.feeRewards = round.feeRewards - appealCost;

            (, , , , bool isDisputeKitJumping) = core.getCourtAndDisputeKitJumps(_coreDisputeID);
            if (isDisputeKitJumping) {
                // Don't create a new round in case of a jump, and remove local dispute from the flow.
                coreDisputeIDToActive[_coreDisputeID].currentRound = false;
            } else {
                // Don't subtract 1 from length since both round arrays haven't been updated yet.
                dispute.coreRoundIDToLocal[coreRoundID + 1] = dispute.rounds.length;
                Round storage newRound = dispute.rounds.push();
                newRound.tied = true;
            }
            core.appeal{value: appealCost}(_coreDisputeID, dispute.numberOfChoices, dispute.extraData);
        }

        if (msg.value > contribution) payable(msg.sender).safeSend(msg.value - contribution, wNative);
    }

    /// @notice Allows those contributors who attempted to fund an appeal round to withdraw any reimbursable fees or rewards after the dispute gets resolved.
    /// @dev Withdrawals are not possible if the core contract is paused.
    /// @dev It can be called after the dispute has jumped to another dispute kit.
    /// @param _coreDisputeID Index of the dispute in Kleros Core contract.
    /// @param _beneficiary The address whose rewards to withdraw.
    /// @param _choice The ruling option that the caller wants to withdraw from.
    /// @return amount The withdrawn amount.
    function withdrawFeesAndRewards(
        uint256 _coreDisputeID,
        address payable _beneficiary,
        uint256 _choice
    ) external returns (uint256 amount) {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period == KlerosCore.Period.execution, DisputeNotResolved());
        require(!core.paused(), CoreIsPaused());
        require(coreDisputeIDToActive[_coreDisputeID].dispute, DisputeUnknownInThisDisputeKit());

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        (uint256 finalRuling, , ) = core.currentRuling(_coreDisputeID);

        for (uint256 i = 0; i < dispute.rounds.length; i++) {
            Round storage round = dispute.rounds[i];

            if (!round.hasPaid[_choice]) {
                // Allow to reimburse if funding was unsuccessful for this ruling option.
                amount += round.contributions[_beneficiary][_choice];
            } else {
                // Funding was successful for this ruling option.
                if (_choice == finalRuling) {
                    // This ruling option is the ultimate winner.
                    amount += round.paidFees[_choice] > 0
                        ? (round.contributions[_beneficiary][_choice] * round.feeRewards) / round.paidFees[_choice]
                        : 0;
                } else if (!round.hasPaid[finalRuling]) {
                    // The ultimate winner was not funded in this round. In this case funded ruling option(s) are reimbursed.
                    amount +=
                        (round.contributions[_beneficiary][_choice] * round.feeRewards) /
                        (round.paidFees[round.fundedChoices[0]] + round.paidFees[round.fundedChoices[1]]);
                }
            }
            round.contributions[_beneficiary][_choice] = 0;
        }

        if (amount != 0) {
            _beneficiary.safeSend(amount, wNative);
            emit Withdrawal(_coreDisputeID, _choice, _beneficiary, amount);
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Checks if the juror is eligible to stake or to vote in the court.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return True if the juror is eligible, false otherwise.
    /// @dev Complexity: O(n + m) where `n` is the number of supported ERC-721 tokens and `m` is the number of supported ERC-1155 tokens.
    function isEligible(address _juror, uint96 _courtID) external view override returns (bool) {
        uint256 erc721Length = supportedErc721Tokens[_courtID].length;
        for (uint256 i = 0; i < erc721Length; i++) {
            address token = supportedErc721Tokens[_courtID][i];
            if (token == address(0)) continue;
            if (IBalanceHolder(token).balanceOf(_juror) > 0) return true;
        }

        uint256 erc1155Length = supportedErc1155Tokens[_courtID].length;
        for (uint256 i = 0; i < erc1155Length; i++) {
            address token = supportedErc1155Tokens[_courtID][i];
            if (token == address(0)) continue;
            uint256[] storage tokenIds = supportedErc1155TokenIds[_courtID][token];
            uint256 tokenIdsLength = tokenIds.length;
            for (uint256 j = 0; j < tokenIdsLength; j++) {
                uint256 tokenId = tokenIds[j];
                if (IBalanceHolderERC1155(token).balanceOf(_juror, tokenId) > 0) return true;
            }
        }
        return false;
    }

    /// @notice Computes the hash of a vote using ABI encoding
    /// @param _choice The choice being voted for
    /// @param _salt A random salt for commitment
    /// @return bytes32 The hash of the encoded vote parameters
    function hashVote(uint256 _choice, uint256 _salt) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_choice, _salt));
    }

    /// @notice Computes the hash of a justification using ABI encoding
    /// @param _salt A random salt for commitment
    /// @param _justification The justification for the vote
    /// @return bytes32 The hash of the encoded justification
    function hashJustification(uint256 _salt, string memory _justification) public pure returns (bytes32) {
        return keccak256(abi.encode(_salt, keccak256(bytes(_justification))));
    }

    /// @notice Returns the rulings that were fully funded in the latest appeal round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return fundedChoices Fully funded rulings.
    function getFundedChoices(uint256 _coreDisputeID) public view returns (uint256[] memory fundedChoices) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage lastRound = dispute.rounds[dispute.rounds.length - 1];
        return lastRound.fundedChoices;
    }

    /// @notice Gets the current ruling of a specified dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(
        uint256 _coreDisputeID
    ) external view override returns (uint256 ruling, bool tied, bool overridden) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        tied = round.tied;
        ruling = tied ? 0 : round.winningChoice;
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        // Override the final ruling if only one side funded the appeals.
        if (period == KlerosCore.Period.execution) {
            uint256[] memory fundedChoices = getFundedChoices(_coreDisputeID);
            if (fundedChoices.length == 1) {
                ruling = fundedChoices[0];
                tied = false;
                overridden = true;
            }
        }
    }

    /// @notice Gets the degree of coherence of a particular voter.
    /// @dev This function is called by Kleros Core in order to determine the amount of the reward.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @param - feePerJuror The fee per juror. Unused, required by interface.
    /// @param - pnkAtStakePerJuror The PNK at stake per juror. Unused, required by interface.
    /// @return pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    /// @return feeCoherence The degree of coherence in basis points for the dispute fee reward.
    function getDegreeOfCoherenceReward(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 /* _feePerJuror */,
        uint256 /* _pnkAtStakePerJuror */
    ) external view override returns (uint256 pnkCoherence, uint256 feeCoherence) {
        uint256 coherence = _getDegreeOfCoherence(_coreDisputeID, _coreRoundID, _voteID);
        return (coherence, coherence);
    }

    /// @notice Gets the degree of coherence of a particular voter.
    /// @dev This function is called by Kleros Core in order to determine the amount of the penalty.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @param - feePerJuror The fee per juror. Unused, required by interface.
    /// @param - pnkAtStakePerJuror The PNK at stake per juror. Unused, required by interface.
    /// @return pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    function getDegreeOfCoherencePenalty(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 /* _feePerJuror */,
        uint256 /* _pnkAtStakePerJuror */
    ) external view override returns (uint256 pnkCoherence) {
        return _getDegreeOfCoherence(_coreDisputeID, _coreRoundID, _voteID);
    }

    function _getDegreeOfCoherence(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) internal view returns (uint256 coherence) {
        // In this contract this degree can be either 0 or 1, but in other dispute kits this value can be something in between.
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        (uint256 winningChoice, bool tied, ) = core.currentRuling(_coreDisputeID);

        if (vote.voted && (vote.choice == winningChoice || tied)) {
            return ONE_BASIS_POINT;
        } else {
            return 0;
        }
    }

    /// @notice Gets the number of jurors who are eligible to a reward in this round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @return The number of coherent jurors.
    function getCoherentCount(uint256 _coreDisputeID, uint256 _coreRoundID) external view override returns (uint256) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage currentRound = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]];
        (uint256 winningChoice, bool tied, ) = core.currentRuling(_coreDisputeID);

        if (currentRound.totalVoted == 0 || (!tied && currentRound.counts[winningChoice] == 0)) {
            return 0;
        } else if (tied) {
            return currentRound.totalVoted;
        } else {
            return currentRound.counts[winningChoice];
        }
    }

    /// @notice Gets the rewards for PNK and fees based on coherence and total reward pool.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param - voteID The ID of the vote. Unused, required by interface.
    /// @param _coherentCount The number of jurors eligible for reward.
    /// @param _pnkRewardPool Total amount of PNK available for rewards to all coherent jurors.
    /// @param _pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    /// @param _feeCoherence The degree of coherence in basis points for the dispute fee reward.
    /// @return pnkReward The pnk reward the juror is eligible to.
    /// @return feeReward The fee reward the juror is eligible to.
    function getRewards(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 /*_voteID*/,
        uint256 _coherentCount,
        uint256 _pnkRewardPool,
        uint256 _pnkCoherence,
        uint256 _feeCoherence
    ) external view override returns (uint256 pnkReward, uint256 feeReward) {
        uint256 feeRewardPool = core.getTotalFeesForJurors(_coreDisputeID, _coreRoundID);

        uint256 availablePnkAmount = _pnkRewardPool / _coherentCount;
        pnkReward = (availablePnkAmount * _pnkCoherence) / ONE_BASIS_POINT;

        uint256 availableFeeAmount = feeRewardPool / _coherentCount;
        feeReward = (availableFeeAmount * _feeCoherence) / ONE_BASIS_POINT;
    }

    /// @notice Returns true if all of the jurors have cast their commits for the last round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether all of the jurors have cast their commits for the last round.
    function areCommitsAllCast(uint256 _coreDisputeID) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        return round.totalCommitted == round.votes.length;
    }

    /// @notice Returns true if all of the jurors have cast their votes for the last round.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether all of the jurors have cast their votes for the last round.
    function areVotesAllCast(uint256 _coreDisputeID) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];

        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        uint256 courtParamsIndex = core.getCourtParametersIndex(
            _coreDisputeID,
            core.getNumberOfRounds(_coreDisputeID) - 1
        );
        bool hiddenVotes = core.getAdditionalCourtParams(courtID, courtParamsIndex).hiddenVotes;
        uint256 expectedTotalVoted = hiddenVotes ? round.totalCommitted : round.votes.length;

        return round.totalVoted == expectedTotalVoted;
    }

    /// @notice Returns true if the appeal funding is finished prematurely (e.g. when losing side didn't fund).
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether the appeal funding is finished.
    function isAppealFunded(uint256 _coreDisputeID) external view override returns (bool) {
        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = core.appealPeriod(_coreDisputeID);

        uint256[] memory fundedChoices = getFundedChoices(_coreDisputeID);
        // Uses block.timestamp from the current tx when called by the core contract.
        return (fundedChoices.length == 0 &&
            block.timestamp - appealPeriodStart >=
            ((appealPeriodEnd - appealPeriodStart) * LOSER_APPEAL_PERIOD_MULTIPLIER) / ONE_BASIS_POINT);
    }

    /// @notice Returns the next round settings for a given dispute.
    /// @dev This function does not check for compatibility between `newDisputeKitID` and `newCourtID`, this is the Core's responsibility.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit. Unused, required by interface.
    /// @param _currentCourtID The ID of the current court.
    /// @param _parentCourtID The ID of the parent court.
    /// @param _currentCourtJurorsForJump The court jump threshold defined by the current court.
    /// @param _currentDisputeKitID The ID of the current dispute kit.
    /// @param _currentRoundNbVotes The number of votes in the current round.
    /// @return newCourtID Court ID after jump.
    /// @return newDisputeKitID Dispute kit ID after jump.
    /// @return newRoundNbVotes The number of votes in the new round.
    function getNextRoundSettings(
        uint256 /* _coreDisputeID */,
        uint96 _currentCourtID,
        uint96 _parentCourtID,
        uint256 _currentCourtJurorsForJump,
        uint256 _currentDisputeKitID,
        uint256 _currentRoundNbVotes
    ) public view override returns (uint96 newCourtID, uint256 newDisputeKitID, uint256 newRoundNbVotes) {
        NextRoundSettings storage nextRoundSettings = courtIDToNextRoundSettings[_currentCourtID];
        uint256 jumpDisputeKitIDOnCourtJump;
        if (nextRoundSettings.enabled) {
            newRoundNbVotes = nextRoundSettings.nbVotes;
            newCourtID = nextRoundSettings.jumpCourtID;
            newDisputeKitID = nextRoundSettings.jumpDisputeKitID; // Takes precedence over jumpDisputeKitIDOnCourtJump
            jumpDisputeKitIDOnCourtJump = nextRoundSettings.jumpDisputeKitIDOnCourtJump;
        }
        if (newCourtID == 0) {
            // Default court jump logic, unaffected by the newRoundNbVotes override
            newCourtID = _currentRoundNbVotes >= _currentCourtJurorsForJump ? _parentCourtID : _currentCourtID;
        }
        if (newDisputeKitID == 0) {
            // jumpDisputeKitID is undefined for next round
            if (newCourtID != _currentCourtID && jumpDisputeKitIDOnCourtJump != 0) {
                // Override on court jump
                newDisputeKitID = jumpDisputeKitIDOnCourtJump;
            } else {
                // Default dispute kit jump logic
                newDisputeKitID = _currentDisputeKitID;
            }
        }
        if (newRoundNbVotes == 0) {
            // Default nbVotes logic
            newRoundNbVotes = (_currentRoundNbVotes * 2) + 1;
        }
    }

    /// @notice Returns true if the specified voter was active in this round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the voter.
    /// @return Whether the voter was active or not.
    function isVoteActive(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        return vote.voted;
    }

    /// @notice Returns the info of the specified round in the core contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _choice The choice to query.
    /// @return winningChoice The winning choice of this round.
    /// @return tied Whether it's a tie or not.
    /// @return totalVoted Number of jurors who cast the vote already.
    /// @return totalCommitted Number of jurors who cast the commit already (only relevant for hidden votes).
    /// @return nbVoters Total number of voters in this round.
    /// @return choiceCount Number of votes cast for the queried choice.
    function getRoundInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _choice
    )
        external
        view
        override
        returns (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommitted,
            uint256 nbVoters,
            uint256 choiceCount
        )
    {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]];
        return (
            round.winningChoice,
            round.tied,
            round.totalVoted,
            round.totalCommitted,
            round.votes.length,
            round.counts[_choice]
        );
    }

    /// @notice Returns the number of rounds in a dispute.
    /// @param _localDisputeID The ID of the dispute in the Dispute Kit.
    /// @return The number of rounds in the dispute.
    function getNumberOfRounds(uint256 _localDisputeID) external view returns (uint256) {
        return disputes[_localDisputeID].rounds.length;
    }

    /// @notice Returns the local dispute ID and round ID for a given core dispute ID and core round ID.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @return localDisputeID The ID of the dispute in the Dispute Kit.
    /// @return localRoundID The ID of the round in the Dispute Kit.
    function getLocalDisputeRoundID(
        uint256 _coreDisputeID,
        uint256 _coreRoundID
    ) external view returns (uint256 localDisputeID, uint256 localRoundID) {
        localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        localRoundID = disputes[localDisputeID].coreRoundIDToLocal[_coreRoundID];
    }

    /// @notice Returns the vote information for a given vote ID.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @return account The address of the juror who cast the vote.
    /// @return commit The commit of the vote.
    /// @return choice The choice that got the vote.
    /// @return voted Whether the vote was cast or not.
    function getVoteInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) external view override returns (address account, bytes32 commit, uint256 choice, bool voted) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        return (vote.account, vote.commit, vote.choice, vote.voted);
    }

    /// @notice Checks if an ERC-721 token is supported in a court.
    /// @param _courtID The ID of the court.
    /// @param _token The address of the token.
    /// @return Whether the token is supported or not.
    function isErc721TokenSupported(uint96 _courtID, address _token) external view returns (bool) {
        return erc721TokenToIndex[_courtID][_token] != 0;
    }

    /// @notice Returns the number of ERC-721 tokens supported in a court.
    /// @param _courtID The ID of the court.
    /// @return The number of ERC-721 tokens supported in the court.
    function supportedErc721TokensLength(uint96 _courtID) external view returns (uint256) {
        return supportedErc721Tokens[_courtID].length;
    }

    /// @notice Returns the ERC-721 token at the given index.
    /// @param _courtID The ID of the court.
    /// @param _index The index of the token.
    /// @return The ERC-721 token at the given index.
    function supportedErc721TokensAt(uint96 _courtID, uint256 _index) external view returns (address) {
        return supportedErc721Tokens[_courtID][_index];
    }

    /// @notice Checks if an ERC-1155 `(token, tokenId)` is supported in a court.
    /// @param _courtID The ID of the court.
    /// @param _token The ERC-1155 token contract address.
    /// @param _tokenId The ERC-1155 tokenId.
    function isErc1155TokenIdSupported(uint96 _courtID, address _token, uint256 _tokenId) external view returns (bool) {
        return erc1155TokenIdToIndex[_courtID][_token][_tokenId] != 0;
    }

    /// @notice Returns the number of ERC-1155 tokenIds supported for a given token contract.
    /// @param _courtID The ID of the court.
    /// @param _token The ERC-1155 token contract address.
    /// @return The number of ERC-1155 tokenIds supported for the given token contract.
    function supportedErc1155TokenIdsLength(uint96 _courtID, address _token) external view returns (uint256) {
        return supportedErc1155TokenIds[_courtID][_token].length;
    }

    /// @notice Returns the ERC-1155 tokenId at the given index for a given token contract.
    /// @param _courtID The ID of the court.
    /// @param _token The ERC-1155 token contract address.
    /// @param _index The index of the tokenId.
    /// @return The ERC-1155 tokenId at the given index for the given token contract.
    function supportedErc1155TokenIdsAt(
        uint96 _courtID,
        address _token,
        uint256 _index
    ) external view returns (uint256) {
        return supportedErc1155TokenIds[_courtID][_token][_index];
    }

    /// @notice Returns the number of ERC-1155 tokens supported in a court.
    /// @param _courtID The ID of the court.
    /// @return The number of ERC-1155 tokens supported in the court.
    function supportedErc1155TokensLength(uint96 _courtID) external view returns (uint256) {
        return supportedErc1155Tokens[_courtID].length;
    }

    /// @notice Returns the ERC-1155 token at the given index.
    /// @param _courtID The ID of the court.
    /// @param _index The index of the token.
    /// @return The ERC-1155 token at the given index.
    function supportedErc1155TokensAt(uint96 _courtID, uint256 _index) external view returns (address) {
        return supportedErc1155Tokens[_courtID][_index];
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @notice Verifies that revealed choice and justification match the hidden vote commitments.
    /// @param _localDisputeID The ID of the dispute in the Dispute Kit.
    /// @param _localRoundID The ID of the round in the Dispute Kit.
    /// @param _voteIDs The IDs of the votes.
    /// @param _choice The choice.
    /// @param _justification The justification.
    /// @param _salt The salt.
    function _verifyHiddenVoteCommitments(
        uint256 _localDisputeID,
        uint256 _localRoundID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        string memory _justification,
        uint256 _salt
    ) internal view {
        bytes32 actualVoteHash = hashVote(_choice, _salt);
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(
                disputes[_localDisputeID].rounds[_localRoundID].votes[_voteIDs[i]].commit == actualVoteHash,
                ChoiceCommitmentMismatch()
            );
        }

        // The juror is allowed to reveal without verifying the justification commitment for recovery purposes.
        if (callerIsJuror) return;

        bytes32 actualJustificationHash = hashJustification(_salt, _justification);
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(
                justificationCommitments[_localDisputeID][_localRoundID][_voteIDs[i]] == actualJustificationHash,
                JustificationCommitmentMismatch()
            );
        }
    }

    /// @notice Sets the juror's choices for the specified votes.
    ///
    /// @dev `O(n)` where `n` is the number of votes.
    ///
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _choice The choice.
    /// @param _salt The salt for the commit if the votes were hidden.
    /// @param _justification Justification of the choice.
    /// @param _juror Address of the juror.
    function _castVote(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        uint256 _salt,
        string memory _justification,
        address _juror
    ) internal whenArbitrationNotPaused isActive(_coreDisputeID) {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period == KlerosCore.Period.vote, NotVotePeriod());
        require(_voteIDs.length > 0, EmptyVoteIDs());

        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        require(_choice <= dispute.numberOfChoices, ChoiceOutOfBounds());

        uint256 localRoundID = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[localRoundID];
        {
            uint256 coreRoundID = core.getNumberOfRounds(_coreDisputeID) - 1;
            (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
            uint256 courtParamsIndex = core.getCourtParametersIndex(_coreDisputeID, coreRoundID);
            bool hiddenVotes = core.getAdditionalCourtParams(courtID, courtParamsIndex).hiddenVotes;
            if (hiddenVotes) {
                _verifyHiddenVoteCommitments(localDisputeID, localRoundID, _voteIDs, _choice, _justification, _salt);
            }

            //  Save the votes.
            for (uint256 i = 0; i < _voteIDs.length; i++) {
                require(round.votes[_voteIDs[i]].account == _juror, JurorHasToOwnTheVote());
                require(!round.votes[_voteIDs[i]].voted, VoteAlreadyCast());
                round.votes[_voteIDs[i]].choice = _choice;
                round.votes[_voteIDs[i]].voted = true;
            }
        } // Workaround stack too deep

        round.totalVoted += _voteIDs.length;

        round.counts[_choice] += _voteIDs.length;

        if (_choice == round.winningChoice) {
            if (round.tied) round.tied = false;
        } else {
            // Voted for another choice.
            if (round.counts[_choice] == round.counts[round.winningChoice]) {
                // Tie.
                if (!round.tied) round.tied = true;
            } else if (round.counts[_choice] > round.counts[round.winningChoice]) {
                // New winner.
                round.winningChoice = _choice;
                round.tied = false;
            }
        }
        emit VoteCast(_coreDisputeID, _juror, _voteIDs, _choice, _justification);
    }

    /// @notice Extracts token gating information from the extra data.
    /// @param _extraData The extra data bytes array with the following encoding:
    /// - bytes 0-31: uint96 courtID, not used here
    /// - bytes 32-63: uint256 minJurors, not used here
    /// - bytes 64-95: uint256 disputeKitID, not used here
    /// - bytes 96-127: uint256 packedTokenGateAndFlag (address tokenGate in bits 0-159, bool isERC1155 in bit 160)
    /// - bytes 128-159: uint256 tokenId
    /// @return courtID The ID of the court.
    /// @return tokenGate The address of the token contract used for gating access.
    /// @return isERC1155 True if the token is an ERC-1155, false for ERC-721.
    /// @return tokenId The token ID for ERC-1155 tokens (ignored for ERC-721).
    function _extraDataToTokenInfo(
        bytes memory _extraData
    ) internal pure returns (uint96 courtID, address tokenGate, bool isERC1155, uint256 tokenId) {
        // Need at least 160 bytes to safely read the parameters
        if (_extraData.length < 160) return (0, address(0), false, 0);

        assembly {
            // solium-disable-line security/no-inline-assembly
            courtID := mload(add(_extraData, 0x20))

            let packedTokenGateIsERC1155 := mload(add(_extraData, 0x80)) // 4th parameter at offset 128
            tokenId := mload(add(_extraData, 0xA0)) // 5th parameter at offset 160 (moved up)

            // Unpack address from lower 160 bits and bool from bit 160
            tokenGate := and(packedTokenGateIsERC1155, 0xffffffffffffffffffffffffffffffffffffffff)
            isERC1155 := and(shr(160, packedTokenGateIsERC1155), 1)
        }
    }

    /// @notice Checks that the chosen address satisfies certain conditions for being drawn.
    /// @param _coreDisputeID ID of the dispute in the core contract.
    /// @param _juror Chosen address.
    /// @return Whether the address passes the check or not.
    function _postDrawCheck(uint256 _coreDisputeID, address _juror) internal view returns (bool) {
        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        if (singleDrawPerJuror) {
            Round storage round = dispute.rounds[dispute.rounds.length - 1];
            if (round.alreadyDrawn[_juror]) {
                return false;
            }
        }

        // Get the local dispute and extract token info from extraData
        (, address tokenGate, bool isERC1155, uint256 tokenId) = _extraDataToTokenInfo(dispute.extraData);

        if (tokenGate == address(0)) return false; // Token gate must be specified.

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

    error OwnerOnly();
    error KlerosCoreOnly();
    error DisputeJumpedToAnotherDisputeKit();
    error DisputeUnknownInThisDisputeKit();
    error UnsuccessfulCall();
    error NotCommitPeriod();
    error EmptyCommit();
    error JurorHasToOwnTheVote();
    error NotVotePeriod();
    error EmptyVoteIDs();
    error ChoiceOutOfBounds();
    error ChoiceCommitmentMismatch();
    error VoteAlreadyCast();
    error NotAppealPeriod();
    error NotAppealPeriodForLoser();
    error AppealFeeIsAlreadyPaid();
    error DisputeNotResolved();
    error CoreIsPaused();
    error WhenArbitrationNotPausedOnly();
    error TokenNotSupported(uint96 courtID, address tokenGate);
    error TokenGateRequired();
    error EmptyJustificationCommit();
    error JustificationCommitmentMismatch();
    error CallerMustBeJurorIfNoHiddenVotes();
}

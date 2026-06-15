// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {KlerosCore} from "../KlerosCore.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {Initializable} from "../../proxy/Initializable.sol";
import {UUPSProxiable} from "../../proxy/UUPSProxiable.sol";
import {ForkMath} from "./ForkMath.sol";
import {ForkSettlement} from "./ForkSettlement.sol";
import {PNKHolderEscrow} from "./PNKHolderEscrow.sol";

/// @title DisputeKitForking
/// @notice The dispute kit hosting the single terminal forking round at the `KlerosCore` boundary
///         (see `docs/layer-1-core/07-forking.md`). It runs hidden (commit/reveal) single-choice,
///         single-threshold votes among all reachable PNK holders, determines the stake-weighted
///         plurality winner as the final ruling (`a_main`, G-3), computes each minority fork's membership
///         via `ForkMath`'s removal fixed point (G-4), and hands off to `ForkSettlement` for redistribution
///         and minting. To `KlerosCore` it is just an `IDisputeKit`; everything forking-specific is composed
///         beneath it (`ForkMath`, `ForkSettlement`, `PNKHolderEscrow`).
///
/// @dev TDD skeleton. The boilerplate (proxy, ownership, Core wiring) is real so the contract deploys and
///      tests can bind to it; the forking logic and the meaningful `IDisputeKit` behaviors revert
///      `NotImplemented()` or return inert defaults until the implementation pass.
contract DisputeKitForking is IDisputeKit, Initializable, UUPSProxiable {
    string public constant override version = "0.1.0";

    // ************************************* //
    // *             Structs               * //
    // ************************************* //

    /// @dev A revealed forking vote.
    struct RevealedVote {
        bool revealed; // True once the holder has revealed.
        uint256 choice; // The chosen dispute option.
        uint256 threshold; // The minimum fork size at which the holder joins the minority fork.
        uint256 weight; // The holder's weight at reveal (frozen stake + escrow).
    }

    /// @dev Per-core-dispute forking round state.
    struct ForkingRound {
        uint256 numberOfChoices; // Number of dispute options (excluding the implicit refuse-to-arbitrate 0).
        mapping(address voter => bytes32) commits; // keccak256(choice, threshold, salt) per voter.
        mapping(address voter => RevealedVote) revealed; // Revealed votes per voter.
        mapping(uint256 choice => ForkMath.OptionList) optionLists; // One threshold-sorted list per option.
        mapping(uint256 choice => uint256) tallyWeight; // Total revealed weight per option.
        uint256 winningChoice; // The plurality winner = `a_main`.
        bool winnerDetermined; // True once the winner has been computed.
        bool finalized; // True once all minority forks have been computed and settlement initiated.
        uint256 finalizeChoiceCursor; // Pagination cursor across losing options during finalize.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The owner of the contract.
    KlerosCore public core; // The Kleros Core arbitrator.
    ForkSettlement public settlement; // The composed settlement unit.
    PNKHolderEscrow public escrow; // The composed tier-2 escrow unit.
    mapping(uint256 coreDisputeID => ForkingRound) internal forkingRounds; // Forking round state per dispute.
    mapping(uint256 coreDisputeID => bool) public initialized; // True once `createDispute` ran for a dispute.

    uint256[50] private __gap; // Reserved slots for future upgrades.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a holder commits a hidden forking vote.
    event VoteCommitted(uint256 indexed _coreDisputeID, address indexed _voter, bytes32 _commit);
    /// @notice Emitted when a holder reveals a forking vote.
    event VoteRevealed(
        uint256 indexed _coreDisputeID,
        address indexed _voter,
        uint256 _choice,
        uint256 _threshold,
        uint256 _weight
    );
    /// @notice Emitted when the cut-off computation completes and the winner + fork membership are published.
    event ForkFinalized(uint256 indexed _coreDisputeID, uint256 _winningChoice);

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error NotImplemented();
    error KlerosCoreOnly();
    error OwnerOnly();
    error UnsupportedOperation();
    error ForkNotInitiated();
    error ForkAlreadyInitiated();
    error WrongPeriod();
    error CommitMismatch();
    error AlreadyRevealed();
    error NothingToReveal();
    error AlreadyFinalized();
    error NotForkingCourt();

    // ************************************* //
    // *             Modifiers             * //
    // ************************************* //

    modifier onlyByCore() {
        require(address(core) == msg.sender, KlerosCoreOnly());
        _;
    }

    modifier onlyByOwner() {
        require(owner == msg.sender, OwnerOnly());
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
    function initialize(address _owner, KlerosCore _core) external initializer {
        owner = _owner;
        core = _core;
    }

    // ************************************* //
    // *            Governance             * //
    // ************************************* //

    /// @dev Access control for UUPS upgrades; only the owner.
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @notice Changes the `owner` storage variable.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Wires the composed settlement and escrow units.
    /// @param _settlement The `ForkSettlement` contract.
    /// @param _escrow The `PNKHolderEscrow` contract.
    function changeComposedUnits(ForkSettlement _settlement, PNKHolderEscrow _escrow) external onlyByOwner {
        settlement = _settlement;
        escrow = _escrow;
    }

    // ************************************* //
    // *         Forking voting            * //
    // ************************************* //

    /// @notice Commits a hidden forking vote: keccak256(choice, threshold, salt). Commit period only.
    /// @param _coreDisputeID The forking dispute.
    /// @param _commit The commitment hash.
    function commitVote(uint256 _coreDisputeID, bytes32 _commit) external {
        _coreDisputeID;
        _commit;
        revert NotImplemented();
    }

    /// @notice Reveals a previously committed forking vote. Weight = frozen `stakedPnk` (incl. locked) +
    ///         any `PNKHolderEscrow` deposit. Inserts the voter into the option's threshold-sorted list.
    /// @param _coreDisputeID The forking dispute.
    /// @param _choice The revealed choice.
    /// @param _threshold The revealed forking threshold.
    /// @param _salt The salt used in the commit.
    function revealVote(uint256 _coreDisputeID, uint256 _choice, uint256 _threshold, uint256 _salt) external {
        _coreDisputeID;
        _choice;
        _threshold;
        _salt;
        revert NotImplemented();
    }

    /// @notice Determines the winner then walks each losing option's removal fixed point (paginated).
    ///         On completion, calls `ForkSettlement.initSettle`. Execution period only.
    /// @param _coreDisputeID The forking dispute.
    /// @param _maxIt The pagination bound for this call.
    function finalize(uint256 _coreDisputeID, uint256 _maxIt) external {
        _coreDisputeID;
        _maxIt;
        revert NotImplemented();
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice UI insertion-hint search into an option's threshold-sorted list.
    /// @param _coreDisputeID The forking dispute.
    /// @param _choice The option to search.
    /// @param _threshold The threshold to place.
    /// @param _searchStart The node to begin from.
    /// @return nextID The node ID to insert before.
    function search(
        uint256 _coreDisputeID,
        uint256 _choice,
        uint256 _threshold,
        uint256 _searchStart
    ) external view returns (uint256 nextID) {
        _coreDisputeID;
        _choice;
        _threshold;
        _searchStart;
        revert NotImplemented();
    }

    /// @notice Helper to compute a forking vote commitment off the same scheme used by `revealVote`.
    /// @param _choice The choice.
    /// @param _threshold The forking threshold.
    /// @param _salt The salt.
    /// @return The commitment hash.
    function hashForkVote(uint256 _choice, uint256 _threshold, uint256 _salt) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_choice, _threshold, _salt));
    }

    // ************************************* //
    // *         IDisputeKit surface       * //
    // ************************************* //

    /// @notice Initiates the forking round for a core dispute. The 3rd argument is the number of choices
    ///         (per `IDisputeKit`); the winner is determined by the round, not passed in.
    /// @param _coreDisputeID The dispute ID in Kleros Core.
    /// @param _numberOfChoices The number of choices.
    function createDispute(
        uint256 _coreDisputeID,
        uint256 /*_coreRoundID*/,
        uint256 _numberOfChoices,
        bytes calldata /*_extraData*/,
        uint256 /*_nbVotes*/
    ) external override onlyByCore {
        require(!initialized[_coreDisputeID], ForkAlreadyInitiated());
        initialized[_coreDisputeID] = true;
        forkingRounds[_coreDisputeID].numberOfChoices = _numberOfChoices;
    }

    /// @notice No drawing happens in a forking round (nbVotes = 0). Returns zeros harmlessly; Core may call
    ///         this and MUST NOT revert.
    function draw(
        uint256 /*_coreDisputeID*/,
        uint256 /*_nonce*/,
        uint256 /*_roundNbVotes*/
    ) external override returns (address, uint96) {
        return (address(0), 0);
    }

    /// @notice The final ruling: the plurality winner `a_main` once determined, else 0. Never tied/overridden.
    function currentRuling(
        uint256 _coreDisputeID
    ) external view override returns (uint256 ruling, bool tied, bool overridden) {
        ForkingRound storage round = forkingRounds[_coreDisputeID];
        return (round.winnerDetermined ? round.winningChoice : 0, false, false);
    }

    // --- The following IDisputeKit functions are inert for the forking kit. --- //

    /// @inheritdoc IDisputeKit
    function getDegreeOfCoherenceReward(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) external pure override returns (uint256, uint256) {
        return (0, 0);
    }

    /// @inheritdoc IDisputeKit
    function getDegreeOfCoherencePenalty(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) external pure override returns (uint256) {
        return 0;
    }

    /// @inheritdoc IDisputeKit
    function getCoherentCount(uint256, uint256) external pure override returns (uint256) {
        return 0;
    }

    /// @inheritdoc IDisputeKit
    function getRewards(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ) external pure override returns (uint256, uint256) {
        return (0, 0);
    }

    /// @inheritdoc IDisputeKit
    function areCommitsAllCast(uint256) external pure override returns (bool) {
        return false; // Time-based progression, not commit-count based.
    }

    /// @inheritdoc IDisputeKit
    function areVotesAllCast(uint256) external pure override returns (bool) {
        return false; // Time-based progression, not vote-count based.
    }

    /// @inheritdoc IDisputeKit
    function isAppealFunded(uint256) external pure override returns (bool) {
        return false;
    }

    /// @inheritdoc IDisputeKit
    function getNextRoundSettings(
        uint256,
        uint96,
        uint96,
        uint256,
        uint256,
        uint256
    ) external pure override returns (uint96, uint256, uint256) {
        revert UnsupportedOperation(); // The forking round is terminal: no next round.
    }

    /// @inheritdoc IDisputeKit
    function isVoteActive(uint256, uint256, uint256) external pure override returns (bool) {
        return false;
    }

    /// @inheritdoc IDisputeKit
    function getRoundInfo(
        uint256,
        uint256,
        uint256
    ) external pure override returns (uint256, bool, uint256, uint256, uint256, uint256) {
        return (0, false, 0, 0, 0, 0);
    }

    /// @inheritdoc IDisputeKit
    function getVoteInfo(uint256, uint256, uint256) external pure override returns (address, bytes32, uint256, bool) {
        return (address(0), bytes32(0), 0, false);
    }
}

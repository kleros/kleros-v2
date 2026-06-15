// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {KlerosCore} from "../KlerosCore.sol";
import {ForkToken} from "../../token/ForkToken.sol";
import {ISlashDestination} from "../interfaces/ISlashDestination.sol";

/// @title ForkSettlement
/// @notice Performs the settlement of a forking round (see `docs/layer-1-core/07-forking.md`):
///         supply-equalized redistribution, fork-token genesis minting, joiner exit, slashing of the
///         silent, and release of the stake freeze. Kept as a separate contract from `DisputeKitForking`
///         (Q-007 baseline) to isolate the mint authority and stay under the 24 KB bytecode limit.
///
///         Settlement is a paginated phase machine:
///           Capture     — surrender each joiner's main-chain PNK to Core (no refund).
///           MainDistrib — credit each main-fork stayer a supply-equalized share of the captured pool.
///           Mint        — deploy/mint each minority fork token, crediting joiners their genesis balance.
///           Done        — release the freeze.
///
///         Supply-equalization (G-5): a holder's genesis on its fork = weight × originalTotalSupply / forkSize.
///
/// @dev TDD skeleton — every state-changing body reverts `NotImplemented()`. The DK computes the weight
///      arrays before `initSettle`, so the genesis basis (Q-002 baseline: stake-snapshot pro-rata) is
///      isolated to the DK and a later decision does not touch this contract.
contract ForkSettlement {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    enum Phase {
        Capture, // Surrendering joiner stakes to the captured pool.
        MainDistrib, // Crediting main-fork stayers.
        Mint, // Minting minority fork tokens.
        Done // Settlement complete, freeze released.
    }

    /// @dev Per-forking-dispute settlement state.
    struct Settlement {
        Phase phase; // The current settlement phase.
        uint256 originalTotalSupply; // Snapshot of PNK total supply at settlement start (G-5 target).
        uint256 mainForkSize; // Total weight staying on the main fork.
        uint256 joinersTotal; // Running total of captured joiner PNK (+ absorbed slashes, Q-006 baseline).
        uint256 captureCursor; // Pagination cursor into the flattened joiner list.
        uint256 distribCursor; // Pagination cursor into the stayer list.
        uint256 mintCursor; // Pagination cursor into the flattened joiner list (mint phase).
        uint256 settleDeadline; // Timestamp after which `forceUnfreeze` may be called (relates to Q-008).
        bool initialized; // True once `initSettle` has run.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The owner of the contract.
    KlerosCore public core; // The Kleros Core arbitrator.
    IERC20 public pinakion; // The PNK token.
    address public disputeKit; // The DisputeKitForking allowed to call `initSettle`.
    ISlashDestination public slashDestination; // Where slashed PNK goes (Q-006). May be self/absorb.

    mapping(uint256 coreDisputeID => Settlement) public settlements;
    // Per dispute: the deployed fork token for each minority option (0 if the option did not fork).
    mapping(uint256 coreDisputeID => mapping(uint256 option => ForkToken)) public forkTokens;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when settlement begins for a forking dispute.
    event SettlementStarted(uint256 indexed _coreDisputeID, uint256 _originalTotalSupply);
    /// @notice Emitted when a minority fork token is created at genesis.
    event ForkTokenCreated(uint256 indexed _coreDisputeID, uint256 indexed _option, address _token);
    /// @notice Emitted when settlement completes and the freeze releases.
    event ForkSettled(uint256 indexed _coreDisputeID);

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error NotImplemented();
    error DisputeKitOnly();
    error AlreadyInitialized();
    error AlreadySettled();
    error NotPastDeadline();

    // ************************************* //
    // *             Modifiers             * //
    // ************************************* //

    modifier onlyByDK() {
        require(msg.sender == disputeKit, DisputeKitOnly());
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructs the settlement contract.
    /// @param _owner The owner address.
    /// @param _core The Kleros Core arbitrator.
    /// @param _disputeKit The DisputeKitForking authorized to start settlements.
    constructor(address _owner, KlerosCore _core, address _disputeKit) {
        owner = _owner;
        core = _core;
        pinakion = _core.pinakion();
        disputeKit = _disputeKit;
        slashDestination = ISlashDestination(address(this)); // Baseline Q-006: absorb into redistribution.
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Initializes settlement for a finalized forking round. Snapshots total supply and deploys
    ///         a fork token per non-empty minority option. Called by `DisputeKitForking.finalize`.
    /// @param _coreDisputeID The forking dispute.
    /// @param _mainStayers The accounts staying on the main fork (winners + cut-off losers).
    /// @param _mainWeights The corresponding main-fork weights.
    /// @param _options The losing options that formed a non-empty minority fork.
    /// @param _joiners Per option, the joiner accounts.
    /// @param _joinerWeights Per option, the joiner weights (parallel to `_joiners`).
    function initSettle(
        uint256 _coreDisputeID,
        address[] calldata _mainStayers,
        uint256[] calldata _mainWeights,
        uint256[] calldata _options,
        address[][] calldata _joiners,
        uint256[][] calldata _joinerWeights
    ) external onlyByDK {
        _coreDisputeID;
        _mainStayers;
        _mainWeights;
        _options;
        _joiners;
        _joinerWeights;
        revert NotImplemented();
    }

    /// @notice Advances settlement by up to `_maxIt` steps across the Capture → MainDistrib → Mint → Done
    ///         phases. Anyone may drive it; idempotent past `Done`.
    /// @param _coreDisputeID The forking dispute.
    /// @param _maxIt The pagination bound for this call.
    function settle(uint256 _coreDisputeID, uint256 _maxIt) external {
        _coreDisputeID;
        _maxIt;
        revert NotImplemented();
    }

    /// @notice Slashes a silent (non-revealing) staker/escrow holder (G-8). Routes the amount to
    ///         `slashDestination` (baseline: absorbed into the stayer bonus).
    /// @param _coreDisputeID The forking dispute.
    /// @param _account The silent holder.
    /// @param _amount The amount to slash.
    function slash(uint256 _coreDisputeID, address _account, uint256 _amount) external onlyByDK {
        _coreDisputeID;
        _account;
        _amount;
        revert NotImplemented();
    }

    /// @notice Emergency release of the stake freeze if settlement stalls past the deadline (Q-008 backstop).
    /// @param _coreDisputeID The forking dispute.
    function forceUnfreeze(uint256 _coreDisputeID) external {
        _coreDisputeID;
        revert NotImplemented();
    }
}

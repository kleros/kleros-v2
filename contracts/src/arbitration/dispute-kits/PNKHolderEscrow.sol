// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {KlerosCore} from "../KlerosCore.sol";

/// @title PNKHolderEscrow
/// @notice The tier-2 forking participation path for PNK holders on the home chain who have no active
///         stake. A holder deposits PNK here (the deposit is their forking vote weight, additive with
///         any staked weight) and then commits/reveals like a staker. After settlement, stayers are
///         refunded their deposit plus the redistribution bonus, joiners' deposits are forwarded to
///         `ForkSettlement` (they receive fork tokens instead), and non-revealers are slashed (G-8).
///
/// @dev TDD skeleton — every state-changing body reverts `NotImplemented()`. The single PNK transfer
///      back to a holder (in `settleEscrow`) MUST follow checks-effects-interactions and be guarded by
///      `nonReentrant` in the implementation pass.
contract PNKHolderEscrow {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    /// @dev A holder's escrow participation for a single forking dispute.
    struct EscrowVote {
        uint256 deposit; // The escrowed PNK = the holder's tier-2 weight.
        bytes32 commit; // keccak256(choice, threshold, salt).
        uint256 choice; // Revealed choice (0 until revealed).
        uint256 threshold; // Revealed forking threshold.
        bool revealed; // True once the holder reveals.
        bool settled; // True once the holder's escrow has been settled.
        uint256[5] __gap; // Reserved slots for future upgrades.
    }

    address public owner; // The owner of the contract.
    KlerosCore public core; // The Kleros Core arbitrator.
    IERC20 public pinakion; // The PNK token.
    address public forkSettlement; // The settlement contract that consumes joiner deposits.
    mapping(uint256 coreDisputeID => mapping(address holder => EscrowVote)) public escrowVotes;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a holder deposits PNK into escrow for a forking dispute.
    event EscrowDeposited(uint256 indexed _coreDisputeID, address indexed _holder, uint256 _amount);
    /// @notice Emitted when a holder commits an escrow vote.
    event EscrowCommitted(uint256 indexed _coreDisputeID, address indexed _holder, bytes32 _commit);
    /// @notice Emitted when a holder reveals an escrow vote.
    event EscrowRevealed(uint256 indexed _coreDisputeID, address indexed _holder, uint256 _choice, uint256 _threshold);
    /// @notice Emitted when a holder's escrow is settled.
    event EscrowSettled(uint256 indexed _coreDisputeID, address indexed _holder, uint256 _payout);

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error NotImplemented();
    error KlerosCoreOnly();
    error ForkSettlementOnly();

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructs the escrow. Not upgradeable in the skeleton; the implementation pass decides
    ///         whether to switch to the project's UUPS proxy pattern.
    /// @param _owner The owner address.
    /// @param _core The Kleros Core arbitrator.
    constructor(address _owner, KlerosCore _core) {
        owner = _owner;
        core = _core;
        pinakion = _core.pinakion();
    }

    /// @notice Sets the settlement contract allowed to pull joiner deposits.
    /// @param _forkSettlement The `ForkSettlement` address.
    function setForkSettlement(address _forkSettlement) external {
        require(msg.sender == owner, NotImplemented());
        forkSettlement = _forkSettlement;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Deposits PNK into escrow for a forking dispute. The deposit is the holder's tier-2 weight.
    /// @param _coreDisputeID The forking dispute.
    /// @param _amount The amount of PNK to escrow.
    function deposit(uint256 _coreDisputeID, uint256 _amount) external {
        _coreDisputeID;
        _amount;
        revert NotImplemented();
    }

    /// @notice Commits a hidden escrow vote: keccak256(choice, threshold, salt).
    /// @param _coreDisputeID The forking dispute.
    /// @param _commit The commitment hash.
    function commit(uint256 _coreDisputeID, bytes32 _commit) external {
        _coreDisputeID;
        _commit;
        revert NotImplemented();
    }

    /// @notice Reveals a previously committed escrow vote.
    /// @param _coreDisputeID The forking dispute.
    /// @param _choice The revealed choice.
    /// @param _threshold The revealed forking threshold.
    /// @param _salt The salt used in the commit.
    function reveal(uint256 _coreDisputeID, uint256 _choice, uint256 _threshold, uint256 _salt) external {
        _coreDisputeID;
        _choice;
        _threshold;
        _salt;
        revert NotImplemented();
    }

    /// @notice Settles a holder's escrow after the forking round's settlement reaches `Done`.
    ///         Stayers: refunded deposit + bonus. Joiners: deposit forwarded to settlement. Silent: slashed.
    /// @param _coreDisputeID The forking dispute.
    /// @param _holder The holder to settle.
    function settleEscrow(uint256 _coreDisputeID, address _holder) external {
        _coreDisputeID;
        _holder;
        revert NotImplemented();
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Reads a holder's revealed tier-2 contribution, folded into the tally by `DisputeKitForking`.
    /// @param _coreDisputeID The forking dispute.
    /// @param _account The holder.
    /// @return choice The revealed choice (0 if not revealed).
    /// @return threshold The revealed threshold.
    /// @return weight The escrow weight (the deposit) if revealed, else 0.
    function revealOf(
        uint256 _coreDisputeID,
        address _account
    ) external view returns (uint256 choice, uint256 threshold, uint256 weight) {
        EscrowVote storage v = escrowVotes[_coreDisputeID][_account];
        if (!v.revealed) return (0, 0, 0);
        return (v.choice, v.threshold, v.deposit);
    }
}

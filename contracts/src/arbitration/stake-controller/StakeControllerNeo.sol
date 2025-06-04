// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {StakeControllerBase} from "./StakeControllerBase.sol";
import {IPNKVault} from "../interfaces/IPNKVault.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {KlerosCore} from "../KlerosCore.sol";
import {RNG} from "../../rng/RNG.sol";

/// @title StakeControllerNeo
/// @notice Enhanced implementation of the Stake Controller with additional features
/// @dev Coordinates between PNKVault and SortitionModule with improved penalty logic
contract StakeControllerNeo is StakeControllerBase {
    string public constant override version = "1.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    mapping(uint256 => IDisputeKit) public disputeKits; // Mapping from dispute kit ID to dispute kit contract
    uint256 public disputeKitsLength; // Number of registered dispute kits

    // Enhanced penalty tracking
    mapping(address => uint256) public totalPenaltiesApplied; // Track total penalties per juror
    mapping(address => uint256) public lastPenaltyBlock; // Track when last penalty was applied

    // Coordination enhancement flags
    bool public enableEnhancedInactivityChecks; // Whether to use enhanced inactivity detection
    uint256 public penaltyCooldownBlocks; // Minimum blocks between penalties for same juror

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event DisputeKitRegistered(uint256 indexed disputeKitID, IDisputeKit indexed disputeKit);
    event EnhancedInactivityChecksToggled(bool enabled);
    event PenaltyCooldownChanged(uint256 newCooldown);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _governor The governor's address.
    /// @param _core The KlerosCore contract.
    /// @param _vault The PNKVault contract.
    /// @param _sortitionModule The SortitionModule contract.
    /// @param _minStakingTime The minimum staking time.
    /// @param _maxDrawingTime The maximum drawing time.
    /// @param _rng The random number generator.
    /// @param _rngLookahead The RNG lookahead time.
    /// @param _enableEnhancedInactivityChecks Whether to enable enhanced inactivity checks.
    /// @param _penaltyCooldownBlocks Minimum blocks between penalties.
    function initialize(
        address _governor,
        KlerosCore _core,
        IPNKVault _vault,
        ISortitionModule _sortitionModule,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        RNG _rng,
        uint256 _rngLookahead,
        bool _enableEnhancedInactivityChecks,
        uint256 _penaltyCooldownBlocks
    ) external reinitializer(2) {
        __StakeControllerBase_initialize(
            _governor,
            _core,
            _vault,
            _sortitionModule,
            _minStakingTime,
            _maxDrawingTime,
            _rng,
            _rngLookahead
        );

        enableEnhancedInactivityChecks = _enableEnhancedInactivityChecks;
        penaltyCooldownBlocks = _penaltyCooldownBlocks;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Register a dispute kit for enhanced inactivity checks
    /// @param _disputeKitID The ID of the dispute kit
    /// @param _disputeKit The dispute kit contract
    function registerDisputeKit(uint256 _disputeKitID, IDisputeKit _disputeKit) external onlyByGovernor {
        disputeKits[_disputeKitID] = _disputeKit;
        if (_disputeKitID >= disputeKitsLength) {
            disputeKitsLength = _disputeKitID + 1;
        }
        emit DisputeKitRegistered(_disputeKitID, _disputeKit);
    }

    /// @dev Toggle enhanced inactivity checks
    /// @param _enabled Whether to enable enhanced checks
    function toggleEnhancedInactivityChecks(bool _enabled) external onlyByGovernor {
        enableEnhancedInactivityChecks = _enabled;
        emit EnhancedInactivityChecksToggled(_enabled);
    }

    /// @dev Change penalty cooldown blocks
    /// @param _penaltyCooldownBlocks New cooldown period in blocks
    function changePenaltyCooldownBlocks(uint256 _penaltyCooldownBlocks) external onlyByGovernor {
        penaltyCooldownBlocks = _penaltyCooldownBlocks;
        emit PenaltyCooldownChanged(_penaltyCooldownBlocks);
    }

    // ************************************* //
    // *        Enhanced Functions         * //
    // ************************************* //

    /// @dev Enhanced penalty execution with cooldown and tracking
    function executeJurorPenalty(
        address _account,
        uint256 _penalty,
        uint256 _totalStake
    ) external override onlyByCore returns (uint256 actualPenalty) {
        // Check penalty cooldown
        if (penaltyCooldownBlocks > 0 && lastPenaltyBlock[_account] + penaltyCooldownBlocks > block.number) {
            revert PenaltyCooldownActive();
        }

        // Execute penalty through vault coordination (base implementation)
        vault.unlockTokens(_account, _penalty);
        actualPenalty = vault.applyPenalty(_account, _penalty);

        // Update tracking
        totalPenaltiesApplied[_account] += actualPenalty;
        lastPenaltyBlock[_account] = block.number;

        emit JurorPenaltyExecuted(_account, _penalty, actualPenalty);
        return actualPenalty;
    }

    /// @dev Enhanced inactivity check with dispute kit integration
    function shouldSetJurorInactive(
        address _account,
        uint256 _disputeID,
        uint256 _round,
        uint256 _repartition
    ) external view override returns (bool shouldSet) {
        // Check if juror has any remaining deposited balance
        uint256 remainingBalance = vault.getDepositedBalance(_account);
        if (remainingBalance == 0) {
            return true;
        }

        // If enhanced checks are disabled, use basic check
        if (!enableEnhancedInactivityChecks) {
            return false;
        }

        // Enhanced check: query dispute kit for vote activity
        // Note: This requires the dispute kit to be properly registered
        // For now, we'll implement a basic version that can be extended

        // If juror has been penalized heavily, consider setting inactive
        uint256 penaltyRatio = (totalPenaltiesApplied[_account] * 10000) /
            (remainingBalance + totalPenaltiesApplied[_account]);
        if (penaltyRatio > 5000) {
            // If more than 50% of original stake was penalized
            return true;
        }

        return false;
    }

    // ************************************* //
    // *           View Functions          * //
    // ************************************* //

    /// @notice Get penalty statistics for a juror
    /// @param _account The juror address
    /// @return totalPenalties Total penalties applied
    /// @return lastPenaltyBlock_ Block when last penalty was applied
    /// @return cooldownRemaining Blocks remaining in cooldown (0 if no cooldown)
    function getPenaltyStats(
        address _account
    ) external view returns (uint256 totalPenalties, uint256 lastPenaltyBlock_, uint256 cooldownRemaining) {
        totalPenalties = totalPenaltiesApplied[_account];
        lastPenaltyBlock_ = lastPenaltyBlock[_account];

        if (penaltyCooldownBlocks > 0 && lastPenaltyBlock_ + penaltyCooldownBlocks > block.number) {
            cooldownRemaining = (lastPenaltyBlock_ + penaltyCooldownBlocks) - block.number;
        } else {
            cooldownRemaining = 0;
        }
    }

    /// @notice Check if a juror is in penalty cooldown
    /// @param _account The juror address
    /// @return Whether the juror is in cooldown
    function isInPenaltyCooldown(address _account) external view returns (bool) {
        if (penaltyCooldownBlocks == 0) return false;
        return lastPenaltyBlock[_account] + penaltyCooldownBlocks > block.number;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error PenaltyCooldownActive();
}

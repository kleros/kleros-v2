// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "./KlerosCoreBase.sol";

/// @title KlerosCore
/// @notice KlerosCore implementation with new StakeController architecture for testing environments
contract KlerosCore is KlerosCoreBase {
    /// @notice Version of the implementation contract
    string public constant override version = "0.0.1";

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialization function for UUPS proxy
    /// @param _governor The governor of the contract.
    /// @param _guardian The guardian able to pause asset withdrawals.
    /// @param _jurorProsecutionModule The module for juror's prosecution.
    /// @param _disputeKit The dispute kit responsible for the dispute logic.
    /// @param _hiddenVotes Whether to use commit and reveal or not.
    /// @param _courtParameters [0]: minStake, [1]: alpha, [2]: feeForJuror, [3]: jurorsForCourtJump
    /// @param _timesPerPeriod The timesPerPeriod array for courts
    /// @param _sortitionExtraData Extra data for sortition module setup
    /// @param _stakeController The stake controller for coordination
    /// @param _vault The vault for coordination
    function initialize(
        address _governor,
        address _guardian,
        address _jurorProsecutionModule,
        IDisputeKit _disputeKit,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        bytes memory _sortitionExtraData,
        IStakeController _stakeController,
        IVault _vault
    ) external initializer {
        __KlerosCoreBase_initialize(
            _governor,
            _guardian,
            _jurorProsecutionModule,
            _disputeKit,
            _hiddenVotes,
            _courtParameters,
            _timesPerPeriod,
            _sortitionExtraData,
            _stakeController,
            _vault
        );
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Access Control to perform implementation upgrades (UUPS Proxiable)
    ///         Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // Empty block: access control implemented by `onlyByGovernor` modifier
    }
}

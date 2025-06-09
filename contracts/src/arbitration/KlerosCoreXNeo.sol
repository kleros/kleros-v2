// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "./KlerosCoreXBase.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title KlerosCoreXNeo
/// @notice KlerosCore with whitelisted arbitrables
contract KlerosCoreXNeo is KlerosCoreXBase {
    string public constant override version = "0.0.1";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    mapping(address => bool) public arbitrableWhitelist; // Arbitrable whitelist.

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
    ) external reinitializer(2) {
        __KlerosCoreXBase_initialize(
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

    function initialize5() external reinitializer(5) {
        // NOP
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Access Control to perform implementation upgrades (UUPS Proxiable)
    ///         Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Adds or removes an arbitrable from whitelist.
    /// @param _arbitrable Arbitrable address.
    /// @param _allowed Whether add or remove permission.
    function changeArbitrableWhitelist(address _arbitrable, bool _allowed) external onlyByGovernor {
        arbitrableWhitelist[_arbitrable] = _allowed;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function _createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData,
        IERC20 _feeToken,
        uint256 _feeAmount
    ) internal override returns (uint256 disputeID) {
        if (!arbitrableWhitelist[msg.sender]) revert ArbitrableNotWhitelisted();
        return super._createDispute(_numberOfChoices, _extraData, _feeToken, _feeAmount);
    }

    function _stakingFailed(OnError _onError, StakingResult _result) internal pure override {
        super._stakingFailed(_onError, _result);
        if (_result == StakingResult.CannotStakeMoreThanMaxStakePerJuror) revert StakingMoreThanMaxStakePerJuror();
        if (_result == StakingResult.CannotStakeMoreThanMaxTotalStaked) revert StakingMoreThanMaxTotalStaked();
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error StakingMoreThanMaxStakePerJuror();
    error StakingMoreThanMaxTotalStaked();
    error ArbitrableNotWhitelisted();
}

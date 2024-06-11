// SPDX-License-Identifier: MIT

/// @custom:authors: [@unknownunknown1, @jaybuidl]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.24;

import "./KlerosCoreBase.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import {Initializable} from "../proxy/Initializable.sol";

/// @title KlerosCore
/// Core arbitrator contract for Kleros v2.
/// Note that this contract trusts the PNK token, the dispute kit and the sortition module contracts.
contract KlerosCore is KlerosCoreBase, UUPSProxiable, Initializable {
    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _governor The governor's address.
    /// @param _guardian The guardian's address.
    /// @param _pinakion The address of the token contract.
    /// @param _jurorProsecutionModule The address of the juror prosecution module.
    /// @param _disputeKit The address of the default dispute kit.
    /// @param _hiddenVotes The `hiddenVotes` property value of the general court.
    /// @param _courtParameters Numeric parameters of General court (minStake, alpha, feeForJuror and jurorsForCourtJump respectively).
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the general court.
    /// @param _sortitionModuleAddress The sortition module responsible for sortition of the jurors.
    function initialize(
        address _governor,
        address _guardian,
        IERC20 _pinakion,
        address _jurorProsecutionModule,
        IDisputeKit _disputeKit,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        ISortitionModule _sortitionModuleAddress
    ) external reinitializer(1) {
        _initialize(
            _governor,
            _guardian,
            _pinakion,
            _jurorProsecutionModule,
            _disputeKit,
            _hiddenVotes,
            _courtParameters,
            _timesPerPeriod,
            _sortitionModuleAddress
        );
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }
}

// SPDX-License-Identifier: MIT

/// @custom:authors: [@unknownunknown1, @jaybuidl]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.24;

import "./DisputeKitClassicBase.sol";
import "../KlerosCore.sol";
import "../../proxy/UUPSProxiable.sol";

interface IProofOfHumanity {
    /// @dev Return true if the submission is registered and not expired.
    /// @param _submissionID The address of the submission.
    /// @return Whether the submission is registered or not.
    function isRegistered(address _submissionID) external view returns (bool);
}

/// @title DisputeKitSybilResistant
/// Dispute kit implementation adapted from DisputeKitClassic
/// - a drawing system: at most 1 vote per juror registered on Proof of Humanity,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitSybilResistant is DisputeKitClassicBase, UUPSProxiable {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IProofOfHumanity public poh; // The Proof of Humanity registry

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer.
    /// @param _governor The governor's address.
    /// @param _core The KlerosCore arbitrator.
    /// @param _poh The Proof of Humanity registry.
    function initialize(address _governor, KlerosCore _core, IProofOfHumanity _poh) external reinitializer(1) {
        __DisputeKitClassicBase_initialize(_governor, _core);
        poh = _poh;
        singleDrawPerJuror = true;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Checks that the chosen address satisfies certain conditions for being drawn.
    /// Note that we don't check the minStake requirement here because of the implicit staking in parent courts.
    /// minStake is checked directly during staking process however it's possible for the juror to get drawn
    /// while having < minStake if it is later increased by governance.
    /// This issue is expected and harmless since we check for insolvency anyway.
    /// @param _round The round in which the juror is being drawn.
    /// @param _coreDisputeID ID of the dispute in the core contract.
    /// @param _juror Chosen address.
    /// @return result Whether the address can be drawn or not.
    function _postDrawCheck(
        Round storage _round,
        uint256 _coreDisputeID,
        address _juror
    ) internal view override returns (bool) {
        return super._postDrawCheck(_round, _coreDisputeID, _juror) && poh.isRegistered(_juror);
    }
}

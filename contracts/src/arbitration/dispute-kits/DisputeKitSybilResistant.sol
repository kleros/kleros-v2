// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {DisputeKitClassicBase, KlerosCoreV2} from "./DisputeKitClassicBase.sol";

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
contract DisputeKitSybilResistant is DisputeKitClassicBase {
    string public constant override version = "0.10.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IProofOfHumanity public poh; // The Proof of Humanity registry

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer.
    /// @param _governor The governor's address.
    /// @param _core The KlerosCore arbitrator.
    /// @param _poh The Proof of Humanity registry.
    function initialize(address _governor, KlerosCoreV2 _core, IProofOfHumanity _poh) external reinitializer(1) {
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

    /// @inheritdoc DisputeKitClassicBase
    function _postDrawCheck(
        Round storage _round,
        uint256 _coreDisputeID,
        address _juror
    ) internal view override returns (bool) {
        return super._postDrawCheck(_round, _coreDisputeID, _juror) && poh.isRegistered(_juror);
    }
}

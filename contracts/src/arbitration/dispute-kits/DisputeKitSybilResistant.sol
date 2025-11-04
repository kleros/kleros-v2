// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassicBase} from "./DisputeKitClassicBase.sol";
import {KlerosCore} from "../KlerosCore.sol";

interface IProofOfHumanity {
    /// @notice Check whether the account corresponds to a claimed humanity.
    /// @dev From https://github.com/Proof-Of-Humanity/proof-of-humanity-v2-contracts/blob/a331e7b6bb0f7a7ad9a905d41032cecc52bf06a6/contracts/ProofOfHumanity.sol#L1495-L1502
    /// @param _account The account address.
    /// @return Whether the account has a valid humanity.
    function isHuman(address _account) external view returns (bool);
}

/// @title DisputeKitSybilResistant
/// @notice Dispute kit implementation adapted from DisputeKitClassic
/// - a drawing system: at most 1 vote per juror registered on Proof of Humanity,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitSybilResistant is DisputeKitClassicBase {
    string public constant override version = "2.0.0";

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

    /// @notice Initializer.
    /// @param _owner The owner's address.
    /// @param _core The KlerosCore arbitrator.
    /// @param _poh The Proof of Humanity registry.
    /// @param _wNative The wrapped native token address, typically wETH.
    function initialize(
        address _owner,
        KlerosCore _core,
        IProofOfHumanity _poh,
        address _wNative
    ) external initializer {
        __DisputeKitClassicBase_initialize(_owner, _core, _wNative);
        poh = _poh;
        singleDrawPerJuror = true;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @inheritdoc DisputeKitClassicBase
    function _postDrawCheck(
        Round storage _round,
        uint256 _coreDisputeID,
        address _juror,
        uint256 _roundNbVotes
    ) internal view override returns (bool) {
        return super._postDrawCheck(_round, _coreDisputeID, _juror, _roundNbVotes) && poh.isHuman(_juror);
    }
}

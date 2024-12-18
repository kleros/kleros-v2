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

interface IToken {
    /// @dev Returns the number of tokens in `owner` account.
    /// @param owner The address of the owner.
    /// @return balance The number of tokens in `owner` account.
    function balanceOf(address owner) external view returns (uint256 balance);
}

/// @title DisputeKitGated
/// Dispute kit implementation adapted from DisputeKitClassic
/// - a drawing system: proportional to staked PNK with a non-zero balance of `tokenGate`,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitGated is DisputeKitClassicBase, UUPSProxiable {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IToken public tokenGate; // The token used for gating access.

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
    /// @param _tokenGate The token used for gating access.
    function initialize(address _governor, KlerosCore _core, IToken _tokenGate) external reinitializer(1) {
        __DisputeKitClassicBase_initialize(_governor, _core);
        tokenGate = _tokenGate;
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
    /// @return result Whether the address passes the check or not.
    function _postDrawCheck(
        Round storage _round,
        uint256 _coreDisputeID,
        address _juror
    ) internal view override returns (bool) {
        return super._postDrawCheck(_round, _coreDisputeID, _juror) && tokenGate.balanceOf(_juror) > 0;
    }
}

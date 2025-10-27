// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassicBase} from "./DisputeKitClassicBase.sol";
import {KlerosCore} from "../KlerosCore.sol";

interface IBalanceHolder {
    /// @notice Returns the number of tokens in `owner` account.
    /// @dev Compatible with ERC-20 and ERC-721.
    /// @param owner The address of the owner.
    /// @return balance The number of tokens in `owner` account.
    function balanceOf(address owner) external view returns (uint256 balance);
}

/// @title DisputeKitGatedArgentinaConsumerProtection
/// @notice Dispute kit implementation adapted from DisputeKitClassic
/// - a drawing system: proportional to staked PNK among the jurors holding a `accreditedProfessionalToken` or a `accreditedConsumerProtectionLawyerToken`
///   and at least one of the drawn jurors is holding a `accreditedConsumerProtectionLawyerToken`,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitGatedArgentinaConsumerProtection is DisputeKitClassicBase {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public accreditedProfessionalToken; // The address of the accredited professional token.
    address public accreditedConsumerProtectionLawyerToken; // The address of the accredited consumer protection lawyer token.
    mapping(uint256 localDisputeID => mapping(uint256 localRoundID => bool)) public drawnConsumerProtectionLawyer; // Maps the local dispute and round ID to the boolean indicating if the consumer protection lawyer was drawn.

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
    /// @param _wNative The wrapped native token address, typically wETH.
    /// @param _accreditedProfessionalToken The address of the accredited professional token.
    /// @param _accreditedConsumerProtectionLawyerToken The address of the accredited consumer protection lawyer token.
    function initialize(
        address _owner,
        KlerosCore _core,
        address _wNative,
        address _accreditedProfessionalToken,
        address _accreditedConsumerProtectionLawyerToken
    ) external initializer {
        __DisputeKitClassicBase_initialize(_owner, _core, _wNative);
        accreditedProfessionalToken = _accreditedProfessionalToken;
        accreditedConsumerProtectionLawyerToken = _accreditedConsumerProtectionLawyerToken;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @notice Changes the accredited professional token.
    /// @param _accreditedProfessionalToken The address of the accredited lawyer token.
    function changeAccreditedProfessionalToken(address _accreditedProfessionalToken) external onlyByOwner {
        accreditedProfessionalToken = _accreditedProfessionalToken;
    }

    /// @notice Changes the accredited consumer protection lawyer token.
    /// @param _accreditedConsumerProtectionLawyerToken The address of the accredited consumer protection lawyer token.
    function changeAccreditedConsumerProtectionLawyerToken(
        address _accreditedConsumerProtectionLawyerToken
    ) external onlyByOwner {
        accreditedConsumerProtectionLawyerToken = _accreditedConsumerProtectionLawyerToken;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc DisputeKitClassicBase
    function draw(
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 _roundNbVotes
    ) public override onlyByCore isActive(_coreDisputeID) returns (address drawnAddress, uint96 fromSubcourtID) {
        (drawnAddress, fromSubcourtID) = super.draw(_coreDisputeID, _nonce, _roundNbVotes);

        if (drawnAddress == address(0)) return (drawnAddress, fromSubcourtID);

        if (IBalanceHolder(accreditedConsumerProtectionLawyerToken).balanceOf(drawnAddress) > 0) {
            // The drawnAddress is a consumer protection lawyer.
            uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
            uint256 localRoundID = disputes[localDisputeID].rounds.length - 1;
            drawnConsumerProtectionLawyer[localDisputeID][localRoundID] = true;
        }
        return (drawnAddress, fromSubcourtID);
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
        if (IBalanceHolder(accreditedConsumerProtectionLawyerToken).balanceOf(_juror) == 0) {
            // The juror is not a consumer protection lawyer.
            uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
            Dispute storage dispute = disputes[localDisputeID];
            uint256 localRoundID = dispute.rounds.length - 1;
            if (
                dispute.rounds[localRoundID].votes.length == _roundNbVotes - 1 &&
                !drawnConsumerProtectionLawyer[localDisputeID][localRoundID]
            ) {
                // This is the last draw iteration and we still have not drawn a consumer protection lawyer.
                // Reject this draw so that another iteration can try again later.
                return false;
            }
            if (IBalanceHolder(accreditedProfessionalToken).balanceOf(_juror) == 0) {
                // The juror does not hold either of the tokens.
                return false;
            }
        }
        return super._postDrawCheck(_round, _coreDisputeID, _juror, _roundNbVotes);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error TokenNotSupported(address tokenGate);
}

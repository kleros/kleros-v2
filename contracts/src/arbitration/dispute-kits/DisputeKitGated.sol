// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";

interface IBalanceHolder {
    /// @notice Returns the number of tokens in `owner` account.
    /// @dev Compatible with ERC-20 and ERC-721.
    /// @param owner The address of the owner.
    /// @return balance The number of tokens in `owner` account.
    function balanceOf(address owner) external view returns (uint256 balance);
}

interface IBalanceHolderERC1155 {
    /// @notice Returns the balance of an ERC-1155 token.
    /// @param account The address of the token holder
    /// @param id ID of the token
    /// @return The token balance
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

/// @title DisputeKitGated
/// @notice Dispute kit implementation adapted from DisputeKitClassic
/// - a drawing system: proportional to staked PNK with a non-zero balance of `tokenGate` where `tokenGate` is an ERC20, ERC721 or ERC1155
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitGated is DisputeKitClassicBase {
    string public constant override version = "2.0.0";

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
    /// @param _jumpDisputeKitID The ID of the dispute kit to switch to after the court jump.
    function initialize(
        address _owner,
        KlerosCore _core,
        address _wNative,
        uint256 _jumpDisputeKitID
    ) external initializer {
        __DisputeKitClassicBase_initialize(_owner, _core, _wNative, _jumpDisputeKitID);
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

    /// @notice Extracts token gating information from the extra data.
    /// @param _extraData The extra data bytes array with the following encoding:
    /// - bytes 0-31: uint96 courtID, not used here
    /// - bytes 32-63: uint256 minJurors, not used here
    /// - bytes 64-95: uint256 disputeKitID, not used here
    /// - bytes 96-127: uint256 packedTokenGateAndFlag (address tokenGate in bits 0-159, bool isERC1155 in bit 160)
    /// - bytes 128-159: uint256 tokenId
    /// @return tokenGate The address of the token contract used for gating access.
    /// @return isERC1155 True if the token is an ERC-1155, false for ERC-20/ERC-721.
    /// @return tokenId The token ID for ERC-1155 tokens (ignored for ERC-20/ERC-721).
    function _extraDataToTokenInfo(
        bytes memory _extraData
    ) public pure returns (address tokenGate, bool isERC1155, uint256 tokenId) {
        // Need at least 160 bytes to safely read the parameters
        if (_extraData.length < 160) return (address(0), false, 0);

        assembly {
            // solium-disable-line security/no-inline-assembly
            let packedTokenGateIsERC1155 := mload(add(_extraData, 0x80)) // 4th parameter at offset 128
            tokenId := mload(add(_extraData, 0xA0)) // 5th parameter at offset 160 (moved up)

            // Unpack address from lower 160 bits and bool from bit 160
            tokenGate := and(packedTokenGateIsERC1155, 0xffffffffffffffffffffffffffffffffffffffff)
            isERC1155 := and(shr(160, packedTokenGateIsERC1155), 1)
        }
    }

    /// @inheritdoc DisputeKitClassicBase
    function _postDrawCheck(
        Round storage _round,
        uint256 _coreDisputeID,
        address _juror
    ) internal view override returns (bool) {
        if (!super._postDrawCheck(_round, _coreDisputeID, _juror)) return false;

        // Get the local dispute and extract token info from extraData
        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        (address tokenGate, bool isERC1155, uint256 tokenId) = _extraDataToTokenInfo(dispute.extraData);

        // If no token gate is specified, allow all jurors
        if (tokenGate == address(0)) return true;

        // Check juror's token balance
        if (isERC1155) {
            return IBalanceHolderERC1155(tokenGate).balanceOf(_juror, tokenId) > 0;
        } else {
            return IBalanceHolder(tokenGate).balanceOf(_juror) > 0;
        }
    }
}

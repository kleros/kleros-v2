// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";

interface IBalanceHolder {
    /// @dev Returns the number of tokens in `owner` account.
    /// @dev Compatible with ERC-20 and ERC-721.
    /// @param owner The address of the owner.
    /// @return balance The number of tokens in `owner` account.
    function balanceOf(address owner) external view returns (uint256 balance);
}

interface IBalanceHolderERC1155 {
    /// @dev Returns the balance of an ERC-1155 token.
    /// @param account The address of the token holder
    /// @param id ID of the token
    /// @return The token balance
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

/// @title DisputeKitGated
/// Dispute kit implementation adapted from DisputeKitClassic
/// - a drawing system: proportional to staked PNK with a non-zero balance of `tokenGate` where `tokenGate` is an ERC20, ERC721 or ERC1155
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitGated is DisputeKitClassicBase {
    string public constant override version = "0.9.2";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public tokenGate; // The token used for gating access.
    uint256 public tokenId; // Only used for ERC-1155
    bool public isERC1155; // True if the tokenGate is an ERC-1155, false otherwise.

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
    /// @param _tokenGate The token used for gating access.
    /// @param _tokenId The token ID for ERC-1155 (ignored for other token types)
    /// @param _isERC1155 Whether the token is an ERC-1155
    function initialize(
        address _governor,
        KlerosCore _core,
        address _tokenGate,
        uint256 _tokenId,
        bool _isERC1155
    ) external reinitializer(1) {
        __DisputeKitClassicBase_initialize(_governor, _core);
        tokenGate = _tokenGate;
        tokenId = _tokenId;
        isERC1155 = _isERC1155;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Changes the `tokenGate` to an ERC-20 or ERC-721 token.
    /// @param _tokenGate The new value for the `tokenGate` storage variable.
    function changeTokenGateERC20OrERC721(address _tokenGate) external onlyByGovernor {
        tokenGate = _tokenGate;
        isERC1155 = false;
    }

    /// @dev Changes the `tokenGate` to an ERC-1155 token.
    /// @param _tokenGate The new value for the `tokenGate` storage variable.
    /// @param _tokenId The new value for the `tokenId` storage variable.
    function changeTokenGateERC1155(address _tokenGate, uint256 _tokenId) external onlyByGovernor {
        tokenGate = _tokenGate;
        tokenId = _tokenId;
        isERC1155 = true;
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
        if (!super._postDrawCheck(_round, _coreDisputeID, _juror)) return false;

        if (isERC1155) {
            return IBalanceHolderERC1155(tokenGate).balanceOf(_juror, tokenId) > 0;
        } else {
            return IBalanceHolder(tokenGate).balanceOf(_juror) > 0;
        }
    }
}

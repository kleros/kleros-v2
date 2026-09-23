// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";
import {IBalanceHolder, IBalanceHolderERC1155} from "./DisputeKitGated.sol";

/// @title DisputeKitGatedPerCourt
/// Dispute kit implementation adapted from DisputeKitGated
/// - a drawing system: proportional to staked PNK with a non-zero balance of the token gate configured
///   for the court the dispute is **currently** in, where the token gate is an ERC20, ERC721 or ERC1155.
///   A court without a configured token gate is not gated.
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
///
/// Unlike DisputeKitGated, the token gate is not read from the dispute extraData but from governance settings
/// keyed by court. It lets a dispute use a different gate (or none) after a court jump, as long as the parent
/// court supports this dispute kit. The gate is evaluated at drawing time, so a change applies to the next draws
/// of the disputes already created.
contract DisputeKitGatedPerCourt is DisputeKitClassicBase {
    string public constant override version = "0.1.0";

    // ************************************* //
    // *             Structs               * //
    // ************************************* //

    struct TokenGate {
        address token; // The token contract used for gating access, address(0) for no gating.
        bool isERC1155; // True if the token is an ERC-1155, false for ERC-20/ERC-721.
        uint256 tokenId; // The token ID for ERC-1155 tokens (ignored for ERC-20/ERC-721).
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    mapping(uint96 courtID => TokenGate) public courtTokenGates; // The token gate of each court.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev To be emitted when the token gate of a court is changed.
    /// @param _courtID The ID of the court.
    /// @param _token The token contract used for gating access, address(0) for no gating.
    /// @param _isERC1155 True if the token is an ERC-1155, false for ERC-20/ERC-721.
    /// @param _tokenId The token ID for ERC-1155 tokens.
    event CourtTokenGateChanged(uint96 indexed _courtID, address indexed _token, bool _isERC1155, uint256 _tokenId);

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
    /// @param _wNative The wrapped native token address, typically wETH.
    function initialize(address _governor, KlerosCore _core, address _wNative) external reinitializer(1) {
        __DisputeKitClassicBase_initialize(_governor, _core, _wNative);
    }

    function reinitialize() external reinitializer(2) {}

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @notice Changes the token gate of a court.
    /// @param _courtID The ID of the court.
    /// @param _token The token contract used for gating access, address(0) for no gating.
    /// @param _isERC1155 True if the token is an ERC-1155, false for ERC-20/ERC-721.
    /// @param _tokenId The token ID for ERC-1155 tokens, must be 0 for ERC-20/ERC-721.
    /// Note: a gate whose `balanceOf()` reverts blocks the drawing in this court until the gate is changed.
    function changeCourtTokenGate(
        uint96 _courtID,
        address _token,
        bool _isERC1155,
        uint256 _tokenId
    ) external onlyByGovernor {
        if (_token == address(0) && (_isERC1155 || _tokenId != 0)) revert InvalidTokenGate();
        if (!_isERC1155 && _tokenId != 0) revert InvalidTokenGate();
        if (_token != address(0) && _token.code.length == 0) revert InvalidTokenGate(); // balanceOf() would revert on draw
        courtTokenGates[_courtID] = TokenGate({token: _token, isERC1155: _isERC1155, tokenId: _tokenId});
        emit CourtTokenGateChanged(_courtID, _token, _isERC1155, _tokenId);
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

        // The gate of the court the dispute is currently in, which changes after a court jump.
        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        TokenGate storage gate = courtTokenGates[courtID];

        // If no token gate is specified, allow all jurors
        if (gate.token == address(0)) return true;

        // Check juror's token balance
        if (gate.isERC1155) {
            return IBalanceHolderERC1155(gate.token).balanceOf(_juror, gate.tokenId) > 0;
        } else {
            return IBalanceHolder(gate.token).balanceOf(_juror) > 0;
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error InvalidTokenGate();
}

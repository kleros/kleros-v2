// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";
import {IBalanceHolder, IBalanceHolderERC1155} from "./DisputeKitGated.sol";

/// @title IPassportDecoder
/// Human Passport decoder, see https://docs.passport.human.tech/building-with-passport/stamps/smart-contracts/contract-reference
interface IPassportDecoder {
    /// @dev Reverts if the user has no score attestation or if it expired.
    /// @param _user The address of the user.
    /// @return The score of the user with 4 decimals, e.g. 549700 for a score of 54.97.
    function getScore(address _user) external view returns (uint256);
}

/// @title DisputeKitGatedPerCourt
/// Dispute kit implementation adapted from DisputeKitGated
/// - a drawing system: proportional to staked PNK, restricted by the gates configured for the court the dispute
///   is **currently** in:
///   - a token gate: a non-zero balance of an ERC20, ERC721 or ERC1155 token,
///   - a Human Passport gate: a minimum Human Passport score.
///   A juror must pass every gate configured for the court. A court without any configured gate is not gated.
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
///
/// Unlike DisputeKitGated, the gates are not read from the dispute extraData but from governance settings
/// keyed by court. It lets a dispute use different gates (or none) after a court jump, as long as the parent
/// court supports this dispute kit. The gates are evaluated at drawing time, so a change applies to the next draws
/// of the disputes already created.
contract DisputeKitGatedPerCourt is DisputeKitClassicBase {
    string public constant override version = "0.1.0";

    /// @dev The gas forwarded to the Human Passport decoder. `getScore()` uses ~24k gas on Arbitrum One (cold).
    /// If a decoder upgrade makes it cost more, every juror becomes ineligible in the gated courts: governance can
    /// recover by pointing to another decoder, by lifting the gates or by upgrading this contract.
    uint256 public constant PASSPORT_GAS_LIMIT = 100_000;

    /// @dev The gas used between the gas check and the Human Passport decoder call (cold account access, calldata),
    /// so that the decoder always receives PASSPORT_GAS_LIMIT when the check passes.
    uint256 public constant PASSPORT_CALL_OVERHEAD = 10_000;

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
    IPassportDecoder public passportDecoder; // The Human Passport decoder.
    mapping(uint96 courtID => uint256) public courtMinPassportScores; // The minimum Human Passport score of each court (4 decimals), 0 for no gating.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev To be emitted when the token gate of a court is changed.
    /// @param _courtID The ID of the court.
    /// @param _token The token contract used for gating access, address(0) for no gating.
    /// @param _isERC1155 True if the token is an ERC-1155, false for ERC-20/ERC-721.
    /// @param _tokenId The token ID for ERC-1155 tokens.
    event CourtTokenGateChanged(uint96 indexed _courtID, address indexed _token, bool _isERC1155, uint256 _tokenId);

    /// @dev To be emitted when the Human Passport decoder is changed.
    /// @param _passportDecoder The new Human Passport decoder.
    event PassportDecoderChanged(IPassportDecoder indexed _passportDecoder);

    /// @dev To be emitted when the minimum Human Passport score of a court is changed.
    /// @param _courtID The ID of the court.
    /// @param _minPassportScore The minimum Human Passport score (4 decimals), 0 for no gating.
    event CourtMinPassportScoreChanged(uint96 indexed _courtID, uint256 _minPassportScore);

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
    /// @param _passportDecoder The Human Passport decoder, address(0) if not available on this chain.
    function initialize(
        address _governor,
        KlerosCore _core,
        address _wNative,
        IPassportDecoder _passportDecoder
    ) external reinitializer(1) {
        __DisputeKitClassicBase_initialize(_governor, _core, _wNative);
        if (address(_passportDecoder) != address(0)) _changePassportDecoder(_passportDecoder);
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

    /// @notice Changes the Human Passport decoder.
    /// @param _passportDecoder The new Human Passport decoder.
    function changePassportDecoder(IPassportDecoder _passportDecoder) external onlyByGovernor {
        _changePassportDecoder(_passportDecoder);
    }

    /// @notice Changes the minimum Human Passport score of a court.
    /// @param _courtID The ID of the court.
    /// @param _minPassportScore The minimum Human Passport score with 4 decimals (e.g. 200000 for a score of 20),
    /// 0 for no gating.
    /// Note: a juror without a score attestation, or with an expired one, is not eligible in a gated court.
    function changeCourtMinPassportScore(uint96 _courtID, uint256 _minPassportScore) external onlyByGovernor {
        if (_minPassportScore != 0 && address(passportDecoder) == address(0)) revert PassportDecoderNotSet();
        courtMinPassportScores[_courtID] = _minPassportScore;
        emit CourtMinPassportScoreChanged(_courtID, _minPassportScore);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function _changePassportDecoder(IPassportDecoder _passportDecoder) internal {
        if (address(_passportDecoder).code.length == 0) revert InvalidPassportDecoder();
        passportDecoder = _passportDecoder;
        emit PassportDecoderChanged(_passportDecoder);
    }

    /// @inheritdoc DisputeKitClassicBase
    function _postDrawCheck(
        Round storage _round,
        uint256 _coreDisputeID,
        address _juror
    ) internal view override returns (bool) {
        if (!super._postDrawCheck(_round, _coreDisputeID, _juror)) return false;

        // The gate of the court the dispute is currently in, which changes after a court jump.
        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        return _passTokenGate(courtID, _juror) && _passPassportGate(courtID, _juror);
    }

    /// @dev Checks the token gate of a court, if any.
    /// @param _courtID The ID of the court.
    /// @param _juror The address of the juror.
    /// @return Whether the juror passes the token gate.
    function _passTokenGate(uint96 _courtID, address _juror) internal view returns (bool) {
        TokenGate storage gate = courtTokenGates[_courtID];

        // If no token gate is specified, allow all jurors
        if (gate.token == address(0)) return true;

        // Check juror's token balance
        if (gate.isERC1155) {
            return IBalanceHolderERC1155(gate.token).balanceOf(_juror, gate.tokenId) > 0;
        } else {
            return IBalanceHolder(gate.token).balanceOf(_juror) > 0;
        }
    }

    /// @dev Checks the Human Passport gate of a court, if any.
    /// `getScore()` reverts for a juror without a score attestation or with an expired one: such a juror is not
    /// eligible instead of reverting the whole draw. The call is gas-capped and its result validated, so that
    /// an upgrade of the third-party decoder cannot block the draw either.
    /// @param _courtID The ID of the court.
    /// @param _juror The address of the juror.
    /// @return Whether the juror passes the Human Passport gate.
    function _passPassportGate(uint96 _courtID, address _juror) internal view returns (bool) {
        uint256 minPassportScore = courtMinPassportScores[_courtID];

        // If no minimum score is specified, allow all jurors
        if (minPassportScore == 0) return true;

        // Prevents the caller from making the call fail on purpose by providing too little gas (EIP-150), which would
        // let them skip the jurors they do not want drawn: the decoder always gets the full PASSPORT_GAS_LIMIT, so a
        // failed call does not depend on the caller. Checked before the call because the gas left after a failed call
        // does not tell whether it was starved: the nested calls of the decoder return the 1/64 of the gas they kept.
        IPassportDecoder decoder = passportDecoder;
        if (gasleft() < (PASSPORT_GAS_LIMIT * 64) / 63 + PASSPORT_CALL_OVERHEAD) revert NotEnoughGasForPassportCheck();

        (bool success, bytes memory result) = address(decoder).staticcall{gas: PASSPORT_GAS_LIMIT}(
            abi.encodeCall(IPassportDecoder.getScore, (_juror))
        );
        if (!success || result.length < 32) return false;
        return abi.decode(result, (uint256)) >= minPassportScore;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error InvalidTokenGate();
    error InvalidPassportDecoder();
    error PassportDecoderNotSet();
    error NotEnoughGasForPassportCheck();
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "./interfaces/IForeignGateway.sol";
import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";
import "../libraries/Constants.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import {IYaho} from "@kleros/veashi-sdk/contracts/interfaces/IYaho.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IJushin} from "@kleros/veashi-sdk/contracts/interfaces/IJushin.sol";

/// Foreign Gateway
/// Counterpart of `HomeGateway`
contract ForeignGateway is IForeignGateway, IJushin, UUPSProxiable, Initializable {
    using SafeERC20 for IERC20;

    string public constant override version = "0.8.0";
    uint256 public constant RATE_PRECISION = 1e18; // Precision of `homeNativeRate`.

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DisputeData {
        uint248 id;
        bool ruled;
        address arbitrable;
        bool relayed; // Sent to the home chain by `relayDispute`.
        IERC20 feeToken; // NATIVE_CURRENCY or an accepted ERC20.
        uint256 paid; // In `feeToken` units.
    }

    struct CurrencyRate {
        bool feePaymentAccepted;
        uint64 rateInEth;
        uint8 rateDecimals;
    }

    /// @dev A bridge whitelisted by the governor. The same `oracleID` must be registered on the HomeGateway
    /// with the ruling-leg reporter (home chain) and adapter (this chain), so a selection means the same bridges on both legs.
    struct Oracle {
        IReporter outboundReporter; // Dispute leg: reporter on this chain.
        IAdapter outboundAdapter; // Dispute leg: adapter on the home chain.
        IAdapter inboundAdapter; // Ruling leg: adapter on this chain, checked in `onMessage`.
        bool enabled; // Disabled oracles can no longer be selected, existing disputes keep their snapshot.
    }

    /// @dev The oracles an arbitrable selected and the threshold applied to both legs.
    struct OracleSelection {
        uint256[] oracleIDs;
        uint256 threshold;
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event ArbitrationCostModified(uint96 indexed _courtID, uint256 _feeForJuror);
    event YahoChanged(IYaho _yaho);
    event YaruChanged(address _yaru);
    event OracleAdded(
        uint256 indexed _oracleID,
        IReporter _outboundReporter,
        IAdapter _outboundAdapter,
        IAdapter _inboundAdapter
    );
    event OracleEnabled(uint256 indexed _oracleID, bool _enabled);
    event DefaultOraclesSet(uint256[] _oracleIDs, uint256 _threshold);
    event HomeNativeRateChanged(uint256 _homeNativeRate);
    event KeeperGuardrailsChanged(uint256 _maxChangeBps, uint256 _cooldown);
    event OracleBridgingCostSet(uint256 indexed _oracleID, uint256 _bridgingCost);
    event KeeperChanged(address indexed _keeper);
    event NativeWithdrawn(address indexed _to, uint256 _amount);
    event TokenWithdrawn(IERC20 indexed _token, address indexed _to, uint256 _amount);
    event DisputeRelayed(bytes32 indexed _disputeHash, uint256 indexed _messageId);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 internal localDisputeID; // The disputeID must start from 1 as the KlerosV1 proxy governor depends on this implementation. We now also depend on localDisputeID not ever being zero.
    mapping(uint96 courtId => uint256) public feeForJuror; // feeForJuror[v2CourtID], it mirrors the value on KlerosCore, in home native currency.
    address public governor;
    address public keeper; // Supervised by the governor: updates juror and bridging fees and withdraws funds. The governor can replace it at any time.
    uint256 public override homeChainID;
    address public override homeGateway;
    mapping(bytes32 disputeHash => DisputeData) public disputeHashtoDisputeData;

    // Veashi
    IYaho public yaho; // Dispatches the dispute leg.
    address public yaru; // Only caller allowed for `onMessage` (ruling leg).
    uint256 public oracleCount; // Oracle IDs are 0..oracleCount-1.
    mapping(uint256 oracleID => Oracle) public oracles;
    mapping(IAdapter => bool) public isOutboundAdapter; // Prevents counting one adapter twice towards a threshold.
    mapping(IAdapter => bool) public isInboundAdapter; // Idem.
    OracleSelection internal defaultOracles; // Used by `createDispute` calls that do not select oracles.
    mapping(bytes32 disputeHash => OracleSelection) internal disputeOracles; // Snapshot taken at `createDispute`.
    mapping(IERC20 => CurrencyRate) public currencyRates; // The price of each fee token in native currency.
    uint256 public homeNativeRate; // Native currency of this chain per unit of home native currency, scaled by RATE_PRECISION.
    uint256 public keeperMaxChangeBps; // Max relative change of a value per keeper update, in basis points.
    uint256 public keeperCooldown; // Min delay between two keeper updates of the same value, in seconds.
    mapping(bytes32 valueKey => uint256) public lastKeeperUpdate; // Timestamp of the last keeper update of a value.
    mapping(uint256 oracleID => uint256) public oracleBridgingCost; // Round trip (dispute + ruling leg) through this oracle, in native currency.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    modifier onlyByGovernorOrKeeper() {
        if (governor != msg.sender && keeper != msg.sender) revert GovernorOrKeeperOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Constructs the `PolicyRegistry` contract.
    /// @param _governor The governor's address.
    /// @param _keeper The keeper's address.
    /// @param _homeChainID The chainID of the home chain.
    /// @param _homeGateway The address of the home gateway.
    /// @param _yaho The Yaho used to dispatch disputes to the home chain.
    /// @param _yaru The Yaru allowed to deliver rulings.
    /// @param _homeNativeRate Native currency of this chain per unit of home native currency, scaled by RATE_PRECISION.
    /// @param _oracles The initial oracles, registered as IDs 0..n-1. Their `enabled` field is ignored, all start enabled.
    /// @param _defaultOracleIDs The IDs of the default selection.
    /// @param _defaultThreshold The threshold of the default selection.
    function initialize(
        address _governor,
        address _keeper,
        uint256 _homeChainID,
        address _homeGateway,
        IYaho _yaho,
        address _yaru,
        uint256 _homeNativeRate,
        Oracle[] calldata _oracles,
        uint256[] calldata _defaultOracleIDs,
        uint256 _defaultThreshold
    ) external reinitializer(1) {
        governor = _governor;
        keeper = _keeper;
        homeChainID = _homeChainID;
        homeGateway = _homeGateway;
        yaho = _yaho;
        yaru = _yaru;
        _changeHomeNativeRate(_homeNativeRate);
        keeperMaxChangeBps = 500; // 5%
        keeperCooldown = 1 hours;
        localDisputeID = 1;

        for (uint256 i = 0; i < _oracles.length; i++) {
            _addOracle(_oracles[i].outboundReporter, _oracles[i].outboundAdapter, _oracles[i].inboundAdapter);
        }
        _setDefaultOracles(_defaultOracleIDs, _defaultThreshold);
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the governor can perform upgrades (`onlyByGovernor`)
     */
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Changes the governor.
    /// @param _governor The address of the new governor.
    function changeGovernor(address _governor) external {
        if (governor != msg.sender) revert GovernorOnly();
        governor = _governor;
    }

    /// @dev Changes the keeper.
    /// @param _keeper The address of the new keeper.
    function changeKeeper(address _keeper) external onlyByGovernor {
        keeper = _keeper;
        emit KeeperChanged(_keeper);
    }

    /// @dev Changes the home gateway.
    /// @param _homeGateway The address of the new home gateway.
    function changeHomeGateway(address _homeGateway) external {
        if (governor != msg.sender) revert GovernorOnly();
        homeGateway = _homeGateway;
    }

    /// @dev Changes the `feeForJuror` property value of a specified court.
    /// @param _courtID The ID of the court on the v2 arbitrator. Not to be confused with the courtID on KlerosLiquid.
    /// @param _feeForJuror The new value for the `feeForJuror` property value.
    function changeCourtJurorFee(uint96 _courtID, uint256 _feeForJuror) external onlyByGovernorOrKeeper {
        _checkKeeperUpdate(keccak256(abi.encode("feeForJuror", _courtID)), feeForJuror[_courtID], _feeForJuror);
        feeForJuror[_courtID] = _feeForJuror;
        emit ArbitrationCostModified(_courtID, _feeForJuror);
    }

    /// @dev Changes the rate converting home native currency (juror fees) into the native currency of this chain.
    /// Equal to RATE_PRECISION when both chains use the same native currency.
    /// @param _homeNativeRate Native currency of this chain per unit of home native currency, scaled by RATE_PRECISION.
    function changeHomeNativeRate(uint256 _homeNativeRate) external onlyByGovernorOrKeeper {
        _checkKeeperUpdate(keccak256(abi.encode("homeNativeRate")), homeNativeRate, _homeNativeRate);
        _changeHomeNativeRate(_homeNativeRate);
    }

    /// @dev Changes the limits on keeper updates of juror fees, bridging costs and rates.
    /// @param _maxChangeBps Max relative change of a value per keeper update, in basis points.
    /// @param _cooldown Min delay between two keeper updates of the same value, in seconds.
    function changeKeeperGuardrails(uint256 _maxChangeBps, uint256 _cooldown) external onlyByGovernor {
        keeperMaxChangeBps = _maxChangeBps;
        keeperCooldown = _cooldown;
        emit KeeperGuardrailsChanged(_maxChangeBps, _cooldown);
    }

    /// @dev Changes the Yaho used to dispatch disputes to the home chain.
    /// @param _yaho The address of the new Yaho.
    function changeYaho(IYaho _yaho) external onlyByGovernor {
        revert NotImplemented();
    }

    /// @dev Changes the Yaru allowed to deliver rulings through `onMessage`.
    /// @param _yaru The address of the new Yaru.
    function changeYaru(address _yaru) external onlyByGovernor {
        revert NotImplemented();
    }

    /// @dev Whitelists a new oracle. The HomeGateway must register the ruling-leg half under the same ID.
    /// @param _outboundReporter The dispute-leg reporter on this chain.
    /// @param _outboundAdapter The dispute-leg adapter on the home chain.
    /// @param _inboundAdapter The ruling-leg adapter on this chain.
    /// @return oracleID The ID of the new oracle.
    function addOracle(
        IReporter _outboundReporter,
        IAdapter _outboundAdapter,
        IAdapter _inboundAdapter
    ) external onlyByGovernor returns (uint256 oracleID) {
        oracleID = _addOracle(_outboundReporter, _outboundAdapter, _inboundAdapter);
    }

    /// @dev Enables or disables an oracle for future selections.
    /// @param _oracleID The ID of the oracle.
    /// @param _enabled Whether the oracle can be selected.
    function setOracleEnabled(uint256 _oracleID, bool _enabled) external onlyByGovernor {
        revert NotImplemented();
    }

    /// @dev Sets the bridging cost charged for an oracle, covering both legs.
    /// @param _oracleID The ID of the oracle.
    /// @param _bridgingCost The round-trip cost in native currency.
    function setOracleBridgingCost(uint256 _oracleID, uint256 _bridgingCost) external onlyByGovernorOrKeeper {
        // What will happen here if the oracle is diabled?
        if (_oracleID >= oracleCount) revert OracleNotEnabled(_oracleID);
        _checkKeeperUpdate(
            keccak256(abi.encode("oracleBridgingCost", _oracleID)),
            oracleBridgingCost[_oracleID],
            _bridgingCost
        );
        oracleBridgingCost[_oracleID] = _bridgingCost;
        emit OracleBridgingCostSet(_oracleID, _bridgingCost);
    }

    /// @dev Changes the supported fee tokens.
    /// @param _feeToken The fee token.
    /// @param _accepted Whether the token is supported or not as a method of fee payment.
    function changeAcceptedFeeTokens(IERC20 _feeToken, bool _accepted) external onlyByGovernor {
        currencyRates[_feeToken].feePaymentAccepted = _accepted;
        emit AcceptedFeeToken(_feeToken, _accepted);
    }

    /// @dev Changes the currency rate of a fee token.
    /// @param _feeToken The fee token.
    /// @param _rateInEth The new rate of the fee token in native currency.
    /// @param _rateDecimals The new decimals of the fee token rate.
    function changeCurrencyRates(
        IERC20 _feeToken,
        uint64 _rateInEth,
        uint8 _rateDecimals
    ) external onlyByGovernorOrKeeper {
        CurrencyRate storage rate = currencyRates[_feeToken];
        if (msg.sender != governor && _rateDecimals != rate.rateDecimals) revert KeeperCannotChangeDecimals();
        _checkKeeperUpdate(keccak256(abi.encode("currencyRate", _feeToken)), rate.rateInEth, _rateInEth);
        currencyRates[_feeToken].rateInEth = _rateInEth;
        currencyRates[_feeToken].rateDecimals = _rateDecimals;
        emit NewCurrencyRate(_feeToken, _rateInEth, _rateDecimals);
    }

    /// @dev Sets the selection used by `createDispute` calls that do not select oracles.
    /// @param _oracleIDs The IDs of the oracles.
    /// @param _threshold The number of oracles that must agree, on both legs.
    function setDefaultOracles(uint256[] calldata _oracleIDs, uint256 _threshold) external onlyByGovernor {
        _setDefaultOracles(_oracleIDs, _threshold);
    }

    // ************************************* //
    // *             Keeper                * //
    // ************************************* //

    /// @dev Withdraws native currency held by the gateway to the keeper.
    /// @param _amount The amount to withdraw.
    function withdrawNative(uint256 _amount) external onlyByGovernorOrKeeper {
        if (keeper == address(0)) revert KeeperNotSet();
        (bool success, ) = keeper.call{value: _amount}("");
        if (!success) revert TransferFailed();
        emit NativeWithdrawn(keeper, _amount);
    }

    /// @dev Withdraws an ERC20 token held by the gateway to the keeper.
    /// @param _token The token to withdraw.
    /// @param _amount The amount to withdraw.
    function withdrawToken(IERC20 _token, uint256 _amount) external onlyByGovernorOrKeeper {
        if (keeper == address(0)) revert KeeperNotSet();
        if (!_token.safeTransfer(keeper, _amount)) revert TransferFailed();
        emit TokenWithdrawn(_token, keeper, _amount);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc IForeignGateway
    function relayDispute(
        uint256 _foreignDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        uint256 _externalDisputeID,
        uint256 _templateId,
        string calldata _templateUri
    ) external override returns (uint256 messageId) {
        // msg.sender is part of the hash: only the arbitrable that created the dispute can find it.
        bytes32 disputeHash = _computeDisputeHash(msg.sender, _foreignDisputeID, _choices, _extraData);
        DisputeData storage dispute = disputeHashtoDisputeData[disputeHash];
        if (dispute.id == 0) revert DisputeDoesNotExist();
        if (dispute.relayed) revert AlreadyRelayed();
        dispute.relayed = true;

        OracleSelection storage selection = disputeOracles[disputeHash];
        bytes memory data = abi.encode(
            DisputeMessage({
                foreignArbitrable: msg.sender,
                foreignDisputeID: _foreignDisputeID,
                choices: _choices,
                extraData: _extraData,
                externalDisputeID: _externalDisputeID,
                templateId: _templateId,
                templateUri: _templateUri,
                oracleIDs: selection.oracleIDs,
                threshold: selection.threshold
            })
        );

        (IReporter[] memory reporters, IAdapter[] memory adapters) = _outboundOracles(selection);
        (messageId, ) = yaho.dispatchMessageToAdapters(
            homeChainID,
            selection.threshold,
            homeGateway,
            data,
            reporters,
            adapters
        );
        emit DisputeRelayed(disputeHash, messageId);
    }

    /// @inheritdoc IJushin
    /// @dev Receives a ruling from the HomeGateway, `_data = abi.encode(disputeHash, ruling)`.
    /// Yaru does not validate the adapter set of a message, so the message must have been verified by
    /// exactly the dispute's ruling-leg adapters, in order, with the dispute's threshold.
    function onMessage(
        uint256 /*_messageId*/,
        uint256 _sourceChainId,
        address _sender,
        uint256 _threshold,
        IAdapter[] calldata _adapters,
        bytes calldata _data
    ) external returns (bytes memory) {
        if (msg.sender != yaru) revert YaruOnly();
        if (_sourceChainId != homeChainID) revert WrongSourceChain();
        if (_sender != homeGateway) revert HomeGatewayMessageSenderOnly();

        (bytes32 disputeHash, uint256 ruling) = abi.decode(_data, (bytes32, uint256));
        DisputeData storage dispute = disputeHashtoDisputeData[disputeHash];
        if (dispute.id == 0) revert DisputeDoesNotExist();
        if (dispute.ruled) revert CannotRuleTwice();
        _checkInboundAdapters(disputeOracles[disputeHash], _threshold, _adapters);

        dispute.ruled = true;
        IArbitrableV2 arbitrable = IArbitrableV2(dispute.arbitrable);
        emit Ruling(arbitrable, dispute.id, ruling);
        arbitrable.rule(dispute.id, ruling);
        return "";
    }

    /// @inheritdoc IArbitratorV2
    /// @dev Native fees, default oracle selection.
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData
    ) external payable override returns (uint256 disputeID) {
        uint256[] memory oracleIDs = defaultOracles.oracleIDs;
        _checkNativeFee(_extraData, oracleIDs);
        disputeID = _createDispute(
            _choices,
            _extraData,
            oracleIDs,
            defaultOracles.threshold,
            NATIVE_CURRENCY,
            msg.value
        );
    }

    /// @inheritdoc IForeignGateway
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData,
        uint256[] calldata _oracleIDs,
        uint256 _threshold
    ) external payable override returns (uint256 disputeID) {
        _checkNativeFee(_extraData, _oracleIDs);
        disputeID = _createDispute(_choices, _extraData, _oracleIDs, _threshold, NATIVE_CURRENCY, msg.value);
    }

    /// @inheritdoc IArbitratorV2
    /// @dev ERC20 fees, default oracle selection.
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData,
        IERC20 _feeToken,
        uint256 _feeAmount
    ) external override returns (uint256 disputeID) {
        uint256[] memory oracleIDs = defaultOracles.oracleIDs;
        _collectTokenFee(_extraData, oracleIDs, _feeToken, _feeAmount);
        disputeID = _createDispute(_choices, _extraData, oracleIDs, defaultOracles.threshold, _feeToken, _feeAmount);
    }

    /// @inheritdoc IForeignGateway
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData,
        uint256[] calldata _oracleIDs,
        uint256 _threshold,
        IERC20 _feeToken,
        uint256 _feeAmount
    ) external override returns (uint256 disputeID) {
        _collectTokenFee(_extraData, _oracleIDs, _feeToken, _feeAmount);
        disputeID = _createDispute(_choices, _extraData, _oracleIDs, _threshold, _feeToken, _feeAmount);
    }

    /// @inheritdoc IArbitratorV2
    /// @dev Juror fees plus the bridging cost of the default oracle selection, in native currency.
    function arbitrationCost(bytes calldata _extraData) public view override returns (uint256 cost) {
        cost = _arbitrationCost(_extraData, defaultOracles.oracleIDs);
    }

    /// @inheritdoc IForeignGateway
    function arbitrationCost(
        bytes calldata _extraData,
        uint256[] calldata _oracleIDs
    ) external view override returns (uint256 cost) {
        cost = _arbitrationCost(_extraData, _oracleIDs);
    }

    /// @inheritdoc IArbitratorV2
    /// @dev Juror fees plus the bridging cost of the default oracle selection, in `_feeToken`.
    function arbitrationCost(bytes calldata _extraData, IERC20 _feeToken) public view override returns (uint256 cost) {
        cost = _arbitrationCostInToken(_extraData, defaultOracles.oracleIDs, _feeToken);
    }

    /// @inheritdoc IForeignGateway
    function arbitrationCost(
        bytes calldata _extraData,
        uint256[] calldata _oracleIDs,
        IERC20 _feeToken
    ) external view override returns (uint256 cost) {
        cost = _arbitrationCostInToken(_extraData, _oracleIDs, _feeToken);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @inheritdoc IForeignGateway
    function disputeHashToForeignID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoDisputeData[_disputeHash].id;
    }

    /// @inheritdoc IForeignGateway
    function bridgingCost(uint256[] memory _oracleIDs) public view override returns (uint256 cost) {
        for (uint256 i = 0; i < _oracleIDs.length; i++) {
            cost += oracleBridgingCost[_oracleIDs[i]];
        }
    }

    /// @dev Converts an amount of native currency into `_toToken`, same formula as KlerosCore.
    /// @param _toToken The token to convert into.
    /// @param _amountInEth The amount in native currency.
    /// @return The amount in `_toToken`.
    function convertEthToTokenAmount(IERC20 _toToken, uint256 _amountInEth) public view returns (uint256) {
        return (_amountInEth * 10 ** currencyRates[_toToken].rateDecimals) / currencyRates[_toToken].rateInEth;
    }

    /// @dev Gets the selection used by `createDispute` calls that do not select oracles.
    /// @return selection The default oracle selection.
    function getDefaultOracles() external view returns (OracleSelection memory selection) {
        selection = defaultOracles;
    }

    /// @dev Gets the oracle selection snapshotted for a dispute.
    /// @param _disputeHash The hash of the dispute.
    /// @return selection The oracle selection.
    function getDisputeOracles(bytes32 _disputeHash) external view returns (OracleSelection memory selection) {
        selection = disputeOracles[_disputeHash];
    }

    function currentRuling(
        uint256 /*_disputeID*/
    ) public pure returns (uint256 /*ruling*/, bool /*tied*/, bool /*overridden*/) {
        revert("Not supported");
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Checks that every ID is whitelisted, enabled and unique, and that 1 <= _threshold <= _oracleIDs.length.
    /// @param _oracleIDs The IDs of the oracles.
    /// @param _threshold The threshold.
    function _validateSelection(uint256[] memory _oracleIDs, uint256 _threshold) internal view {
        if (_threshold == 0 || _threshold > _oracleIDs.length) revert InvalidThreshold();
        for (uint256 i = 0; i < _oracleIDs.length; i++) {
            if (_oracleIDs[i] >= oracleCount || !oracles[_oracleIDs[i]].enabled) revert OracleNotEnabled(_oracleIDs[i]);
            for (uint256 j = 0; j < i; j++) {
                if (_oracleIDs[i] == _oracleIDs[j]) revert DuplicateOracle(_oracleIDs[i]);
            }
        }
    }

    /// @dev Whitelists a new oracle, enabled.
    /// A zero reporter is allowed for adapters that verify Yaho's events themselves (light clients).
    /// @param _outboundReporter The dispute-leg reporter on this chain.
    /// @param _outboundAdapter The dispute-leg adapter on the home chain.
    /// @param _inboundAdapter The ruling-leg adapter on this chain.
    /// @return oracleID The ID of the new oracle.
    function _addOracle(
        IReporter _outboundReporter,
        IAdapter _outboundAdapter,
        IAdapter _inboundAdapter
    ) internal returns (uint256 oracleID) {
        if (address(_outboundAdapter) == address(0) || address(_inboundAdapter) == address(0)) revert InvalidOracle();
        if (isOutboundAdapter[_outboundAdapter] || isInboundAdapter[_inboundAdapter]) revert AdapterAlreadyUsed();
        isOutboundAdapter[_outboundAdapter] = true;
        isInboundAdapter[_inboundAdapter] = true;
        oracleID = oracleCount++;
        oracles[oracleID] = Oracle({
            outboundReporter: _outboundReporter,
            outboundAdapter: _outboundAdapter,
            inboundAdapter: _inboundAdapter,
            enabled: true
        });
        emit OracleAdded(oracleID, _outboundReporter, _outboundAdapter, _inboundAdapter);
    }

    /// @dev Validates and stores the default selection.
    /// @param _oracleIDs The IDs of the oracles.
    /// @param _threshold The number of oracles that must agree, on both legs.
    function _setDefaultOracles(uint256[] memory _oracleIDs, uint256 _threshold) internal {
        _validateSelection(_oracleIDs, _threshold);
        defaultOracles = OracleSelection({oracleIDs: _oracleIDs, threshold: _threshold});
        emit DefaultOraclesSet(_oracleIDs, _threshold);
    }

    /// @dev Limits keeper updates of a value: at most `keeperMaxChangeBps` relative change, at most once per
    /// `keeperCooldown`. The governor is not limited. A value at zero can only be set by the governor.
    /// @param _valueKey Identifies the value, so each court fee, oracle cost and rate has its own cooldown.
    /// @param _oldValue The current value.
    /// @param _newValue The requested value.
    function _checkKeeperUpdate(bytes32 _valueKey, uint256 _oldValue, uint256 _newValue) internal {
        if (msg.sender == governor) return;
        if (block.timestamp < lastKeeperUpdate[_valueKey] + keeperCooldown) revert KeeperCooldownActive();
        uint256 change = _newValue > _oldValue ? _newValue - _oldValue : _oldValue - _newValue;
        if (change * ONE_BASIS_POINT > _oldValue * keeperMaxChangeBps) revert KeeperChangeTooLarge();
        lastKeeperUpdate[_valueKey] = block.timestamp;
    }

    /// @dev Sets `homeNativeRate`, which must not be zero or juror fees would be free.
    /// @param _homeNativeRate The new rate.
    function _changeHomeNativeRate(uint256 _homeNativeRate) internal {
        if (_homeNativeRate == 0) revert InvalidRate();
        homeNativeRate = _homeNativeRate;
        emit HomeNativeRateChanged(_homeNativeRate);
    }

    /// @dev Juror fees for the court and number of jurors in `_extraData`, converted into the native currency
    /// of this chain, plus the bridging cost of the oracles.
    /// @param _extraData The extra data for the arbitrator.
    /// @param _oracleIDs The IDs of the oracles.
    /// @return cost The arbitration cost in native currency.
    function _arbitrationCost(
        bytes calldata _extraData,
        uint256[] memory _oracleIDs
    ) internal view returns (uint256 cost) {
        (uint96 courtID, uint256 minJurors) = extraDataToCourtIDMinJurors(_extraData);
        cost = (feeForJuror[courtID] * minJurors * homeNativeRate) / RATE_PRECISION + bridgingCost(_oracleIDs);
    }

    /// @dev Arbitration cost converted into an accepted fee token.
    /// @param _extraData The extra data for the arbitrator.
    /// @param _oracleIDs The IDs of the oracles.
    /// @param _feeToken The fee token.
    /// @return cost The arbitration cost in `_feeToken`.
    function _arbitrationCostInToken(
        bytes calldata _extraData,
        uint256[] memory _oracleIDs,
        IERC20 _feeToken
    ) internal view returns (uint256 cost) {
        if (!currencyRates[_feeToken].feePaymentAccepted) revert TokenNotAccepted();
        cost = convertEthToTokenAmount(_feeToken, _arbitrationCost(_extraData, _oracleIDs));
    }

    /// @dev Reverts unless `msg.value` covers the native arbitration cost.
    /// @param _extraData The extra data for the arbitrator.
    /// @param _oracleIDs The IDs of the oracles.
    function _checkNativeFee(bytes calldata _extraData, uint256[] memory _oracleIDs) internal view {
        if (msg.value < _arbitrationCost(_extraData, _oracleIDs)) revert ArbitrationFeesNotEnough();
    }

    /// @dev Checks that `_feeAmount` covers the cost in `_feeToken` and pulls it from the caller.
    /// @param _extraData The extra data for the arbitrator.
    /// @param _oracleIDs The IDs of the oracles.
    /// @param _feeToken The fee token.
    /// @param _feeAmount The amount offered.
    function _collectTokenFee(
        bytes calldata _extraData,
        uint256[] memory _oracleIDs,
        IERC20 _feeToken,
        uint256 _feeAmount
    ) internal {
        if (_feeAmount < _arbitrationCostInToken(_extraData, _oracleIDs, _feeToken)) revert ArbitrationFeesNotEnough();
        if (!_feeToken.safeTransferFrom(msg.sender, address(this), _feeAmount)) revert TransferFailed();
    }

    /// @dev Creates a dispute and snapshots its oracle selection. Fees must already be checked or collected.
    /// The selection is validated on every call, so a default that includes a since-disabled oracle reverts.
    /// @param _choices The number of choices.
    /// @param _extraData The extra data for the arbitrator.
    /// @param _oracleIDs The IDs of the oracles used on both legs.
    /// @param _threshold The number of oracles that must agree, on both legs.
    /// @param _feeToken NATIVE_CURRENCY or the ERC20 the fees were paid in.
    /// @param _paid The amount paid, in `_feeToken` units.
    /// @return disputeID The local dispute ID.
    function _createDispute(
        uint256 _choices,
        bytes calldata _extraData,
        uint256[] memory _oracleIDs,
        uint256 _threshold,
        IERC20 _feeToken,
        uint256 _paid
    ) internal returns (uint256 disputeID) {
        _validateSelection(_oracleIDs, _threshold);

        disputeID = localDisputeID++;
        bytes32 disputeHash = _computeDisputeHash(msg.sender, disputeID, _choices, _extraData);

        disputeHashtoDisputeData[disputeHash] = DisputeData({
            id: uint248(disputeID),
            ruled: false,
            arbitrable: msg.sender,
            relayed: false,
            feeToken: _feeToken,
            paid: _paid
        });
        disputeOracles[disputeHash] = OracleSelection({oracleIDs: _oracleIDs, threshold: _threshold});

        emit CrossChainDisputeOutgoing(msg.sender, disputeID, _choices, _extraData);
    }

    /// @dev Expands a selection into the index-aligned arrays Yaho expects for the dispute leg.
    /// @param _selection The oracle selection.
    /// @return reporters The dispute-leg reporters on this chain.
    /// @return adapters The dispute-leg adapters on the home chain.
    function _outboundOracles(
        OracleSelection storage _selection
    ) internal view returns (IReporter[] memory reporters, IAdapter[] memory adapters) {
        uint256 length = _selection.oracleIDs.length;
        reporters = new IReporter[](length);
        adapters = new IAdapter[](length);
        for (uint256 i = 0; i < length; i++) {
            Oracle storage oracle = oracles[_selection.oracleIDs[i]];
            reporters[i] = oracle.outboundReporter;
            adapters[i] = oracle.outboundAdapter;
        }
    }

    /// @dev Reverts unless `_adapters` are exactly the selection's ruling-leg adapters, in order, and
    /// `_threshold` is the selection's threshold.
    /// @param _selection The dispute's oracle selection.
    /// @param _threshold The threshold of the incoming message.
    /// @param _adapters The adapters of the incoming message.
    function _checkInboundAdapters(
        OracleSelection storage _selection,
        uint256 _threshold,
        IAdapter[] calldata _adapters
    ) internal view {
        uint256 length = _selection.oracleIDs.length;
        if (_threshold != _selection.threshold || _adapters.length != length) revert UnexpectedAdapters();
        for (uint256 i = 0; i < length; i++) {
            if (_adapters[i] != oracles[_selection.oracleIDs[i]].inboundAdapter) revert UnexpectedAdapters();
        }
    }

    /// @dev Computes the dispute hash, the identifier shared by both gateways. The gateway address and the local
    /// dispute ID make it unique, including across redeployments; the other fields let `relayDispute` check its inputs.
    /// @param _arbitrable The arbitrable that created the dispute.
    /// @param _foreignDisputeID The local dispute ID.
    /// @param _choices The number of choices.
    /// @param _extraData The extra data for the arbitrator.
    /// @return The dispute hash.
    function _computeDisputeHash(
        address _arbitrable,
        uint256 _foreignDisputeID,
        uint256 _choices,
        bytes calldata _extraData
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "createDispute",
                    block.chainid,
                    address(this),
                    _arbitrable,
                    _foreignDisputeID,
                    _choices,
                    _extraData
                )
            );
    }

    function extraDataToCourtIDMinJurors(
        bytes memory _extraData
    ) internal view returns (uint96 courtID, uint256 minJurors) {
        // Note that here we ignore DisputeKitID
        if (_extraData.length >= 64) {
            assembly ("memory-safe") {
                // solium-disable-line security/no-inline-assembly
                courtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
            }
            if (feeForJuror[courtID] == 0) courtID = 0;
            if (minJurors == 0) minJurors = DEFAULT_NB_OF_JURORS;
        } else {
            courtID = 0;
            minJurors = DEFAULT_NB_OF_JURORS;
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
    error GovernorOrKeeperOnly();
    error KeeperNotSet();
    error HomeGatewayMessageSenderOnly();
    error YaruOnly();
    error ArbitrationFeesNotEnough();
    error DisputeDoesNotExist();
    error CannotRuleTwice();
    error AlreadyRelayed();
    error WrongSourceChain();
    error UnexpectedAdapters();
    error InvalidRate();
    error KeeperCooldownActive();
    error KeeperChangeTooLarge();
    error KeeperCannotChangeDecimals();
    error NotImplemented();
    error InvalidThreshold();
    error InvalidOracle();
    error AdapterAlreadyUsed();
    error OracleNotEnabled(uint256 _oracleID);
    error DuplicateOracle(uint256 _oracleID);
    error TokenNotAccepted();
    error TransferFailed();
}

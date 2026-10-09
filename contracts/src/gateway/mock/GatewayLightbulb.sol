// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IArbitrableV2, IArbitratorV2} from "../../arbitration/interfaces/IArbitrableV2.sol";
import {IForeignGateway} from "../interfaces/IForeignGateway.sol";
import {SafeERC20, IERC20} from "../../libraries/SafeERC20.sol";

/// @title GatewayLightbulb
/// @dev Test arbitrable for the full cross-chain flow through the gateways. Asking to switch a lightbulb opens a
/// dispute through the ForeignGateway and relays it to the home chain in the same transaction. The ruling given
/// on the home chain comes back through the HomeGateway and switches the bulb on (ruling 1) or off (ruling 2).
/// On a testnet, pair it with a KlerosCoreRuler in manual mode as the HomeGateway's arbitrator.
contract GatewayLightbulb is IArbitrableV2 {
    using SafeERC20 for IERC20;

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Request {
        address owner; // Whose lightbulb the dispute is about.
        bool ruled;
        uint256 ruling;
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event LightbulbRequested(
        address indexed _owner,
        uint256 indexed _disputeID,
        uint256[] _oracleIDs,
        uint256 _threshold
    );
    event LightbulbSwitched(address indexed _owner, uint256 indexed _disputeID, bool _isOn);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant NUMBER_OF_CHOICES = 2;
    uint256 public constant RULING_ON = 1;
    uint256 public constant RULING_OFF = 2;

    IForeignGateway public immutable gateway;
    bytes public arbitratorExtraData; // Court ID and number of jurors on the home chain.
    uint256 public templateId;
    string public templateUri;
    mapping(uint256 disputeID => Request) public requests;
    mapping(address owner => bool) public lightbulbIsOn;

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @param _gateway The ForeignGateway.
    /// @param _arbitratorExtraData The extra data passed to the gateway.
    /// @param _templateId The dispute template ID emitted with each dispute.
    /// @param _templateUri The dispute template URI emitted with each dispute.
    constructor(
        IForeignGateway _gateway,
        bytes memory _arbitratorExtraData,
        uint256 _templateId,
        string memory _templateUri
    ) {
        gateway = _gateway;
        arbitratorExtraData = _arbitratorExtraData;
        templateId = _templateId;
        templateUri = _templateUri;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Opens a dispute about the caller's lightbulb with the gateway's default oracles and relays it.
    /// Send at least `gateway.arbitrationCost(arbitratorExtraData)`; the excess is refunded.
    /// @return disputeID The dispute ID on the ForeignGateway.
    function requestSwitch() external payable returns (uint256 disputeID) {
        bytes memory extraData = arbitratorExtraData;
        uint256 cost = gateway.arbitrationCost(extraData);
        if (msg.value < cost) revert InsufficientPayment();
        disputeID = gateway.createDispute{value: cost}(NUMBER_OF_CHOICES, extraData);
        _relay(disputeID, extraData);
        _refundExcess(cost);
        emit LightbulbRequested(msg.sender, disputeID, new uint256[](0), 0);
    }

    /// @dev Opens a dispute about the caller's lightbulb over the given oracles and relays it.
    /// Send at least `gateway.arbitrationCost(arbitratorExtraData, _oracleIDs)`; the excess is refunded.
    /// @param _oracleIDs The oracles to use on both legs.
    /// @param _threshold The number of oracles that must agree.
    /// @return disputeID The dispute ID on the ForeignGateway.
    function requestSwitch(
        uint256[] calldata _oracleIDs,
        uint256 _threshold
    ) external payable returns (uint256 disputeID) {
        bytes memory extraData = arbitratorExtraData;
        uint256 cost = gateway.arbitrationCost(extraData, _oracleIDs);
        if (msg.value < cost) revert InsufficientPayment();
        disputeID = gateway.createDispute{value: cost}(NUMBER_OF_CHOICES, extraData, _oracleIDs, _threshold);
        _relay(disputeID, extraData);
        _refundExcess(cost);
        emit LightbulbRequested(msg.sender, disputeID, _oracleIDs, _threshold);
    }

    /// @dev Same as `requestSwitch()` but pays in an ERC20 accepted by the gateway, with the default oracles.
    /// Approve at least `gateway.arbitrationCost(arbitratorExtraData, _feeToken)` to this contract; exactly the
    /// cost is pulled.
    /// @param _feeToken The ERC20 used to pay the fees.
    /// @return disputeID The dispute ID on the ForeignGateway.
    function requestSwitchWithToken(IERC20 _feeToken) external returns (uint256 disputeID) {
        bytes memory extraData = arbitratorExtraData;
        uint256 cost = gateway.arbitrationCost(extraData, _feeToken);
        _collectToken(_feeToken, cost);
        disputeID = gateway.createDispute(NUMBER_OF_CHOICES, extraData, _feeToken, cost);
        _relay(disputeID, extraData);
        emit LightbulbRequested(msg.sender, disputeID, new uint256[](0), 0);
    }

    /// @dev Same as `requestSwitch(_oracleIDs, _threshold)` but pays in an ERC20 accepted by the gateway.
    /// Approve at least `gateway.arbitrationCost(arbitratorExtraData, _oracleIDs, _feeToken)` to this contract;
    /// exactly the cost is pulled.
    /// @param _oracleIDs The oracles to use on both legs.
    /// @param _threshold The number of oracles that must agree.
    /// @param _feeToken The ERC20 used to pay the fees.
    /// @return disputeID The dispute ID on the ForeignGateway.
    function requestSwitchWithToken(
        uint256[] calldata _oracleIDs,
        uint256 _threshold,
        IERC20 _feeToken
    ) external returns (uint256 disputeID) {
        bytes memory extraData = arbitratorExtraData;
        uint256 cost = gateway.arbitrationCost(extraData, _oracleIDs, _feeToken);
        _collectToken(_feeToken, cost);
        disputeID = gateway.createDispute(NUMBER_OF_CHOICES, extraData, _oracleIDs, _threshold, _feeToken, cost);
        _relay(disputeID, extraData);
        emit LightbulbRequested(msg.sender, disputeID, _oracleIDs, _threshold);
    }

    /// @inheritdoc IArbitrableV2
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        if (msg.sender != address(gateway)) revert GatewayOnly();
        Request storage request = requests[_disputeID];
        if (request.owner == address(0)) revert UnknownDispute();
        if (request.ruled) revert AlreadyRuled();

        request.ruled = true;
        request.ruling = _ruling;
        if (_ruling == RULING_ON) lightbulbIsOn[request.owner] = true;
        else if (_ruling == RULING_OFF) lightbulbIsOn[request.owner] = false;

        emit Ruling(IArbitratorV2(address(gateway)), _disputeID, _ruling);
        emit LightbulbSwitched(request.owner, _disputeID, lightbulbIsOn[request.owner]);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Records the request, emits `DisputeRequest` and relays the dispute to the home chain.
    /// @param _disputeID The dispute ID on the ForeignGateway.
    /// @param _extraData The extra data the dispute was created with.
    function _relay(uint256 _disputeID, bytes memory _extraData) internal {
        requests[_disputeID].owner = msg.sender;

        // The external dispute ID is the gateway dispute ID: this contract only uses one gateway.
        emit DisputeRequest(IArbitratorV2(address(gateway)), _disputeID, _disputeID, templateId, templateUri);
        gateway.relayDispute(_disputeID, NUMBER_OF_CHOICES, _extraData, _disputeID, templateId, templateUri);
    }

    /// @dev Refunds the native currency sent above the arbitration cost.
    /// @param _cost The amount paid to the gateway.
    function _refundExcess(uint256 _cost) internal {
        if (msg.value > _cost) {
            (bool success, ) = msg.sender.call{value: msg.value - _cost}("");
            if (!success) revert RefundFailed();
        }
    }

    /// @dev Pulls the arbitration cost in `_feeToken` from the caller and lets the gateway take it.
    /// @param _feeToken The ERC20 used to pay the fees.
    /// @param _cost The arbitration cost in `_feeToken`.
    function _collectToken(IERC20 _feeToken, uint256 _cost) internal {
        if (!_feeToken.safeTransferFrom(msg.sender, address(this), _cost)) revert TransferFailed();
        if (!_feeToken.increaseAllowance(address(gateway), _cost)) revert AllowanceIncreaseFailed();
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GatewayOnly();
    error UnknownDispute();
    error AlreadyRuled();
    error InsufficientPayment();
    error RefundFailed();
    error TransferFailed();
    error AllowanceIncreaseFailed();
}

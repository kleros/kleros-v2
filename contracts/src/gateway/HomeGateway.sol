// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "./interfaces/IForeignGateway.sol";
import "./interfaces/IHomeGateway.sol";
import "../libraries/Constants.sol";
import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";
import {IYaho} from "@kleros/veashi-sdk/contracts/interfaces/IYaho.sol";
import {IReporter} from "@kleros/veashi-sdk/contracts/interfaces/IReporter.sol";
import {IAdapter} from "@kleros/veashi-sdk/contracts/interfaces/IAdapter.sol";
import {IJushin} from "@kleros/veashi-sdk/contracts/interfaces/IJushin.sol";
import {VouchedDispatcher} from "./VouchedDispatcher.sol";

/// Home Gateway
/// Counterpart of `ForeignGateway`
/// Dispatches rulings through `VouchedDispatcher`: the reporters, whose dispatcher this gateway is, pay only for a
/// message it vouches for. `VouchedDispatcher` keeps its state in an ERC-7201 slot, so the storage layout is unchanged.
contract HomeGateway is IHomeGateway, IJushin, UUPSProxiable, Initializable, VouchedDispatcher {
    string public constant override version = "0.9.0";

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    /// @dev The home half of an oracle registered on the ForeignGateway under the same ID. Not enforced on-chain:
    /// `inboundAdapter` must be the ForeignGateway oracle's `outboundAdapter` (dispute leg, adapter on this chain),
    /// and `outboundAdapter` must be its `inboundAdapter` (ruling leg, adapter on the foreign chain).
    struct Oracle {
        IReporter outboundReporter; // Ruling leg: reporter on this chain.
        IAdapter outboundAdapter; // Ruling leg: adapter on the foreign chain.
        IAdapter inboundAdapter; // Dispute leg: adapter on this chain, checked in `onMessage`.
    }

    /// @dev A dispute received from the ForeignGateway and the oracles selected for it on the foreign chain.
    /// `received` is never reset: it rejects a duplicate delivery, and it is the only existence marker since
    /// arbitrator dispute IDs start at 0. `creationFailed` is never reset either, and rejects a duplicate too.
    struct ReceivedDispute {
        bool received; // Created on the arbitrator.
        uint256 threshold;
        uint256[] oracleIDs;
        bool creationFailed; // Not created on the arbitrator, and the failure was sent back.
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event YahoChanged(IYaho _yaho);
    event YaruChanged(address _yaru);
    event OracleAdded(
        uint256 indexed _oracleID,
        IReporter _outboundReporter,
        IAdapter _outboundAdapter,
        IAdapter _inboundAdapter
    );
    event OracleReporterSet(uint256 indexed _oracleID, IReporter _reporter);
    event Funded(address indexed _from, uint256 _amount);
    event Withdrawn(address indexed _to, uint256 _amount);
    event DisputeCreationFailed(bytes32 indexed _disputeHash, bytes _reason, uint256 _messageId);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor;
    IArbitratorV2 public arbitrator;
    uint256 public override foreignChainID;
    address public override foreignGateway;
    mapping(uint256 disputeID => bytes32) public disputeIDtoHash;
    mapping(bytes32 disputeHash => uint256) public disputeHashtoID;

    // Veashi
    IYaho public yaho; // Dispatches the ruling leg.
    address public yaru; // Only caller allowed for `onMessage` (dispute leg).
    uint256 public oracleCount; // Oracle IDs are 0..oracleCount-1, the same IDs as on the ForeignGateway.
    mapping(uint256 oracleID => Oracle) public oracles;
    mapping(IAdapter => bool) public isOutboundAdapter; // Prevents counting one adapter twice towards a threshold.
    mapping(IAdapter => bool) public isInboundAdapter; // Idem.
    mapping(bytes32 disputeHash => ReceivedDispute) internal receivedDisputes;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @dev Requires that the sender is the governor.
    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializes the gateway.
    /// @param _governor The governor's address.
    /// @param _arbitrator The address of the arbitrator.
    /// @param _foreignChainID The ID of the foreign chain.
    /// @param _foreignGateway The address of the foreign gateway.
    /// @param _yaho The Yaho used to dispatch rulings to the foreign chain.
    /// @param _yaru The Yaru allowed to deliver disputes.
    /// @param _oracles The oracles, registered as IDs 0..n-1. Must match the ForeignGateway's IDs.
    function initialize(
        address _governor,
        IArbitratorV2 _arbitrator,
        uint256 _foreignChainID,
        address _foreignGateway,
        IYaho _yaho,
        address _yaru,
        Oracle[] calldata _oracles
    ) external reinitializer(1) {
        governor = _governor;
        arbitrator = _arbitrator;
        foreignChainID = _foreignChainID;
        foreignGateway = _foreignGateway;
        yaho = _yaho;
        yaru = _yaru;

        for (uint256 i = 0; i < _oracles.length; i++) {
            _addOracle(_oracles[i].outboundReporter, _oracles[i].outboundAdapter, _oracles[i].inboundAdapter);
        }
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
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the arbitrator.
    /// Only call it when no dispute is open (not enforced on-chain): `rule` accepts only the current arbitrator, so a
    /// dispute created on the old one could never be ruled.
    /// @param _arbitrator The address of the new arbitrator.
    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyByGovernor {
        arbitrator = _arbitrator;
    }

    /// @dev Changes the foreign gateway.
    /// Only call it when no dispute is open (not enforced on-chain): a dispute still sent by the old foreign gateway is
    /// rejected, and the ruling of a received dispute is sent to the new one, which does not know it.
    /// @param _foreignGateway The address of the new foreign gateway.
    function changeForeignGateway(address _foreignGateway) external onlyByGovernor {
        foreignGateway = _foreignGateway;
    }

    /// @dev Changes the Yaho used to dispatch rulings to the foreign chain.
    /// Only call it when no dispute is open (not enforced on-chain): a ruling not yet dispatched goes through the new
    /// Yaho, which the foreign chain's Yaru and the oracles' reporters must already accept.
    /// @param _yaho The address of the new Yaho.
    function changeYaho(IYaho _yaho) external onlyByGovernor {
        yaho = _yaho;
        emit YahoChanged(_yaho);
    }

    /// @dev Changes the Yaru allowed to deliver disputes through `onMessage`.
    /// Only call it when no dispute is open (not enforced on-chain): a dispute the old Yaru still executes is rejected.
    /// @param _yaru The address of the new Yaru.
    function changeYaru(address _yaru) external onlyByGovernor {
        yaru = _yaru;
        emit YaruChanged(_yaru);
    }

    /// @dev Registers the home half of the next ForeignGateway oracle, so the IDs stay aligned.
    /// @param _outboundReporter The ruling-leg reporter on this chain.
    /// @param _outboundAdapter The ruling-leg adapter on the foreign chain.
    /// @param _inboundAdapter The dispute-leg adapter on this chain.
    /// @return oracleID The ID of the new oracle.
    function addOracle(
        IReporter _outboundReporter,
        IAdapter _outboundAdapter,
        IAdapter _inboundAdapter
    ) external onlyByGovernor returns (uint256 oracleID) {
        oracleID = _addOracle(_outboundReporter, _outboundAdapter, _inboundAdapter);
    }

    /// @dev Replaces the ruling-leg reporter of an oracle, or mutes it with `address(0)`, which Yaho skips.
    /// A ruling or a creation failure is dispatched with the reporters set at dispatch time. The ForeignGateway checks
    /// only adapters, so the oracles of a received dispute stay valid. The reporter is not checked against `yaho`.
    /// Muting keeps a ruling or a failure deliverable only if the dispute's other selected oracles still meet its
    /// threshold, or if this oracle's adapter reads Yaho itself (a light client). Otherwise replace the reporter: one
    /// dispatched while muted never reaches the foreign chain, and it cannot be dispatched again.
    /// @param _oracleID The ID of the oracle.
    /// @param _reporter The new reporter, `address(0)` to mute it.
    function setOracleReporter(uint256 _oracleID, IReporter _reporter) external onlyByGovernor {
        if (_oracleID >= oracleCount) revert UnknownOracle(_oracleID);
        oracles[_oracleID].outboundReporter = _reporter;
        emit OracleReporterSet(_oracleID, _reporter);
    }

    /// @dev Withdraws native currency held by the gateway.
    /// @param _to The recipient.
    /// @param _amount The amount to withdraw.
    function withdraw(address payable _to, uint256 _amount) external onlyByGovernor {
        (bool success, ) = _to.call{value: _amount}("");
        if (!success) revert TransferFailed();
        emit Withdrawn(_to, _amount);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Funds the arbitration fees paid to the arbitrator for incoming disputes.
    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    /// @inheritdoc IJushin
    /// @dev Receives a dispute from the ForeignGateway, `_data = abi.encode(IForeignGateway.DisputeMessage)`, and
    /// creates it on the arbitrator, paying the arbitration cost from the gateway's balance. A balance below the cost,
    /// or a revert of `createDispute`, is a creation failure, sent back to the ForeignGateway (`_sendCreationFailure`).
    /// Yaru does not validate the adapter set of a message, so the message must have been verified by exactly the
    /// dispute-leg adapters of the oracles it selects, in order, with the threshold it carries.
    function onMessage(
        uint256 /*_messageId*/,
        uint256 _sourceChainId,
        address _sender,
        uint256 _threshold,
        IAdapter[] calldata _adapters,
        bytes calldata _data
    ) external returns (bytes memory) {
        if (msg.sender != yaru) revert YaruOnly();
        if (_sourceChainId != foreignChainID) revert WrongSourceChain();
        if (_sender != foreignGateway) revert ForeignGatewayMessageSenderOnly();

        IForeignGateway.DisputeMessage memory message = abi.decode(_data, (IForeignGateway.DisputeMessage));
        _checkInboundAdapters(message.oracleIDs, message.threshold, _threshold, _adapters);

        // The chain ID and the ForeignGateway address come from Yaru, never from the payload.
        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                "createDispute",
                _sourceChainId,
                _sender,
                message.foreignArbitrable,
                message.foreignDisputeID,
                message.choices,
                message.extraData
            )
        );
        ReceivedDispute storage receivedDispute = receivedDisputes[disputeHash];
        if (receivedDispute.received || receivedDispute.creationFailed) revert DisputeAlreadyReceived();
        receivedDispute.threshold = message.threshold;
        receivedDispute.oracleIDs = message.oracleIDs;

        uint256 cost = arbitrator.arbitrationCost(message.extraData);
        if (address(this).balance < cost) {
            bytes memory reason = abi.encodeWithSelector(InsufficientFunds.selector, cost, address(this).balance);
            _sendCreationFailure(disputeHash, reason);
            return "";
        }

        uint256 gasBefore = gasleft();
        try arbitrator.createDispute{value: cost}(message.choices, message.extraData) returns (uint256 disputeID) {
            disputeIDtoHash[disputeID] = disputeHash;
            disputeHashtoID[disputeHash] = disputeID;
            receivedDispute.received = true;
            _emitDisputeIncoming(message, _sourceChainId, disputeID);
        } catch (bytes memory reason) {
            // A frame keeps 1/64 of its gas when it calls, and `createDispute` goes 6 frames deep on KlerosCore, so
            // 1/4 or less left means it may have run out of the gas the executor gave: revert, so no executor can
            // turn an out-of-gas into a creation failure. Yaru can retry.
            if (gasleft() <= gasBefore / 4) revert InsufficientGas();
            _sendCreationFailure(disputeHash, reason);
        }
        return "";
    }

    /// @inheritdoc IArbitrableV2
    /// @dev Sends the ruling to the ForeignGateway through Yaho, `abi.encode(disputeHash, ruling)`, over the oracles
    /// selected on the foreign chain, in the same order. Reporters pay the bridge fees from their own balances for a
    /// message dispatched through `_dispatchVouched` only. A reporter revert reverts the arbitrator's ruling execution,
    /// which can be retried, after the governor replaces or mutes the reporter if needed (`setOracleReporter`).
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        if (msg.sender != address(arbitrator)) revert ArbitratorOnly();

        bytes32 disputeHash = disputeIDtoHash[_disputeID];
        ReceivedDispute storage receivedDispute = receivedDisputes[disputeHash];
        if (!receivedDispute.received) revert DisputeDoesNotExist();

        uint256 messageId = _dispatchToForeignGateway(receivedDispute, abi.encode(disputeHash, _ruling));
        emit RulingDispatched(_disputeID, disputeHash, _ruling, messageId);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @inheritdoc IHomeGateway
    function disputeHashToHomeID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoID[_disputeHash];
    }

    /// @dev Gets a received dispute and the oracles selected for it.
    /// @param _disputeHash The hash of the dispute.
    /// @return The received dispute.
    function getReceivedDispute(bytes32 _disputeHash) external view returns (ReceivedDispute memory) {
        return receivedDisputes[_disputeHash];
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev The Yaho `_dispatchVouched` dispatches through.
    function _yaho() internal view override returns (address) {
        return address(yaho);
    }

    /// @dev Records that the arbitrator did not create a dispute and sends the failure to the ForeignGateway,
    /// `abi.encode(disputeHash)` (32 bytes, a ruling is 64), as `rule` sends a ruling. A dispatch revert reverts the
    /// delivery, which Yaru can retry.
    /// @param _disputeHash The hash of the dispute.
    /// @param _reason The revert data of `createDispute`, or `InsufficientFunds` for a balance below the cost.
    function _sendCreationFailure(bytes32 _disputeHash, bytes memory _reason) internal {
        ReceivedDispute storage receivedDispute = receivedDisputes[_disputeHash];
        receivedDispute.creationFailed = true;
        uint256 messageId = _dispatchToForeignGateway(receivedDispute, abi.encode(_disputeHash));
        emit DisputeCreationFailed(_disputeHash, _reason, messageId);
    }

    /// @dev Dispatches `_data` to the ForeignGateway through `_dispatchVouched`, over the oracles selected for the
    /// dispute on the foreign chain, in the same order, with its threshold.
    /// @param _receivedDispute The received dispute.
    /// @param _data The message data.
    /// @return messageId The ID of the dispatched message.
    function _dispatchToForeignGateway(
        ReceivedDispute storage _receivedDispute,
        bytes memory _data
    ) internal returns (uint256 messageId) {
        uint256 length = _receivedDispute.oracleIDs.length;
        IReporter[] memory reporters = new IReporter[](length);
        IAdapter[] memory adapters = new IAdapter[](length);
        for (uint256 i = 0; i < length; i++) {
            Oracle storage oracle = oracles[_receivedDispute.oracleIDs[i]];
            reporters[i] = oracle.outboundReporter;
            adapters[i] = oracle.outboundAdapter;
        }

        (messageId, ) = _dispatchVouched(
            foreignChainID,
            _receivedDispute.threshold,
            foreignGateway,
            _data,
            reporters,
            adapters
        );
    }

    /// @dev Emits the events of a dispute received from the ForeignGateway and created on the arbitrator. A separate
    /// function keeps `onMessage` within the stack limit when compiled without via-IR, as the coverage build is.
    /// @param _message The dispute message.
    /// @param _sourceChainId The foreign chain ID.
    /// @param _disputeID The dispute ID on the arbitrator.
    function _emitDisputeIncoming(
        IForeignGateway.DisputeMessage memory _message,
        uint256 _sourceChainId,
        uint256 _disputeID
    ) internal {
        emit DisputeRequest(
            arbitrator,
            _disputeID,
            _message.externalDisputeID,
            _message.templateId,
            _message.templateUri
        );
        emit CrossChainDisputeIncoming(
            arbitrator,
            _sourceChainId,
            _message.foreignArbitrable,
            _message.foreignDisputeID,
            _disputeID,
            _message.externalDisputeID,
            _message.templateId,
            _message.templateUri
        );
    }

    /// @dev Registers an oracle. A zero reporter is allowed for adapters that verify Yaho's events themselves.
    /// @param _outboundReporter The ruling-leg reporter on this chain.
    /// @param _outboundAdapter The ruling-leg adapter on the foreign chain.
    /// @param _inboundAdapter The dispute-leg adapter on this chain.
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
            inboundAdapter: _inboundAdapter
        });
        emit OracleAdded(oracleID, _outboundReporter, _outboundAdapter, _inboundAdapter);
    }

    /// @dev Reverts unless `_adapters` are exactly the dispute-leg adapters of `_oracleIDs`, in order, and the
    /// message threshold equals the selected one. An ID not registered here has a zero adapter and never matches,
    /// so the message stays executable until the governor registers it.
    /// @param _oracleIDs The oracles selected on the foreign chain.
    /// @param _selectedThreshold The threshold selected on the foreign chain.
    /// @param _threshold The threshold of the incoming message.
    /// @param _adapters The adapters of the incoming message.
    function _checkInboundAdapters(
        uint256[] memory _oracleIDs,
        uint256 _selectedThreshold,
        uint256 _threshold,
        IAdapter[] calldata _adapters
    ) internal view {
        uint256 length = _oracleIDs.length;
        if (_threshold != _selectedThreshold || _adapters.length != length) {
            revert UnexpectedAdapters();
        }
        for (uint256 i = 0; i < length; i++) {
            if (_oracleIDs[i] >= oracleCount || _adapters[i] != oracles[_oracleIDs[i]].inboundAdapter) {
                revert UnexpectedAdapters();
            }
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
    error ArbitratorOnly();
    error YaruOnly();
    error WrongSourceChain();
    error ForeignGatewayMessageSenderOnly();
    error UnexpectedAdapters();
    error DisputeAlreadyReceived();
    error DisputeDoesNotExist();
    error InsufficientFunds(uint256 _required, uint256 _available);
    error InvalidOracle();
    error AdapterAlreadyUsed();
    error TransferFailed();
    error UnknownOracle(uint256 _oracleID);
    error InsufficientGas();
}

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

/// Home Gateway
/// Counterpart of `ForeignGateway`
contract HomeGateway is IHomeGateway, IJushin, UUPSProxiable, Initializable {
    string public constant override version = "0.8.0";

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
    /// arbitrator dispute IDs start at 0.
    struct ReceivedDispute {
        bool received; // Created on the arbitrator.
        uint256 threshold;
        uint256[] oracleIDs;
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
    event Funded(address indexed _from, uint256 _amount);
    event Withdrawn(address indexed _to, uint256 _amount);

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
    /// @param _arbitrator The address of the new arbitrator.
    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyByGovernor {
        arbitrator = _arbitrator;
    }

    /// @dev Changes the foreign gateway.
    /// @param _foreignGateway The address of the new foreign gateway.
    function changeForeignGateway(address _foreignGateway) external onlyByGovernor {
        foreignGateway = _foreignGateway;
    }

    /// @dev Changes the Yaho used to dispatch rulings to the foreign chain.
    /// @param _yaho The address of the new Yaho.
    function changeYaho(IYaho _yaho) external onlyByGovernor {
        yaho = _yaho;
        emit YahoChanged(_yaho);
    }

    /// @dev Changes the Yaru allowed to deliver disputes through `onMessage`.
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
    /// creates it on the arbitrator, paying the arbitration cost from the gateway's balance.
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
        if (receivedDispute.received) revert DisputeAlreadyReceived();

        uint256 cost = arbitrator.arbitrationCost(message.extraData);
        if (address(this).balance < cost) revert InsufficientFunds(cost, address(this).balance);
        uint256 disputeID = arbitrator.createDispute{value: cost}(message.choices, message.extraData);

        disputeIDtoHash[disputeID] = disputeHash;
        disputeHashtoID[disputeHash] = disputeID;
        receivedDispute.received = true;
        receivedDispute.threshold = message.threshold;
        receivedDispute.oracleIDs = message.oracleIDs;

        emit DisputeRequest(arbitrator, disputeID, message.externalDisputeID, message.templateId, message.templateUri);
        emit CrossChainDisputeIncoming(
            arbitrator,
            _sourceChainId,
            message.foreignArbitrable,
            message.foreignDisputeID,
            disputeID,
            message.externalDisputeID,
            message.templateId,
            message.templateUri
        );
        return "";
    }
    // TEST: Core contract can handle the reverts and retry is possible if not this will be a two transaction revert.
    /// @inheritdoc IArbitrableV2
    /// @dev Sends the ruling to the ForeignGateway through Yaho, `abi.encode(disputeHash, ruling)`, over the oracles
    /// selected on the foreign chain, in the same order. Reporters pay the bridge fees from their own balances,
    /// a reporter revert reverts the arbitrator's ruling execution, which can be retried.
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        if (msg.sender != address(arbitrator)) revert ArbitratorOnly();

        bytes32 disputeHash = disputeIDtoHash[_disputeID];
        ReceivedDispute storage receivedDispute = receivedDisputes[disputeHash];
        if (!receivedDispute.received) revert DisputeDoesNotExist();

        uint256 length = receivedDispute.oracleIDs.length;
        IReporter[] memory reporters = new IReporter[](length);
        IAdapter[] memory adapters = new IAdapter[](length);
        for (uint256 i = 0; i < length; i++) {
            Oracle storage oracle = oracles[receivedDispute.oracleIDs[i]];
            reporters[i] = oracle.outboundReporter;
            adapters[i] = oracle.outboundAdapter;
        }

        (uint256 messageId, ) = yaho.dispatchMessageToAdapters(
            foreignChainID,
            receivedDispute.threshold,
            foreignGateway,
            abi.encode(disputeHash, _ruling),
            reporters,
            adapters
        );
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
}

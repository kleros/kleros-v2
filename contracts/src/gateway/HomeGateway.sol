// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "../arbitration/IArbitratorV2.sol";
import "./interfaces/IForeignGateway.sol";
import "./interfaces/IHomeGateway.sol";

/// Home Gateway
/// Counterpart of `ForeignGateway`
contract HomeGateway is IHomeGateway {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct RelayedData {
        uint256 arbitrationCost;
        address relayer;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor;
    IArbitratorV2 public arbitrator;
    IVeaInbox public veaInbox;
    address public override receiverGateway;
    uint256 public immutable receiverChainID;
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => uint256) public disputeHashtoID;
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    constructor(
        address _governor,
        IArbitratorV2 _arbitrator,
        IVeaInbox _veaInbox,
        address _receiverGateway,
        uint256 _receiverChainID
    ) {
        governor = _governor;
        arbitrator = _arbitrator;
        veaInbox = _veaInbox;
        receiverGateway = _receiverGateway;
        receiverChainID = _receiverChainID;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /// @dev Changes the governor.
    /// @param _governor The address of the new governor.
    function changeGovernor(address _governor) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        governor = _governor;
    }

    /// @dev Changes the arbitrator.
    /// @param _arbitrator The address of the new arbitrator.
    function changeArbitrator(IArbitratorV2 _arbitrator) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        arbitrator = _arbitrator;
    }

    /// @dev Changes the vea inbox, useful to increase the claim deposit.
    /// @param _veaInbox The address of the new vea inbox.
    function changeVea(IVeaInbox _veaInbox) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        veaInbox = _veaInbox;
    }

    /// @dev Changes the receiver gateway.
    /// @param _receiverGateway The address of the new receiver gateway.
    function changeReceiverGateway(address _receiverGateway) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        receiverGateway = _receiverGateway;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Provide the same parameters as on the foreignChain while creating a dispute. Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
    /// @param _params The parameters of the dispute, see `RelayCreateDisputeParams`.
    function relayCreateDispute(RelayCreateDisputeParams memory _params) external payable override {
        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                "createDispute",
                _params.foreignBlockHash,
                _params.foreignChainID,
                _params.foreignArbitrable,
                _params.foreignDisputeID,
                _params.choices,
                _params.extraData
            )
        );
        RelayedData storage relayedData = disputeHashtoRelayedData[disputeHash];
        require(relayedData.relayer == address(0), "Dispute already relayed");

        relayedData.arbitrationCost = arbitrator.arbitrationCost(_params.extraData);
        require(msg.value >= relayedData.arbitrationCost, "Not enough arbitration cost paid");

        uint256 disputeID = arbitrator.createDispute{value: msg.value}(_params.choices, _params.extraData);
        disputeIDtoHash[disputeID] = disputeHash;
        disputeHashtoID[disputeHash] = disputeID;
        relayedData.relayer = msg.sender;

        emit DisputeRequest(arbitrator, disputeID, _params.externalDisputeID, _params.templateId, _params.templateUri);

        emit CrossChainDisputeIncoming(
            arbitrator,
            _params.foreignChainID,
            _params.foreignArbitrable,
            _params.foreignDisputeID,
            _params.externalDisputeID,
            _params.templateId,
            _params.templateUri
        );
    }

    /// @dev Give a ruling for a dispute. Must be called by the arbitrator.
    /// The purpose of this function is to ensure that the address calling it has the right to rule on the contract.
    /// @param _disputeID ID of the dispute in the Arbitrator contract.
    /// @param _ruling Ruling given by the arbitrator. Note that 0 is reserved for "Not able/wanting to make a decision".
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        require(msg.sender == address(arbitrator), "Only Arbitrator");

        bytes32 disputeHash = disputeIDtoHash[_disputeID];
        RelayedData memory relayedData = disputeHashtoRelayedData[disputeHash];

        // The first parameter of relayRule() `_messageSender` is missing from the encoding below
        // because Vea takes care of inserting it for security reasons.
        bytes4 methodSelector = IForeignGateway.relayRule.selector;
        bytes memory data = abi.encode(disputeHash, _ruling, relayedData.relayer);
        veaInbox.sendMessage(receiverGateway, methodSelector, data);
    }

    /// @dev Looks up the local home disputeID for a disputeHash. For cross-chain Evidence standard.
    /// @param _disputeHash dispute hash
    function disputeHashToHomeID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoID[_disputeHash];
    }
}

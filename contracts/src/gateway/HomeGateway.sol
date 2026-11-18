// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IVeaInbox} from "@kleros/vea-contracts/src/interfaces/inboxes/IVeaInbox.sol";
import {ISenderGateway} from "@kleros/vea-contracts/src/interfaces/gateways/ISenderGateway.sol";
import {IForeignGateway} from "./interfaces/IForeignGateway.sol";
import {IHomeGateway} from "./interfaces/IHomeGateway.sol";
import {IArbitratorV2} from "../arbitration/interfaces/IArbitratorV2.sol";
import {IArbitrableV2} from "../arbitration/interfaces/IArbitrableV2.sol";

/// @title Home Gateway
/// @notice Counterpart of `ForeignGateway`
contract HomeGateway is IHomeGateway, Initializable {
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

    address public owner;
    IArbitratorV2 public arbitrator;
    IVeaInbox public veaInbox;
    uint256 public foreignChainID;
    address public foreignGateway;
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => uint256) public disputeHashtoID;
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @notice Requires that the sender is the owner.
    modifier onlyOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Constructs the `PolicyRegistry` contract.
    /// @param _owner The owner's address.
    /// @param _arbitrator The address of the arbitrator.
    /// @param _veaInbox The address of the vea inbox.
    /// @param _foreignChainID The ID of the foreign chain.
    /// @param _foreignGateway The address of the foreign gateway.
    function initialize(
        address _owner,
        IArbitratorV2 _arbitrator,
        IVeaInbox _veaInbox,
        uint256 _foreignChainID,
        address _foreignGateway
    ) external initializer {
        owner = _owner;
        arbitrator = _arbitrator;
        veaInbox = _veaInbox;
        foreignChainID = _foreignChainID;
        foreignGateway = _foreignGateway;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /// @notice Changes the owner.
    /// @param _owner The address of the new owner.
    function changeOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    /// @notice Changes the arbitrator.
    /// @param _arbitrator The address of the new arbitrator.
    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyOwner {
        arbitrator = _arbitrator;
    }

    /// @notice Changes the vea inbox, useful to increase the claim deposit.
    /// @param _veaInbox The address of the new vea inbox.
    function changeVea(IVeaInbox _veaInbox) external onlyOwner {
        veaInbox = _veaInbox;
    }

    /// @notice Changes the foreign gateway.
    /// @param _foreignGateway The address of the new foreign gateway.
    function changeForeignGateway(address _foreignGateway) external onlyOwner {
        foreignGateway = _foreignGateway;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Relays a dispute creation from the ForeignGateway to the home arbitrator using the same parameters as the ones on the foreign chain.
    ///
    /// @dev Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
    /// This function accepts the fees payment in the native currency of the home chain, typically ETH.
    ///
    /// @param _params The parameters of the dispute, see `RelayCreateDisputeParams`.
    function relayCreateDispute(RelayCreateDisputeParams memory _params) external payable {
        require(_params.foreignChainID == foreignChainID, ForeignChainIDNotSupported());

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
        require(relayedData.relayer == address(0), DisputeAlreadyRelayed());

        uint256 disputeID = arbitrator.createDispute{value: msg.value}(_params.choices, _params.extraData);
        disputeIDtoHash[disputeID] = disputeHash;
        disputeHashtoID[disputeHash] = disputeID;
        relayedData.relayer = msg.sender;

        emit DisputeRequest(arbitrator, disputeID, _params.templateId);

        emit CrossChainDisputeIncoming(
            arbitrator,
            _params.foreignChainID,
            _params.foreignArbitrable,
            _params.foreignDisputeID,
            disputeID,
            _params.templateId
        );
    }

    /// @notice Give a ruling for a dispute.
    ///
    /// @dev This is a callback function for the arbitrator to provide the ruling to this contract.
    /// Only the arbitrator must be allowed to call this function.
    /// Ruling 0 is reserved for "Not able/wanting to make a decision".
    ///
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling Ruling given by the arbitrator.
    function rule(uint256 _disputeID, uint256 _ruling) external {
        require(msg.sender == address(arbitrator), ArbitratorOnly());

        bytes32 disputeHash = disputeIDtoHash[_disputeID];
        RelayedData memory relayedData = disputeHashtoRelayedData[disputeHash];

        // The first parameter of relayRule() `_messageSender` is missing from the encoding below
        // because Vea takes care of inserting it for security reasons.
        bytes4 methodSelector = IForeignGateway.relayRule.selector;
        bytes memory data = abi.encode(disputeHash, _ruling, relayedData.relayer);
        veaInbox.sendMessage(foreignGateway, methodSelector, data);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Looks up the local home disputeID for a disputeHash
    /// @param _disputeHash dispute hash
    /// @return disputeID dispute identifier on the home chain
    function disputeHashToHomeID(bytes32 _disputeHash) external view returns (uint256) {
        return disputeHashtoID[_disputeHash];
    }

    function receiverGateway() external view returns (address) {
        return foreignGateway;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error ArbitratorOnly();
    error ForeignChainIDNotSupported();
    error DisputeAlreadyRelayed();
}

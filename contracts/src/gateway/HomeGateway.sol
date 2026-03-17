// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IVeaInbox} from "@kleros/vea-contracts/src/interfaces/inboxes/IVeaInbox.sol";
import {ISenderGateway} from "@kleros/vea-contracts/src/interfaces/gateways/ISenderGateway.sol";
import {IForeignGateway} from "./interfaces/IForeignGateway.sol";
import {IHomeGateway} from "./interfaces/IHomeGateway.sol";
import {IArbitratorV2} from "../arbitration/interfaces/IArbitratorV2.sol";
import {IArbitrableV2} from "../arbitration/interfaces/IArbitrableV2.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import {Initializable} from "../proxy/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/Constants.sol";

/// @title Home Gateway
/// @notice Counterpart of `ForeignGateway`
contract HomeGateway is IHomeGateway, UUPSProxiable, Initializable {
    using SafeERC20 for IERC20;

    string public constant override version = "0.8.0";

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
    uint256 public override foreignChainID;
    address public override foreignGateway;
    IERC20 public feeToken;
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => uint256) public disputeHashtoID;
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @notice Requires that the sender is the owner.
    modifier onlyByOwner() {
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
    /// @param _feeToken The address of the fee token.
    function initialize(
        address _owner,
        IArbitratorV2 _arbitrator,
        IVeaInbox _veaInbox,
        uint256 _foreignChainID,
        address _foreignGateway,
        IERC20 _feeToken
    ) external initializer {
        owner = _owner;
        arbitrator = _arbitrator;
        veaInbox = _veaInbox;
        foreignChainID = _foreignChainID;
        foreignGateway = _foreignGateway;
        feeToken = _feeToken;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the owner can perform upgrades (`onlyByOwner`)
     */
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @notice Changes the owner.
    /// @param _owner The address of the new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Changes the arbitrator.
    /// @param _arbitrator The address of the new arbitrator.
    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyByOwner {
        arbitrator = _arbitrator;
    }

    /// @notice Changes the vea inbox, useful to increase the claim deposit.
    /// @param _veaInbox The address of the new vea inbox.
    function changeVea(IVeaInbox _veaInbox) external onlyByOwner {
        veaInbox = _veaInbox;
    }

    /// @notice Changes the foreign gateway.
    /// @param _foreignGateway The address of the new foreign gateway.
    function changeForeignGateway(address _foreignGateway) external onlyByOwner {
        foreignGateway = _foreignGateway;
    }

    /// @notice Changes the fee token.
    /// @param _feeToken The address of the new fee token.
    function changeFeeToken(IERC20 _feeToken) external onlyByOwner {
        feeToken = _feeToken;
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
    function relayCreateDispute(RelayCreateDisputeParams memory _params) external payable override {
        require(feeToken == NATIVE_CURRENCY, FeesPaidInNativeCurrencyOnly());
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

    /// @notice Relays a dispute creation from the ForeignGateway to the home arbitrator using the same parameters as the ones on the foreign chain.
    ///
    /// @dev Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
    /// This function accepts the fees payment in the ERC20 `acceptedFeeToken()`.
    ///
    /// @param _params The parameters of the dispute, see `RelayCreateDisputeParams`.
    function relayCreateDispute(RelayCreateDisputeParams memory _params, uint256 _feeAmount) external {
        require(feeToken != NATIVE_CURRENCY, FeesPaidInERC20Only());
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

        require(feeToken.safeTransferFrom(msg.sender, address(this), _feeAmount), TransferFailed());
        require(feeToken.increaseAllowance(address(arbitrator), _feeAmount), AllowanceIncreaseFailed());

        uint256 disputeID = arbitrator.createDispute(_params.choices, _params.extraData, feeToken, _feeAmount);
        disputeIDtoHash[disputeID] = disputeHash;
        disputeHashtoID[disputeHash] = disputeID;
        relayedData.relayer = msg.sender;

        // Not strictly necessary for functionality, only to satisfy IArbitrableV2
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
    function rule(uint256 _disputeID, uint256 _ruling) external override {
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
    function disputeHashToHomeID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoID[_disputeHash];
    }

    function receiverGateway() external view override returns (address) {
        return foreignGateway;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error ArbitratorOnly();
    error FeesPaidInERC20Only();
    error FeesPaidInNativeCurrencyOnly();
    error ForeignChainIDNotSupported();
    error DisputeAlreadyRelayed();
    error TransferFailed();
    error AllowanceIncreaseFailed();
}

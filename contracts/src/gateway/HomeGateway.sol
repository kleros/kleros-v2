// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "../arbitration/IArbitrator.sol";
import "./interfaces/IForeignGateway.sol";
import "./interfaces/IHomeGateway.sol";
import "../libraries/SafeERC20.sol";

/// Home Gateway
/// Counterpart of `ForeignGateway`
contract HomeGateway is IHomeGateway {
    using SafeERC20 for IERC20;

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

    IERC20 public constant NATIVE_CURRENCY = IERC20(address(0)); // The native currency, such as ETH on Arbitrum, Optimism and Ethereum L1.
    address public governor;
    IArbitrator public arbitrator;
    IVeaInbox public veaInbox;
    uint256 public immutable override foreignChainID;
    address public override foreignGateway;
    IERC20 public feeToken;
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => uint256) public disputeHashtoID;
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor(
        address _governor,
        IArbitrator _arbitrator,
        IVeaInbox _veaInbox,
        uint256 _foreignChainID,
        address _foreignGateway,
        IERC20 _feeToken
    ) {
        governor = _governor;
        arbitrator = _arbitrator;
        veaInbox = _veaInbox;
        foreignChainID = _foreignChainID;
        foreignGateway = _foreignGateway;
        feeToken = _feeToken;

        emit MetaEvidence(0, "BRIDGE");
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
    function changeArbitrator(IArbitrator _arbitrator) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        arbitrator = _arbitrator;
    }

    /// @dev Changes the vea inbox, useful to increase the claim deposit.
    /// @param _veaInbox The address of the new vea inbox.
    function changeVea(IVeaInbox _veaInbox) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        veaInbox = _veaInbox;
    }

    /// @dev Changes the foreign gateway.
    /// @param _foreignGateway The address of the new foreign gateway.
    function changeForeignGateway(address _foreignGateway) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        foreignGateway = _foreignGateway;
    }

    /// @dev Changes the fee token.
    /// @param _feeToken The address of the new fee token.
    function changeFeeToken(IERC20 _feeToken) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        feeToken = _feeToken;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc IHomeGateway
    function relayCreateDispute(
        uint256 _foreignChainID,
        bytes32 _foreignBlockHash,
        uint256 _foreignDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        address _arbitrable
    ) external payable override {
        require(feeToken == NATIVE_CURRENCY, "Fees paid in ERC20 only");
        require(_foreignChainID == foreignChainID, "Foreign chain ID not supported");

        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                _foreignChainID,
                _foreignBlockHash,
                "createDispute",
                _foreignDisputeID,
                _choices,
                _extraData,
                _arbitrable
            )
        );
        RelayedData storage relayedData = disputeHashtoRelayedData[disputeHash];
        require(relayedData.relayer == address(0), "Dispute already relayed");

        uint256 disputeID = arbitrator.createDispute{value: msg.value}(_choices, _extraData);
        disputeIDtoHash[disputeID] = disputeHash;
        disputeHashtoID[disputeHash] = disputeID;
        relayedData.relayer = msg.sender;

        emit Dispute(arbitrator, disputeID, 0, 0);
    }

    /// @inheritdoc IHomeGateway
    function relayCreateDispute(
        uint256 _foreignChainID,
        bytes32 _foreignBlockHash,
        uint256 _foreignDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        address _arbitrable,
        uint256 _feeAmount
    ) external payable {
        require(feeToken != NATIVE_CURRENCY, "Fees paid in native currency only");
        require(_foreignChainID == foreignChainID, "Foreign chain ID not supported");

        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                _foreignChainID,
                _foreignBlockHash,
                "createDispute",
                _foreignDisputeID,
                _choices,
                _extraData,
                _arbitrable
            )
        );
        RelayedData storage relayedData = disputeHashtoRelayedData[disputeHash];
        require(relayedData.relayer == address(0), "Dispute already relayed");

        require(feeToken.safeTransferFrom(msg.sender, address(this), _feeAmount), "Transfer failed");
        require(feeToken.increaseAllowance(address(arbitrator), _feeAmount), "Allowance increase failed");

        uint256 disputeID = arbitrator.createDispute(_choices, _extraData, feeToken, _feeAmount);
        disputeIDtoHash[disputeID] = disputeHash;
        disputeHashtoID[disputeHash] = disputeID;
        relayedData.relayer = msg.sender;

        emit Dispute(arbitrator, disputeID, 0, 0);
    }

    /// @inheritdoc IArbitrable
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        require(msg.sender == address(arbitrator), "Only Arbitrator");

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

    /// @inheritdoc IHomeGateway
    function disputeHashToHomeID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoID[_disputeHash];
    }

    /// @inheritdoc ISenderGateway
    function receiverGateway() external view override returns (address) {
        return foreignGateway;
    }

    /// @inheritdoc IHomeGateway
    function acceptedFeeToken() external view returns (IERC20) {
        return feeToken;
    }
}

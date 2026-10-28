// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../../arbitration/interfaces/IArbitratorV2.sol";

interface IForeignGateway is IArbitratorV2 {
    /// @dev Payload of the dispute message sent to the HomeGateway through Yaho, as `abi.encode(DisputeMessage)`.
    /// The HomeGateway recomputes the dispute hash from the first four fields, plus the source chain ID and sender
    /// (the ForeignGateway) delivered by Yaru.
    struct DisputeMessage {
        address foreignArbitrable;
        uint256 foreignDisputeID;
        uint256 choices;
        bytes extraData;
        uint256 externalDisputeID; // From the arbitrable's `DisputeRequest`.
        uint256 templateId; // From the arbitrable's `DisputeRequest`.
        string templateUri; // From the arbitrable's `DisputeRequest`.
        uint256[] oracleIDs; // Oracles the HomeGateway must use for the ruling leg.
        uint256 threshold; // Threshold the HomeGateway must use for the ruling leg.
    }

    /// @dev To be emitted when a dispute is sent to the IHomeGateway.
    /// @param _foreignArbitrable The address of the Arbitrable contract.
    /// @param _foreignDisputeID The identifier of the dispute in the Arbitrable contract.
    /// @param _choices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Any extra data to attach.
    event CrossChainDisputeOutgoing(
        address indexed _foreignArbitrable,
        uint256 indexed _foreignDisputeID,
        uint256 _choices,
        bytes _extraData
    );

    /// @dev Creates a dispute that uses the given oracles on both legs instead of the default selection.
    /// @param _choices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Additional info about the dispute.
    /// @param _oracleIDs The IDs of whitelisted, enabled oracles, without duplicates.
    /// @param _threshold The number of oracles that must agree. 1 <= _threshold <= _oracleIDs.length.
    /// @return disputeID The identifier of the dispute created.
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData,
        uint256[] calldata _oracleIDs,
        uint256 _threshold
    ) external payable returns (uint256 disputeID);

    /// @dev Creates a dispute paid in an accepted ERC20 that uses the given oracles on both legs.
    /// The caller must have approved `_feeAmount` of `_feeToken` to the gateway.
    /// @param _choices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Additional info about the dispute.
    /// @param _oracleIDs The IDs of whitelisted, enabled oracles, without duplicates.
    /// @param _threshold The number of oracles that must agree. 1 <= _threshold <= _oracleIDs.length.
    /// @param _feeToken The ERC20 token used to pay fees.
    /// @param _feeAmount Amount of the ERC20 token used to pay fees.
    /// @return disputeID The identifier of the dispute created.
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData,
        uint256[] calldata _oracleIDs,
        uint256 _threshold,
        IERC20 _feeToken,
        uint256 _feeAmount
    ) external returns (uint256 disputeID);

    /// @dev Computes the cost in `_feeToken` of a dispute that uses the given oracles.
    /// @param _extraData Additional info about the dispute.
    /// @param _oracleIDs The IDs of the oracles.
    /// @param _feeToken The ERC20 token used to pay fees.
    /// @return cost The arbitration cost in `_feeToken`.
    function arbitrationCost(
        bytes calldata _extraData,
        uint256[] calldata _oracleIDs,
        IERC20 _feeToken
    ) external view returns (uint256 cost);

    /// @dev Computes the cost of a dispute that uses the given oracles: juror fees plus their bridging cost.
    /// @param _extraData Additional info about the dispute.
    /// @param _oracleIDs The IDs of the oracles.
    /// @return cost The arbitration cost in native currency.
    function arbitrationCost(
        bytes calldata _extraData,
        uint256[] calldata _oracleIDs
    ) external view returns (uint256 cost);

    /// @dev Computes the bridging cost of a selection: the sum of each oracle's round-trip cost.
    /// @param _oracleIDs The IDs of the oracles.
    /// @return cost The bridging cost in native currency.
    function bridgingCost(uint256[] memory _oracleIDs) external view returns (uint256 cost);

    /// @dev Sends a created dispute to the home chain through Yaho, over the oracles selected at creation.
    /// Only the dispute's arbitrable can relay it: the dispute hash is recomputed with `msg.sender` as the arbitrable.
    /// A dispute can be relayed once.
    /// @param _foreignDisputeID The local dispute ID returned by `createDispute`.
    /// @param _choices The number of choices passed to `createDispute`.
    /// @param _extraData The extra data passed to `createDispute`.
    /// @param _externalDisputeID The external dispute ID of the arbitrable's `DisputeRequest`.
    /// @param _templateId The template ID of the arbitrable's `DisputeRequest`.
    /// @param _templateUri The template URI of the arbitrable's `DisputeRequest`.
    /// @return messageId The Yaho message ID.
    function relayDispute(
        uint256 _foreignDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        uint256 _externalDisputeID,
        uint256 _templateId,
        string calldata _templateUri
    ) external returns (uint256 messageId);

    /// @dev Looks up the local foreign disputeID for a disputeHash
    /// @param _disputeHash dispute hash
    function disputeHashToForeignID(bytes32 _disputeHash) external view returns (uint256);

    /// @return The chain ID where the corresponding home gateway is deployed.
    function homeChainID() external view returns (uint256);

    /// @return The address of the corresponding home gateway.
    function homeGateway() external view returns (address);
}

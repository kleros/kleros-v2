// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../../arbitration/interfaces/IArbitrableV2.sol";

interface IHomeGateway is IArbitrableV2 {
    /// @dev To be emitted when a dispute is received from the IForeignGateway.
    /// @param _arbitrator The arbitrator of the contract.
    /// @param _arbitrableChainId The chain identifier where the Arbitrable contract is deployed.
    /// @param _arbitrable The address of the Arbitrable contract.
    /// @param _arbitrableDisputeID The identifier of the dispute in the Arbitrable contract.
    /// @param _arbitratorDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _externalDisputeID An identifier created outside Kleros by the protocol requesting arbitration.
    /// @param _templateId The identifier of the dispute template. Should not be used with _templateUri.
    /// @param _templateUri IPFS path to the dispute template starting with '/ipfs/'. Should not be used with _templateId.
    event CrossChainDisputeIncoming(
        IArbitratorV2 _arbitrator,
        uint256 _arbitrableChainId,
        address indexed _arbitrable,
        uint256 indexed _arbitrableDisputeID,
        uint256 indexed _arbitratorDisputeID,
        uint256 _externalDisputeID,
        uint256 _templateId,
        string _templateUri
    );

    /// @dev To be emitted when a ruling is sent to the IForeignGateway through Yaho.
    /// @param _disputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _disputeHash The dispute hash shared by both gateways.
    /// @param _ruling The ruling.
    /// @param _messageId The Yaho message ID.
    event RulingDispatched(
        uint256 indexed _disputeID,
        bytes32 indexed _disputeHash,
        uint256 _ruling,
        uint256 _messageId
    );

    /// @dev Looks up the local home disputeID for a disputeHash
    /// @param _disputeHash dispute hash
    /// @return disputeID dispute identifier on the home chain
    function disputeHashToHomeID(bytes32 _disputeHash) external view returns (uint256);

    /// @return The chain ID where the corresponding foreign gateway is deployed.
    function foreignChainID() external view returns (uint256);

    /// @return The address of the corresponding foreign gateway.
    function foreignGateway() external view returns (address);
}

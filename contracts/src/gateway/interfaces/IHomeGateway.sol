// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "../../arbitration/IArbitrable.sol";
import "../../evidence/IMetaEvidence.sol";
import "@kleros/vea-contracts/src/interfaces/gateways/ISenderGateway.sol";

interface IHomeGateway is IArbitrable, IMetaEvidence, ISenderGateway {
    /// @dev To be emitted when a dispute is received from the IForeignGateway.
    /// @param _arbitrator The arbitrator of the contract.
    /// @param _arbitrableChainId The chain identifier where the Arbitrable contract is deployed.
    /// @param _arbitrable The address of the Arbitrable contract.
    /// @param _arbitrableDisputeID The identifier of the dispute in the Arbitrable contract.
    /// @param _externalDisputeID An identifier created outside Kleros by the protocol requesting arbitration.
    /// @param _templateId The identifier of the dispute template. Should not be used with _templateUri.
    /// @param _templateUri IPFS path to the dispute template starting with '/ipfs/'. Should not be used with _templateId.
    event CrossChainDisputeIncoming(
        IArbitratorV2 indexed _arbitrator,
        uint256 _arbitrableChainId,
        address indexed _arbitrable,
        uint256 indexed _arbitrableDisputeID,
        uint256 _externalDisputeID,
        uint256 _templateId,
        string _templateUri
    );

    /// @dev Provide the same parameters as on the foreignChain while creating a dispute. Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
    /// @param _foreignChainID foreignChainId
    /// @param _foreignBlockHash foreignBlockHash
    /// @param _foreignDisputeID foreignDisputeID
    /// @param _choices number of ruling choices
    /// @param _extraData extraData
    /// @param _arbitrable arbitrable
    function relayCreateDispute(
        uint256 _foreignChainID,
        bytes32 _foreignBlockHash,
        uint256 _foreignDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        address _arbitrable
    ) external payable;

    /// @dev Looks up the local home disputeID for a disputeHash.
    /// @param _disputeHash dispute hash
    /// @return disputeID dispute identifier on the home chain
    function disputeHashToHomeID(bytes32 _disputeHash) external view returns (uint256);

    /// @return The chain ID where the corresponding foreign gateway is deployed.
    function foreignChainID() external view returns (uint256);

    /// @return The address of the corresponding foreign gateway.
    function foreignGateway() external view returns (address);
}

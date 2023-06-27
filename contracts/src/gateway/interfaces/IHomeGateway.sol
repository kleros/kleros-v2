// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@kleros/vea-contracts/src/interfaces/gateways/ISenderGateway.sol";
import "../../arbitration/interfaces/IArbitrableV2.sol";

interface IHomeGateway is IArbitrableV2, ISenderGateway {
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

    // Workaround stack too deep for relayCreateDispute()
    struct RelayCreateDisputeParams {
        bytes32 foreignBlockHash;
        uint256 foreignChainID;
        address foreignArbitrable;
        uint256 foreignDisputeID;
        uint256 externalDisputeID;
        uint256 templateId;
        string templateUri;
        uint256 choices;
        bytes extraData;
    }

    /// @dev Relays a dispute creation from the ForeignGateway to the home arbitrator using the same parameters as the ones on the foreign chain.
    ///      Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
    ///      This function accepts the fees payment in the native currency of the home chain, typically ETH.
    /// @param _params The parameters of the dispute, see `RelayCreateDisputeParams`.
    function relayCreateDispute(RelayCreateDisputeParams memory _params) external payable;

    /// @dev Relays a dispute creation from the ForeignGateway to the home arbitrator using the same parameters as the ones on the foreign chain.
    ///      Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
    ///      This function accepts the fees payment in the ERC20 `acceptedFeeToken()`.
    /// @param _params The parameters of the dispute, see `RelayCreateDisputeParams`.
    function relayCreateDispute(RelayCreateDisputeParams memory _params, uint256 _feeAmount) external;

    /// @dev Looks up the local home disputeID for a disputeHash
    /// @param _disputeHash dispute hash
    /// @return disputeID dispute identifier on the home chain
    function disputeHashToHomeID(bytes32 _disputeHash) external view returns (uint256);

    /// @return The chain ID where the corresponding foreign gateway is deployed.
    function foreignChainID() external view returns (uint256);

    /// @return The address of the corresponding foreign gateway.
    function foreignGateway() external view returns (address);

    /// return The fee token.
    function feeToken() external view returns (IERC20);
}

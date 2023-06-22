// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@kleros/vea-contracts/src/interfaces/gateways/ISenderGateway.sol";
import "../../arbitration/IArbitrable.sol";
import "../../evidence/IMetaEvidence.sol";

interface IHomeGateway is IArbitrable, IMetaEvidence, ISenderGateway {
    /// @dev Relays a dispute creation from the ForeignGateway to the home arbitrator using the same parameters as the ones on the foreign chain.
    ///      Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
    ///      This function accepts the fees payment in the native currency of the home chain, typically ETH.
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

    /// @dev Relays a dispute creation from the ForeignGateway to the home arbitrator using the same parameters as the ones on the foreign chain.
    ///      Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
    ///      This function accepts the fees payment in the ERC20 token specified by `acceptedFeeToken()`.
    /// @param _foreignChainID foreignChainId
    /// @param _foreignBlockHash foreignBlockHash
    /// @param _foreignDisputeID foreignDisputeID
    /// @param _choices number of ruling choices
    /// @param _extraData extraData
    /// @param _arbitrable arbitrable
    /// @param _feeAmount Amount of the ERC20 token used to pay fees.
    function relayCreateDispute(
        uint256 _foreignChainID,
        bytes32 _foreignBlockHash,
        uint256 _foreignDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        address _arbitrable,
        uint256 _feeAmount
    ) external payable;

    /// @dev Looks up the local home disputeID for a disputeHash
    /// @param _disputeHash dispute hash
    function disputeHashToHomeID(bytes32 _disputeHash) external view returns (uint256);

    /// @return The chain ID where the corresponding foreign gateway is deployed.
    function foreignChainID() external view returns (uint256);

    /// @return The address of the corresponding foreign gateway.
    function foreignGateway() external view returns (address);

    /// return The fee token.
    function acceptedFeeToken() external view returns (IERC20);
}

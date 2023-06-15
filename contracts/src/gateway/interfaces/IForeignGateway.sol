// SPDX-License-Identifier: MIT

/// @custom:authors: [@jaybuidl, @shotaronowhere, @shalzz]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@kleros/vea-contracts/src/interfaces/gateways/IReceiverGateway.sol";
import "../../arbitration/IArbitrator.sol";

interface IForeignGateway is IArbitrator, IReceiverGateway {
    /// Relay the rule call from the home gateway to the arbitrable.
    function relayRule(address _messageSender, bytes32 _disputeHash, uint256 _ruling, address _forwarder) external;

    /// Reimburses the dispute fees to the relayer who paid for these fees on the home chain.
    /// @param _disputeHash The dispute hash for which to withdraw the fees.
    function withdrawFees(bytes32 _disputeHash) external;

    /// @dev Looks up the local foreign disputeID for a disputeHash
    /// @param _disputeHash dispute hash
    function disputeHashToForeignID(bytes32 _disputeHash) external view returns (uint256);

    /// @return The chain ID where the corresponding home gateway is deployed.
    function homeChainID() external view returns (uint256);

    /// @return The address of the corresponding home gateway.
    function homeGateway() external view returns (address);
}

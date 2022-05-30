// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrable.sol";
import "../../evidence/IMetaEvidence.sol";
import "./IHomeGatewayBase.sol";

interface IHomeGateway is IArbitrable, IMetaEvidence, IHomeGatewayBase {
    function relayCreateDispute(
        uint256 _originalChainID,
        bytes32 _originalBlockHash,
        uint256 _originalDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        address _arbitrable
    ) external payable;

    // For cross-chain Evidence standard
    function disputeHashToHomeID(bytes32 _disputeHash) external view returns (uint256);
}

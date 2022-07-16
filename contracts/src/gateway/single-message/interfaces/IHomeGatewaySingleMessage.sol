// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../../arbitration/IArbitrable.sol";
import "../../../evidence/IMetaEvidence.sol";

interface IHomeGatewaySingleMessage is IArbitrable, IMetaEvidence {
    function chainID() external view returns (uint256);

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

    function foreignChainID() external view returns (uint256);

    function foreignGateway() external view returns (address);
}

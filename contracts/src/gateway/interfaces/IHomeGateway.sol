// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrable.sol";
import "../../evidence/IEvidence.sol";

interface IHomeGateway is IArbitrable, IEvidence {
    function chainID() external view returns (uint256);

    /**
     * Handle the cross-chain call from the foreign gateway.
     */
    function handleIncomingDispute(
        bytes32 _disputeHash,
        uint256 _choices,
        bytes calldata _extraData,
        uint256 numOfJurors
    ) external;

    function relayCreateDispute(bytes32 _disputeHash) external payable;

    // For cross-chain Evidence standard

    function disputeHashToHomeID(bytes32 _disputeHash) external view returns (uint256);

    function foreignChainID() external view returns (uint256);

    function foreignGateway() external view returns (address);
}

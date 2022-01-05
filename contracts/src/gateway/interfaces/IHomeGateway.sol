// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrable.sol";
import "./IHomeEvidence.sol";

interface IHomeGateway is IArbitrable, IHomeEvidence {
    function chainID() external view returns (uint256);

    function homeDisputeHashToID(bytes32 _disputeHash) external view returns (uint256);

    /**
     * Relay the createDispute call from the foreign gateway to the arbitrator.
     */
    function relayCreateDispute(
        bytes32 _disputeHash,
        uint256 _choices,
        bytes calldata _extraData
    ) external;
}

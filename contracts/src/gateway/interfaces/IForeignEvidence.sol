// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IForeignEvidence {
    function disputeID(uint256 _foreignDisputeID) external view returns (uint256);

    function homeChainID(uint256 _disputeID) external view returns (uint256);

    function homeBridge(uint256 _disputeID) external view returns (address);
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../evidence/IEvidence.sol";

interface IHomeEvidence is IEvidence {
    function homeToForeignDisputeID(uint256 _homeDisputeID) external view returns (uint256);

    function foreignChainID(uint256 _homeDisputeID) external view returns (uint256);

    function foreignBridge(uint256 _homeDisputeID) external view returns (address);
}

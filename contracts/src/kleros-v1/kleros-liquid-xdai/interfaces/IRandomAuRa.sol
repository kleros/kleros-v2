// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

interface IRandomAuRa {
    function currentSeed() external view returns (uint256);

    function isCommitPhase() external view returns (bool);

    function nextCommitPhaseStartBlock() external view returns (uint256);

    function collectRoundLength() external view returns (uint256);
}

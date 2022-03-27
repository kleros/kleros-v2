// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFastBridgeReceiver {
    function claim(uint256 _ticketID, bytes32 _messageHash) external payable;

    function challenge(uint256 _ticketID) external payable;

    function verifyAndRelay(
        uint256 _ticketID,
        bytes32 _messageHash,
        bytes memory _messageData
    ) external;

    function verifyAndRelaySafe(
        uint256 _ticketID,
        bytes32 _messageHash,
        bytes memory _messageData
    ) external;

    function withdrawClaimDeposit(uint256 _ticketID) external;

    function withdrawChallengeDeposit(uint256 _ticketID) external;

    function claimDeposit() external view returns (uint256 amount);

    function challengeDeposit() external view returns (uint256 amount);

    function challengeDuration() external view returns (uint256 amount);
}

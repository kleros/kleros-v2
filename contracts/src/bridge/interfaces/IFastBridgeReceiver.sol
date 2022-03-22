// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFastBridgeReceiver {
    function claim(bytes32 _messageHash) external payable;

    function challenge(bytes32 _messageHash) external payable;

    function verifyAndRelay(bytes32 _messageHash, bytes memory _encodedData) external;

    function verifyAndRelaySafe(bytes32 _messageHash, bytes memory _encodedData) external;

    function withdrawClaimDeposit(bytes32 _messageHash) external;

    function withdrawChallengeDeposit(bytes32 _messageHash) external;

    function claimDeposit() external view returns (uint256 amount);

    function challengeDeposit() external view returns (uint256 amount);

    function challengeDuration() external view returns (uint256 amount);

    function safeBridgeTimeout() external view returns (uint256 amount);
}

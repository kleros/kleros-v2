// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFastBridgeReceiver {
    function claim(bytes32 _messageHash) external payable;

    function verifyAndRelay(bytes32 _messageHash, bytes memory _calldata) external;

    function withdrawClaimDeposit(bytes32 _messageHash) external;

    function claimDeposit() external view returns (uint256 amount);
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFastBridgeReceiver {
    function claim(uint256 _fastMessageIndex, bytes32 _messageHash) external payable;

    function verifyAndRelay(uint _fastMessageIndex, bytes memory _encodedData) external;

    function relayRule(bytes memory _encodedData) external;

    function withdrawClaimDeposit(uint256 _fastMessageIndex) external;

    function viewClaimDeposit() external view returns (uint256 amount);
}

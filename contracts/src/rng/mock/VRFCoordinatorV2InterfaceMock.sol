// SPDX-License-Identifier: MIT
// A mock for testing code that relies on VRFCoordinatorV2.
pragma solidity ^0.8.4;

interface VRFCoordinatorV2InterfaceMock {
    function consumerIsAdded(uint64 _subId, address _consumer) external view returns (bool);

    function fulfillRandomWords(uint256 _requestId, address _consumer) external;

    function fundSubscription(uint64 _subId, uint96 _amount) external;

    function requestRandomWords(
        bytes32 _keyHash,
        uint64 _subId,
        uint16 _minimumRequestConfirmations,
        uint32 _callbackGasLimit,
        uint32 _numWords
    ) external returns (uint256);

    function createSubscription() external returns (uint64 _subId);

    function getSubscription(
        uint64 _subId
    ) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers);

    function cancelSubscription(uint64 _subId, address _to) external;

    function addConsumer(uint64 _subId, address _consumer) external;

    function removeConsumer(uint64 _subId, address _consumer) external;
}

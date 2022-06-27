pragma solidity ^0.8;

interface ISortitionModule {
    function createTree(bytes32 _key, uint256 _K) external;

    function set(
        bytes32 _key,
        uint256 _value,
        bytes32 _ID
    ) external;

    function draw(bytes32 _key, uint256 _drawnNumber) external view returns (address);

    function stakeOf(bytes32 _key, bytes32 _ID) external view returns (uint256);
}

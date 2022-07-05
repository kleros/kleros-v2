pragma solidity ^0.8;

interface ISortitionModule {
    enum Phase {
        staking, // Stake can be updated during this phase.
        freezing // Phase during which the dispute kits can undergo the drawing process. Staking is not allowed during this phase.
    }

    function createTree(bytes32 _key, uint256 _K) external;

    function set(
        bytes32 _key,
        uint256 _value,
        bytes32 _ID
    ) external;

    function draw(bytes32 _key, uint256 _drawnNumber) external view returns (address);

    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external;

    function preDrawHook(uint256 _disputeID) external;

    function preStakeHook(
        address _account,
        uint96 _subcourtID,
        uint256 _stake,
        uint256 _penalty
    )
        external
        returns (
            bool,
            uint256,
            bytes32
        );

    function phase() external view returns (Phase);

    function freezingPhaseTimeout() external view returns (bool);

    function getFreezeBlock() external view returns (uint256);
}

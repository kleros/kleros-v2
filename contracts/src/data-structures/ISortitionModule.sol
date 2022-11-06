pragma solidity ^0.8;

interface ISortitionModule {
    enum Phase {
        staking, // Stake sum trees can be updated. Pass after `minStakingTime` passes and there is at least one dispute without jurors.
        generating, // Waiting for a random number. Pass as soon as it is ready.
        drawing // Jurors can be drawn. Pass after all disputes have jurors or `maxDrawingTime` passes.
    }

    enum Result {
        None,
        True,
        False
    }

    function initialize(bytes32 _key, bytes memory _extraData) external;

    function set(
        uint256 _subcourtID,
        uint256 _value,
        bytes32 _ID
    ) external;

    function notifyRandomNumber(uint256 _drawnNumber) external;

    function draw(
        bytes32 _subCourt,
        uint256 _coreDisputeID,
        uint256 _voteID
    ) external view returns (address);

    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external;

    function postDrawHook(uint256 _disputeID, uint256 _roundID) external;

    function preStakeHook(
        address _account,
        uint96 _subcourtID,
        uint256 _stake,
        uint256 _penalty
    ) external returns (Result);
}

pragma solidity ^0.8;

import "../arbitration/IArbitrator.sol";

interface IKlerosLiquid is IArbitrator {
    enum Period {
        evidence, // Evidence can be submitted. This is also when drawing has to take place.
        commit, // Jurors commit a hashed vote. This is skipped for courts without hidden votes.
        vote, // Jurors reveal/cast their vote depending on whether the court has hidden votes or not.
        appeal, // The dispute can be appealed.
        execution // Tokens are redistributed and the ruling is executed.
    }

    enum Phase {
        staking, // Stake sum trees can be updated. Pass after `minStakingTime` passes and there is at least one dispute without jurors.
        generating, // Waiting for a random number. Pass as soon as it is ready.
        drawing // Jurors can be drawn. Pass after all disputes have jurors or `maxDrawingTime` passes.
    }

    struct Dispute {
        // Note that appeal `0` is equivalent to the first round of the dispute.
        uint96 subcourtID; // The ID of the subcourt the dispute is in.
        address arbitrated; // The arbitrated arbitrable contract.
        // The number of choices jurors have when voting. This does not include choice `0` which is reserved for "refuse to arbitrate"/"no ruling".
        uint256 numberOfChoices;
        Period period; // The current period of the dispute.
        uint256 lastPeriodChange; // The last time the period was changed.
        uint256 drawsInRound; // A counter of draws made in the current round.
        uint256 commitsInRound; // A counter of commits made in the current round.
        bool ruled; // True if the ruling has been executed, false otherwise.
    }

    struct Juror {
        uint256 stakedTokens; // The juror's total amount of tokens staked in subcourts.
        uint256 lockedTokens; // The juror's total amount of tokens locked in disputes.
    }

    function phase() external view returns (Phase);

    function lockInsolventTransfers() external view returns (bool);

    function minStakingTime() external view returns (uint256);

    function pinakion() external view returns (address);

    function disputes(uint256 _index) external view returns (Dispute memory);

    function jurors(address _account) external view returns (Juror memory);

    function changeSubcourtTimesPerPeriod(uint96 _subcourtID, uint256[4] calldata _timesPerPeriod) external;

    function executeGovernorProposal(
        address _destination,
        uint256 _amount,
        bytes calldata _data
    ) external;

    // Getters
    function getVote(
        uint256 _disputeID,
        uint256 _appeal,
        uint256 _voteID
    )
        external
        view
        returns (
            address account,
            bytes32 commit,
            uint256 choice,
            bool voted
        );

    function getDispute(uint256 _disputeID)
        external
        view
        returns (
            uint256[] memory votesLengths,
            uint256[] memory tokensAtStakePerJuror,
            uint256[] memory totalFeesForJurors,
            uint256[] memory votesInEachRound,
            uint256[] memory repartitionsInEachRound,
            uint256[] memory penaltiesInEachRound
        );

    function getSubcourt(uint96 _subcourtID)
        external
        view
        returns (uint256[] memory children, uint256[4] memory timesPerPeriod);
}

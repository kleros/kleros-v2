// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {KlerosCore} from "../KlerosCore.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {SafeSend} from "../../libraries/SafeSend.sol";

/// @title CentralizedKit
contract CentralizedKit is IDisputeKit, Initializable {
    using SafeSend for address payable;

    // ************************************* //
    // *             Structs               * //
    // ************************************* //

    struct Dispute {
        uint256 ruling; // The ruling given by the ruler.
        bool ruled; // Whether the dispute was ruled or not.
        uint256 coreDisputeID; // Corresponding core dispute ID.
        uint256 numberOfChoices; // The number of choices jurors have when voting. This does not include choice `0` which is reserved for "refuse to arbitrate".
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public ruler; // The address to give a centralized ruling.
    KlerosCore public core; // The Kleros Core arbitrator.
    address public wNative; // The wrapped native token for safeSend().
    Dispute[] public disputes; // Array of the locally created disputes.
    mapping(uint256 coreDisputeID => uint256 localDisputeID) public coreDisputeIDToLocal; // Maps the dispute ID in Kleros Core to the local dispute ID.

    uint256[50] private __gap; // Reserved slots for future upgrades.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when a dispute is created.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _numberOfChoices The number of choices available in the dispute.
    event DisputeCreation(uint256 indexed _coreDisputeID, uint256 _numberOfChoices);

    /// @notice To be emitted when a ruling is given by the ruler.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling The given ruling.
    event RulingGiven(uint256 indexed _coreDisputeID, uint256 _ruling);

    /// @notice To be emitted when final round's appeal fees are withdrawn.
    /// @param _recipient Fee's recepient.
    /// @param _amount Withdrawn amount.
    event FeesWithdrawn(address indexed _recipient, uint256 _amount);

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

    modifier onlyCore() {
        require(address(core) == msg.sender, KlerosCoreOnly());
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer.
    /// @param _core The KlerosCore arbitrator.
    /// @param _ruler The ruler.
    /// @param _wNative The wrapped native token address, typically wETH.
    function initialize(KlerosCore _core, address _ruler, address _wNative) external initializer {
        core = _core;
        ruler = _ruler;
        wNative = _wNative;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Creates a local dispute and maps it to the dispute ID in the Core contract.
    /// @dev Access restricted to Kleros Core only.
    /// @dev The new `KlerosCore.Round` must be created before calling this function.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _numberOfChoices Number of choices of the dispute.
    function createDispute(uint256 _coreDisputeID, uint256 _coreRoundID, uint256 _numberOfChoices) public onlyCore {
        coreDisputeIDToLocal[_coreDisputeID] = disputes.length;

        Dispute storage dispute = disputes.push();
        dispute.numberOfChoices = _numberOfChoices;
        dispute.coreDisputeID = _coreDisputeID;

        emit DisputeCreation(_coreDisputeID, _numberOfChoices);
    }

    /// @notice Gives a ruling to a dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _ruling The given ruling.
    function giveRuling(uint256 _coreDisputeID, uint256 _ruling) external {
        require(ruler == msg.sender, RulerOnly());
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        require(dispute.coreDisputeID == _coreDisputeID, DisputeUnknownInThisDisputeKit()); // Extra check for 0 id fallback.

        require(_ruling <= dispute.numberOfChoices, RulingOutOfBounds());
        require(!dispute.ruled, RulingAlreadyGiven());

        dispute.ruled = true;
        dispute.ruling = _ruling;

        emit RulingGiven(_coreDisputeID, _ruling);
    }

    /// @notice Withdraws appeal fees of the final round.
    /// @param _recipient Recipient's address.
    /// @param _amount Amount to withdraw.
    function withdrawFees(address payable _recipient, uint256 _amount) external {
        require(msg.sender == ruler, RulerOnly());
        require(_amount <= address(this).balance, InsufficientBalance());
        _recipient.safeSend(_amount, wNative);
        emit FeesWithdrawn(_recipient, _amount);
    }

    receive() external payable {}

    /// @notice Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core. Not used by this contract.
    /// @dev Access restricted to Kleros Core only.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _nonce Nonce that represents the current drawing iteration in this round.
    /// @param - The number of votes in the round (unused, required by interface).
    /// @return drawnAddress The drawn address.
    /// @return fromSubcourtID The subcourt ID from which the juror was drawn.
    function draw(
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 /*_roundNbVotes*/
    ) public onlyCore returns (address drawnAddress, uint96 fromSubcourtID) {
        revert UnsupportedOperation();
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Gets the current ruling of a specified dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _coreDisputeID) external view returns (uint256 ruling, bool tied, bool overridden) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        require(dispute.coreDisputeID == _coreDisputeID, DisputeUnknownInThisDisputeKit()); // Extra check for 0 id fallback.
        // Note that this check prevents passing period from Appeal to Execution in KlerosCore if the ruling is not ready.
        require(dispute.ruled, RulingNotGiven());
        ruling = dispute.ruling;
    }

    /// @notice Gets the rewards for PNK and fees.
    /// @notice Intended to be called by KlerosCore. External callers must validate inputs beforehand.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @param _feeRewardPool Total amount of fees available for rewards to all coherent jurors.
    /// @param _pnkRewardPool Total amount of PNK available for rewards to all coherent jurors.
    /// @return feeReward The fee reward the juror is eligible to.
    /// @return pnkReward The pnk reward the juror is eligible to.
    function getRewards(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _feeRewardPool,
        uint256 _pnkRewardPool
    ) external view returns (uint256 feeReward, uint256 pnkReward) {
        return (0, 0);
    }

    /// @notice Gets the pnk penalty for incoherent juror.
    /// @notice Intended to be called by KlerosCore. External callers must validate inputs beforehand.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @param _pnkAtStake Pnk amount subjected to penalty.
    /// @return penalty Juror's penalty.
    function getPenalty(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _pnkAtStake
    ) external view returns (uint256 penalty) {
        return 0;
    }

    /// @notice Returns true if all of the jurors have cast their commits for the last round. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether all of the jurors have cast their commits for the last round.
    function areCommitsAllCast(uint256 _coreDisputeID) external view returns (bool) {
        return false;
    }

    /// @notice Returns true if all of the jurors have cast their votes for the last round. Not used by this contract.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether all of the jurors have cast their votes for the last round.
    function areVotesAllCast(uint256 _coreDisputeID) external view returns (bool) {
        return false;
    }

    /// @notice Returns true if the appeal funding is finished prematurely (e.g. when losing side didn't fund). Not used by this contract.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether the appeal funding is finished.
    function isAppealTimeFinished(uint256 _coreDisputeID) external view returns (bool) {
        return false;
    }

    /// @notice Returns the next round settings for a given dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return newCourtID Court ID after jump.
    /// @return newDisputeKitID Dispute kit ID after jump.
    /// @return newRoundNbVotes The number of votes in the new round.
    function getNextRoundSettings(
        uint256 _coreDisputeID
    ) external view returns (uint96 newCourtID, uint256 newDisputeKitID, uint256 newRoundNbVotes) {
        revert UnsupportedOperation();
    }

    /// @notice Returns true if the specified voter was active in this round. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the voter.
    /// @return Whether the voter was active or not.
    function isVoteActive(uint256 _coreDisputeID, uint256 _coreRoundID, uint256 _voteID) external view returns (bool) {
        return false;
    }

    /// @notice Returns the info of the specified round in the core contract. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _choice The choice to query.
    /// @return winningChoice The winning choice of this round.
    /// @return tied Whether it's a tie or not.
    /// @return totalVoted Number of jurors who cast the vote already.
    /// @return totalCommitted Number of jurors who cast the commit already (only relevant for hidden votes).
    /// @return nbVoters Total number of voters in this round.
    /// @return choiceCount Number of votes cast for the queried choice.
    function getRoundInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _choice
    )
        external
        view
        returns (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommitted,
            uint256 nbVoters,
            uint256 choiceCount
        )
    {
        revert UnsupportedOperation();
    }

    /// @notice Returns the vote information for a given vote ID. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @return account The address of the juror who cast the vote.
    /// @return commit The commit of the vote.
    /// @return choice The choice that got the vote.
    /// @return voted Whether the vote was cast or not.
    function getVoteInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) external view returns (address account, bytes32 commit, uint256 choice, bool voted) {
        return (address(0), bytes32(0), 0, false);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error KlerosCoreOnly();
    error RulerOnly();
    error UnsupportedOperation();
    error DisputeUnknownInThisDisputeKit();
    error RulingOutOfBounds();
    error RulingAlreadyGiven();
    error RulingNotGiven();
    error InsufficientBalance();
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {KlerosCore} from "../KlerosCore.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {Initializable} from "../../proxy/Initializable.sol";

/// @title CentralizedKit
contract CentralizedKit is IDisputeKit, Initializable {
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

    address public owner; // The owner of the contract.
    address public ruler; // The address to give a centralized ruling.
    KlerosCore public core; // The Kleros Core arbitrator.
    Dispute[] public disputes; // Array of the locally created disputes.
    mapping(uint256 coreDisputeID => uint256 localDisputeID) public coreDisputeIDToLocal; // Maps the dispute ID in Kleros Core to the local dispute ID.

    uint256[50] private __gap; // Reserved slots for future upgrades.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when a dispute is created.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _numberOfChoices The number of choices available in the dispute.
    /// @param _extraData The extra data for the dispute.
    event DisputeCreation(uint256 indexed _coreDisputeID, uint256 _numberOfChoices, bytes _extraData);

    event RulingGiven(uint256 indexed _coreDisputeID, uint256 _ruling);

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

    modifier onlyByOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    modifier onlyByCore() {
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
    /// @param _owner The owner's address.
    /// @param _core The KlerosCore arbitrator.
    /// @param _ruler The ruler.
    function initialize(address _owner, KlerosCore _core, address _ruler) external initializer {
        owner = _owner;
        core = _core;
        ruler = _ruler;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @notice Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address payable _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @notice Changes the `core` storage variable.
    /// @param _core The new value for the `core` storage variable.
    function changeCore(address _core) external onlyByOwner {
        core = KlerosCore(_core);
    }

    /// @notice Changes the `ruler` storage variable.
    /// @param _ruler The new value for the `ruler` storage variable.
    function changeRuler(address _ruler) external onlyByOwner {
        ruler = _ruler;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Creates a local dispute and maps it to the dispute ID in the Core contract.
    /// @dev Access restricted to Kleros Core only.
    /// @dev The new `KlerosCore.Round` must be created before calling this function.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _numberOfChoices Number of choices of the dispute
    /// @param _extraData Additional info about the dispute, for possible use in future dispute kits.
    /// @param - nbVotes Maximal number of votes this dispute can get. Added for future-proofing.
    function createDispute(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _numberOfChoices,
        bytes calldata _extraData,
        uint256 /*_nbVotes*/
    ) public override onlyByCore {
        coreDisputeIDToLocal[_coreDisputeID] = disputes.length;

        Dispute storage dispute = disputes.push();
        dispute.numberOfChoices = _numberOfChoices;
        dispute.coreDisputeID = _coreDisputeID;

        emit DisputeCreation(_coreDisputeID, _numberOfChoices, _extraData);
    }

    /// @notice Gives a ruling to a dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
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

    /// @notice Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core. Not used by this contract.
    /// @dev Access restricted to Kleros Core only.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _nonce Nonce.
    /// @param - The number of votes in the round (unused, required by interface).
    /// @return drawnAddress The drawn address.
    /// @return fromSubcourtID The subcourt ID from which the juror was drawn.
    function draw(
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 /*_roundNbVotes*/
    ) public override onlyByCore returns (address drawnAddress, uint96 fromSubcourtID) {
        revert UnsupportedOperation();
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Gets the current ruling of a specified dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(
        uint256 _coreDisputeID
    ) external view override returns (uint256 ruling, bool tied, bool overridden) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        require(dispute.coreDisputeID == _coreDisputeID, DisputeUnknownInThisDisputeKit()); // Extra check for 0 id fallback.
        require(dispute.ruled, RulingNotGiven());
        ruling = dispute.ruling;
    }

    /// @notice Gets the degree of coherence of a particular voter. Not used by this contract.
    /// @dev This function is called by Kleros Core in order to determine the amount of the reward.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @param - feePerJuror The fee per juror. Unused, required by interface.
    /// @param - pnkAtStakePerJuror The PNK at stake per juror. Unused, required by interface.
    /// @return pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    /// @return feeCoherence The degree of coherence in basis points for the dispute fee reward.
    function getDegreeOfCoherenceReward(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 /* _feePerJuror */,
        uint256 /* _pnkAtStakePerJuror */
    ) external view override returns (uint256 pnkCoherence, uint256 feeCoherence) {
        return (0, 0);
    }

    /// @notice Gets the degree of coherence of a particular voter. Not used by this contract.
    /// @dev This function is called by Kleros Core in order to determine the amount of the penalty.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @param - feePerJuror The fee per juror. Unused, required by interface.
    /// @param - pnkAtStakePerJuror The PNK at stake per juror. Unused, required by interface.
    /// @return pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    function getDegreeOfCoherencePenalty(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 /* _feePerJuror */,
        uint256 /* _pnkAtStakePerJuror */
    ) external view override returns (uint256 pnkCoherence) {
        return 0;
    }

    /// @notice Gets the number of jurors who are eligible to a reward in this round. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @return The number of coherent jurors.
    function getCoherentCount(uint256 _coreDisputeID, uint256 _coreRoundID) external view override returns (uint256) {
        return 0;
    }

    /// @notice Gets the rewards for PNK and fees based on coherence and total reward pool. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param - voteID The ID of the vote. Unused, required by interface.
    /// @param _coherentCount The number of jurors eligible for reward.
    /// @param _pnkRewardPool Total amount of PNK available for rewards to all coherent jurors.
    /// @param _pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    /// @param _feeCoherence The degree of coherence in basis points for the dispute fee reward.
    /// @return pnkReward The pnk reward the juror is eligible to.
    /// @return feeReward The fee reward the juror is eligible to.
    function getRewards(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 /*_voteID*/,
        uint256 _coherentCount,
        uint256 _pnkRewardPool,
        uint256 _pnkCoherence,
        uint256 _feeCoherence
    ) external view virtual override returns (uint256 pnkReward, uint256 feeReward) {
        return (0, 0);
    }

    /// @notice Returns true if all of the jurors have cast their commits for the last round. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether all of the jurors have cast their commits for the last round.
    function areCommitsAllCast(uint256 _coreDisputeID) external view override returns (bool) {
        return false;
    }

    /// @notice Returns true if all of the jurors have cast their votes for the last round. Not used by this contract.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether all of the jurors have cast their votes for the last round.
    function areVotesAllCast(uint256 _coreDisputeID) external view override returns (bool) {
        return false;
    }

    /// @notice Returns true if the appeal funding is finished prematurely (e.g. when losing side didn't fund). Not used by this contract.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether the appeal funding is finished.
    function isAppealFunded(uint256 _coreDisputeID) external view override returns (bool) {
        return false;
    }

    /// @notice Returns the next round settings for a given dispute. Not used by this contract.
    /// @dev This function does not check for compatibility between `newDisputeKitID` and `newCourtID`, this is the Core's responsibility.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit. Unused, required by interface.
    /// @param _currentCourtID The ID of the current court.
    /// @param _parentCourtID The ID of the parent court.
    /// @param _currentCourtJurorsForJump The court jump threshold defined by the current court.
    /// @param _currentDisputeKitID The ID of the current dispute kit.
    /// @param _currentRoundNbVotes The number of votes in the current round.
    /// @return newCourtID Court ID after jump.
    /// @return newDisputeKitID Dispute kit ID after jump.
    /// @return newRoundNbVotes The number of votes in the new round.
    function getNextRoundSettings(
        uint256 /* _coreDisputeID */,
        uint96 _currentCourtID,
        uint96 _parentCourtID,
        uint256 _currentCourtJurorsForJump,
        uint256 _currentDisputeKitID,
        uint256 _currentRoundNbVotes
    ) public view virtual override returns (uint96 newCourtID, uint256 newDisputeKitID, uint256 newRoundNbVotes) {
        revert UnsupportedOperation();
    }

    /// @notice Returns true if the specified voter was active in this round. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the voter.
    /// @return Whether the voter was active or not.
    function isVoteActive(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) external view override returns (bool) {
        return false;
    }

    /// @notice Returns the info of the specified round in the core contract. Not used by this contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
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
        override
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
    ) external view override returns (address account, bytes32 commit, uint256 choice, bool voted) {
        return (address(0), bytes32(0), 0, false);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error KlerosCoreOnly();
    error RulerOnly();
    error UnsupportedOperation();
    error DisputeUnknownInThisDisputeKit();
    error RulingOutOfBounds();
    error RulingAlreadyGiven();
    error RulingNotGiven();
}

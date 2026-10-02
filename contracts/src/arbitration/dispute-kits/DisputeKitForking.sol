// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {KlerosCore} from "../KlerosCore.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "../../libraries/SafeERC20.sol";

/// @title DisputeKitForking
/// @notice Dispute kit to handle forking logic.
/// It intentionally doesn't implement most of the IDisputeKit functions.
contract DisputeKitForking is IDisputeKit, Initializable {
    using SafeERC20 for IERC20;

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 constant HEAD = 0;
    uint256 constant TAIL = type(uint256).max;
    uint256 constant INFINITY = type(uint256).max;

    struct Fork {
        mapping(uint256 forkBidID => ForkBid bid) forkBids;
        uint256 lastBidID;
        uint256 cutOffBidID;
        uint256 remainingSupport; // The amount of tokens that remains to support forking.
        bool finalized;
        uint256 currentRuling;
        IERC20 pinakion;
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct ForkBid {
        uint256 prev;
        uint256 next;
        uint256 minSupport;
        uint256 value; // Locked value.
        address account;
        bool withdrawn; // True if the bid has been withdrawn.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    KlerosCore public core; // The Kleros Core arbitrator.

    Fork[] public forks; // 0 element is unused.
    mapping(uint256 coreDisputeID => uint256 forkID) public coreDisputeIDToForkID;
    uint256[50] private __gap; // Reserved slots for future upgrades.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event ForkBidSubmitted(
        uint256 indexed _coreDisputeID,
        uint256 indexed _forkID,
        uint256 indexed _forkBidID,
        address account,
        uint256 _timestamp
    );

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

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
    /// @param _core The KlerosCore arbitrator.
    function initialize(KlerosCore _core) external initializer {
        core = _core;
        forks.push(); // Create an empty element to avoid using 0 index.
    }

    // ********************************** //
    // *         Forking logic          * //
    // ********************************** //

    /// @notice Submit a bid for participation in a fork and put it in the ordered list.
    /// @notice Submissions are allowed up until Execution period.
    /// @param _coreDisputeID Core dispute ID the forking is related to.
    /// @param _value The amout of token the submitter willing to commit to the fork.
    /// @param _minSupport The minimal token support the fork should have for the submitter to participate in it.
    /// @param _next The bidID of the next bid in the list.
    function submitBid(uint256 _coreDisputeID, uint256 _value, uint256 _minSupport, uint256 _next) public {
        uint256 forkID = coreDisputeIDToForkID[_coreDisputeID];
        require(forkID != 0, ForkNotInitiated());
        require(_minSupport < INFINITY, MinSupportTooHigh()); // TAIL uses INFINITY as a sentinel, so no real bid may equal it.

        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period < KlerosCore.Period.execution, WrongPeriod());

        Fork storage fork = forks[coreDisputeIDToForkID[_coreDisputeID]];
        ForkBid storage nextBid = fork.forkBids[_next];
        uint256 prev = nextBid.prev;
        ForkBid storage prevBid = fork.forkBids[prev];
        require(_minSupport >= prevBid.minSupport && _minSupport < nextBid.minSupport);

        uint256 lastBidID = ++fork.lastBidID; // Increment the lastBidID. It will be the new bid's ID.
        // Update the pointers of neighboring bids.
        prevBid.next = lastBidID;
        nextBid.prev = lastBidID;

        // Lock the value in the contract.
        require(fork.pinakion.safeTransferFrom(msg.sender, address(this), _value), TransferFailed());

        // Insert the bid.
        ForkBid storage lastBid = fork.forkBids[lastBidID];
        lastBid.prev = prev;
        lastBid.next = _next;
        lastBid.minSupport = _minSupport;
        lastBid.value = _value;
        lastBid.account = msg.sender;

        fork.remainingSupport += _value;

        emit ForkBidSubmitted(_coreDisputeID, forkID, lastBidID, msg.sender, block.timestamp);
    }

    /// @notice Search for the correct insertion spot and submit a bid.
    /// This function is O(n), where n is the amount of bids between the initial search position and the insertion position.
    /// The UI must first call search to find the best point to start the search such that it consumes the least amount of gas possible.
    /// Using this function instead of calling submitBid directly prevents it from failing in the case where new bids are added before the transaction is executed.
    /// @param _coreDisputeID Core dispute ID the forking is related to.
    /// @param _value The amout of token the submitter willing to commit to the fork.
    /// @param _minSupport The minimal token support the fork should have for the submitter to participate in it.
    /// @param _next The bidID of the next bid in the list.
    function searchAndBid(uint256 _coreDisputeID, uint256 _value, uint256 _minSupport, uint256 _next) external {
        // Check fork ID here too to avoid wasting gas on search.
        uint256 forkID = coreDisputeIDToForkID[_coreDisputeID];
        require(forkID != 0, ForkNotInitiated());
        submitBid(_coreDisputeID, _value, _minSupport, search(forkID, _minSupport, _next));
    }

    /// @notice Withdraw a bid. Can only be done during Evidence period.
    /// @param _coreDisputeID Core dispute ID the forking is related to.
    /// @param _bidID The bid to withdraw.
    function withdraw(uint256 _coreDisputeID, uint256 _bidID) external {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period == KlerosCore.Period.evidence, WrongPeriod());

        Fork storage fork = forks[coreDisputeIDToForkID[_coreDisputeID]];

        ForkBid storage bid = fork.forkBids[_bidID];
        require(msg.sender == bid.account, WrongSender());
        require(!bid.withdrawn, AlreadyWithdrawn());

        bid.withdrawn = true;

        uint256 refund = bid.value;
        bid.value = 0;
        fork.remainingSupport -= refund;

        require(fork.pinakion.safeTransfer(msg.sender, refund), TransferFailed());
    }

    /// @notice Finalize by finding the cut-off bid. Can only be done in Execution period.
    /// Since the amount of bids is not bounded, this function may have to be called multiple times.
    /// The function is O(min(n,_maxIt)) where n is the amount of bids. In total it will perform O(n) computations, possibly in multiple calls.
    /// @param _coreDisputeID Core dispute ID the forking is related to.
    /// @param _maxIt The maximum amount of bids to go through. This value must be set in order to not exceed the gas limit.
    function finalize(uint256 _coreDisputeID, uint256 _maxIt) external {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period == KlerosCore.Period.execution, WrongPeriod());

        Fork storage fork = forks[coreDisputeIDToForkID[_coreDisputeID]];
        require(!fork.finalized, AlreadyFinalized());

        // Make local copies of the finalization variables in order to avoid modifying storage in order to save gas.
        uint256 localCutOffBidID = fork.cutOffBidID;
        uint256 localRemainingSupport = fork.remainingSupport;

        // Search for the cut-off bid while removing bids whose minimum support is not met.
        for (uint256 it = 0; it < _maxIt && !fork.finalized; it++) {
            ForkBid storage bid = fork.forkBids[localCutOffBidID];
            if (bid.minSupport > localRemainingSupport && localCutOffBidID != HEAD) {
                uint256 refund = bid.value;
                bid.value = 0;
                // Bid's condition is not satisfied, remove it.
                localRemainingSupport -= refund;
                localCutOffBidID = bid.prev; // Go to the previous bid.
                // Refund the bid because its minimum support condition was not met.
                fork.pinakion.safeTransfer(bid.account, refund);
            } else {
                // We found the cut-off. All lower bids are satisfied, if any.
                fork.finalized = true;
            }
        }

        // Update storage.
        fork.cutOffBidID = localCutOffBidID;
        fork.remainingSupport = localRemainingSupport;
    }

    /// @notice Search for the correct insertion spot of a bid.
    /// This function is O(n), where n is the amount of bids between the initial search position and the insertion position.
    /// @param _forkID The id of the related fork.
    /// @param _minSupport The minimal token support the fork should have for the submitter to participate in it.
    /// @param _nextStart The bidID of the next bid from the initial position to start the search from.
    /// @return nextInsert The bidID of the next bid from the position the bid must be inserted at.
    function search(uint256 _forkID, uint256 _minSupport, uint256 _nextStart) public view returns (uint256 nextInsert) {
        require(_minSupport < INFINITY, MinSupportTooHigh()); // TAIL uses INFINITY as a sentinel, so no real bid may equal it.
        Fork storage fork = forks[_forkID];
        uint256 next = _nextStart;
        bool found;

        while (!found) {
            // While we aren't at the insertion point.
            ForkBid storage nextBid = fork.forkBids[next];
            uint256 prev = nextBid.prev;
            ForkBid storage prevBid = fork.forkBids[prev];

            if (_minSupport < prevBid.minSupport)
                // It should be inserted before.
                next = prev;
            else if (_minSupport >= nextBid.minSupport)
                // It should be inserted after. The second value we sort by is bidID. Since bid IDs increase, equal minSupport bids are inserted after existing ones.
                next = nextBid.next; // We found the insertion point.
            else found = true;
        }

        return next;
    }

    /// @notice @dev Get the current remaining support and cut off bid's details.
    /// This function is O(n), where n is the amount of bids. This could exceed the gas limit, therefore this function should only be used for interface display and not by other contracts.
    /// @param _forkID The id of the related fork.
    /// @return remainingSupport The remaining fork support.
    /// @return currentCutOffBidID The id of the current cutoff bid.
    /// @return currentCutOffBidMinSupport Min support of the current cutoff bid.
    function remainingSupportAndCutOff(
        uint256 _forkID
    ) external view returns (uint256 remainingSupport, uint256 currentCutOffBidID, uint256 currentCutOffBidMinSupport) {
        Fork storage fork = forks[_forkID];
        currentCutOffBidID = fork.cutOffBidID;
        remainingSupport = fork.remainingSupport;

        // Loop over all bids or until cut off bid is found
        while (currentCutOffBidID != HEAD) {
            ForkBid storage bid = fork.forkBids[currentCutOffBidID];
            if (bid.minSupport > remainingSupport) {
                // Bid's condition is not satisfied, remove it.
                remainingSupport -= bid.value;
                currentCutOffBidID = bid.prev; // Go to the previous bid.
            } else {
                // We found the cut-off. All lower bids are satisfied, if any.
                break;
            }
        }

        currentCutOffBidMinSupport = fork.forkBids[currentCutOffBidID].minSupport;
    }

    // TODO: actual forking logic and forked tokens redeem.

    // ************************************** //
    // *         Dispute kit logic          * //
    // ************************************** //

    /// @notice Initiates the fork and maps fork id to the dispute ID in the Core contract.
    /// @notice Stores the ruling of the existing fork.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit. Not used by this contract.
    /// @param - _finalRuling Final ruling of this fork.
    /// @param - extraData Additional info about the dispute, for possible use in future dispute kits. Not used by this contract.
    /// @param - nbVotes Maximal number of votes this dispute can get. Not used by this contract.
    function createDispute(
        uint256 _coreDisputeID,
        uint256 /*_coreRoundID*/,
        uint256 _finalRuling,
        bytes calldata /*_extraData*/,
        uint256 /*_nbVotes*/
    ) external onlyByCore {
        require(coreDisputeIDToForkID[_coreDisputeID] == 0, ForkAlreadyInitiated());
        coreDisputeIDToForkID[_coreDisputeID] = forks.length;
        Fork storage fork = forks.push();
        fork.currentRuling = _finalRuling;
        fork.pinakion = core.pinakion();

        // Add the virtual bids. This simplifies other functions.
        ForkBid storage head = fork.forkBids[HEAD];
        head.prev = TAIL;
        head.next = TAIL;
        head.minSupport = 0;
        head.value = 0;
        head.account = address(0);

        ForkBid storage tail = fork.forkBids[TAIL];
        tail.prev = HEAD;
        tail.next = HEAD;
        tail.minSupport = INFINITY;
        tail.value = 0;
        tail.account = address(0);

        fork.cutOffBidID = TAIL;
    }

    /// @notice Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - nonce Nonce.
    /// @param - The number of votes in the round (unused, required by interface).
    /// @return The drawn address.
    /// @return The subcourt ID from which the juror was drawn.
    function draw(
        uint256 /*_coreDisputeID*/,
        uint256 /*_nonce*/,
        uint256 /*_roundNbVotes*/
    ) external pure returns (address, uint96) {
        revert UnsupportedOperation();
    }

    /// @notice Sets the caller's commit for the specified votes. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core.
    /// @param - voteIDs The IDs of the votes.
    /// @param - commit The commitment hash.
    function castCommit(
        uint256 /*_coreDisputeID*/,
        uint256[] calldata /*_voteIDs*/,
        bytes32 /*_commit*/
    ) external pure {
        revert UnsupportedOperation();
    }

    /// @notice Sets the caller's choices for the specified votes. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core.
    /// @param - voteIDs The IDs of the votes.
    /// @param - choice The choice.
    /// @param - salt The salt for the commit if the votes were hidden.
    /// @param - justification Justification of the choice.
    function castVote(
        uint256 /*_coreDisputeID*/,
        uint256[] calldata /*_voteIDs*/,
        uint256 /*_choice*/,
        uint256 /*_salt*/,
        string memory /*_justification*/
    ) external pure {
        revert UnsupportedOperation();
    }

    /// @notice Manages contributions, and appeals a dispute if at least two choices are fully funded. Not used by this contract. Not used by this contract.
    /// @param - coreDisputeID Index of the dispute in Kleros Core.
    /// @param - choice A choice that receives funding.
    function fundAppeal(uint256 /*_coreDisputeID*/, uint256 /*_choice*/) external payable {
        revert UnsupportedOperation();
    }

    /// @notice Allows those contributors who attempted to fund an appeal round to withdraw any reimbursable fees or rewards after the dispute gets resolved. Not used by this contract.
    /// @param - coreDisputeID Index of the dispute in Kleros Core contract.
    /// @param - beneficiary The address whose rewards to withdraw.
    /// @param - choice The ruling option that the caller wants to withdraw from.
    /// @return The withdrawn amount.
    function withdrawFeesAndRewards(
        uint256 /*_coreDisputeID*/,
        address payable /*_beneficiary*/,
        uint256 /*_choice*/
    ) external pure returns (uint256) {
        revert UnsupportedOperation();
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Returns the rulings that were fully funded in the latest appeal round. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Fully funded rulings.
    function getFundedChoices(uint256 /*_coreDisputeID*/) external pure returns (uint256[] memory) {
        return new uint256[](0);
    }

    /// @notice Gets the current ruling of a specified dispute. For this dispute kit it returns the ruling passed by Core when the fork dispute was created.
    /// @notice Will return 0 ruling for unknown disputes.
    /// @param  _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _coreDisputeID) external view returns (uint256 ruling, bool tied, bool overridden) {
        uint256 forkID = coreDisputeIDToForkID[_coreDisputeID];
        require(forkID != 0, ForkNotInitiated());

        return (forks[forkID].currentRuling, false, false);
    }

    /// @notice Gets the degree of coherence of a particular voter. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param - voteID The ID of the vote.
    /// @param - feePerJuror The fee per juror.
    /// @param - pnkAtStakePerJuror The PNK at stake per juror. Unused, required by interface.
    /// @return The degree of coherence in basis points for the dispute PNK reward.
    /// @return The degree of coherence in basis points for the dispute fee reward.
    function getDegreeOfCoherenceReward(
        uint256 /*_coreDisputeID*/,
        uint256 /*_coreRoundID*/,
        uint256 /*_voteID*/,
        uint256 /* _feePerJuror */,
        uint256 /* _pnkAtStakePerJuror */
    ) external pure returns (uint256, uint256) {
        return (0, 0);
    }

    /// @notice Gets the degree of coherence of a particular voter. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param - voteID The ID of the vote.
    /// @param - feePerJuror The fee per juror.
    /// @param - pnkAtStakePerJuror The PNK at stake per juror.
    /// @return The degree of coherence in basis points for the dispute PNK penalty.
    function getDegreeOfCoherencePenalty(
        uint256 /*_coreDisputeID*/,
        uint256 /*_coreRoundID*/,
        uint256 /*_voteID*/,
        uint256 /* _feePerJuror */,
        uint256 /* _pnkAtStakePerJuror */
    ) external pure returns (uint256) {
        return (0);
    }

    /// @notice Gets the number of jurors who are eligible to a reward in this round. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @return The number of coherent jurors.
    function getCoherentCount(uint256 /*_coreDisputeID*/, uint256 /*_coreRoundID*/) external pure returns (uint256) {
        return 0;
    }

    /// @notice Gets the rewards for PNK and fees based on coherence and total reward pool. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param - voteID The ID of the vote. Unused, required by interface.
    /// @param - coherentCount The number of jurors eligible for reward.
    /// @param - pnkRewardPool Total amount of PNK available for rewards to all coherent jurors.
    /// @param - pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    /// @param - feeCoherence The degree of coherence in basis points for the dispute fee reward.
    /// @return The pnk reward the juror is eligible to.
    /// @return The fee reward the juror is eligible to.
    function getRewards(
        uint256 /*_coreDisputeID*/,
        uint256 /*_coreRoundID*/,
        uint256 /*_voteID*/,
        uint256 /*_coherentCount*/,
        uint256 /*_pnkRewardPool*/,
        uint256 /*_pnkCoherence*/,
        uint256 /*_feeCoherence*/
    ) external pure virtual returns (uint256, uint256) {
        return (0, 0);
    }

    /// @notice Returns true if all of the jurors have cast their commits for the last round. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether all of the jurors have cast their commits for the last round.
    function areCommitsAllCast(uint256 /*_coreDisputeID*/) external pure returns (bool) {
        return false;
    }

    /// @notice Returns true if all of the jurors have cast their votes for the last round. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether all of the jurors have cast their votes for the last round.
    function areVotesAllCast(uint256 /*_coreDisputeID*/) external pure returns (bool) {
        return false;
    }

    /// @notice Returns true if the appeal time is finished prematurely (e.g. when losing side didn't fund). Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether the appeal time is finished.
    function isAppealFunded(uint256 /*_coreDisputeID*/) external pure returns (bool) {
        return false;
    }

    /// @notice Returns the next round settings for a given dispute. Not used by this contract. Reverts for extra protection.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - currentCourtID The ID of the current court.
    /// @param - parentCourtID The ID of the parent court.
    /// @param - currentCourtJurorsForJump The court jump threshold defined by the current court.
    /// @param - currentDisputeKitID The ID of the current dispute kit.
    /// @param - currentRoundNbVotes The number of votes in the current round.
    /// @return Court ID after jump.
    /// @return Dispute kit ID after jump.
    /// @return The number of votes in the new round.
    function getNextRoundSettings(
        uint256 /* _coreDisputeID */,
        uint96 /*_currentCourtID*/,
        uint96 /*_parentCourtID*/,
        uint256 /*_currentCourtJurorsForJump*/,
        uint256 /*_currentDisputeKitID*/,
        uint256 /*_currentRoundNbVotes*/
    ) external pure virtual returns (uint96, uint256, uint256) {
        revert UnsupportedOperation();
    }

    /// @notice Returns true if the specified voter was active in this round. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param - voteID The ID of the voter.
    /// @return Whether the voter was active or not.
    function isVoteActive(
        uint256 /*_coreDisputeID*/,
        uint256 /*_coreRoundID*/,
        uint256 /*_voteID*/
    ) external pure returns (bool) {
        return false;
    }

    /// @notice Returns the info of the specified round in the Dispute kit. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param - coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param - choice The choice to query.
    /// @return The winning choice of this round.
    /// @return Whether it's a tie or not.
    /// @return Number of jurors who cast the vote already.
    /// @return Number of jurors who cast the commit already (only relevant for hidden votes).
    /// @return Total number of voters in this round.
    /// @return Number of votes cast for the queried choice.
    function getRoundInfo(
        uint256 /*_coreDisputeID*/,
        uint256 /*_coreRoundID*/,
        uint256 /*_choice*/
    ) external pure override returns (uint256, bool, uint256, uint256, uint256, uint256) {
        return (0, false, 0, 0, 0, 0);
    }

    /// @notice Returns the vote information for a given vote ID. Not used by this round. Not used by this contract.
    /// @param - coreDisputeID The ID of the dispute in Kleros Core.
    /// @param - coreRoundID The ID of the round in Kleros Core.
    /// @param - voteID The ID of the vote.
    /// @return The address of the juror who cast the vote.
    /// @return The commit of the vote.
    /// @return The choice that got the vote.
    /// @return Whether the vote was cast or not.
    function getVoteInfo(
        uint256 /*_coreDisputeID*/,
        uint256 /*_coreRoundID*/,
        uint256 /*_voteID*/
    ) external pure returns (address, bytes32, uint256, bool) {
        return (address(0), bytes32(0), 0, false);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error KlerosCoreOnly();
    error UnsupportedOperation();
    error ForkAlreadyInitiated();
    error ForkNotInitiated();
    error WrongPeriod();
    error TransferFailed();
    error AlreadyFinalized();
    error AlreadyWithdrawn();
    error WrongSender();
    error MinSupportTooHigh();
}

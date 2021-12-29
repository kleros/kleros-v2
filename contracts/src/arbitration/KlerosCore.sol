// SPDX-License-Identifier: MIT

/**
 *  @authors: [@unknownunknown1]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IArbitrator.sol";
import "./dispute-kits/DisputeKit.sol";
import {SortitionSumTreeFactory} from "../data-structures/SortitionSumTreeFactory.sol";

/**
 *  @title KlerosCore
 *  Core arbitrator contract for Kleros v2.
 */
contract KlerosCore is IArbitrator {
    using SortitionSumTreeFactory for SortitionSumTreeFactory.SortitionSumTrees; // Use library functions for sortition sum trees.

    /* Enums */

    enum Period {
        evidence, // Evidence can be submitted. This is also when drawing has to take place.
        commit, // Jurors commit a hashed vote. This is skipped for courts without hidden votes.
        vote, // Jurors reveal/cast their vote depending on whether the court has hidden votes or not.
        appeal, // The dispute can be appealed.
        execution // Tokens are redistributed and the ruling is executed.
    }

    /* Structs */

    struct Court {
        uint96 parent; // The parent court.
        bool hiddenVotes; // Whether to use commit and reveal or not.
        uint256[] children; // List of child courts.
        uint256 minStake; // Minimum tokens needed to stake in the court.
        uint256 alpha; // Basis point of tokens that are lost when incoherent.
        uint256 feeForJuror; // Arbitration fee paid per juror.
        uint256 jurorsForCourtJump; // The appeal after the one that reaches this number of jurors will go to the parent court if any.
        uint256[4] timesPerPeriod; // The time allotted to each dispute period in the form `timesPerPeriod[period]`.
        uint256 supportedDisputeKits; // The bitfield of dispute kits that the court supports.
    }

    struct Dispute {
        uint96 subcourtID; // The ID of the subcourt the dispute is in.
        IArbitrable arbitrated; // The arbitrable contract.
        DisputeKit disputeKit; // ID of the dispute kit that this dispute was assigned to.
        Period period; // The current period of the dispute.
        bool ruled; // True if the ruling has been executed, false otherwise.
        uint256 currentRound; // The index of the current appeal round. Note that 0 represents the default dispute round. Former votes.length - 1.
        uint256 lastPeriodChange; // The last time the period was changed.
        uint256 nbVotes; // The total number of votes the dispute can possibly have in the current round. Former votes[_appeal].length.
        mapping(uint256 => address[]) drawnJurors; // Addresses of the drawn jurors in the form `drawnJurors[_appeal]`.
        uint256[] tokensAtStakePerJuror; // The amount of tokens at stake for each juror in the form `tokensAtStakePerJuror[appeal]`.
        uint256[] totalFeesForJurors; // The total juror fees paid in the form `totalFeesForJurors[appeal]`.
        uint256[] repartitionsInEachRound; // A counter of vote reward repartitions made in each round in the form `repartitionsInEachRound[appeal]`.
        uint256[] penaltiesInEachRound; // The amount of tokens collected from penalties in each round in the form `penaltiesInEachRound[appeal]`.
    }

    struct Juror {
        uint96[] subcourtIDs; // The IDs of subcourts where the juror's stake path ends. A stake path is a path from the forking court to a court the juror directly staked in using `_setStake`.
        // TODO: Relations of staked and locked tokens (currently unfinished).
        mapping(uint96 => uint256) stakedTokens; // The number of tokens the juror has staked in the subcourt in the form `stakedTokens[subcourtID]`.
        mapping(uint96 => uint256) lockedTokens; // The number of tokens the juror has locked in the subcourt in the form `lockedTokens[subcourtID]`.
    }

    /* Constants */

    uint256 public constant MAX_STAKE_PATHS = 4; // The maximum number of stake paths a juror can have.
    uint256 public constant MIN_JURORS = 3; // The global default minimum number of jurors in a dispute.
    uint256 public constant ALPHA_DIVISOR = 1e4; // The number to divide `Court.alpha` by.
    uint256 public constant NON_PAYABLE_AMOUNT = (2**256 - 2) / 2; // An amount higher than the supply of ETH.

    /* Storage */

    address public governor; // The governor of the contract.
    IERC20 public pinakion; // The Pinakion token contract.
    // TODO: interactions with jurorProsecutionModule.
    address public jurorProsecutionModule; // The module for juror's prosecution.

    Court[] public courts; // The subcourts.

    //TODO: disputeKits forest.
    DisputeKit[] public disputeKits; // All supported dispute kits.

    Dispute[] public disputes; // The disputes.
    mapping(address => Juror) internal jurors; // The jurors.
    SortitionSumTreeFactory.SortitionSumTrees internal sortitionSumTrees; // The sortition sum trees.

    /* Events */

    event StakeSet(address indexed _address, uint256 _subcourtID, uint256 _amount, uint256 _newTotalStake);
    event NewPeriod(uint256 indexed _disputeID, Period _period);
    event AppealPossible(uint256 indexed _disputeID, IArbitrable indexed _arbitrable);
    event AppealDecision(uint256 indexed _disputeID, IArbitrable indexed _arbitrable);
    event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _appeal, uint256 _voteID);
    event TokenAndETHShift(
        address indexed _account,
        uint256 indexed _disputeID,
        int256 _tokenAmount,
        int256 _ETHAmount
    );

    /* Modifiers */

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    /** @dev Constructor.
     *  @param _governor The governor's address.
     *  @param _pinakion The address of the token contract.
     *  @param _jurorProsecutionModule The address of the juror prosecution module.
     *  @param _disputeKit The address of the default dispute kit.
     *  @param _hiddenVotes The `hiddenVotes` property value of the forking court.
     *  @param _minStake The `minStake` property value of the forking court.
     *  @param _alpha The `alpha` property value of the forking court.
     *  @param _feeForJuror The `feeForJuror` property value of the forking court.
     *  @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the forking court.
     *  @param _timesPerPeriod The `timesPerPeriod` property value of the forking court.
     *  @param _sortitionSumTreeK The number of children per node of the forking court's sortition sum tree.
     */
    constructor(
        address _governor,
        IERC20 _pinakion,
        address _jurorProsecutionModule,
        DisputeKit _disputeKit,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod,
        uint256 _sortitionSumTreeK
    ) public {
        governor = _governor;
        pinakion = _pinakion;
        jurorProsecutionModule = _jurorProsecutionModule;
        disputeKits.push(_disputeKit);

        // Create the Forking court.
        courts.push(
            Court({
                parent: 0,
                children: new uint256[](0),
                hiddenVotes: _hiddenVotes,
                minStake: _minStake,
                alpha: _alpha,
                feeForJuror: _feeForJuror,
                jurorsForCourtJump: _jurorsForCourtJump,
                timesPerPeriod: _timesPerPeriod,
                supportedDisputeKits: 1 // The first bit of the bit field is supported by default.
            })
        );
        sortitionSumTrees.createTree(bytes32(0), _sortitionSumTreeK);
    }

    /* External and public */

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /** @dev Allows the governor to call anything on behalf of the contract.
     *  @param _destination The destination of the call.
     *  @param _amount The value sent with the call.
     *  @param _data The data sent with the call.
     */
    function executeGovernorProposal(
        address _destination,
        uint256 _amount,
        bytes memory _data
    ) external onlyByGovernor {
        (bool success, ) = _destination.call{value: _amount}(_data);
        require(success, "Unsuccessful call");
    }

    /** @dev Changes the `governor` storage variable.
     *  @param _governor The new value for the `governor` storage variable.
     */
    function changeGovernor(address payable _governor) external onlyByGovernor {
        governor = _governor;
    }

    /** @dev Changes the `pinakion` storage variable.
     *  @param _pinakion The new value for the `pinakion` storage variable.
     */
    function changePinakion(IERC20 _pinakion) external onlyByGovernor {
        pinakion = _pinakion;
    }

    /** @dev Changes the `jurorProsecutionModule` storage variable.
     *  @param _jurorProsecutionModule The new value for the `jurorProsecutionModule` storage variable.
     */
    function changeJurorProsecutionModule(address _jurorProsecutionModule) external onlyByGovernor {
        jurorProsecutionModule = _jurorProsecutionModule;
    }

    /** @dev Add a new supported dispute kit module to the court.
     *  @param _disputeKitAddress The address of the dispute kit contract.
     */
    function addNewDisputeKit(DisputeKit _disputeKitAddress) external onlyByGovernor {
        // TODO: the dispute kit data structure. For now keep it a simple array.
        // Also note that in current state this function doesn't take into account that the added address is actually new.
        require(disputeKits.length <= 256); // Can't be more than 256 because the IDs are used in a bitfield.
        disputeKits.push(_disputeKitAddress);
    }

    /** @dev Creates a subcourt under a specified parent court.
     *  @param _parent The `parent` property value of the subcourt.
     *  @param _hiddenVotes The `hiddenVotes` property value of the subcourt.
     *  @param _minStake The `minStake` property value of the subcourt.
     *  @param _alpha The `alpha` property value of the subcourt.
     *  @param _feeForJuror The `feeForJuror` property value of the subcourt.
     *  @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the subcourt.
     *  @param _timesPerPeriod The `timesPerPeriod` property value of the subcourt.
     *  @param _sortitionSumTreeK The number of children per node of the subcourt's sortition sum tree.
     */
    function createSubcourt(
        uint96 _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod,
        uint256 _sortitionSumTreeK
    ) external onlyByGovernor {
        require(
            courts[_parent].minStake <= _minStake,
            "A subcourt cannot be a child of a subcourt with a higher minimum stake."
        );

        uint256 subcourtID = courts.length;
        // Create the subcourt.
        courts.push(
            Court({
                parent: _parent,
                children: new uint256[](0),
                hiddenVotes: _hiddenVotes,
                minStake: _minStake,
                alpha: _alpha,
                feeForJuror: _feeForJuror,
                jurorsForCourtJump: _jurorsForCourtJump,
                timesPerPeriod: _timesPerPeriod,
                supportedDisputeKits: 1
            })
        );

        sortitionSumTrees.createTree(bytes32(subcourtID), _sortitionSumTreeK);
        // Update the parent.
        courts[_parent].children.push(subcourtID);
    }

    /** @dev Changes the `minStake` property value of a specified subcourt. Don't set to a value lower than its parent's `minStake` property value.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _minStake The new value for the `minStake` property value.
     */
    function changeSubcourtMinStake(uint96 _subcourtID, uint256 _minStake) external onlyByGovernor {
        require(_subcourtID == 0 || courts[courts[_subcourtID].parent].minStake <= _minStake);
        for (uint256 i = 0; i < courts[_subcourtID].children.length; i++) {
            require(
                courts[courts[_subcourtID].children[i]].minStake >= _minStake,
                "A subcourt cannot be the parent of a subcourt with a lower minimum stake."
            );
        }

        courts[_subcourtID].minStake = _minStake;
    }

    /** @dev Changes the `alpha` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _alpha The new value for the `alpha` property value.
     */
    function changeSubcourtAlpha(uint96 _subcourtID, uint256 _alpha) external onlyByGovernor {
        courts[_subcourtID].alpha = _alpha;
    }

    /** @dev Changes the `feeForJuror` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _feeForJuror The new value for the `feeForJuror` property value.
     */
    function changeSubcourtJurorFee(uint96 _subcourtID, uint256 _feeForJuror) external onlyByGovernor {
        courts[_subcourtID].feeForJuror = _feeForJuror;
    }

    /** @dev Changes the `jurorsForCourtJump` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _jurorsForCourtJump The new value for the `jurorsForCourtJump` property value.
     */
    function changeSubcourtJurorsForJump(uint96 _subcourtID, uint256 _jurorsForCourtJump) external onlyByGovernor {
        courts[_subcourtID].jurorsForCourtJump = _jurorsForCourtJump;
    }

    /** @dev Changes the `timesPerPeriod` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _timesPerPeriod The new value for the `timesPerPeriod` property value.
     */
    function changeSubcourtTimesPerPeriod(uint96 _subcourtID, uint256[4] memory _timesPerPeriod)
        external
        onlyByGovernor
    {
        courts[_subcourtID].timesPerPeriod = _timesPerPeriod;
    }

    /** @dev Adds/removes particular dispute kits to a subcourt's bitfield of supported dispute kits.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _disputeKitIDs IDs of dispute kits in the disputeKits array, which support should be added/removed.
     *  @param _enable Whether add or remove the dispute kits from the subcourt.
     */
    function setDisputeKits(
        uint96 _subcourtID,
        uint8[] memory _disputeKitIDs,
        bool _enable
    ) external onlyByGovernor {
        Court storage subcourt = courts[_subcourtID];
        for (uint256 i = 0; i < _disputeKitIDs.length; i++) {
            uint256 bitToChange = 1 << _disputeKitIDs[i]; // Get the bit that corresponds with dispute kit's ID.
            if (_enable)
                require((bitToChange & ~subcourt.supportedDisputeKits) == bitToChange, "Dispute kit already supported");
            else require((bitToChange & subcourt.supportedDisputeKits) == bitToChange, "Dispute kit is not supported");

            // Change the bit corresponding with the dispute kit's ID to an opposite value.
            subcourt.supportedDisputeKits ^= bitToChange;
        }
    }

    // ************************** //
    // *      General flow      * //
    // ************************** //

    /** @dev Sets the caller's stake in a subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _stake The new stake.
     */
    function setStake(uint96 _subcourtID, uint256 _stake) external {
        _setStake(msg.sender, _subcourtID, _stake);
    }

    /** @dev Creates a dispute. Must be called by the arbitrable contract.
     *  @param _numberOfChoices Number of choices for the jurors to choose from.
     *  @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's subcourt (first 32 bytes),
     *  the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
     *  @return disputeID The ID of the created dispute.
     */
    function createDispute(uint256 _numberOfChoices, bytes memory _extraData)
        external
        payable
        override
        returns (uint256 disputeID)
    {
        require(msg.value >= arbitrationCost(_extraData), "Not enough ETH to cover arbitration cost.");
        (uint96 subcourtID, , uint8 disputeKitID) = extraDataToSubcourtIDMinJurorsDisputeKit(_extraData);

        uint256 bitToCheck = 1 << disputeKitID; // Get the bit that corresponds with dispute kit's ID.
        require(
            (bitToCheck & courts[subcourtID].supportedDisputeKits) == bitToCheck,
            "The dispute kit is not supported by this subcourt"
        );

        disputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.subcourtID = subcourtID;
        dispute.arbitrated = IArbitrable(msg.sender);

        DisputeKit disputeKit = disputeKits[disputeKitID];
        dispute.disputeKit = disputeKit;

        dispute.lastPeriodChange = block.timestamp;
        dispute.nbVotes = msg.value / courts[dispute.subcourtID].feeForJuror;

        dispute.tokensAtStakePerJuror.push(
            (courts[dispute.subcourtID].minStake * courts[dispute.subcourtID].alpha) / ALPHA_DIVISOR
        );
        dispute.totalFeesForJurors.push(msg.value);
        dispute.repartitionsInEachRound.push(0);
        dispute.penaltiesInEachRound.push(0);

        disputeKit.createDispute(disputeID, _numberOfChoices, _extraData);
        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    /** @dev Passes the period of a specified dispute.
     *  @param _disputeID The ID of the dispute.
     */
    function passPeriod(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        if (dispute.period == Period.evidence) {
            require(
                dispute.currentRound > 0 ||
                    block.timestamp - dispute.lastPeriodChange >=
                    courts[dispute.subcourtID].timesPerPeriod[uint256(dispute.period)],
                "The evidence period time has not passed yet and it is not an appeal."
            );
            require(
                dispute.drawnJurors[dispute.currentRound].length == dispute.nbVotes,
                "The dispute has not finished drawing yet."
            );
            dispute.period = courts[dispute.subcourtID].hiddenVotes ? Period.commit : Period.vote;
        } else if (dispute.period == Period.commit) {
            // In case the jurors finished casting commits beforehand the dispute kit should call passPeriod() by itself.
            require(
                block.timestamp - dispute.lastPeriodChange >=
                    courts[dispute.subcourtID].timesPerPeriod[uint256(dispute.period)] ||
                    msg.sender == address(dispute.disputeKit),
                "The commit period time has not passed yet."
            );
            dispute.period = Period.vote;
        } else if (dispute.period == Period.vote) {
            // In case the jurors finished casting votes beforehand the dispute kit should call passPeriod() by itself.
            require(
                block.timestamp - dispute.lastPeriodChange >=
                    courts[dispute.subcourtID].timesPerPeriod[uint256(dispute.period)] ||
                    msg.sender == address(dispute.disputeKit),
                "The vote period time has not passed yet"
            );
            dispute.period = Period.appeal;
            emit AppealPossible(_disputeID, dispute.arbitrated);
        } else if (dispute.period == Period.appeal) {
            require(
                block.timestamp - dispute.lastPeriodChange >=
                    courts[dispute.subcourtID].timesPerPeriod[uint256(dispute.period)],
                "The appeal period time has not passed yet."
            );
            dispute.period = Period.execution;
        } else if (dispute.period == Period.execution) {
            revert("The dispute is already in the last period.");
        }

        dispute.lastPeriodChange = block.timestamp;
        emit NewPeriod(_disputeID, dispute.period);
    }

    /** @dev Draws jurors for the dispute. Can be called in parts.
     *  @param _disputeID The ID of the dispute.
     *  @param _iterations The number of iterations to run.
     */
    function draw(uint256 _disputeID, uint256 _iterations) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.evidence, "Should be evidence period.");
        DisputeKit disputeKit = dispute.disputeKit;
        uint256 startIndex = dispute.drawnJurors[dispute.currentRound].length;
        uint256 endIndex = startIndex + _iterations <= dispute.nbVotes ? startIndex + _iterations : dispute.nbVotes;

        for (uint256 i = startIndex; i < endIndex; i++) {
            address drawnAddress = disputeKit.draw(_disputeID);
            if (drawnAddress != address(0)) {
                // In case no one has staked at the court yet.
                jurors[drawnAddress].lockedTokens[dispute.subcourtID] += dispute.tokensAtStakePerJuror[
                    dispute.currentRound
                ];
                dispute.drawnJurors[dispute.currentRound].push(drawnAddress);
                emit Draw(drawnAddress, _disputeID, dispute.currentRound, i);
            }
        }
    }

    /** @dev Appeals the ruling of a specified dispute.
     *  @param _disputeID The ID of the dispute.
     */
    function appeal(uint256 _disputeID) external payable {
        require(msg.value >= appealCost(_disputeID), "Not enough ETH to cover appeal cost.");

        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.appeal, "Dispute is not appealable");
        require(msg.sender == address(dispute.disputeKit), "Can only be called by the dispute kit.");

        if (dispute.nbVotes >= courts[dispute.subcourtID].jurorsForCourtJump)
            // Jump to parent subcourt.
            // TODO: Handle court jump in the Forking court. Also make sure the new subcourt is compatible with the dispute kit.
            dispute.subcourtID = courts[dispute.subcourtID].parent;

        dispute.period = Period.evidence;
        dispute.lastPeriodChange = block.timestamp;
        // As many votes that can be afforded by the provided funds.
        dispute.nbVotes = msg.value / courts[dispute.subcourtID].feeForJuror;

        dispute.tokensAtStakePerJuror.push(
            (courts[dispute.subcourtID].minStake * courts[dispute.subcourtID].alpha) / ALPHA_DIVISOR
        );
        dispute.totalFeesForJurors.push(msg.value);
        dispute.repartitionsInEachRound.push(0);
        dispute.penaltiesInEachRound.push(0);

        dispute.currentRound++;

        emit AppealDecision(_disputeID, dispute.arbitrated);
        emit NewPeriod(_disputeID, Period.evidence);
    }

    /** @dev Distribute tokens and ETH for the specific round of the dispute. Can be called in parts.
     *  @param _disputeID The ID of the dispute.
     *  @param _appeal The appeal round.
     *  @param _iterations The number of iterations to run.
     */
    function execute(
        uint256 _disputeID,
        uint256 _appeal,
        uint256 _iterations
    ) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, "Should be execution period.");

        uint256 end = dispute.repartitionsInEachRound[_appeal] + _iterations;
        uint256 penaltiesInRoundCache = dispute.penaltiesInEachRound[_appeal]; // For saving gas.

        uint256 numberOfVotesInRound = dispute.drawnJurors[_appeal].length;
        uint256 coherentCount = dispute.disputeKit.getCoherentCount(_disputeID, _appeal); // Total number of jurors that are eligible to a reward in this round.

        address account; // Address of the juror.
        uint256 degreeOfCoherence; // [0, 1] value that determines how coherent the juror was in this round, in basis points.

        if (coherentCount == 0) {
            // We loop over the votes once as there are no rewards because it is not a tie and no one in this round is coherent with the final outcome.
            if (end > numberOfVotesInRound) end = numberOfVotesInRound;
        } else {
            // We loop over the votes twice, first to collect penalties, and second to distribute them as rewards along with arbitration fees.
            if (end > numberOfVotesInRound * 2) end = numberOfVotesInRound * 2;
        }

        for (uint256 i = dispute.repartitionsInEachRound[_appeal]; i < end; i++) {
            // Penalty.
            if (i < numberOfVotesInRound) {
                degreeOfCoherence = dispute.disputeKit.getDegreeOfCoherence(_disputeID, _appeal, i);
                if (degreeOfCoherence > ALPHA_DIVISOR) degreeOfCoherence = ALPHA_DIVISOR; // Make sure the degree doesn't exceed 1, though it should be ensured by the dispute kit.

                uint256 penalty = (dispute.tokensAtStakePerJuror[_appeal] * (ALPHA_DIVISOR - degreeOfCoherence)) /
                    ALPHA_DIVISOR; // Fully coherent jurors won't be penalized.
                penaltiesInRoundCache += penalty;

                account = dispute.drawnJurors[_appeal][i];
                jurors[account].lockedTokens[dispute.subcourtID] -= penalty; // Release this part of locked tokens.
                // TODO: properly update staked tokens in case of penalty.

                // Unstake the juror if he lost due to inactivity.
                if (!dispute.disputeKit.isVoteActive(_disputeID, _appeal, i)) {
                    for (uint256 j = 0; j < jurors[account].subcourtIDs.length; j++)
                        _setStake(account, jurors[account].subcourtIDs[j], 0);
                }
                emit TokenAndETHShift(account, _disputeID, -int256(penalty), 0);

                if (i == numberOfVotesInRound - 1) {
                    if (coherentCount == 0) {
                        // No one was coherent. Send the rewards to governor.
                        payable(governor).send(dispute.totalFeesForJurors[_appeal]);
                        pinakion.transfer(governor, penaltiesInRoundCache);
                    }
                }
                // Reward.
            } else {
                degreeOfCoherence = dispute.disputeKit.getDegreeOfCoherence(
                    _disputeID,
                    _appeal,
                    i % numberOfVotesInRound
                );
                if (degreeOfCoherence > ALPHA_DIVISOR) degreeOfCoherence = ALPHA_DIVISOR;
                account = dispute.drawnJurors[_appeal][i % 2];
                // Release the rest of the tokens of the juror for this round.
                jurors[account].lockedTokens[dispute.subcourtID] -=
                    (dispute.tokensAtStakePerJuror[_appeal] * degreeOfCoherence) /
                    ALPHA_DIVISOR;
                // TODO: properly update staked tokens in case of reward.

                uint256 tokenReward = ((penaltiesInRoundCache / coherentCount) * degreeOfCoherence) / ALPHA_DIVISOR;
                uint256 ETHReward = ((dispute.totalFeesForJurors[_appeal] / coherentCount) * degreeOfCoherence) /
                    ALPHA_DIVISOR;

                pinakion.transfer(account, tokenReward);
                payable(account).send(ETHReward);
                emit TokenAndETHShift(account, _disputeID, int256(tokenReward), int256(ETHReward));
            }
        }

        if (dispute.penaltiesInEachRound[_appeal] != penaltiesInRoundCache)
            dispute.penaltiesInEachRound[_appeal] = penaltiesInRoundCache;
        dispute.repartitionsInEachRound[_appeal] = end;
    }

    /** @dev Executes a specified dispute's ruling. UNTRUSTED.
     *  @param _disputeID The ID of the dispute.
     */
    function executeRuling(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, "Should be execution period.");
        require(!dispute.ruled, "Ruling already executed.");

        uint256 winningChoice = currentRuling(_disputeID);
        dispute.ruled = true;
        dispute.arbitrated.rule(_disputeID, winningChoice);
    }

    // ********************* //
    // *      Getters      * //
    // ********************* //

    /** @dev Gets the cost of arbitration in a specified subcourt.
     *  @param _extraData Additional info about the dispute. We use it to pass the ID of the subcourt to create the dispute in (first 32 bytes)
     *  and the minimum number of jurors required (next 32 bytes).
     *  @return cost The arbitration cost.
     */
    function arbitrationCost(bytes memory _extraData) public view override returns (uint256 cost) {
        (uint96 subcourtID, uint256 minJurors, ) = extraDataToSubcourtIDMinJurorsDisputeKit(_extraData);
        cost = courts[subcourtID].feeForJuror * minJurors;
    }

    /** @dev Gets the cost of appealing a specified dispute.
     *  @param _disputeID The ID of the dispute.
     *  @return cost The appeal cost.
     */
    function appealCost(uint256 _disputeID) public view returns (uint256 cost) {
        Dispute storage dispute = disputes[_disputeID];
        if (dispute.nbVotes >= courts[dispute.subcourtID].jurorsForCourtJump) {
            // Jump to parent subcourt.
            if (dispute.subcourtID == 0)
                // Already in the forking court.
                cost = NON_PAYABLE_AMOUNT; // Get the cost of the parent subcourt.
            else cost = courts[courts[dispute.subcourtID].parent].feeForJuror * ((dispute.nbVotes * 2) + 1);
        }
        // Stay in current subcourt.
        else cost = courts[dispute.subcourtID].feeForJuror * ((dispute.nbVotes * 2) + 1);
    }

    /** @dev Gets the start and the end of a specified dispute's current appeal period.
     *  @param _disputeID The ID of the dispute.
     *  @return start The start of the appeal period.
     *  @return end The end of the appeal period.
     */
    function appealPeriod(uint256 _disputeID) public view returns (uint256 start, uint256 end) {
        Dispute storage dispute = disputes[_disputeID];
        if (dispute.period == Period.appeal) {
            start = dispute.lastPeriodChange;
            end = dispute.lastPeriodChange + courts[dispute.subcourtID].timesPerPeriod[uint256(Period.appeal)];
        } else {
            start = 0;
            end = 0;
        }
    }

    /** @dev Gets the current ruling of a specified dispute.
     *  @param _disputeID The ID of the dispute.
     *  @return ruling The current ruling.
     */
    function currentRuling(uint256 _disputeID) public view returns (uint256 ruling) {
        DisputeKit disputeKit = disputes[_disputeID].disputeKit;
        return disputeKit.currentRuling(_disputeID);
    }

    // ************************************* //
    // *      Getters for dispute kits     * //
    // ************************************* //

    function getSortitionSumTree(bytes32 _key)
        public
        view
        returns (
            uint256 K,
            uint256[] memory stack,
            uint256[] memory nodes
        )
    {
        SortitionSumTreeFactory.SortitionSumTree storage tree = sortitionSumTrees.sortitionSumTrees[_key];
        K = tree.K;
        stack = tree.stack;
        nodes = tree.nodes;
    }

    function getSortitionSumTreeID(bytes32 _key, uint256 _nodeIndex) external view returns (bytes32 ID) {
        ID = sortitionSumTrees.sortitionSumTrees[_key].nodeIndexesToIDs[_nodeIndex];
    }

    function getSubcourtID(uint256 _disputeID) external view returns (uint256 subcourtID) {
        return disputes[_disputeID].subcourtID;
    }

    function getCurrentPeriod(uint256 _disputeID) external view returns (Period period) {
        return disputes[_disputeID].period;
    }

    function areVotesHidden(uint256 _subcourtID) external view returns (bool hiddenVotes) {
        return courts[_subcourtID].hiddenVotes;
    }

    function isRuled(uint256 _disputeID) external view returns (bool) {
        return disputes[_disputeID].ruled;
    }

    /* Internal */

    /** @dev Sets the specified juror's stake in a subcourt.
     *  `O(n + p * log_k(j))` where
     *  `n` is the number of subcourts the juror has staked in,
     *  `p` is the depth of the subcourt tree,
     *  `k` is the minimum number of children per node of one of these subcourts' sortition sum tree,
     *  and `j` is the maximum number of jurors that ever staked in one of these subcourts simultaneously.
     *  @param _account The address of the juror.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _stake The new stake.
     */
    function _setStake(
        address _account,
        uint96 _subcourtID,
        uint256 _stake
    ) internal {
        Juror storage juror = jurors[_account];
        bytes32 stakePathID = accountAndSubcourtIDToStakePathID(_account, _subcourtID);
        uint256 currentStake = sortitionSumTrees.stakeOf(bytes32(uint256(_subcourtID)), stakePathID);

        if (_stake != 0) {
            require(_stake >= courts[_subcourtID].minStake, "Should stake at least minimal amount");
            if (currentStake == 0) {
                require(juror.subcourtIDs.length < MAX_STAKE_PATHS, "Max stake paths reached");
                juror.subcourtIDs.push(_subcourtID);
            }
        } else {
            for (uint256 i = 0; i < juror.subcourtIDs.length; i++) {
                if (juror.subcourtIDs[i] == _subcourtID) {
                    juror.subcourtIDs[i] = juror.subcourtIDs[juror.subcourtIDs.length - 1];
                    juror.subcourtIDs.pop();
                    break;
                }
            }
        }

        // Update juror's records.
        uint256 newTotalStake = juror.stakedTokens[_subcourtID] - currentStake + _stake;
        juror.stakedTokens[_subcourtID] = newTotalStake;

        // Update subcourt parents.
        bool finished = false;
        uint256 currentSubcourtID = _subcourtID;
        while (!finished) {
            sortitionSumTrees.set(bytes32(currentSubcourtID), _stake, stakePathID);
            if (currentSubcourtID == 0) finished = true;
            else currentSubcourtID = courts[currentSubcourtID].parent;
        }

        if (_stake >= currentStake) {
            require(
                pinakion.transferFrom(_account, address(this), _stake - currentStake),
                "Sender doesn't have enough tokens"
            );
        } else {
            // Keep locked tokens in the contract and release them after dispute is executed. Note that the current flow of staking is unfinished.
            require(
                pinakion.transfer(_account, currentStake - _stake - juror.lockedTokens[_subcourtID]),
                "The transfer failed"
            );
        }

        emit StakeSet(_account, _subcourtID, _stake, newTotalStake);
    }

    /** @dev Gets a subcourt ID, the minimum number of jurors and an ID of a dispute kit from a specified extra data bytes array.
     *  Note that if extradata contains an incorrect value then this value will be switched to default.
     *  @param _extraData The extra data bytes array. The first 32 bytes are the subcourt ID, the next are the minimum number of jurors and the last are the dispute kit ID.
     *  @return subcourtID The subcourt ID.
     *  @return minJurors The minimum number of jurors required.
     *  @return disputeKitID The ID of the dispute kit.
     */
    function extraDataToSubcourtIDMinJurorsDisputeKit(bytes memory _extraData)
        internal
        view
        returns (
            uint96 subcourtID,
            uint256 minJurors,
            uint8 disputeKitID
        )
    {
        // Note that if the extradata doesn't contain 32 bytes for the dispute kit ID it'll return the default 0 index.
        if (_extraData.length >= 64) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                subcourtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
                disputeKitID := mload(add(_extraData, 0x60))
            }
            if (subcourtID >= courts.length) subcourtID = 0;
            if (minJurors == 0) minJurors = MIN_JURORS;
            if (disputeKitID >= disputeKits.length) disputeKitID = 0;
        } else {
            subcourtID = 0;
            minJurors = MIN_JURORS;
            disputeKitID = 0;
        }
    }

    /** @dev Packs an account and a subcourt ID into a stake path ID.
     *  @param _account The address of the juror to pack.
     *  @param _subcourtID The subcourt ID to pack.
     *  @return stakePathID The stake path ID.
     */
    function accountAndSubcourtIDToStakePathID(address _account, uint96 _subcourtID)
        internal
        pure
        returns (bytes32 stakePathID)
    {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(ptr, i), byte(add(0x0c, i), _account))
            }
            for {
                let i := 0x14
            } lt(i, 0x20) {
                i := add(i, 0x01)
            } {
                mstore8(add(ptr, i), byte(i, _subcourtID))
            }
            stakePathID := mload(ptr)
        }
    }

    function getDispute(uint256 _disputeID)
        external
        view
        returns (
            uint256[] memory tokensAtStakePerJuror,
            uint256[] memory totalFeesForJurors,
            uint256[] memory repartitionsInEachRound,
            uint256[] memory penaltiesInEachRound
        )
    {
        Dispute storage dispute = disputes[_disputeID];
        tokensAtStakePerJuror = dispute.tokensAtStakePerJuror;
        totalFeesForJurors = dispute.totalFeesForJurors;
        repartitionsInEachRound = dispute.repartitionsInEachRound;
        penaltiesInEachRound = dispute.penaltiesInEachRound;
    }
}

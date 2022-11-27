// SPDX-License-Identifier: MIT

/**
 *  @authors: [@unknownunknown1, @jaybuidl]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IArbitrator.sol";
import "./IDisputeKit.sol";
import {SortitionSumTreeFactory} from "../data-structures/SortitionSumTreeFactory.sol";

/**
 *  @title KlerosCore
 *  Core arbitrator contract for Kleros v2.
 *  Note that this contract trusts the token and the dispute kit contracts.
 */
contract KlerosCore is IArbitrator {
    using SortitionSumTreeFactory for SortitionSumTreeFactory.SortitionSumTrees; // Use library functions for sortition sum trees.

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    enum Phase {
        staking, // Stake can be updated during this phase.
        freezing // Phase during which the dispute kits can undergo the drawing process. Staking is not allowed during this phase.
    }

    enum Period {
        evidence, // Evidence can be submitted. This is also when drawing has to take place.
        commit, // Jurors commit a hashed vote. This is skipped for courts without hidden votes.
        vote, // Jurors reveal/cast their vote depending on whether the court has hidden votes or not.
        appeal, // The dispute can be appealed.
        execution // Tokens are redistributed and the ruling is executed.
    }

    struct Court {
        uint96 parent; // The parent court.
        bool hiddenVotes; // Whether to use commit and reveal or not.
        uint256[] children; // List of child courts.
        uint256 minStake; // Minimum tokens needed to stake in the court.
        uint256 alpha; // Basis point of tokens that are lost when incoherent.
        uint256 feeForJuror; // Arbitration fee paid per juror.
        uint256 jurorsForCourtJump; // The appeal after the one that reaches this number of jurors will go to the parent court if any.
        uint256[4] timesPerPeriod; // The time allotted to each dispute period in the form `timesPerPeriod[period]`.
        mapping(uint256 => bool) supportedDisputeKits; // True if DK with this ID is supported by the court.
    }

    struct Dispute {
        uint96 subcourtID; // The ID of the subcourt the dispute is in.
        IArbitrable arbitrated; // The arbitrable contract.
        Period period; // The current period of the dispute.
        bool ruled; // True if the ruling has been executed, false otherwise.
        uint256 lastPeriodChange; // The last time the period was changed.
        Round[] rounds;
    }

    struct Round {
        uint256 disputeKitID; // Index of the dispute kit in the array.
        uint256 tokensAtStakePerJuror; // The amount of tokens at stake for each juror in this round.
        uint256 totalFeesForJurors; // The total juror fees paid in this round.
        uint256 nbVotes; // The total number of votes the dispute can possibly have in the current round. Former votes[_round].length.
        uint256 repartitions; // A counter of reward repartitions made in this round.
        uint256 penalties; // The amount of tokens collected from penalties in this round.
        address[] drawnJurors; // Addresses of the jurors that were drawn in this round.
    }

    struct Juror {
        uint96[] subcourtIDs; // The IDs of subcourts where the juror's stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        mapping(uint96 => uint256) stakedTokens; // The number of tokens the juror has staked in the subcourt in the form `stakedTokens[subcourtID]`.
        mapping(uint96 => uint256) lockedTokens; // The number of tokens the juror has locked in the subcourt in the form `lockedTokens[subcourtID]`.
    }

    struct DisputeKitNode {
        uint256 parent; // Index of the parent dispute kit. If it's 0 then this DK is a root.
        uint256[] children; // List of child dispute kits.
        IDisputeKit disputeKit; // The dispute kit implementation.
        bool needsFreezing; // The dispute kit needs freezing.
        uint256 depthLevel; // How far this DK is from the root. 0 for root DK.
    }

    struct DelayedStake {
        address account; // The address of the juror.
        uint96 subcourtID; // The ID of the subcourt.
        uint256 stake; // The new stake.
        uint256 penalty; // Penalty value, in case the stake was set during execution.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint96 public constant FORKING_COURT = 0; // Index of the forking court.
    uint96 public constant GENERAL_COURT = 1; // Index of the default (general) court.
    uint256 public constant NULL_DISPUTE_KIT = 0; // Null pattern to indicate a top-level DK which has no parent.
    uint256 public constant DISPUTE_KIT_CLASSIC = 1; // Index of the default DK. 0 index is skipped.
    uint256 public constant MAX_STAKE_PATHS = 4; // The maximum number of stake paths a juror can have.
    uint256 public constant MIN_JURORS = 3; // The global default minimum number of jurors in a dispute.
    uint256 public constant ALPHA_DIVISOR = 1e4; // The number to divide `Court.alpha` by.
    uint256 public constant NON_PAYABLE_AMOUNT = (2 ** 256 - 2) / 2; // An amount higher than the supply of ETH.
    uint256 public constant SEARCH_ITERATIONS = 10; // Number of iterations to search for suitable parent court before jumping to the top court.

    address public governor; // The governor of the contract.
    IERC20 public pinakion; // The Pinakion token contract.
    // TODO: interactions with jurorProsecutionModule.
    address public jurorProsecutionModule; // The module for juror's prosecution.
    Phase public phase; // The current phase.
    uint256 public minStakingTime; // The time after which the phase can be switched to Freezing if there are open disputes.
    uint256 public maxFreezingTime; // The time after which the phase can be switched back to Staking.
    uint256 public lastPhaseChange; // The last time the phase was changed.
    uint256 public freezeBlock; // Number of the block when Core was frozen.
    Court[] public courts; // The subcourts.
    DisputeKitNode[] public disputeKitNodes; // The list of DisputeKitNode, indexed by DisputeKitID.
    uint256[] public disputesKitIDsThatNeedFreezing; // The disputeKitIDs that need switching to Freezing phase.
    Dispute[] public disputes; // The disputes.
    mapping(address => Juror) internal jurors; // The jurors.
    SortitionSumTreeFactory.SortitionSumTrees internal sortitionSumTrees; // The sortition sum trees.
    mapping(uint256 => DelayedStake) public delayedStakes; // Stores the stakes that were changed during Freezing phase, to update them when the phase is switched to Staking.

    uint256 public delayedStakeWriteIndex; // The index of the last `delayedStake` item that was written to the array. 0 index is skipped.
    uint256 public delayedStakeReadIndex = 1; // The index of the next `delayedStake` item that should be processed. Starts at 1 because 0 index is skipped.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event NewPhase(Phase _phase);
    event NewPeriod(uint256 indexed _disputeID, Period _period);
    event StakeSet(address indexed _address, uint256 _subcourtID, uint256 _amount, uint256 _newTotalStake);
    event AppealPossible(uint256 indexed _disputeID, IArbitrable indexed _arbitrable);
    event AppealDecision(uint256 indexed _disputeID, IArbitrable indexed _arbitrable);
    event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _roundID, uint256 _voteID);
    event SubcourtCreated(
        uint256 indexed _subcourtID,
        uint96 indexed _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] _timesPerPeriod,
        uint256 _sortitionSumTreeK,
        uint256[] _supportedDisputeKits
    );
    event SubcourtModified(uint96 indexed _subcourtID, string _param);
    event DisputeKitCreated(
        uint256 indexed _disputeKitID,
        IDisputeKit indexed _disputeKitAddress,
        uint256 indexed _parent
    );
    event DisputeKitEnabled(uint96 indexed _subcourtID, uint256 indexed _disputeKitID, bool indexed _enable);
    event CourtJump(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint96 indexed _fromSubcourtID,
        uint96 _toSubcourtID
    );
    event DisputeKitJump(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint256 indexed _fromDisputeKitID,
        uint256 _toDisputeKitID
    );
    event TokenAndETHShift(
        address indexed _account,
        uint256 indexed _disputeID,
        int256 _tokenAmount,
        int256 _ethAmount
    );

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Governor only");
        _;
    }

    /** @dev Constructor.
     *  @param _governor The governor's address.
     *  @param _pinakion The address of the token contract.
     *  @param _jurorProsecutionModule The address of the juror prosecution module.
     *  @param _disputeKit The address of the default dispute kit.
     *  @param _phaseTimeouts minStakingTime and maxFreezingTime respectively
     *  @param _hiddenVotes The `hiddenVotes` property value of the general court.
     *  @param _courtParameters Numeric parameters of General court (minStake, alpha, feeForJuror and jurorsForCourtJump respectively).
     *  @param _timesPerPeriod The `timesPerPeriod` property value of the general court.
     *  @param _sortitionSumTreeK The number of children per node of the general court's sortition sum tree.
     */
    constructor(
        address _governor,
        IERC20 _pinakion,
        address _jurorProsecutionModule,
        IDisputeKit _disputeKit,
        uint256[2] memory _phaseTimeouts,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        uint256 _sortitionSumTreeK
    ) {
        governor = _governor;
        pinakion = _pinakion;
        jurorProsecutionModule = _jurorProsecutionModule;
        minStakingTime = _phaseTimeouts[0];
        maxFreezingTime = _phaseTimeouts[1];
        lastPhaseChange = block.timestamp;

        // NULL_DISPUTE_KIT: an empty element at index 0 to indicate when a node has no parent.
        disputeKitNodes.push();

        // DISPUTE_KIT_CLASSIC
        disputeKitNodes.push(
            DisputeKitNode({
                parent: NULL_DISPUTE_KIT,
                children: new uint256[](0),
                disputeKit: _disputeKit,
                needsFreezing: false,
                depthLevel: 0
            })
        );
        emit DisputeKitCreated(DISPUTE_KIT_CLASSIC, _disputeKit, NULL_DISPUTE_KIT);

        // FORKING_COURT
        // TODO: Fill the properties for the Forking court, emit SubcourtCreated.
        courts.push();
        sortitionSumTrees.createTree(bytes32(uint256(FORKING_COURT)), _sortitionSumTreeK);

        // GENERAL_COURT
        Court storage court = courts.push();
        court.parent = FORKING_COURT;
        court.children = new uint256[](0);
        court.hiddenVotes = _hiddenVotes;
        court.minStake = _courtParameters[0];
        court.alpha = _courtParameters[1];
        court.feeForJuror = _courtParameters[2];
        court.jurorsForCourtJump = _courtParameters[3];
        court.timesPerPeriod = _timesPerPeriod;
        sortitionSumTrees.createTree(bytes32(uint256(GENERAL_COURT)), _sortitionSumTreeK);
        emit SubcourtCreated(
            1,
            court.parent,
            _hiddenVotes,
            _courtParameters[0],
            _courtParameters[1],
            _courtParameters[2],
            _courtParameters[3],
            _timesPerPeriod,
            _sortitionSumTreeK,
            new uint256[](0)
        );
        enableDisputeKit(GENERAL_COURT, DISPUTE_KIT_CLASSIC, true);
    }

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

    /** @dev Changes the `minStakingTime` storage variable.
     *  @param _minStakingTime The new value for the `minStakingTime` storage variable.
     */
    function changeMinStakingTime(uint256 _minStakingTime) external onlyByGovernor {
        minStakingTime = _minStakingTime;
    }

    /** @dev Changes the `maxFreezingTime` storage variable.
     *  @param _maxFreezingTime The new value for the `maxFreezingTime` storage variable.
     */
    function changeMaxFreezingTime(uint256 _maxFreezingTime) external onlyByGovernor {
        maxFreezingTime = _maxFreezingTime;
    }

    /** @dev Add a new supported dispute kit module to the court.
     *  @param _disputeKitAddress The address of the dispute kit contract.
     *  @param _parent The ID of the parent dispute kit. It is left empty when root DK is created.
     *  Note that the root DK must be supported by the general court.
     */
    function addNewDisputeKit(IDisputeKit _disputeKitAddress, uint256 _parent) external onlyByGovernor {
        uint256 disputeKitID = disputeKitNodes.length;
        require(_parent < disputeKitID, "!Parent");
        uint256 depthLevel;
        if (_parent != NULL_DISPUTE_KIT) {
            depthLevel = disputeKitNodes[_parent].depthLevel + 1;
            // It should be always possible to reach the root from the leaf with the defined number of search iterations.
            require(depthLevel < SEARCH_ITERATIONS, "Depth level max");
        }
        disputeKitNodes.push(
            DisputeKitNode({
                parent: _parent,
                children: new uint256[](0),
                disputeKit: _disputeKitAddress,
                needsFreezing: false,
                depthLevel: depthLevel
            })
        );
        disputeKitNodes[_parent].children.push(disputeKitID);
        emit DisputeKitCreated(disputeKitID, _disputeKitAddress, _parent);
        if (_parent == NULL_DISPUTE_KIT) {
            // A new dispute kit tree root should always be supported by the General court.
            enableDisputeKit(GENERAL_COURT, disputeKitID, true);
        }
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
     *  @param _supportedDisputeKits Indexes of dispute kits that this subcourt will support.
     */
    function createSubcourt(
        uint96 _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod,
        uint256 _sortitionSumTreeK,
        uint256[] memory _supportedDisputeKits
    ) external onlyByGovernor {
        require(courts[_parent].minStake <= _minStake, "MinStake lower than parent court");
        require(_supportedDisputeKits.length > 0, "!Supported DK");
        require(_parent != FORKING_COURT, "Invalid: Forking court as parent");

        uint256 subcourtID = courts.length;
        Court storage court = courts.push();

        for (uint256 i = 0; i < _supportedDisputeKits.length; i++) {
            require(
                _supportedDisputeKits[i] > 0 && _supportedDisputeKits[i] < disputeKitNodes.length,
                "Wrong DK index"
            );
            court.supportedDisputeKits[_supportedDisputeKits[i]] = true;
        }

        court.parent = _parent;
        court.children = new uint256[](0);
        court.hiddenVotes = _hiddenVotes;
        court.minStake = _minStake;
        court.alpha = _alpha;
        court.feeForJuror = _feeForJuror;
        court.jurorsForCourtJump = _jurorsForCourtJump;
        court.timesPerPeriod = _timesPerPeriod;

        sortitionSumTrees.createTree(bytes32(subcourtID), _sortitionSumTreeK);
        // Update the parent.
        courts[_parent].children.push(subcourtID);
        emit SubcourtCreated(
            subcourtID,
            _parent,
            _hiddenVotes,
            _minStake,
            _alpha,
            _feeForJuror,
            _jurorsForCourtJump,
            _timesPerPeriod,
            _sortitionSumTreeK,
            _supportedDisputeKits
        );
    }

    /** @dev Changes the `minStake` property value of a specified subcourt. Don't set to a value lower than its parent's `minStake` property value.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _minStake The new value for the `minStake` property value.
     */
    function changeSubcourtMinStake(uint96 _subcourtID, uint256 _minStake) external onlyByGovernor {
        require(
            _subcourtID == GENERAL_COURT || courts[courts[_subcourtID].parent].minStake <= _minStake,
            "MinStake lower than parent court"
        );
        for (uint256 i = 0; i < courts[_subcourtID].children.length; i++) {
            require(courts[courts[_subcourtID].children[i]].minStake >= _minStake, "MinStake lower than parent court");
        }

        courts[_subcourtID].minStake = _minStake;
        emit SubcourtModified(_subcourtID, "minStake");
    }

    /** @dev Changes the `alpha` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _alpha The new value for the `alpha` property value.
     */
    function changeSubcourtAlpha(uint96 _subcourtID, uint256 _alpha) external onlyByGovernor {
        courts[_subcourtID].alpha = _alpha;
        emit SubcourtModified(_subcourtID, "alpha");
    }

    /** @dev Changes the `feeForJuror` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _feeForJuror The new value for the `feeForJuror` property value.
     */
    function changeSubcourtJurorFee(uint96 _subcourtID, uint256 _feeForJuror) external onlyByGovernor {
        courts[_subcourtID].feeForJuror = _feeForJuror;
        emit SubcourtModified(_subcourtID, "feeForJuror");
    }

    /** @dev Changes the `jurorsForCourtJump` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _jurorsForCourtJump The new value for the `jurorsForCourtJump` property value.
     */
    function changeSubcourtJurorsForJump(uint96 _subcourtID, uint256 _jurorsForCourtJump) external onlyByGovernor {
        courts[_subcourtID].jurorsForCourtJump = _jurorsForCourtJump;
        emit SubcourtModified(_subcourtID, "jurorsForCourtJump");
    }

    /** @dev Changes the `hiddenVotes` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _hiddenVotes The new value for the `hiddenVotes` property value.
     */
    function changeSubcourtHiddenVotes(uint96 _subcourtID, bool _hiddenVotes) external onlyByGovernor {
        courts[_subcourtID].hiddenVotes = _hiddenVotes;
        emit SubcourtModified(_subcourtID, "hiddenVotes");
    }

    /** @dev Changes the `timesPerPeriod` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _timesPerPeriod The new value for the `timesPerPeriod` property value.
     */
    function changeSubcourtTimesPerPeriod(
        uint96 _subcourtID,
        uint256[4] memory _timesPerPeriod
    ) external onlyByGovernor {
        courts[_subcourtID].timesPerPeriod = _timesPerPeriod;
        emit SubcourtModified(_subcourtID, "timesPerPeriod");
    }

    /** @dev Adds/removes court's support for specified dispute kits.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _disputeKitIDs The IDs of dispute kits which support should be added/removed.
     *  @param _enable Whether add or remove the dispute kits from the subcourt.
     */
    function enableDisputeKits(
        uint96 _subcourtID,
        uint256[] memory _disputeKitIDs,
        bool _enable
    ) external onlyByGovernor {
        Court storage subcourt = courts[_subcourtID];
        for (uint256 i = 0; i < _disputeKitIDs.length; i++) {
            if (_enable) {
                require(_disputeKitIDs[i] > 0 && _disputeKitIDs[i] < disputeKitNodes.length, "Wrong DK index");
                enableDisputeKit(_subcourtID, _disputeKitIDs[i], true);
            } else {
                require(
                    !(_subcourtID == GENERAL_COURT && disputeKitNodes[_disputeKitIDs[i]].parent == NULL_DISPUTE_KIT),
                    "Can't disable Root DK in General"
                );
                enableDisputeKit(_subcourtID, _disputeKitIDs[i], false);
            }
        }
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /** @dev Sets the caller's stake in a subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _stake The new stake.
     */
    function setStake(uint96 _subcourtID, uint256 _stake) external {
        require(setStakeForAccount(msg.sender, _subcourtID, _stake, 0), "Staking failed");
    }

    /** @dev Executes the next delayed stakes.
     *  @param _iterations The number of delayed stakes to execute.
     */
    function executeDelayedStakes(uint256 _iterations) external {
        require(phase == Phase.staking, "!Staking phase.");

        uint256 actualIterations = (delayedStakeReadIndex + _iterations) - 1 > delayedStakeWriteIndex
            ? (delayedStakeWriteIndex - delayedStakeReadIndex) + 1
            : _iterations;
        uint256 newDelayedStakeReadIndex = delayedStakeReadIndex + actualIterations;

        for (uint256 i = delayedStakeReadIndex; i < newDelayedStakeReadIndex; i++) {
            DelayedStake storage delayedStake = delayedStakes[i];
            setStakeForAccount(delayedStake.account, delayedStake.subcourtID, delayedStake.stake, delayedStake.penalty);
            delete delayedStakes[i];
        }
        delayedStakeReadIndex = newDelayedStakeReadIndex;
    }

    /** @dev Creates a dispute. Must be called by the arbitrable contract.
     *  @param _numberOfChoices Number of choices for the jurors to choose from.
     *  @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's subcourt (first 32 bytes),
     *  the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
     *  @return disputeID The ID of the created dispute.
     */
    function createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData
    ) external payable override returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "ETH too low for arbitration cost");

        (uint96 subcourtID, , uint256 disputeKitID) = extraDataToSubcourtIDMinJurorsDisputeKit(_extraData);
        require(courts[subcourtID].supportedDisputeKits[disputeKitID], "DK unsupported by subcourt");

        disputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.subcourtID = subcourtID;
        dispute.arbitrated = IArbitrable(msg.sender);
        dispute.lastPeriodChange = block.timestamp;

        IDisputeKit disputeKit = disputeKitNodes[disputeKitID].disputeKit;
        Court storage court = courts[dispute.subcourtID];
        Round storage round = dispute.rounds.push();
        round.nbVotes = msg.value / court.feeForJuror;
        round.disputeKitID = disputeKitID;
        round.tokensAtStakePerJuror = (court.minStake * court.alpha) / ALPHA_DIVISOR;
        round.totalFeesForJurors = msg.value;

        if (!disputeKitNodes[disputeKitID].needsFreezing) {
            // Ensures uniqueness in the disputesKitIDsThatNeedFreezing array.
            disputeKitNodes[disputeKitID].needsFreezing = true;
            disputesKitIDsThatNeedFreezing.push(disputeKitID);
        }

        disputeKit.createDispute(disputeID, _numberOfChoices, _extraData, round.nbVotes);
        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    /** @dev Switches the phases between Staking and Freezing, also signal the switch to the dispute kits.
     */
    function passPhase() external {
        if (phase == Phase.staking) {
            require(block.timestamp - lastPhaseChange >= minStakingTime, "MinStakingTime not passed");
            require(disputesKitIDsThatNeedFreezing.length > 0, "No DK needs freezing");
            phase = Phase.freezing;
            freezeBlock = block.number;
        } else {
            // phase == Phase.freezing
            bool timeout = this.freezingPhaseTimeout();
            for (int256 i = int256(disputesKitIDsThatNeedFreezing.length) - 1; i >= 0; --i) {
                uint256 disputeKitID = disputesKitIDsThatNeedFreezing[uint256(i)];
                IDisputeKit disputeKit = disputeKitNodes[disputesKitIDsThatNeedFreezing[uint256(i)]].disputeKit;
                if (timeout && !disputeKit.isResolving()) {
                    // Force the dispute kit to be ready for Staking phase.
                    disputeKit.passPhase(); // Should not be called if already in Resolving phase, because it reverts.
                    require(disputeKit.isResolving(), "Some DK not in Resolving phase");
                } else {
                    // Check if the dispute kit is ready for Staking phase.
                    require(disputeKit.isResolving(), "Some DK not in Resolving phase");
                    if (disputeKit.disputesWithoutJurors() == 0) {
                        // The dispute kit had time to finish drawing jurors for all its disputes.
                        disputeKitNodes[disputeKitID].needsFreezing = false;
                        if (i < int256(disputesKitIDsThatNeedFreezing.length) - 1) {
                            // This is not the last element so copy the last element to the current one, then pop.
                            disputesKitIDsThatNeedFreezing[uint256(i)] = disputesKitIDsThatNeedFreezing[
                                disputesKitIDsThatNeedFreezing.length - 1
                            ];
                        }
                        disputesKitIDsThatNeedFreezing.pop();
                    }
                }
            }
            phase = Phase.staking;
        }
        // Should not be reached if the phase is unchanged.
        lastPhaseChange = block.timestamp;
        emit NewPhase(phase);
    }

    /** @dev Passes the period of a specified dispute.
     *  @param _disputeID The ID of the dispute.
     */
    function passPeriod(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        Court storage court = courts[dispute.subcourtID];

        uint256 currentRound = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[currentRound];
        if (dispute.period == Period.evidence) {
            require(
                currentRound > 0 ||
                    block.timestamp - dispute.lastPeriodChange >= court.timesPerPeriod[uint256(dispute.period)],
                "Evidence not passed && !Appeal"
            );
            require(round.drawnJurors.length == round.nbVotes, "Dispute still drawing");
            dispute.period = court.hiddenVotes ? Period.commit : Period.vote;
        } else if (dispute.period == Period.commit) {
            require(
                block.timestamp - dispute.lastPeriodChange >= court.timesPerPeriod[uint256(dispute.period)] ||
                    disputeKitNodes[round.disputeKitID].disputeKit.areCommitsAllCast(_disputeID),
                "Commit period not passed"
            );
            dispute.period = Period.vote;
        } else if (dispute.period == Period.vote) {
            require(
                block.timestamp - dispute.lastPeriodChange >= court.timesPerPeriod[uint256(dispute.period)] ||
                    disputeKitNodes[round.disputeKitID].disputeKit.areVotesAllCast(_disputeID),
                "Vote period not passed"
            );
            dispute.period = Period.appeal;
            emit AppealPossible(_disputeID, dispute.arbitrated);
        } else if (dispute.period == Period.appeal) {
            require(
                block.timestamp - dispute.lastPeriodChange >= court.timesPerPeriod[uint256(dispute.period)],
                "Appeal period not passed"
            );
            dispute.period = Period.execution;
        } else if (dispute.period == Period.execution) {
            revert("Dispute period is final");
        }

        dispute.lastPeriodChange = block.timestamp;
        emit NewPeriod(_disputeID, dispute.period);
    }

    /** @dev Draws jurors for the dispute. Can be called in parts.
     *  @param _disputeID The ID of the dispute.
     *  @param _iterations The number of iterations to run.
     */
    function draw(uint256 _disputeID, uint256 _iterations) external {
        require(phase == Phase.freezing, "Wrong phase");

        Dispute storage dispute = disputes[_disputeID];
        uint256 currentRound = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[currentRound];
        require(dispute.period == Period.evidence, "!Evidence period");

        IDisputeKit disputeKit = disputeKitNodes[round.disputeKitID].disputeKit;
        uint256 startIndex = round.drawnJurors.length;
        uint256 endIndex = startIndex + _iterations <= round.nbVotes ? startIndex + _iterations : round.nbVotes;

        for (uint256 i = startIndex; i < endIndex; i++) {
            address drawnAddress = disputeKit.draw(_disputeID);
            if (drawnAddress != address(0)) {
                // In case no one has staked at the court yet.
                jurors[drawnAddress].lockedTokens[dispute.subcourtID] += round.tokensAtStakePerJuror;
                emit Draw(drawnAddress, _disputeID, currentRound, round.drawnJurors.length);
                round.drawnJurors.push(drawnAddress);
            }
        }
    }

    /** @dev Appeals the ruling of a specified dispute.
     *  Note: Access restricted to the Dispute Kit for this `disputeID`.
     *  @param _disputeID The ID of the dispute.
     *  @param _numberOfChoices Number of choices for the dispute. Can be required during court jump.
     *  @param _extraData Extradata for the dispute. Can be required during court jump.
     */
    function appeal(uint256 _disputeID, uint256 _numberOfChoices, bytes memory _extraData) external payable {
        require(msg.value >= appealCost(_disputeID), "ETH too low for appeal cost");

        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.appeal, "Dispute not appealable");

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        require(msg.sender == address(disputeKitNodes[round.disputeKitID].disputeKit), "Dispute Kit only");

        uint96 newSubcourtID = dispute.subcourtID;
        uint256 newDisputeKitID = round.disputeKitID;

        // Warning: the extra round must be created before calling disputeKit.createDispute()
        Round storage extraRound = dispute.rounds.push();

        if (round.nbVotes >= courts[newSubcourtID].jurorsForCourtJump) {
            // Jump to parent subcourt.
            newSubcourtID = courts[newSubcourtID].parent;

            for (uint256 i = 0; i < SEARCH_ITERATIONS; i++) {
                if (courts[newSubcourtID].supportedDisputeKits[newDisputeKitID]) {
                    break;
                } else if (disputeKitNodes[newDisputeKitID].parent != NULL_DISPUTE_KIT) {
                    newDisputeKitID = disputeKitNodes[newDisputeKitID].parent;
                } else {
                    // DK's parent has 0 index, that means we reached the root DK (0 depth level).
                    // Jump to the next parent court if the current court doesn't support any DK from this tree.
                    // Note that we don't reset newDisputeKitID in this case as, a precaution.
                    newSubcourtID = courts[newSubcourtID].parent;
                }
            }
            // We didn't find a court that is compatible with DK from this tree, so we jump directly to the top court.
            // Note that this can only happen when disputeKitID is at its root, and each root DK is supported by the top court by default.
            if (!courts[newSubcourtID].supportedDisputeKits[newDisputeKitID]) {
                newSubcourtID = GENERAL_COURT;
            }

            if (newSubcourtID != dispute.subcourtID) {
                emit CourtJump(_disputeID, dispute.rounds.length - 1, dispute.subcourtID, newSubcourtID);
            }
        }

        dispute.subcourtID = newSubcourtID;
        dispute.period = Period.evidence;
        dispute.lastPeriodChange = block.timestamp;

        Court storage court = courts[newSubcourtID];
        extraRound.nbVotes = msg.value / court.feeForJuror; // As many votes that can be afforded by the provided funds.
        extraRound.tokensAtStakePerJuror = (court.minStake * court.alpha) / ALPHA_DIVISOR;
        extraRound.totalFeesForJurors = msg.value;
        extraRound.disputeKitID = newDisputeKitID;

        if (!disputeKitNodes[newDisputeKitID].needsFreezing) {
            // Ensures uniqueness in the disputesKitIDsThatNeedFreezing array.
            disputeKitNodes[newDisputeKitID].needsFreezing = true;
            disputesKitIDsThatNeedFreezing.push(newDisputeKitID);
        }

        // Dispute kit was changed, so create a dispute in the new DK contract.
        if (extraRound.disputeKitID != round.disputeKitID) {
            emit DisputeKitJump(_disputeID, dispute.rounds.length - 1, round.disputeKitID, extraRound.disputeKitID);
            disputeKitNodes[extraRound.disputeKitID].disputeKit.createDispute(
                _disputeID,
                _numberOfChoices,
                _extraData,
                extraRound.nbVotes
            );
        }

        emit AppealDecision(_disputeID, dispute.arbitrated);
        emit NewPeriod(_disputeID, Period.evidence);
    }

    /** @dev Distribute tokens and ETH for the specific round of the dispute. Can be called in parts.
     *  @param _disputeID The ID of the dispute.
     *  @param _round The appeal round.
     *  @param _iterations The number of iterations to run.
     */
    function execute(uint256 _disputeID, uint256 _round, uint256 _iterations) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, "!Execution period");

        Round storage round = dispute.rounds[_round];
        IDisputeKit disputeKit = disputeKitNodes[round.disputeKitID].disputeKit;

        uint256 end = round.repartitions + _iterations;
        uint256 penaltiesInRoundCache = round.penalties; // For saving gas.
        uint256 numberOfVotesInRound = round.drawnJurors.length;
        uint256 coherentCount = disputeKit.getCoherentCount(_disputeID, _round); // Total number of jurors that are eligible to a reward in this round.

        address account; // Address of the juror.
        uint256 degreeOfCoherence; // [0, 1] value that determines how coherent the juror was in this round, in basis points.

        if (coherentCount == 0) {
            // We loop over the votes once as there are no rewards because it is not a tie and no one in this round is coherent with the final outcome.
            if (end > numberOfVotesInRound) end = numberOfVotesInRound;
        } else {
            // We loop over the votes twice, first to collect penalties, and second to distribute them as rewards along with arbitration fees.
            if (end > numberOfVotesInRound * 2) end = numberOfVotesInRound * 2;
        }

        for (uint256 i = round.repartitions; i < end; i++) {
            if (i < numberOfVotesInRound) {
                // Penalty.
                degreeOfCoherence = disputeKit.getDegreeOfCoherence(_disputeID, _round, i);

                // Make sure the degree doesn't exceed 1, though it should be ensured by the dispute kit.
                if (degreeOfCoherence > ALPHA_DIVISOR) {
                    degreeOfCoherence = ALPHA_DIVISOR;
                }

                // Fully coherent jurors won't be penalized.
                uint256 penalty = (round.tokensAtStakePerJuror * (ALPHA_DIVISOR - degreeOfCoherence)) / ALPHA_DIVISOR;
                penaltiesInRoundCache += penalty;

                account = round.drawnJurors[i];
                jurors[account].lockedTokens[dispute.subcourtID] -= penalty; // Release this part of locked tokens.

                // Can only update the stake if it is able to cover the minStake and penalty, otherwise unstake from the court.
                if (jurors[account].stakedTokens[dispute.subcourtID] >= courts[dispute.subcourtID].minStake + penalty) {
                    uint256 newStake = jurors[account].stakedTokens[dispute.subcourtID] - penalty;
                    setStakeForAccount(account, dispute.subcourtID, newStake, penalty);
                } else if (jurors[account].stakedTokens[dispute.subcourtID] != 0) {
                    setStakeForAccount(account, dispute.subcourtID, 0, penalty);
                }

                // Unstake the juror if he lost due to inactivity.
                if (!disputeKit.isVoteActive(_disputeID, _round, i)) {
                    uint96[] memory subcourtIDs = getJurorSubcourtIDs(account);
                    for (uint256 j = 0; j < subcourtIDs.length; j++) {
                        setStakeForAccount(account, subcourtIDs[j], 0, 0);
                    }
                }
                emit TokenAndETHShift(account, _disputeID, -int256(penalty), 0);

                if (i == numberOfVotesInRound - 1) {
                    if (coherentCount == 0) {
                        // No one was coherent. Send the rewards to governor.
                        payable(governor).send(round.totalFeesForJurors);
                        safeTransfer(governor, penaltiesInRoundCache);
                    }
                }
            } else {
                // Reward.
                degreeOfCoherence = disputeKit.getDegreeOfCoherence(_disputeID, _round, i % numberOfVotesInRound);

                // Make sure the degree doesn't exceed 1, though it should be ensured by the dispute kit.
                if (degreeOfCoherence > ALPHA_DIVISOR) {
                    degreeOfCoherence = ALPHA_DIVISOR;
                }

                account = round.drawnJurors[i % numberOfVotesInRound];

                // Release the rest of the tokens of the juror for this round.
                jurors[account].lockedTokens[dispute.subcourtID] -=
                    (round.tokensAtStakePerJuror * degreeOfCoherence) /
                    ALPHA_DIVISOR;

                // Give back the locked tokens in case the juror fully unstaked earlier.
                if (jurors[account].stakedTokens[dispute.subcourtID] == 0) {
                    uint256 tokenLocked = (round.tokensAtStakePerJuror * degreeOfCoherence) / ALPHA_DIVISOR;
                    safeTransfer(account, tokenLocked);
                }

                uint256 tokenReward = ((penaltiesInRoundCache / coherentCount) * degreeOfCoherence) / ALPHA_DIVISOR;
                uint256 ethReward = ((round.totalFeesForJurors / coherentCount) * degreeOfCoherence) / ALPHA_DIVISOR;
                safeTransfer(account, tokenReward);
                payable(account).send(ethReward);
                emit TokenAndETHShift(account, _disputeID, int256(tokenReward), int256(ethReward));
            }
        }

        if (round.penalties != penaltiesInRoundCache) {
            round.penalties = penaltiesInRoundCache;
        }
        round.repartitions = end;
    }

    /** @dev Executes a specified dispute's ruling. UNTRUSTED.
     *  @param _disputeID The ID of the dispute.
     */
    function executeRuling(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, "!Execution period");
        require(!dispute.ruled, "Ruling already executed");

        (uint256 winningChoice, , ) = currentRuling(_disputeID);
        dispute.ruled = true;
        dispute.arbitrated.rule(_disputeID, winningChoice);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

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
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        Court storage court = courts[dispute.subcourtID];
        if (round.nbVotes >= court.jurorsForCourtJump) {
            // Jump to parent subcourt.
            if (dispute.subcourtID == GENERAL_COURT) {
                // TODO: Handle the forking when appealed in General court.
                cost = NON_PAYABLE_AMOUNT; // Get the cost of the parent subcourt.
            } else {
                cost = courts[court.parent].feeForJuror * ((round.nbVotes * 2) + 1);
            }
        } else {
            // Stay in current subcourt.
            cost = court.feeForJuror * ((round.nbVotes * 2) + 1);
        }
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
     *  @return tied Whether it's a tie or not.
     *  @return overridden Whether the ruling was overridden by appeal funding or not.
     */
    function currentRuling(uint256 _disputeID) public view returns (uint256 ruling, bool tied, bool overridden) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        IDisputeKit disputeKit = disputeKitNodes[round.disputeKitID].disputeKit;
        (ruling, tied, overridden) = disputeKit.currentRuling(_disputeID);
    }

    function getRoundInfo(
        uint256 _disputeID,
        uint256 _round
    )
        external
        view
        returns (
            uint256 tokensAtStakePerJuror,
            uint256 totalFeesForJurors,
            uint256 repartitions,
            uint256 penalties,
            address[] memory drawnJurors,
            uint256 disputeKitID
        )
    {
        Round storage round = disputes[_disputeID].rounds[_round];
        return (
            round.tokensAtStakePerJuror,
            round.totalFeesForJurors,
            round.repartitions,
            round.penalties,
            round.drawnJurors,
            round.disputeKitID
        );
    }

    function getNumberOfRounds(uint256 _disputeID) external view returns (uint256) {
        return disputes[_disputeID].rounds.length;
    }

    function getJurorBalance(
        address _juror,
        uint96 _subcourtID
    ) external view returns (uint256 staked, uint256 locked) {
        staked = jurors[_juror].stakedTokens[_subcourtID];
        locked = jurors[_juror].lockedTokens[_subcourtID];
    }

    function isSupported(uint96 _subcourtID, uint256 _disputeKitID) external view returns (bool) {
        return courts[_subcourtID].supportedDisputeKits[_disputeKitID];
    }

    /** @dev Gets non-primitive properties of a specified dispute kit node.
     *  @param _disputeKitID The ID of the dispute kit.
     *  @return children Indexes of children of this DK.
     */
    function getDisputeKitChildren(uint256 _disputeKitID) external view returns (uint256[] memory) {
        return disputeKitNodes[_disputeKitID].children;
    }

    /** @dev Gets the timesPerPeriod array for a given court.
     *  @param _subcourtID The ID of the court to get the times from.
     *  @return timesPerPeriod The timesPerPeriod array for the given court.
     */
    function getTimesPerPeriod(uint96 _subcourtID) external view returns (uint256[4] memory timesPerPeriod) {
        Court storage court = courts[_subcourtID];
        timesPerPeriod = court.timesPerPeriod;
    }

    // ************************************* //
    // *   Public Views for Dispute Kits   * //
    // ************************************* //

    function getSortitionSumTreeNode(bytes32 _key, uint256 _index) external view returns (uint256) {
        return sortitionSumTrees.sortitionSumTrees[_key].nodes[_index];
    }

    function getSortitionSumTree(
        bytes32 _key,
        uint256 _nodeIndex
    ) public view returns (uint256 K, uint256 length, bytes32 ID) {
        SortitionSumTreeFactory.SortitionSumTree storage tree = sortitionSumTrees.sortitionSumTrees[_key];
        K = tree.K;
        length = tree.nodes.length;
        ID = tree.nodeIndexesToIDs[_nodeIndex];
    }

    function getNumberOfVotes(uint256 _disputeID) external view returns (uint256) {
        Dispute storage dispute = disputes[_disputeID];
        return dispute.rounds[dispute.rounds.length - 1].nbVotes;
    }

    function freezingPhaseTimeout() external view returns (bool) {
        return phase == Phase.freezing && block.timestamp - lastPhaseChange >= maxFreezingTime;
    }

    /** @dev Returns true if the dispute kit will be switched to a parent DK.
     *  @param _disputeID The ID of the dispute.
     *  @return Whether DK will be switched or not.
     */
    function isDisputeKitJumping(uint256 _disputeID) external view returns (bool) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        Court storage court = courts[dispute.subcourtID];

        if (round.nbVotes < court.jurorsForCourtJump) {
            return false;
        }

        // Jump if the parent court doesn't support the current DK.
        return !courts[court.parent].supportedDisputeKits[round.disputeKitID];
    }

    function getDisputesKitIDsThatNeedFreezing() external view returns (uint256[] memory) {
        return disputesKitIDsThatNeedFreezing;
    }

    function getJurorSubcourtIDs(address _juror) public view returns (uint96[] memory) {
        return jurors[_juror].subcourtIDs;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function enableDisputeKit(uint96 _subcourtID, uint256 _disputeKitID, bool _enable) internal {
        courts[_subcourtID].supportedDisputeKits[_disputeKitID] = _enable;
        emit DisputeKitEnabled(_subcourtID, _disputeKitID, _enable);
    }

    /** @dev Sets the specified juror's stake in a subcourt.
     *  `O(n + p * log_k(j))` where
     *  `n` is the number of subcourts the juror has staked in,
     *  `p` is the depth of the subcourt tree,
     *  `k` is the minimum number of children per node of one of these subcourts' sortition sum tree,
     *  and `j` is the maximum number of jurors that ever staked in one of these subcourts simultaneously.
     *  @param _account The address of the juror.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _stake The new stake.
     *  @param _penalty Penalized amount won't be transferred back to juror when the stake is lowered.
     *  @return succeeded True if the call succeeded, false otherwise.
     */
    function setStakeForAccount(
        address _account,
        uint96 _subcourtID,
        uint256 _stake,
        uint256 _penalty
    ) internal returns (bool succeeded) {
        if (_subcourtID == FORKING_COURT || _subcourtID > courts.length) return false;

        Juror storage juror = jurors[_account];
        bytes32 stakePathID = accountAndSubcourtIDToStakePathID(_account, _subcourtID);
        uint256 currentStake = sortitionSumTrees.stakeOf(bytes32(uint256(_subcourtID)), stakePathID);

        if (_stake != 0) {
            // Check against locked tokens in case the min stake was lowered.
            if (_stake < courts[_subcourtID].minStake || _stake < juror.lockedTokens[_subcourtID]) return false;
            if (currentStake == 0 && juror.subcourtIDs.length >= MAX_STAKE_PATHS) return false;
        }

        // Delayed action logic.
        if (phase != Phase.staking) {
            delayedStakes[++delayedStakeWriteIndex] = DelayedStake({
                account: _account,
                subcourtID: _subcourtID,
                stake: _stake,
                penalty: _penalty
            });
            return true;
        }

        uint256 transferredAmount;
        if (_stake >= currentStake) {
            transferredAmount = _stake - currentStake;
            if (transferredAmount > 0) {
                if (safeTransferFrom(_account, address(this), transferredAmount)) {
                    if (currentStake == 0) {
                        juror.subcourtIDs.push(_subcourtID);
                    }
                } else {
                    return false;
                }
            }
        } else if (_stake == 0) {
            // Keep locked tokens in the contract and release them after dispute is executed.
            transferredAmount = currentStake - juror.lockedTokens[_subcourtID] - _penalty;
            if (transferredAmount > 0) {
                if (safeTransfer(_account, transferredAmount)) {
                    for (uint256 i = 0; i < juror.subcourtIDs.length; i++) {
                        if (juror.subcourtIDs[i] == _subcourtID) {
                            juror.subcourtIDs[i] = juror.subcourtIDs[juror.subcourtIDs.length - 1];
                            juror.subcourtIDs.pop();
                            break;
                        }
                    }
                } else {
                    return false;
                }
            }
        } else {
            transferredAmount = currentStake - _stake - _penalty;
            if (transferredAmount > 0) {
                if (!safeTransfer(_account, transferredAmount)) {
                    return false;
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
            if (currentSubcourtID == GENERAL_COURT) finished = true;
            else currentSubcourtID = courts[currentSubcourtID].parent;
        }

        emit StakeSet(_account, _subcourtID, _stake, newTotalStake);

        return true;
    }

    /** @dev Gets a subcourt ID, the minimum number of jurors and an ID of a dispute kit from a specified extra data bytes array.
     *  Note that if extradata contains an incorrect value then this value will be switched to default.
     *  @param _extraData The extra data bytes array. The first 32 bytes are the subcourt ID, the next are the minimum number of jurors and the last are the dispute kit ID.
     *  @return subcourtID The subcourt ID.
     *  @return minJurors The minimum number of jurors required.
     *  @return disputeKitID The ID of the dispute kit.
     */
    function extraDataToSubcourtIDMinJurorsDisputeKit(
        bytes memory _extraData
    ) internal view returns (uint96 subcourtID, uint256 minJurors, uint256 disputeKitID) {
        // Note that if the extradata doesn't contain 32 bytes for the dispute kit ID it'll return the default 0 index.
        if (_extraData.length >= 64) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                subcourtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
                disputeKitID := mload(add(_extraData, 0x60))
            }
            if (subcourtID == FORKING_COURT || subcourtID >= courts.length) {
                subcourtID = GENERAL_COURT;
            }
            if (minJurors == 0) {
                minJurors = MIN_JURORS;
            }
            if (disputeKitID == NULL_DISPUTE_KIT || disputeKitID >= disputeKitNodes.length) {
                disputeKitID = DISPUTE_KIT_CLASSIC; // 0 index is not used.
            }
        } else {
            subcourtID = GENERAL_COURT;
            minJurors = MIN_JURORS;
            disputeKitID = DISPUTE_KIT_CLASSIC;
        }
    }

    /** @dev Packs an account and a subcourt ID into a stake path ID.
     *  @param _account The address of the juror to pack.
     *  @param _subcourtID The subcourt ID to pack.
     *  @return stakePathID The stake path ID.
     */
    function accountAndSubcourtIDToStakePathID(
        address _account,
        uint96 _subcourtID
    ) internal pure returns (bytes32 stakePathID) {
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

    /** @dev Calls transfer() without reverting.
     *  @param _to Recepient address.
     *  @param _value Amount transferred.
     *  @return Whether transfer succeeded or not.
     */
    function safeTransfer(address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(pinakion).call(
            abi.encodeWithSelector(IERC20.transfer.selector, _to, _value)
        );
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }

    /** @dev Calls transferFrom() without reverting.
     *  @param _from Sender address.
     *  @param _to Recepient address.
     *  @param _value Amount transferred.
     *  @return Whether transfer succeeded or not.
     */
    function safeTransferFrom(address _from, address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(pinakion).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, _from, _to, _value)
        );
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }
}

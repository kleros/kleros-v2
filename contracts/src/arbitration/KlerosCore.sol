// SPDX-License-Identifier: MIT

/// @custom:authors: [@unknownunknown1, @jaybuidl]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IArbitrator.sol";
import "./IDisputeKit.sol";
import "./ISortitionModule.sol";

/// @title KlerosCore
/// Core arbitrator contract for Kleros v2.
/// Note that this contract trusts the token and the dispute kit contracts.
contract KlerosCore is IArbitrator {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

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
        bool disabled; // True if the court is disabled. Unused for now, will be implemented later.
    }

    struct Dispute {
        uint96 courtID; // The ID of the court the dispute is in.
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
        uint256 sumRewardPaid; // Total sum of arbitration fees paid to coherent jurors as a reward in this round.
        uint256 sumTokenRewardPaid; // Total sum of tokens paid to coherent jurors as a reward in this round.
    }

    struct Juror {
        uint96[] courtIDs; // The IDs of courts where the juror's stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        mapping(uint96 => uint256) stakedTokens; // The number of tokens the juror has staked in the court in the form `stakedTokens[courtID]`.
        mapping(uint96 => uint256) lockedTokens; // The number of tokens the juror has locked in the court in the form `lockedTokens[courtID]`.
    }

    struct DisputeKitNode {
        uint256 parent; // Index of the parent dispute kit. If it's 0 then this DK is a root.
        uint256[] children; // List of child dispute kits.
        IDisputeKit disputeKit; // The dispute kit implementation.
        uint256 depthLevel; // How far this DK is from the root. 0 for root DK.
        bool disabled; // True if the dispute kit is disabled and can't be used. This parameter is added preemptively to avoid storage changes in the future.
    }

    // Workaround "stack too deep" errors
    struct ExecuteParams {
        uint256 disputeID; // The ID of the dispute to execute.
        uint256 round; // The round to execute.
        uint256 coherentCount; // The number of coherent votes in the round.
        uint256 numberOfVotesInRound; // The number of votes in the round.
        uint256 penaltiesInRound; // The amount of tokens collected from penalties in the round.
        uint256 repartition; // The index of the repartition to execute.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint96 public constant FORKING_COURT = 0; // Index of the forking court.
    uint96 public constant GENERAL_COURT = 1; // Index of the default (general) court.
    uint256 public constant NULL_DISPUTE_KIT = 0; // Null pattern to indicate a top-level DK which has no parent.
    uint256 public constant DISPUTE_KIT_CLASSIC = 1; // Index of the default DK. 0 index is skipped.
    uint256 public constant DEFAULT_NB_OF_JURORS = 3; // The default number of jurors in a dispute.
    uint256 public constant ALPHA_DIVISOR = 1e4; // The number to divide `Court.alpha` by.
    uint256 public constant NON_PAYABLE_AMOUNT = (2 ** 256 - 2) / 2; // An amount higher than the supply of ETH.
    uint256 public constant SEARCH_ITERATIONS = 10; // Number of iterations to search for suitable parent court before jumping to the top court.

    address public governor; // The governor of the contract.
    IERC20 public pinakion; // The Pinakion token contract.
    // TODO: interactions with jurorProsecutionModule.
    address public jurorProsecutionModule; // The module for juror's prosecution.
    ISortitionModule public sortitionModule; // Sortition module for drawing.

    Court[] public courts; // The courts.
    DisputeKitNode[] public disputeKitNodes; // The list of DisputeKitNode, indexed by DisputeKitID.
    Dispute[] public disputes; // The disputes.

    mapping(address => Juror) internal jurors; // The jurors.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event StakeSet(address indexed _address, uint256 _courtID, uint256 _amount);
    event StakeDelayed(address indexed _address, uint256 _courtID, uint256 _amount, uint256 _penalty);
    event NewPeriod(uint256 indexed _disputeID, Period _period);
    event AppealPossible(uint256 indexed _disputeID, IArbitrable indexed _arbitrable);
    event AppealDecision(uint256 indexed _disputeID, IArbitrable indexed _arbitrable);
    event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _roundID, uint256 _voteID);
    event CourtCreated(
        uint256 indexed _courtID,
        uint96 indexed _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] _timesPerPeriod,
        uint256[] _supportedDisputeKits
    );
    event CourtModified(uint96 indexed _courtID, string _param);
    event DisputeKitCreated(
        uint256 indexed _disputeKitID,
        IDisputeKit indexed _disputeKitAddress,
        uint256 indexed _parent
    );
    event DisputeKitEnabled(uint96 indexed _courtID, uint256 indexed _disputeKitID, bool indexed _enable);
    event CourtJump(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint96 indexed _fromCourtID,
        uint96 _toCourtID
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
        uint256 indexed _roundID,
        uint256 _degreeOfCoherency,
        int256 _tokenAmount,
        int256 _ethAmount
    );
    event LeftoverRewardSent(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint256 _tokenAmount,
        uint256 _ethAmount
    );

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Governor only");
        _;
    }

    /// @dev Constructor.
    /// @param _governor The governor's address.
    /// @param _pinakion The address of the token contract.
    /// @param _jurorProsecutionModule The address of the juror prosecution module.
    /// @param _disputeKit The address of the default dispute kit.
    /// @param _hiddenVotes The `hiddenVotes` property value of the general court.
    /// @param _courtParameters Numeric parameters of General court (minStake, alpha, feeForJuror and jurorsForCourtJump respectively).
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the general court.
    /// @param _sortitionExtraData The extra data for sortition module.
    /// @param _sortitionModuleAddress The sortition module responsible for sortition of the jurors.
    constructor(
        address _governor,
        IERC20 _pinakion,
        address _jurorProsecutionModule,
        IDisputeKit _disputeKit,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        bytes memory _sortitionExtraData,
        ISortitionModule _sortitionModuleAddress
    ) {
        governor = _governor;
        pinakion = _pinakion;
        jurorProsecutionModule = _jurorProsecutionModule;
        sortitionModule = _sortitionModuleAddress;

        // NULL_DISPUTE_KIT: an empty element at index 0 to indicate when a node has no parent.
        disputeKitNodes.push();

        // DISPUTE_KIT_CLASSIC
        disputeKitNodes.push(
            DisputeKitNode({
                parent: NULL_DISPUTE_KIT,
                children: new uint256[](0),
                disputeKit: _disputeKit,
                depthLevel: 0,
                disabled: false
            })
        );
        emit DisputeKitCreated(DISPUTE_KIT_CLASSIC, _disputeKit, NULL_DISPUTE_KIT);

        // FORKING_COURT
        // TODO: Fill the properties for the Forking court, emit CourtCreated.
        courts.push();
        sortitionModule.createTree(bytes32(uint256(FORKING_COURT)), _sortitionExtraData);

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

        sortitionModule.createTree(bytes32(uint256(GENERAL_COURT)), _sortitionExtraData);

        emit CourtCreated(
            1,
            court.parent,
            _hiddenVotes,
            _courtParameters[0],
            _courtParameters[1],
            _courtParameters[2],
            _courtParameters[3],
            _timesPerPeriod,
            new uint256[](0)
        );
        _enableDisputeKit(GENERAL_COURT, DISPUTE_KIT_CLASSIC, true);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Allows the governor to call anything on behalf of the contract.
    /// @param _destination The destination of the call.
    /// @param _amount The value sent with the call.
    /// @param _data The data sent with the call.
    function executeGovernorProposal(
        address _destination,
        uint256 _amount,
        bytes memory _data
    ) external onlyByGovernor {
        (bool success, ) = _destination.call{value: _amount}(_data);
        require(success, "Unsuccessful call");
    }

    /// @dev Changes the `governor` storage variable.
    /// @param _governor The new value for the `governor` storage variable.
    function changeGovernor(address payable _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the `pinakion` storage variable.
    /// @param _pinakion The new value for the `pinakion` storage variable.
    function changePinakion(IERC20 _pinakion) external onlyByGovernor {
        pinakion = _pinakion;
    }

    /// @dev Changes the `jurorProsecutionModule` storage variable.
    /// @param _jurorProsecutionModule The new value for the `jurorProsecutionModule` storage variable.
    function changeJurorProsecutionModule(address _jurorProsecutionModule) external onlyByGovernor {
        jurorProsecutionModule = _jurorProsecutionModule;
    }

    /// @dev Changes the `_sortitionModule` storage variable.
    /// Note that the new module should be initialized for all courts.
    /// @param _sortitionModule The new value for the `sortitionModule` storage variable.
    function changeSortitionModule(ISortitionModule _sortitionModule) external onlyByGovernor {
        sortitionModule = _sortitionModule;
    }

    /// @dev Add a new supported dispute kit module to the court.
    /// @param _disputeKitAddress The address of the dispute kit contract.
    /// @param _parent The ID of the parent dispute kit. It is left empty when root DK is created.
    /// Note that the root DK must be supported by the general court.
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
                depthLevel: depthLevel,
                disabled: false
            })
        );

        disputeKitNodes[_parent].children.push(disputeKitID);
        emit DisputeKitCreated(disputeKitID, _disputeKitAddress, _parent);
        if (_parent == NULL_DISPUTE_KIT) {
            // A new dispute kit tree root should always be supported by the General court.
            _enableDisputeKit(GENERAL_COURT, disputeKitID, true);
        }
    }

    /// @dev Creates a court under a specified parent court.
    /// @param _parent The `parent` property value of the court.
    /// @param _hiddenVotes The `hiddenVotes` property value of the court.
    /// @param _minStake The `minStake` property value of the court.
    /// @param _alpha The `alpha` property value of the court.
    /// @param _feeForJuror The `feeForJuror` property value of the court.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the court.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the court.
    /// @param _sortitionExtraData Extra data for sortition module.
    /// @param _supportedDisputeKits Indexes of dispute kits that this court will support.
    function createCourt(
        uint96 _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod,
        bytes memory _sortitionExtraData,
        uint256[] memory _supportedDisputeKits
    ) external onlyByGovernor {
        require(courts[_parent].minStake <= _minStake, "MinStake lower than parent court");
        require(_supportedDisputeKits.length > 0, "!Supported DK");
        require(_parent != FORKING_COURT, "Invalid: Forking court as parent");

        uint256 courtID = courts.length;
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

        sortitionModule.createTree(bytes32(courtID), _sortitionExtraData);

        // Update the parent.
        courts[_parent].children.push(courtID);
        emit CourtCreated(
            courtID,
            _parent,
            _hiddenVotes,
            _minStake,
            _alpha,
            _feeForJuror,
            _jurorsForCourtJump,
            _timesPerPeriod,
            _supportedDisputeKits
        );
    }

    /// @dev Changes the `minStake` property value of a specified court. Don't set to a value lower than its parent's `minStake` property value.
    /// @param _courtID The ID of the court.
    /// @param _minStake The new value for the `minStake` property value.
    function changeCourtMinStake(uint96 _courtID, uint256 _minStake) external onlyByGovernor {
        require(
            _courtID == GENERAL_COURT || courts[courts[_courtID].parent].minStake <= _minStake,
            "MinStake lower than parent court"
        );
        for (uint256 i = 0; i < courts[_courtID].children.length; i++) {
            require(courts[courts[_courtID].children[i]].minStake >= _minStake, "MinStake lower than parent court");
        }

        courts[_courtID].minStake = _minStake;
        emit CourtModified(_courtID, "minStake");
    }

    /// @dev Changes the `alpha` property value of a specified court.
    /// @param _courtID The ID of the court.
    /// @param _alpha The new value for the `alpha` property value.
    function changeCourtAlpha(uint96 _courtID, uint256 _alpha) external onlyByGovernor {
        courts[_courtID].alpha = _alpha;
        emit CourtModified(_courtID, "alpha");
    }

    /// @dev Changes the `feeForJuror` property value of a specified court.
    /// @param _courtID The ID of the court.
    /// @param _feeForJuror The new value for the `feeForJuror` property value.
    function changeCourtJurorFee(uint96 _courtID, uint256 _feeForJuror) external onlyByGovernor {
        courts[_courtID].feeForJuror = _feeForJuror;
        emit CourtModified(_courtID, "feeForJuror");
    }

    /// @dev Changes the `jurorsForCourtJump` property value of a specified court.
    /// @param _courtID The ID of the court.
    /// @param _jurorsForCourtJump The new value for the `jurorsForCourtJump` property value.
    function changeCourtJurorsForJump(uint96 _courtID, uint256 _jurorsForCourtJump) external onlyByGovernor {
        courts[_courtID].jurorsForCourtJump = _jurorsForCourtJump;
        emit CourtModified(_courtID, "jurorsForCourtJump");
    }

    /// @dev Changes the `hiddenVotes` property value of a specified court.
    /// @param _courtID The ID of the court.
    /// @param _hiddenVotes The new value for the `hiddenVotes` property value.
    function changeCourtHiddenVotes(uint96 _courtID, bool _hiddenVotes) external onlyByGovernor {
        courts[_courtID].hiddenVotes = _hiddenVotes;
        emit CourtModified(_courtID, "hiddenVotes");
    }

    /// @dev Changes the `timesPerPeriod` property value of a specified court.
    /// @param _courtID The ID of the court.
    /// @param _timesPerPeriod The new value for the `timesPerPeriod` property value.
    function changeCourtTimesPerPeriod(uint96 _courtID, uint256[4] memory _timesPerPeriod) external onlyByGovernor {
        courts[_courtID].timesPerPeriod = _timesPerPeriod;
        emit CourtModified(_courtID, "timesPerPeriod");
    }

    /// @dev Adds/removes court's support for specified dispute kits.
    /// @param _courtID The ID of the court.
    /// @param _disputeKitIDs The IDs of dispute kits which support should be added/removed.
    /// @param _enable Whether add or remove the dispute kits from the court.
    function enableDisputeKits(uint96 _courtID, uint256[] memory _disputeKitIDs, bool _enable) external onlyByGovernor {
        for (uint256 i = 0; i < _disputeKitIDs.length; i++) {
            if (_enable) {
                require(_disputeKitIDs[i] > 0 && _disputeKitIDs[i] < disputeKitNodes.length, "Wrong DK index");
                _enableDisputeKit(_courtID, _disputeKitIDs[i], true);
            } else {
                require(
                    !(_courtID == GENERAL_COURT && disputeKitNodes[_disputeKitIDs[i]].parent == NULL_DISPUTE_KIT),
                    "Can't disable Root DK in General"
                );
                _enableDisputeKit(_courtID, _disputeKitIDs[i], false);
            }
        }
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Sets the caller's stake in a court.
    /// @param _courtID The ID of the court.
    /// @param _stake The new stake.
    function setStake(uint96 _courtID, uint256 _stake) external {
        require(_setStakeForAccount(msg.sender, _courtID, _stake, 0), "Staking failed");
    }

    function setStakeBySortitionModule(address _account, uint96 _courtID, uint256 _stake, uint256 _penalty) external {
        require(msg.sender == address(sortitionModule), "Wrong caller");
        _setStakeForAccount(_account, _courtID, _stake, _penalty);
    }

    /// @inheritdoc IArbitrator
    function createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData
    ) external payable override returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "Arbitration fees: not enough");

        (uint96 courtID, , uint256 disputeKitID) = _extraDataToCourtIDMinJurorsDisputeKit(_extraData);
        require(courts[courtID].supportedDisputeKits[disputeKitID], "DK unsupported by court");

        disputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.courtID = courtID;
        dispute.arbitrated = IArbitrable(msg.sender);
        dispute.lastPeriodChange = block.timestamp;

        IDisputeKit disputeKit = disputeKitNodes[disputeKitID].disputeKit;
        Court storage court = courts[dispute.courtID];
        Round storage round = dispute.rounds.push();
        round.nbVotes = msg.value / court.feeForJuror;
        round.disputeKitID = disputeKitID;
        round.tokensAtStakePerJuror = (court.minStake * court.alpha) / ALPHA_DIVISOR;
        round.totalFeesForJurors = msg.value;

        sortitionModule.createDisputeHook(disputeID, 0); // Default round ID.

        disputeKit.createDispute(disputeID, _numberOfChoices, _extraData, round.nbVotes);
        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    /// @inheritdoc IArbitrator
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData,
        address _feeToken,
        uint256 _feeAmount
    ) external override returns (uint256 disputeID) {
        // TODO
    }

    /// @dev Passes the period of a specified dispute.
    /// @param _disputeID The ID of the dispute.
    function passPeriod(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        Court storage court = courts[dispute.courtID];

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

    /// @dev Draws jurors for the dispute. Can be called in parts.
    /// @param _disputeID The ID of the dispute.
    /// @param _iterations The number of iterations to run.
    function draw(uint256 _disputeID, uint256 _iterations) external {
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
                jurors[drawnAddress].lockedTokens[dispute.courtID] += round.tokensAtStakePerJuror;
                emit Draw(drawnAddress, _disputeID, currentRound, round.drawnJurors.length);
                round.drawnJurors.push(drawnAddress);

                if (round.drawnJurors.length == round.nbVotes) {
                    sortitionModule.postDrawHook(_disputeID, currentRound);
                }
            }
        }
    }

    /// @dev Appeals the ruling of a specified dispute.
    /// Note: Access restricted to the Dispute Kit for this `disputeID`.
    /// @param _disputeID The ID of the dispute.
    /// @param _numberOfChoices Number of choices for the dispute. Can be required during court jump.
    /// @param _extraData Extradata for the dispute. Can be required during court jump.
    function appeal(uint256 _disputeID, uint256 _numberOfChoices, bytes memory _extraData) external payable {
        require(msg.value >= appealCost(_disputeID), "ETH too low for appeal cost");

        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.appeal, "Dispute not appealable");

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        require(msg.sender == address(disputeKitNodes[round.disputeKitID].disputeKit), "Dispute Kit only");

        uint96 newCourtID = dispute.courtID;
        uint256 newDisputeKitID = round.disputeKitID;

        // Warning: the extra round must be created before calling disputeKit.createDispute()
        Round storage extraRound = dispute.rounds.push();

        if (round.nbVotes >= courts[newCourtID].jurorsForCourtJump) {
            // Jump to parent court.
            newCourtID = courts[newCourtID].parent;

            for (uint256 i = 0; i < SEARCH_ITERATIONS; i++) {
                if (courts[newCourtID].supportedDisputeKits[newDisputeKitID]) {
                    break;
                } else if (disputeKitNodes[newDisputeKitID].parent != NULL_DISPUTE_KIT) {
                    newDisputeKitID = disputeKitNodes[newDisputeKitID].parent;
                } else {
                    // DK's parent has 0 index, that means we reached the root DK (0 depth level).
                    // Jump to the next parent court if the current court doesn't support any DK from this tree.
                    // Note that we don't reset newDisputeKitID in this case as, a precaution.
                    newCourtID = courts[newCourtID].parent;
                }
            }
            // We didn't find a court that is compatible with DK from this tree, so we jump directly to the top court.
            // Note that this can only happen when disputeKitID is at its root, and each root DK is supported by the top court by default.
            if (!courts[newCourtID].supportedDisputeKits[newDisputeKitID]) {
                newCourtID = GENERAL_COURT;
            }

            if (newCourtID != dispute.courtID) {
                emit CourtJump(_disputeID, dispute.rounds.length - 1, dispute.courtID, newCourtID);
            }
        }

        dispute.courtID = newCourtID;
        dispute.period = Period.evidence;
        dispute.lastPeriodChange = block.timestamp;

        Court storage court = courts[newCourtID];
        extraRound.nbVotes = msg.value / court.feeForJuror; // As many votes that can be afforded by the provided funds.
        extraRound.tokensAtStakePerJuror = (court.minStake * court.alpha) / ALPHA_DIVISOR;
        extraRound.totalFeesForJurors = msg.value;
        extraRound.disputeKitID = newDisputeKitID;

        sortitionModule.createDisputeHook(_disputeID, dispute.rounds.length - 1);

        // Dispute kit was changed, so create a dispute in the new DK contract.
        if (extraRound.disputeKitID != round.disputeKitID) {
            IDisputeKit disputeKit = disputeKitNodes[extraRound.disputeKitID].disputeKit;
            emit DisputeKitJump(_disputeID, dispute.rounds.length - 1, round.disputeKitID, extraRound.disputeKitID);
            disputeKit.createDispute(_disputeID, _numberOfChoices, _extraData, extraRound.nbVotes);
        }

        emit AppealDecision(_disputeID, dispute.arbitrated);
        emit NewPeriod(_disputeID, Period.evidence);
    }

    /// @dev Distribute tokens and ETH for the specific round of the dispute. Can be called in parts.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The appeal round.
    /// @param _iterations The number of iterations to run.
    function execute(uint256 _disputeID, uint256 _round, uint256 _iterations) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, "!Execution period");

        Round storage round = dispute.rounds[_round];
        IDisputeKit disputeKit = disputeKitNodes[round.disputeKitID].disputeKit;

        uint256 start = round.repartitions;
        uint256 end = round.repartitions + _iterations;

        uint256 penaltiesInRoundCache = round.penalties; // For saving gas.
        uint256 numberOfVotesInRound = round.drawnJurors.length;
        uint256 coherentCount = disputeKit.getCoherentCount(_disputeID, _round); // Total number of jurors that are eligible to a reward in this round.

        if (coherentCount == 0) {
            // We loop over the votes once as there are no rewards because it is not a tie and no one in this round is coherent with the final outcome.
            if (end > numberOfVotesInRound) end = numberOfVotesInRound;
        } else {
            // We loop over the votes twice, first to collect penalties, and second to distribute them as rewards along with arbitration fees.
            if (end > numberOfVotesInRound * 2) end = numberOfVotesInRound * 2;
        }
        round.repartitions = end;

        for (uint256 i = start; i < end; i++) {
            if (i < numberOfVotesInRound) {
                penaltiesInRoundCache = _executePenalties(
                    ExecuteParams(_disputeID, _round, coherentCount, numberOfVotesInRound, penaltiesInRoundCache, i)
                );
            } else {
                _executeRewards(
                    ExecuteParams(_disputeID, _round, coherentCount, numberOfVotesInRound, penaltiesInRoundCache, i)
                );
            }
        }
        if (round.penalties != penaltiesInRoundCache) {
            round.penalties = penaltiesInRoundCache; // Reentrancy risk: breaks Check-Effect-Interact
        }
    }

    /// @dev Distribute the tokens and ETH for the specific round of the dispute, penalties only.
    /// @param _params The parameters for the execution, see `ExecuteParams`.
    /// @return penaltiesInRoundCache The updated penalties in round cache.
    function _executePenalties(ExecuteParams memory _params) internal returns (uint256) {
        Dispute storage dispute = disputes[_params.disputeID];
        Round storage round = dispute.rounds[_params.round];
        IDisputeKit disputeKit = disputeKitNodes[round.disputeKitID].disputeKit;

        // [0, 1] value that determines how coherent the juror was in this round, in basis points.
        uint256 degreeOfCoherence = disputeKit.getDegreeOfCoherence(
            _params.disputeID,
            _params.round,
            _params.repartition
        );
        if (degreeOfCoherence > ALPHA_DIVISOR) {
            // Make sure the degree doesn't exceed 1, though it should be ensured by the dispute kit.
            degreeOfCoherence = ALPHA_DIVISOR;
        }

        // Fully coherent jurors won't be penalized.
        uint256 penalty = (round.tokensAtStakePerJuror * (ALPHA_DIVISOR - degreeOfCoherence)) / ALPHA_DIVISOR;
        _params.penaltiesInRound += penalty;

        // Unlock the tokens affected by the penalty
        address account = round.drawnJurors[_params.repartition];
        jurors[account].lockedTokens[dispute.courtID] -= penalty;

        // Apply the penalty to the staked tokens
        if (jurors[account].stakedTokens[dispute.courtID] >= courts[dispute.courtID].minStake + penalty) {
            // The juror still has enough staked token after penalty for this court.
            uint256 newStake = jurors[account].stakedTokens[dispute.courtID] - penalty;
            _setStakeForAccount(account, dispute.courtID, newStake, penalty);
        } else if (jurors[account].stakedTokens[dispute.courtID] != 0) {
            // The juror does not have enough staked tokens after penalty for this court, unstake them.
            _setStakeForAccount(account, dispute.courtID, 0, penalty);
        }
        emit TokenAndETHShift(account, _params.disputeID, _params.round, degreeOfCoherence, -int256(penalty), 0);

        if (!disputeKit.isVoteActive(_params.disputeID, _params.round, _params.repartition)) {
            // The juror is inactive, unstake them.
            sortitionModule.setJurorInactive(account);
        }
        if (_params.repartition == _params.numberOfVotesInRound - 1 && _params.coherentCount == 0) {
            // No one was coherent, send the rewards to the governor.
            payable(governor).send(round.totalFeesForJurors);
            _safeTransfer(governor, _params.penaltiesInRound);
            emit LeftoverRewardSent(
                _params.disputeID,
                _params.round,
                _params.penaltiesInRound,
                round.totalFeesForJurors
            );
        }
        return _params.penaltiesInRound;
    }

    /// @dev Distribute the tokens and ETH for the specific round of the dispute, rewards only.
    /// @param _params The parameters for the execution, see `ExecuteParams`.
    function _executeRewards(ExecuteParams memory _params) internal {
        Dispute storage dispute = disputes[_params.disputeID];
        Round storage round = dispute.rounds[_params.round];
        IDisputeKit disputeKit = disputeKitNodes[round.disputeKitID].disputeKit;

        // [0, 1] value that determines how coherent the juror was in this round, in basis points.
        uint256 degreeOfCoherence = disputeKit.getDegreeOfCoherence(
            _params.disputeID,
            _params.round,
            _params.repartition % _params.numberOfVotesInRound
        );

        // Make sure the degree doesn't exceed 1, though it should be ensured by the dispute kit.
        if (degreeOfCoherence > ALPHA_DIVISOR) {
            degreeOfCoherence = ALPHA_DIVISOR;
        }

        address account = round.drawnJurors[_params.repartition % _params.numberOfVotesInRound];
        uint256 tokenLocked = (round.tokensAtStakePerJuror * degreeOfCoherence) / ALPHA_DIVISOR;

        // Release the rest of the tokens of the juror for this round.
        jurors[account].lockedTokens[dispute.courtID] -= tokenLocked;

        // Give back the locked tokens in case the juror fully unstaked earlier.
        if (jurors[account].stakedTokens[dispute.courtID] == 0) {
            _safeTransfer(account, tokenLocked);
        }

        // Transfer the rewards
        uint256 tokenReward = ((_params.penaltiesInRound / _params.coherentCount) * degreeOfCoherence) / ALPHA_DIVISOR;
        round.sumTokenRewardPaid += tokenReward;
        uint256 ethReward = ((round.totalFeesForJurors / _params.coherentCount) * degreeOfCoherence) / ALPHA_DIVISOR;
        round.sumRewardPaid += ethReward;
        _safeTransfer(account, tokenReward);
        payable(account).send(ethReward);
        emit TokenAndETHShift(
            account,
            _params.disputeID,
            _params.round,
            degreeOfCoherence,
            int256(tokenReward),
            int256(ethReward)
        );

        // Transfer any residual rewards to the governor. It may happen due to partial coherence of the jurors.
        if (_params.repartition == _params.numberOfVotesInRound * 2 - 1) {
            uint256 leftoverTokenReward = _params.penaltiesInRound - round.sumTokenRewardPaid;
            uint256 leftoverReward = round.totalFeesForJurors - round.sumRewardPaid;
            if (leftoverTokenReward != 0 || leftoverReward != 0) {
                if (leftoverTokenReward != 0) {
                    _safeTransfer(governor, leftoverTokenReward);
                }
                if (leftoverReward != 0) {
                    payable(governor).send(leftoverReward);
                }
                emit LeftoverRewardSent(_params.disputeID, _params.round, leftoverTokenReward, leftoverReward);
            }
        }
    }

    /// @dev Executes a specified dispute's ruling. UNTRUSTED.
    /// @param _disputeID The ID of the dispute.
    function executeRuling(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, "!Execution period");
        require(!dispute.ruled, "Ruling already executed");

        (uint256 winningChoice, , ) = currentRuling(_disputeID);
        dispute.ruled = true;
        emit Ruling(dispute.arbitrated, _disputeID, winningChoice);
        dispute.arbitrated.rule(_disputeID, winningChoice);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Gets the cost of arbitration in a specified court.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the court to create the dispute in (first 32 bytes)
    /// and the minimum number of jurors required (next 32 bytes).
    /// @return cost The arbitration cost.
    function arbitrationCost(bytes memory _extraData) public view override returns (uint256 cost) {
        (uint96 courtID, uint256 minJurors, ) = _extraDataToCourtIDMinJurorsDisputeKit(_extraData);
        cost = courts[courtID].feeForJuror * minJurors;
    }

    /// @dev Gets the cost of appealing a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return cost The appeal cost.
    function appealCost(uint256 _disputeID) public view returns (uint256 cost) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        Court storage court = courts[dispute.courtID];
        if (round.nbVotes >= court.jurorsForCourtJump) {
            // Jump to parent court.
            if (dispute.courtID == GENERAL_COURT) {
                // TODO: Handle the forking when appealed in General court.
                cost = NON_PAYABLE_AMOUNT; // Get the cost of the parent court.
            } else {
                cost = courts[court.parent].feeForJuror * ((round.nbVotes * 2) + 1);
            }
        } else {
            // Stay in current court.
            cost = court.feeForJuror * ((round.nbVotes * 2) + 1);
        }
    }

    /// @inheritdoc IArbitrator
    function supposedFeeTokens() external view override returns (address[] memory) {
        // TODO
        return new address[](0);
    }

    /// @dev Gets the start and the end of a specified dispute's current appeal period.
    /// @param _disputeID The ID of the dispute.
    /// @return start The start of the appeal period.
    /// @return end The end of the appeal period.
    function appealPeriod(uint256 _disputeID) public view returns (uint256 start, uint256 end) {
        Dispute storage dispute = disputes[_disputeID];
        if (dispute.period == Period.appeal) {
            start = dispute.lastPeriodChange;
            end = dispute.lastPeriodChange + courts[dispute.courtID].timesPerPeriod[uint256(Period.appeal)];
        } else {
            start = 0;
            end = 0;
        }
    }

    /// @dev Gets the current ruling of a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
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
            uint256 disputeKitID,
            uint256 sumRewardPaid,
            uint256 sumTokenRewardPaid
        )
    {
        Round storage round = disputes[_disputeID].rounds[_round];
        return (
            round.tokensAtStakePerJuror,
            round.totalFeesForJurors,
            round.repartitions,
            round.penalties,
            round.drawnJurors,
            round.disputeKitID,
            round.sumRewardPaid,
            round.sumTokenRewardPaid
        );
    }

    function getNumberOfRounds(uint256 _disputeID) external view returns (uint256) {
        return disputes[_disputeID].rounds.length;
    }

    function getJurorBalance(
        address _juror,
        uint96 _courtID
    ) external view returns (uint256 staked, uint256 locked, uint256 nbCourts) {
        Juror storage juror = jurors[_juror];
        staked = juror.stakedTokens[_courtID];
        locked = juror.lockedTokens[_courtID];
        nbCourts = juror.courtIDs.length;
    }

    function isSupported(uint96 _courtID, uint256 _disputeKitID) external view returns (bool) {
        return courts[_courtID].supportedDisputeKits[_disputeKitID];
    }

    /// @dev Gets non-primitive properties of a specified dispute kit node.
    /// @param _disputeKitID The ID of the dispute kit.
    /// @return children Indexes of children of this DK.
    function getDisputeKitChildren(uint256 _disputeKitID) external view returns (uint256[] memory) {
        return disputeKitNodes[_disputeKitID].children;
    }

    /// @dev Gets the timesPerPeriod array for a given court.
    /// @param _courtID The ID of the court to get the times from.
    /// @return timesPerPeriod The timesPerPeriod array for the given court.
    function getTimesPerPeriod(uint96 _courtID) external view returns (uint256[4] memory timesPerPeriod) {
        Court storage court = courts[_courtID];
        timesPerPeriod = court.timesPerPeriod;
    }

    // ************************************* //
    // *   Public Views for Dispute Kits   * //
    // ************************************* //

    /// @dev Gets the number of votes permitted for the specified dispute in the latest round.
    /// @param _disputeID The ID of the dispute.
    function getNumberOfVotes(uint256 _disputeID) external view returns (uint256) {
        Dispute storage dispute = disputes[_disputeID];
        return dispute.rounds[dispute.rounds.length - 1].nbVotes;
    }

    /// @dev Returns true if the dispute kit will be switched to a parent DK.
    /// @param _disputeID The ID of the dispute.
    /// @return Whether DK will be switched or not.
    function isDisputeKitJumping(uint256 _disputeID) external view returns (bool) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        Court storage court = courts[dispute.courtID];

        if (round.nbVotes < court.jurorsForCourtJump) {
            return false;
        }

        // Jump if the parent court doesn't support the current DK.
        return !courts[court.parent].supportedDisputeKits[round.disputeKitID];
    }

    function getDisputeKitNodesLength() external view returns (uint256) {
        return disputeKitNodes.length;
    }

    /// @dev Gets the dispute kit for a specific `_disputeKitID`.
    /// @param _disputeKitID The ID of the dispute kit.
    function getDisputeKit(uint256 _disputeKitID) external view returns (IDisputeKit) {
        return disputeKitNodes[_disputeKitID].disputeKit;
    }

    /// @dev Gets the court identifiers where a specific `_juror` has staked.
    /// @param _juror The address of the juror.
    function getJurorCourtIDs(address _juror) public view returns (uint96[] memory) {
        return jurors[_juror].courtIDs;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Toggles the dispute kit support for a given court.
    /// @param _courtID The ID of the court to toggle the support for.
    /// @param _disputeKitID The ID of the dispute kit to toggle the support for.
    /// @param _enable Whether to enable or disable the support.
    function _enableDisputeKit(uint96 _courtID, uint256 _disputeKitID, bool _enable) internal {
        courts[_courtID].supportedDisputeKits[_disputeKitID] = _enable;
        emit DisputeKitEnabled(_courtID, _disputeKitID, _enable);
    }

    /// @dev Sets the specified juror's stake in a court.
    /// `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _stake The new stake.
    /// @param _penalty Penalized amount won't be transferred back to juror when the stake is lowered.
    /// @return succeeded True if the call succeeded, false otherwise.
    function _setStakeForAccount(
        address _account,
        uint96 _courtID,
        uint256 _stake,
        uint256 _penalty
    ) internal returns (bool succeeded) {
        if (_courtID == FORKING_COURT || _courtID > courts.length) return false;

        Juror storage juror = jurors[_account];
        uint256 currentStake = juror.stakedTokens[_courtID];

        if (_stake != 0) {
            // Check against locked tokens in case the min stake was lowered.
            if (_stake < courts[_courtID].minStake || _stake < juror.lockedTokens[_courtID]) return false;
        }

        ISortitionModule.preStakeHookResult result = sortitionModule.preStakeHook(_account, _courtID, _stake, _penalty);
        if (result == ISortitionModule.preStakeHookResult.failed) {
            return false;
        } else if (result == ISortitionModule.preStakeHookResult.delayed) {
            emit StakeDelayed(_account, _courtID, _stake, _penalty);
            return true;
        }

        uint256 transferredAmount;
        if (_stake >= currentStake) {
            transferredAmount = _stake - currentStake;
            if (transferredAmount > 0) {
                if (_safeTransferFrom(_account, address(this), transferredAmount)) {
                    if (currentStake == 0) {
                        juror.courtIDs.push(_courtID);
                    }
                } else {
                    return false;
                }
            }
        } else {
            if (_stake == 0) {
                // Keep locked tokens in the contract and release them after dispute is executed.
                transferredAmount = currentStake - juror.lockedTokens[_courtID] - _penalty;
                if (transferredAmount > 0) {
                    if (_safeTransfer(_account, transferredAmount)) {
                        for (uint256 i = juror.courtIDs.length; i > 0; i--) {
                            if (juror.courtIDs[i - 1] == _courtID) {
                                juror.courtIDs[i - 1] = juror.courtIDs[juror.courtIDs.length - 1];
                                juror.courtIDs.pop();
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
                    if (!_safeTransfer(_account, transferredAmount)) {
                        return false;
                    }
                }
            }
        }

        // Update juror's records.
        juror.stakedTokens[_courtID] = _stake;

        sortitionModule.setStake(_account, _courtID, _stake);
        emit StakeSet(_account, _courtID, _stake);
        return true;
    }

    /// @dev Gets a court ID, the minimum number of jurors and an ID of a dispute kit from a specified extra data bytes array.
    /// Note that if extradata contains an incorrect value then this value will be switched to default.
    /// @param _extraData The extra data bytes array. The first 32 bytes are the court ID, the next are the minimum number of jurors and the last are the dispute kit ID.
    /// @return courtID The court ID.
    /// @return minJurors The minimum number of jurors required.
    /// @return disputeKitID The ID of the dispute kit.
    function _extraDataToCourtIDMinJurorsDisputeKit(
        bytes memory _extraData
    ) internal view returns (uint96 courtID, uint256 minJurors, uint256 disputeKitID) {
        // Note that if the extradata doesn't contain 32 bytes for the dispute kit ID it'll return the default 0 index.
        if (_extraData.length >= 64) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                courtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
                disputeKitID := mload(add(_extraData, 0x60))
            }
            if (courtID == FORKING_COURT || courtID >= courts.length) {
                courtID = GENERAL_COURT;
            }
            if (minJurors == 0) {
                minJurors = DEFAULT_NB_OF_JURORS;
            }
            if (disputeKitID == NULL_DISPUTE_KIT || disputeKitID >= disputeKitNodes.length) {
                disputeKitID = DISPUTE_KIT_CLASSIC; // 0 index is not used.
            }
        } else {
            courtID = GENERAL_COURT;
            minJurors = DEFAULT_NB_OF_JURORS;
            disputeKitID = DISPUTE_KIT_CLASSIC;
        }
    }

    /// @dev Calls transfer() without reverting.
    /// @param _to Recepient address.
    /// @param _value Amount transferred.
    /// @return Whether transfer succeeded or not.
    function _safeTransfer(address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(pinakion).call(abi.encodeCall(IERC20.transfer, (_to, _value)));
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }

    /// @dev Calls transferFrom() without reverting.
    /// @param _from Sender address.
    /// @param _to Recepient address.
    /// @param _value Amount transferred.
    /// @return Whether transfer succeeded or not.
    function _safeTransferFrom(address _from, address _to, uint256 _value) internal returns (bool) {
        (bool success, bytes memory data) = address(pinakion).call(
            abi.encodeCall(IERC20.transferFrom, (_from, _to, _value))
        );
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }
}

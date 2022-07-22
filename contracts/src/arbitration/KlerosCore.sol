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
import "../data-structures/ISortitionModule.sol";

/**
 *  @title KlerosCore
 *  Core arbitrator contract for Kleros v2.
 *  Note that this contract trusts the token and the dispute kit contracts.
 */
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

    enum SortitionFlags {
        CreateDisputeHook, // Set to true if the hook is needed after dispute creation.
        PreStakeHook, // Set to true if the module requires a hook before staking.
        StoreStakeValues // Set to true if staked values should be stored within the module.
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
        uint256 depthLevel; // How far this DK is from the root. 0 for root DK.
    }

    struct SortitionModuleStruct {
        uint256 flags; // Bitmap of flags for this sortition module.
        mapping(bytes32 => bool) courtInitialized; // True if the court with this ID has been initialialized in the module. Only checked if the flag is raised.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant FORKING_COURT = 0; // Index of the forking court.
    uint256 public constant GENERAL_COURT = 1; // Index of the default (general) court.
    uint256 public constant NULL_DISPUTE_KIT = 0; // Null pattern to indicate a top-level DK which has no parent.
    uint256 public constant DISPUTE_KIT_CLASSIC_INDEX = 1; // Index of the default DK. 0 index is skipped.
    uint256 public constant MIN_JURORS = 3; // The global default minimum number of jurors in a dispute.
    uint256 public constant ALPHA_DIVISOR = 1e4; // The number to divide `Court.alpha` by.
    uint256 public constant NON_PAYABLE_AMOUNT = (2**256 - 2) / 2; // An amount higher than the supply of ETH.
    uint256 public constant SEARCH_ITERATIONS = 10; // Number of iterations to search for suitable parent court before jumping to the top court.

    address public governor; // The governor of the contract.
    IERC20 public pinakion; // The Pinakion token contract.
    // TODO: interactions with jurorProsecutionModule.
    address public jurorProsecutionModule; // The module for juror's prosecution.

    Court[] public courts; // The subcourts.
    DisputeKitNode[] public disputeKitNodes; // The list of DisputeKitNode, indexed by DisputeKitID.
    Dispute[] public disputes; // The disputes.
    ISortitionModule[] public sortitionModules; // Stores the addresses of added modules.

    mapping(ISortitionModule => SortitionModuleStruct) public sortitionModuleData; // Data of sortition modules.
    mapping(IDisputeKit => ISortitionModule) public disputeKitToSortition; // Maps dispute kit to its respective sortition module.
    mapping(address => Juror) internal jurors; // The jurors.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event StakeSet(address indexed _address, uint256 _subcourtID, uint256 _amount);
    event NewPeriod(uint256 indexed _disputeID, Period _period);
    event AppealPossible(uint256 indexed _disputeID, IArbitrable indexed _arbitrable);
    event AppealDecision(uint256 indexed _disputeID, IArbitrable indexed _arbitrable);
    event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _roundID, uint256 _voteID);
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
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    /** @dev Constructor.
     *  @param _governor The governor's address.
     *  @param _pinakion The address of the token contract.
     *  @param _jurorProsecutionModule The address of the juror prosecution module.
     *  @param _disputeKit The address of the default dispute kit.
     *  @param _hiddenVotes The `hiddenVotes` property value of the general court.
     *  @param _courtParameters Numeric parameters of General court (minStake, alpha, feeForJuror and jurorsForCourtJump respectively).
     *  @param _timesPerPeriod The `timesPerPeriod` property value of the general court.
     *  @param _sortitionExtraData The extra data for sortition module.
     *  @param _sortitionModuleAddress The initial sortition module responsible for sortition of the jurors.
     *  @param _sortitionModuleFlags Flags for sortition module.
     */
    constructor(
        address _governor,
        IERC20 _pinakion,
        address _jurorProsecutionModule,
        IDisputeKit _disputeKit,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        bytes memory _sortitionExtraData,
        ISortitionModule _sortitionModuleAddress,
        uint256 _sortitionModuleFlags
    ) {
        governor = _governor;
        pinakion = _pinakion;
        jurorProsecutionModule = _jurorProsecutionModule;

        disputeKitNodes.push(); // NULL_DISPUTE_KIT: an empty element at index 0 to indicate when a node has no parent.
        disputeKitNodes.push(
            DisputeKitNode({parent: 0, children: new uint256[](0), disputeKit: _disputeKit, depthLevel: 0})
        );
        disputeKitToSortition[_disputeKit] = _sortitionModuleAddress;

        // Create the Forking court.
        courts.push();
        // TODO: fill the properties for Forking court.

        // Create the General court.
        Court storage court = courts.push();
        court.parent = 1; // TODO: Should the parent for General court be 0 or 1? In the former case the Forking court will become the top court after jumping.
        court.children = new uint256[](0);
        court.hiddenVotes = _hiddenVotes;
        court.minStake = _courtParameters[0];
        court.alpha = _courtParameters[1];
        court.feeForJuror = _courtParameters[2];
        court.jurorsForCourtJump = _courtParameters[3];
        court.timesPerPeriod = _timesPerPeriod;
        court.supportedDisputeKits[DISPUTE_KIT_CLASSIC_INDEX] = true;

        SortitionModuleStruct storage sortitionModule = sortitionModuleData[_sortitionModuleAddress];
        sortitionModule.flags = _sortitionModuleFlags;
        sortitionModules.push(_sortitionModuleAddress);

        _sortitionModuleAddress.initialize(bytes32(FORKING_COURT), _sortitionExtraData);
        _sortitionModuleAddress.initialize(bytes32(GENERAL_COURT), _sortitionExtraData);

        sortitionModule.courtInitialized[bytes32(FORKING_COURT)] = true;
        sortitionModule.courtInitialized[bytes32(GENERAL_COURT)] = true;
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

    /** @dev Adds new sortition module to the array.
     *  @param _sortitionModule The new sortition module to add.
     *  @param _sortitionModuleFlags Flags for sortition module.
     */
    function addSortitionModule(ISortitionModule _sortitionModule, uint256 _sortitionModuleFlags)
        external
        onlyByGovernor
    {
        SortitionModuleStruct storage sortitionModule = sortitionModuleData[_sortitionModule];
        sortitionModule.flags = _sortitionModuleFlags;
        sortitionModules.push(_sortitionModule);
    }

    /** @dev Add a new supported dispute kit module to the court.
     *  @param _disputeKitAddress The address of the dispute kit contract.
     *  @param _parent The ID of the parent dispute kit. It is left empty when root DK is created.
     *  @param _sortitionModuleAddress The address of the relevant sortition module.
     *  Note that the root DK must be supported by the general court.
     */
    function addNewDisputeKit(
        IDisputeKit _disputeKitAddress,
        uint256 _parent,
        ISortitionModule _sortitionModuleAddress
    ) external onlyByGovernor {
        uint256 disputeKitID = disputeKitNodes.length;
        require(_parent < disputeKitID, "Parent doesn't exist");
        uint256 depthLevel;

        // Create new tree, which root should be supported by General court.
        if (_parent == NULL_DISPUTE_KIT) {
            courts[GENERAL_COURT].supportedDisputeKits[disputeKitID] = true;
        } else {
            depthLevel = disputeKitNodes[_parent].depthLevel + 1;
            // It should be always possible to reach the root from the leaf with the defined number of search iterations.
            require(depthLevel < SEARCH_ITERATIONS, "Depth level is at max");
        }
        disputeKitNodes.push(
            DisputeKitNode({
                parent: _parent,
                children: new uint256[](0),
                disputeKit: _disputeKitAddress,
                depthLevel: depthLevel
            })
        );
        disputeKitToSortition[_disputeKitAddress] = _sortitionModuleAddress;
        disputeKitNodes[_parent].children.push(disputeKitID);
    }

    /** @dev Creates a subcourt under a specified parent court.
     *  @param _parent The `parent` property value of the subcourt.
     *  @param _hiddenVotes The `hiddenVotes` property value of the subcourt.
     *  @param _minStake The `minStake` property value of the subcourt.
     *  @param _alpha The `alpha` property value of the subcourt.
     *  @param _feeForJuror The `feeForJuror` property value of the subcourt.
     *  @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the subcourt.
     *  @param _timesPerPeriod The `timesPerPeriod` property value of the subcourt.
     *  @param _sortitionExtraData Extra data for sortition module.
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
        bytes memory _sortitionExtraData,
        uint256[] memory _supportedDisputeKits
    ) external onlyByGovernor {
        require(
            courts[_parent].minStake <= _minStake,
            "A subcourt cannot be a child of a subcourt with a higher minimum stake."
        );
        require(_supportedDisputeKits.length > 0, "Must support at least one DK");
        require(_parent != FORKING_COURT, "Can't have Forking court as a parent");

        uint256 subcourtID = courts.length;
        Court storage court = courts.push();

        for (uint256 i = 0; i < _supportedDisputeKits.length; i++) {
            require(
                _supportedDisputeKits[i] > 0 && _supportedDisputeKits[i] < disputeKitNodes.length,
                "Wrong DK index"
            );
            court.supportedDisputeKits[_supportedDisputeKits[i]] = true;

            ISortitionModule sortitionModuleAddress = disputeKitToSortition[
                disputeKitNodes[_supportedDisputeKits[i]].disputeKit
            ];
            SortitionModuleStruct storage sortitionModule = sortitionModuleData[sortitionModuleAddress];
            if (!sortitionModule.courtInitialized[bytes32(subcourtID)]) {
                sortitionModuleAddress.initialize(bytes32(subcourtID), _sortitionExtraData);
                sortitionModule.courtInitialized[bytes32(subcourtID)] = true;
            }
        }

        court.parent = _parent;
        court.children = new uint256[](0);
        court.hiddenVotes = _hiddenVotes;
        court.minStake = _minStake;
        court.alpha = _alpha;
        court.feeForJuror = _feeForJuror;
        court.jurorsForCourtJump = _jurorsForCourtJump;
        court.timesPerPeriod = _timesPerPeriod;

        // Update the parent.
        courts[_parent].children.push(subcourtID);
    }

    /** @dev Changes the `minStake` property value of a specified subcourt. Don't set to a value lower than its parent's `minStake` property value.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _minStake The new value for the `minStake` property value.
     */
    function changeSubcourtMinStake(uint96 _subcourtID, uint256 _minStake) external onlyByGovernor {
        require(_subcourtID == GENERAL_COURT || courts[courts[_subcourtID].parent].minStake <= _minStake);
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

    /** @dev Changes the `hiddenVotes` property value of a specified subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _hiddenVotes The new value for the `hiddenVotes` property value.
     */
    function changeHiddenVotes(uint96 _subcourtID, bool _hiddenVotes) external onlyByGovernor {
        courts[_subcourtID].hiddenVotes = _hiddenVotes;
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

    /** @dev Adds/removes court's support for specified dispute kits..
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
                subcourt.supportedDisputeKits[_disputeKitIDs[i]] = true;
            } else {
                require(
                    !(_subcourtID == GENERAL_COURT && disputeKitNodes[_disputeKitIDs[i]].parent == NULL_DISPUTE_KIT),
                    "Can't remove root DK support from the general court"
                );
                subcourt.supportedDisputeKits[_disputeKitIDs[i]] = false;
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

    function setStakeBySortitionModule(
        address _account,
        uint96 _subcourtID,
        uint256 _stake,
        uint256 _penalty
    ) external {
        // Use courtInitialized mapping to check the validity of the caller.
        require(
            sortitionModuleData[ISortitionModule(msg.sender)].courtInitialized[bytes32(uint256(_subcourtID))],
            "Wrong caller"
        );
        setStakeForAccount(_account, _subcourtID, _stake, _penalty);
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
        (uint96 subcourtID, , uint256 disputeKitID) = extraDataToSubcourtIDMinJurorsDisputeKit(_extraData);

        require(
            courts[subcourtID].supportedDisputeKits[disputeKitID],
            "The dispute kit is not supported by this subcourt"
        );

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

        uint256 sortitionFlag = 1 << uint256(SortitionFlags.CreateDisputeHook);
        ISortitionModule sortitionModuleAddress = disputeKitToSortition[disputeKit];
        if (sortitionFlag & sortitionModuleData[sortitionModuleAddress].flags == sortitionFlag) {
            sortitionModuleAddress.createDisputeHook(disputeID, 0); // Default round ID.
        }

        disputeKit.createDispute(disputeID, _numberOfChoices, _extraData, round.nbVotes);
        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
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
                "The evidence period time has not passed yet and it is not an appeal."
            );
            require(round.drawnJurors.length == round.nbVotes, "The dispute has not finished drawing yet.");
            dispute.period = court.hiddenVotes ? Period.commit : Period.vote;
        } else if (dispute.period == Period.commit) {
            require(
                block.timestamp - dispute.lastPeriodChange >= court.timesPerPeriod[uint256(dispute.period)] ||
                    disputeKitNodes[round.disputeKitID].disputeKit.areCommitsAllCast(_disputeID),
                "The commit period time has not passed yet."
            );
            dispute.period = Period.vote;
        } else if (dispute.period == Period.vote) {
            require(
                block.timestamp - dispute.lastPeriodChange >= court.timesPerPeriod[uint256(dispute.period)] ||
                    disputeKitNodes[round.disputeKitID].disputeKit.areVotesAllCast(_disputeID),
                "The vote period time has not passed yet"
            );
            dispute.period = Period.appeal;
            emit AppealPossible(_disputeID, dispute.arbitrated);
        } else if (dispute.period == Period.appeal) {
            require(
                block.timestamp - dispute.lastPeriodChange >= court.timesPerPeriod[uint256(dispute.period)],
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
        uint256 currentRound = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[currentRound];
        require(dispute.period == Period.evidence, "Should be evidence period.");

        IDisputeKit disputeKit = disputeKitNodes[round.disputeKitID].disputeKit;

        uint256 startIndex = round.drawnJurors.length;
        uint256 endIndex = startIndex + _iterations <= round.nbVotes ? startIndex + _iterations : round.nbVotes;

        for (uint256 i = startIndex; i < endIndex; i++) {
            address drawnAddress = disputeKit.draw(_disputeID);
            if (drawnAddress != address(0)) {
                // In case no one has staked at the court yet.
                jurors[drawnAddress].lockedTokens[dispute.subcourtID] += round.tokensAtStakePerJuror;
                round.drawnJurors.push(drawnAddress);
                emit Draw(drawnAddress, _disputeID, currentRound, i);
            }
        }
    }

    /** @dev Appeals the ruling of a specified dispute.
     *  Note: Access restricted to the Dispute Kit for this `disputeID`.
     *  @param _disputeID The ID of the dispute.
     *  @param _numberOfChoices Number of choices for the dispute. Can be required during court jump.
     *  @param _extraData Extradata for the dispute. Can be required during court jump.
     */
    function appeal(
        uint256 _disputeID,
        uint256 _numberOfChoices,
        bytes memory _extraData
    ) external payable {
        require(msg.value >= appealCost(_disputeID), "Not enough ETH to cover appeal cost.");

        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.appeal, "Dispute is not appealable.");

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        require(
            msg.sender == address(disputeKitNodes[round.disputeKitID].disputeKit),
            "Access not allowed: Dispute Kit only."
        );

        uint96 newSubcourtID = dispute.subcourtID;
        uint256 newDisputeKitID = round.disputeKitID;

        // Warning: the extra round must be created before calling disputeKit.createDispute()
        Round storage extraRound = dispute.rounds.push();

        if (round.nbVotes >= courts[newDisputeKitID].jurorsForCourtJump) {
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
                newSubcourtID = uint96(GENERAL_COURT);
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

        IDisputeKit disputeKit = disputeKitNodes[extraRound.disputeKitID].disputeKit;

        uint256 sortitionFlag = 1 << uint256(SortitionFlags.CreateDisputeHook);
        ISortitionModule sortitionModuleAddress = disputeKitToSortition[disputeKit];
        if (sortitionFlag & sortitionModuleData[sortitionModuleAddress].flags == sortitionFlag) {
            sortitionModuleAddress.createDisputeHook(_disputeID, dispute.rounds.length - 1);
        }

        // Dispute kit was changed, so create a dispute in the new DK contract.
        if (extraRound.disputeKitID != round.disputeKitID) {
            emit DisputeKitJump(_disputeID, dispute.rounds.length - 1, round.disputeKitID, extraRound.disputeKitID);
            disputeKit.createDispute(_disputeID, _numberOfChoices, _extraData, extraRound.nbVotes);
        }

        emit AppealDecision(_disputeID, dispute.arbitrated);
        emit NewPeriod(_disputeID, Period.evidence);
    }

    /** @dev Distribute tokens and ETH for the specific round of the dispute. Can be called in parts.
     *  @param _disputeID The ID of the dispute.
     *  @param _round The appeal round.
     *  @param _iterations The number of iterations to run.
     */
    function execute(
        uint256 _disputeID,
        uint256 _round,
        uint256 _iterations
    ) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, "Should be execution period.");

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
                    for (uint256 j = 0; j < jurors[account].subcourtIDs.length; j++) {
                        setStakeForAccount(account, jurors[account].subcourtIDs[j], 0, 0);
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
        require(dispute.period == Period.execution, "Should be execution period.");
        require(!dispute.ruled, "Ruling already executed.");

        uint256 winningChoice = currentRuling(_disputeID);
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
     */
    function currentRuling(uint256 _disputeID) public view returns (uint256 ruling) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        IDisputeKit disputeKit = disputeKitNodes[round.disputeKitID].disputeKit;
        return disputeKit.currentRuling(_disputeID);
    }

    function getRoundInfo(uint256 _disputeID, uint256 _round)
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
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[_round];
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
        Dispute storage dispute = disputes[_disputeID];
        return dispute.rounds.length;
    }

    function getJurorBalance(address _juror, uint96 _subcourtID)
        external
        view
        returns (
            uint256 staked,
            uint256 locked,
            uint256 nbSubcourts
        )
    {
        Juror storage juror = jurors[_juror];
        staked = juror.stakedTokens[_subcourtID];
        locked = juror.lockedTokens[_subcourtID];
        nbSubcourts = juror.subcourtIDs.length;
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

    // TODO: some getters can be merged into a single function

    function drawAddressFromSortition(bytes32 _key, uint256 _drawnNumber) external view returns (address drawnAddress) {
        ISortitionModule sortitionModuleAddress = disputeKitToSortition[IDisputeKit(msg.sender)];
        drawnAddress = sortitionModuleAddress.draw(_key, _drawnNumber);
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

    function getNumberOfVotes(uint256 _disputeID) external view returns (uint256) {
        Dispute storage dispute = disputes[_disputeID];
        return dispute.rounds[dispute.rounds.length - 1].nbVotes;
    }

    /** @dev Returns true if the dispute kit will be switched to a parent DK.
     *  @param _disputeID The ID of the dispute.
     *  @return Whether DK will be switched or not.
     */
    function isDisputeKitJumping(uint256 _disputeID) public view returns (bool) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        Court storage court = courts[dispute.subcourtID];

        if (round.nbVotes < court.jurorsForCourtJump) {
            return false;
        }

        // Jump if the parent court doesn't support the current DK.
        return !courts[court.parent].supportedDisputeKits[round.disputeKitID];
    }

    function getLastRoundResult(uint256 _disputeID) external view returns (uint256 winningChoice, bool tied) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        (winningChoice, tied) = disputeKitNodes[round.disputeKitID].disputeKit.getLastRoundResult(_disputeID);
    }

    function getDisputeKitNodesLength() external view returns (uint256) {
        return disputeKitNodes.length;
    }

    function getDisputeKit(uint256 _disputeKitID) external view returns (IDisputeKit) {
        return disputeKitNodes[_disputeKitID].disputeKit;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

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

        uint256 currentStake = juror.stakedTokens[_subcourtID];
        uint256 delta;
        bool plusOrMinus; // True if the stake is increasing, false otherwise

        if (_stake != 0) {
            // Check against locked tokens in case the min stake was lowered.
            if (_stake < courts[_subcourtID].minStake || _stake < juror.lockedTokens[_subcourtID]) return false;
        }

        uint256 sortitionFlag = 1 << uint256(SortitionFlags.PreStakeHook);
        for (uint256 i = 0; i < sortitionModules.length; i++) {
            if (sortitionFlag & sortitionModuleData[sortitionModules[i]].flags == sortitionFlag) {
                ISortitionModule.Result result = sortitionModules[i].preStakeHook(
                    _account,
                    _subcourtID,
                    _stake,
                    _penalty
                );
                if (result == ISortitionModule.Result.False) {
                    return false;
                } else if (result == ISortitionModule.Result.True) {
                    return true;
                }
            }
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
            plusOrMinus = true;
            delta = _stake - currentStake;
        } else {
            if (_stake == 0) {
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
                delta = currentStake - _stake;
            }
        }

        // Update juror's records in the current and in parent subcourts.
        sortitionFlag = 1 << uint256(SortitionFlags.StoreStakeValues);
        bool finished = false;
        uint256 currentSubcourtID = _subcourtID;
        while (!finished) {
            for (uint256 i = 0; i < sortitionModules.length; i++) {
                if (sortitionFlag & sortitionModuleData[sortitionModules[i]].flags == sortitionFlag) {
                    sortitionModules[i].set(bytes32(currentSubcourtID), _stake, stakePathID);
                }
            }
            juror.stakedTokens[uint96(currentSubcourtID)] = plusOrMinus
                ? juror.stakedTokens[uint96(currentSubcourtID)] + delta
                : juror.stakedTokens[uint96(currentSubcourtID)] - delta;
            if (currentSubcourtID == GENERAL_COURT) finished = true;
            else currentSubcourtID = courts[currentSubcourtID].parent;
        }

        emit StakeSet(_account, _subcourtID, _stake);

        return true;
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
            uint256 disputeKitID
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
            if (subcourtID == FORKING_COURT || subcourtID >= courts.length) {
                subcourtID = uint96(GENERAL_COURT);
            }
            if (minJurors == 0) {
                minJurors = MIN_JURORS;
            }
            if (disputeKitID == NULL_DISPUTE_KIT || disputeKitID >= disputeKitNodes.length) {
                disputeKitID = DISPUTE_KIT_CLASSIC_INDEX; // 0 index is not used.
            }
        } else {
            subcourtID = uint96(GENERAL_COURT);
            minJurors = MIN_JURORS;
            disputeKitID = DISPUTE_KIT_CLASSIC_INDEX;
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
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _value
    ) internal returns (bool) {
        (bool success, bytes memory data) = address(pinakion).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, _from, _to, _value)
        );
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }
}

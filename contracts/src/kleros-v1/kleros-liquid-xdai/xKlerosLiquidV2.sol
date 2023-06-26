// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IArbitratorV2, IArbitrableV2} from "../../arbitration/interfaces/IArbitratorV2.sol";
import {ITokenController} from "../interfaces/ITokenController.sol";
import {WrappedPinakion} from "./WrappedPinakion.sol";
import {IRandomAuRa} from "./interfaces/IRandomAuRa.sol";

import {SortitionSumTreeFactory} from "../../libraries/SortitionSumTreeFactory.sol";
import "../../gateway/interfaces/IForeignGateway.sol";

/// @title xKlerosLiquidV2
/// @dev This contract is an adaption of Mainnet's KlerosLiquid (https://github.com/kleros/kleros/blob/69cfbfb2128c29f1625b3a99a3183540772fda08/contracts/kleros/KlerosLiquid.sol)
/// for xDai chain. Notice that variables referring to ETH values in this contract, will hold the native token values of the chain on which xKlerosLiquid is deployed.
/// When this contract gets deployed on xDai chain, ETH variables will hold xDai values.
contract xKlerosLiquidV2 is Initializable, ITokenController, IArbitratorV2 {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    // General
    enum Phase {
        staking, // Stake sum trees can be updated. Pass after `minStakingTime` passes and there is at least one dispute without jurors.
        generating, // Waiting for a random number. Pass as soon as it is ready.
        drawing // Jurors can be drawn. Pass after all disputes have jurors or `maxDrawingTime` passes.
    }

    // Dispute
    enum Period {
        evidence, // Evidence can be submitted. This is also when drawing has to take place.
        commit, // Jurors commit a hashed vote. This is skipped for courts without hidden votes.
        vote, // Jurors reveal/cast their vote depending on whether the court has hidden votes or not.
        appeal, // The dispute can be appealed.
        execution // Tokens are redistributed and the ruling is executed.
    }

    // General
    struct Court {
        uint96 parent; // The parent court.
        uint256[] children; // List of child courts.
        bool hiddenVotes; // Whether to use commit and reveal or not.
        uint256 minStake; // Minimum tokens needed to stake in the court.
        uint256 alpha; // Basis point of tokens that are lost when incoherent.
        uint256 feeForJuror; // Arbitration fee paid per juror.
        // The appeal after the one that reaches this number of jurors will go to the parent court if any, otherwise, no more appeals are possible.
        uint256 jurorsForCourtJump;
        uint256[4] timesPerPeriod; // The time allotted to each dispute period in the form `timesPerPeriod[period]`.
    }
    struct DelayedSetStake {
        address account; // The address of the juror.
        uint96 subcourtID; // The ID of the subcourt.
        uint128 stake; // The new stake.
    }

    // Dispute
    struct Vote {
        address account; // The address of the juror.
        bytes32 commit; // The commit of the juror. For courts with hidden votes.
        uint256 choice; // The choice of the juror.
        bool voted; // True if the vote has been cast or revealed, false otherwise.
    }
    struct VoteCounter {
        // The choice with the most votes. Note that in the case of a tie, it is the choice that reached the tied number of votes first.
        uint256 winningChoice;
        mapping(uint256 => uint256) counts; // The sum of votes for each choice in the form `counts[choice]`.
        bool tied; // True if there is a tie, false otherwise.
    }
    struct Dispute {
        // Note that appeal `0` is equivalent to the first round of the dispute.
        uint96 subcourtID; // The ID of the subcourt the dispute is in.
        IArbitrableV2 arbitrated; // The arbitrated arbitrable contract.
        // The number of choices jurors have when voting. This does not include choice `0` which is reserved for "refuse to arbitrate"/"no ruling".
        uint256 numberOfChoices;
        Period period; // The current period of the dispute.
        uint256 lastPeriodChange; // The last time the period was changed.
        // The votes in the form `votes[appeal][voteID]`. On each round, a new list is pushed and packed with as many empty votes as there are draws. We use `dispute.votes.length` to get the number of appeals plus 1 for the first round.
        Vote[][] votes;
        VoteCounter[] voteCounters; // The vote counters in the form `voteCounters[appeal]`.
        uint256[] tokensAtStakePerJuror; // The amount of tokens at stake for each juror in the form `tokensAtStakePerJuror[appeal]`.
        uint256[] totalFeesForJurors; // The total juror fees paid in the form `totalFeesForJurors[appeal]`.
        uint256 drawsInRound; // A counter of draws made in the current round.
        uint256 commitsInRound; // A counter of commits made in the current round.
        uint256[] votesInEachRound; // A counter of votes made in each round in the form `votesInEachRound[appeal]`.
        // A counter of vote reward repartitions made in each round in the form `repartitionsInEachRound[appeal]`.
        uint256[] repartitionsInEachRound;
        uint256[] penaltiesInEachRound; // The amount of tokens collected from penalties in each round in the form `penaltiesInEachRound[appeal]`.
        bool ruled; // True if the ruling has been executed, false otherwise.
    }

    // Juror
    struct Juror {
        // The IDs of subcourts where the juror has stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        uint96[] subcourtIDs;
        uint256 stakedTokens; // The juror's total amount of tokens staked in subcourts.
        uint256 lockedTokens; // The juror's total amount of tokens locked in disputes.
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev Emitted when we pass to a new phase.
    /// @param _phase The new phase.
    event NewPhase(Phase _phase);

    /// @dev Emitted when a dispute passes to a new period.
    /// @param _disputeID The ID of the dispute.
    /// @param _period The new period.
    event NewPeriod(uint256 indexed _disputeID, Period _period);

    /// @dev Emitted when a juror's stake is set.
    /// @param _address The address of the juror.
    /// @param _subcourtID The ID of the subcourt at the end of the stake path.
    /// @param _stake The new stake.
    /// @param _newTotalStake The new total stake.
    event StakeSet(address indexed _address, uint256 _subcourtID, uint128 _stake, uint256 _newTotalStake);

    /// @dev Emitted when a juror is drawn.
    /// @param _address The drawn address.
    /// @param _disputeID The ID of the dispute.
    /// @param _appeal The appeal the draw is for. 0 is for the first round.
    /// @param _voteID The vote ID.
    event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _appeal, uint256 _voteID);

    /// @dev Emitted when a juror wins or loses tokens and ETH from a dispute.
    /// @param _address The juror affected.
    /// @param _disputeID The ID of the dispute.
    /// @param _tokenAmount The amount of tokens won or lost.
    /// @param _ETHAmount The amount of ETH won or lost.
    event TokenAndETHShift(address indexed _address, uint256 indexed _disputeID, int _tokenAmount, int _ETHAmount);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    // General Constants
    uint256 public constant MAX_STAKE_PATHS = 4; // The maximum number of stake paths a juror can have.
    uint256 public constant DEFAULT_NB_OF_JURORS = 3; // The default number of jurors in a dispute.
    uint256 public constant NON_PAYABLE_AMOUNT = (2 ** 256 - 2) / 2; // An amount higher than the supply of ETH.
    uint256 public constant ALPHA_DIVISOR = 1e4; // The number to divide `Court.alpha` by.
    // General Contracts
    address public governor; // The governor of the contract.
    WrappedPinakion public pinakion; // The Pinakion token contract.
    IRandomAuRa public RNGenerator; // The random number generator contract.
    // General Dynamic
    Phase public phase; // The current phase.
    uint256 public lastPhaseChange; // The last time the phase was changed.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    // The block number to get the next random number from. Used so there is at least a 1 block difference from the staking phase.
    uint256 public RNBlock;
    uint256 public RN; // The current random number.
    uint256 public minStakingTime; // The minimum staking time.
    uint256 public maxDrawingTime; // The maximum drawing time.
    // True if insolvent (`balance < stakedTokens || balance < lockedTokens`) token transfers should be blocked. Used to avoid blocking penalties.
    bool public lockInsolventTransfers;
    // General Storage
    Court[] public courts; // The subcourts.
    using SortitionSumTreeFactory for SortitionSumTreeFactory.SortitionSumTrees; // Use library functions for sortition sum trees.
    SortitionSumTreeFactory.SortitionSumTrees internal sortitionSumTrees; // The sortition sum trees.
    // The delayed calls to `_setStake`. Used to schedule `_setStake`s when not in the staking phase.
    mapping(uint256 => DelayedSetStake) public delayedSetStakes;
    // The index of the next `delayedSetStakes` item to execute. Starts at 1 because `lastDelayedSetStake` starts at 0.
    uint256 public nextDelayedSetStake;
    uint256 public lastDelayedSetStake; // The index of the last `delayedSetStakes` item. 0 is skipped because it is the initial value.

    // Dispute
    // Use a mapping instead of an array so that upgrading (appending variables to) the Dispute struct is possible without big layout changes.
    mapping(uint256 => Dispute) public disputes; // The disputes.
    uint256 public totalDisputes;

    // Juror
    mapping(address => Juror) public jurors; // The jurors.

    IForeignGateway public foreignGateway; // Foreign gateway contract.

    mapping(uint256 => uint256) public disputesRuling;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /// @dev Requires a specific phase.
    /// @param _phase The required phase.
    modifier onlyDuringPhase(Phase _phase) {
        require(phase == _phase);
        _;
    }

    /// @dev Requires a specific period in a dispute.
    /// @param _disputeID The ID of the dispute.
    /// @param _period The required period.
    modifier onlyDuringPeriod(uint256 _disputeID, Period _period) {
        require(disputes[_disputeID].period == _period);
        _;
    }

    /// @dev Requires that the sender is the governor. Note that the governor is expected to not be malicious.
    modifier onlyByGovernor() {
        require(governor == msg.sender);
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructs the KlerosLiquid contract.
    /// @param _governor The governor's address.
    /// @param _pinakion The address of the token contract.
    /// @param _RNGenerator The address of the random number generator contract.
    /// @param _minStakingTime The minimum time that the staking phase should last.
    /// @param _maxDrawingTime The maximum time that the drawing phase should last.
    /// @param _hiddenVotes The `hiddenVotes` property value of the general court.
    /// @param _courtParameters MinStake, alpha, feeForJuror and jurorsForCourtJump respectively.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the general court.
    /// @param _sortitionSumTreeK The number of children per node of the general court's sortition sum tree.
    /// @param _foreignGateway Foreign gateway on xDai.
    function initialize(
        address _governor,
        WrappedPinakion _pinakion,
        IRandomAuRa _RNGenerator,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        uint256 _sortitionSumTreeK,
        IForeignGateway _foreignGateway
    ) public initializer {
        // Initialize contract.
        governor = _governor;
        pinakion = _pinakion;
        RNGenerator = _RNGenerator;
        minStakingTime = _minStakingTime;
        maxDrawingTime = _maxDrawingTime;
        phase = Phase.staking;
        lastPhaseChange = block.timestamp;
        lockInsolventTransfers = true;
        if (nextDelayedSetStake == 0) nextDelayedSetStake = 1;
        foreignGateway = _foreignGateway;

        // Create the general court.
        if (courts.length == 0) {
            courts.push(
                Court({
                    parent: 0,
                    children: new uint256[](0),
                    hiddenVotes: _hiddenVotes,
                    minStake: _courtParameters[0],
                    alpha: _courtParameters[1],
                    feeForJuror: _courtParameters[2],
                    jurorsForCourtJump: _courtParameters[3],
                    timesPerPeriod: _timesPerPeriod
                })
            );
            sortitionSumTrees.createTree(bytes32(0), _sortitionSumTreeK);
        }
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Lets the governor call anything on behalf of the contract.
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
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /// @dev Changes the `pinakion` storage variable.
    /// @param _pinakion The new value for the `pinakion` storage variable.
    function changePinakion(WrappedPinakion _pinakion) external onlyByGovernor {
        pinakion = _pinakion;
    }

    /// @dev Changes the `RNGenerator` storage variable.
    /// @param _RNGenerator The new value for the `RNGenerator` storage variable.
    function changeRNGenerator(IRandomAuRa _RNGenerator) external onlyByGovernor {
        RNGenerator = _RNGenerator;
        if (phase == Phase.generating) {
            RNBlock = RNGenerator.nextCommitPhaseStartBlock() + RNGenerator.collectRoundLength();
        }
    }

    /// @dev Changes the `minStakingTime` storage variable.
    /// @param _minStakingTime The new value for the `minStakingTime` storage variable.
    function changeMinStakingTime(uint256 _minStakingTime) external onlyByGovernor {
        minStakingTime = _minStakingTime;
    }

    /// @dev Changes the `maxDrawingTime` storage variable.
    /// @param _maxDrawingTime The new value for the `maxDrawingTime` storage variable.
    function changeMaxDrawingTime(uint256 _maxDrawingTime) external onlyByGovernor {
        maxDrawingTime = _maxDrawingTime;
    }

    /// @dev Changes the `foreignGateway` storage variable.
    /// @param _foreignGateway The new value for the `foreignGateway` storage variable.
    function changeForeignGateway(IForeignGateway _foreignGateway) external onlyByGovernor {
        foreignGateway = _foreignGateway;
    }

    /// @dev Creates a subcourt under a specified parent court.
    /// @param _parent The `parent` property value of the subcourt.
    /// @param _hiddenVotes The `hiddenVotes` property value of the subcourt.
    /// @param _minStake The `minStake` property value of the subcourt.
    /// @param _alpha The `alpha` property value of the subcourt.
    /// @param _feeForJuror The `feeForJuror` property value of the subcourt.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the subcourt.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the subcourt.
    /// @param _sortitionSumTreeK The number of children per node of the subcourt's sortition sum tree.
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

        // Create the subcourt.
        uint256 subcourtID = courts.length;
        Court storage subcourt = courts.push();
        subcourt.parent = _parent;
        subcourt.children = new uint256[](0);
        subcourt.hiddenVotes = _hiddenVotes;
        subcourt.minStake = _minStake;
        subcourt.alpha = _alpha;
        subcourt.feeForJuror = _feeForJuror;
        subcourt.jurorsForCourtJump = _jurorsForCourtJump;
        subcourt.timesPerPeriod = _timesPerPeriod;
        sortitionSumTrees.createTree(bytes32(subcourtID), _sortitionSumTreeK);

        // Update the parent.
        courts[_parent].children.push(subcourtID);
    }

    /// @dev Changes the `minStake` property value of a specified subcourt. Don't set to a value lower than its parent's `minStake` property value.
    /// @param _subcourtID The ID of the subcourt.
    /// @param _minStake The new value for the `minStake` property value.
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

    /// @dev Changes the `alpha` property value of a specified subcourt.
    /// @param _subcourtID The ID of the subcourt.
    /// @param _alpha The new value for the `alpha` property value.
    function changeSubcourtAlpha(uint96 _subcourtID, uint256 _alpha) external onlyByGovernor {
        courts[_subcourtID].alpha = _alpha;
    }

    /// @dev Changes the `feeForJuror` property value of a specified subcourt.
    /// @param _subcourtID The ID of the subcourt.
    /// @param _feeForJuror The new value for the `feeForJuror` property value.
    function changeSubcourtJurorFee(uint96 _subcourtID, uint256 _feeForJuror) external onlyByGovernor {
        courts[_subcourtID].feeForJuror = _feeForJuror;
    }

    /// @dev Changes the `jurorsForCourtJump` property value of a specified subcourt.
    /// @param _subcourtID The ID of the subcourt.
    /// @param _jurorsForCourtJump The new value for the `jurorsForCourtJump` property value.
    function changeSubcourtJurorsForJump(uint96 _subcourtID, uint256 _jurorsForCourtJump) external onlyByGovernor {
        courts[_subcourtID].jurorsForCourtJump = _jurorsForCourtJump;
    }

    /// @dev Changes the `timesPerPeriod` property value of a specified subcourt.
    /// @param _subcourtID The ID of the subcourt.
    /// @param _timesPerPeriod The new value for the `timesPerPeriod` property value.
    function changeSubcourtTimesPerPeriod(
        uint96 _subcourtID,
        uint256[4] memory _timesPerPeriod
    ) external onlyByGovernor {
        courts[_subcourtID].timesPerPeriod = _timesPerPeriod;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Sets the caller's stake in a subcourt.
    /// @param _subcourtID The ID of the subcourt.
    /// @param _stake The new stake.
    function setStake(uint96 _subcourtID, uint128 _stake) external {
        require(_setStake(msg.sender, _subcourtID, _stake));
    }

    /// @dev Executes the next delayed set stakes.
    /// `O(n)` where `n` is the number of iterations to run.
    /// @param _iterations The number of delayed set stakes to execute.
    function executeDelayedSetStakes(uint256 _iterations) external onlyDuringPhase(Phase.staking) {
        uint256 actualIterations = (nextDelayedSetStake + _iterations) - 1 > lastDelayedSetStake
            ? (lastDelayedSetStake - nextDelayedSetStake) + 1
            : _iterations;
        uint256 newNextDelayedSetStake = nextDelayedSetStake + actualIterations;
        require(newNextDelayedSetStake >= nextDelayedSetStake);
        for (uint256 i = nextDelayedSetStake; i < newNextDelayedSetStake; i++) {
            DelayedSetStake storage delayedSetStake = delayedSetStakes[i];
            _setStake(delayedSetStake.account, delayedSetStake.subcourtID, delayedSetStake.stake);
            delete delayedSetStakes[i];
        }
        nextDelayedSetStake = newNextDelayedSetStake;
    }

    /// @dev Receive the ruling from foreign gateway which technically is an arbitrator of this contract.
    /// @param _disputeID ID of the dispute.
    /// @param _ruling Ruling given by V2 court and relayed by foreign gateway.
    function rule(uint256 _disputeID, uint256 _ruling) external {
        require(_disputeID < totalDisputes, "Dispute ID does not exist.");
        require(msg.sender == address(foreignGateway), "Can only be called by gateway");

        Dispute storage dispute = disputes[_disputeID];
        require(!dispute.ruled, "Ruling already executed.");
        dispute.ruled = true;
        disputesRuling[_disputeID] = _ruling;

        // Send the relayed ruling to the arbitrable while fully bypassing the dispute flow.
        dispute.arbitrated.rule(_disputeID, _ruling);

        emit Ruling(dispute.arbitrated, _disputeID, _ruling);
    }

    /// Public

    /// @dev Creates a dispute. Must be called by the arbitrable contract.
    /// @param _numberOfChoices Number of choices to choose from in the dispute to be created.
    /// @param _extraData Additional info about the dispute to be created. We use it to pass the ID of the subcourt to create the dispute in (first 32 bytes) and the minimum number of jurors required (next 32 bytes).
    /// @return disputeID The ID of the created dispute.
    function createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData
    ) public payable override returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "Arbitration fees: not enough");

        disputeID = totalDisputes++;
        Dispute storage dispute = disputes[disputeID];
        dispute.arbitrated = IArbitrableV2(msg.sender);

        // The V2 subcourtID is off by one
        (uint96 subcourtID, uint256 minJurors) = extraDataToSubcourtIDAndMinJurors(_extraData);
        bytes memory extraDataV2 = abi.encode(uint256(subcourtID + 1), minJurors);

        foreignGateway.createDispute{value: msg.value}(_numberOfChoices, extraDataV2);
        emit DisputeCreation(disputeID, IArbitrableV2(msg.sender));
    }

    /// @inheritdoc IArbitratorV2
    function createDispute(
        uint256 /*_choices*/,
        bytes calldata /*_extraData*/,
        IERC20 /*_feeToken*/,
        uint256 /*_feeAmount*/
    ) external override returns (uint256) {
        revert("Not supported");
    }

    /// @dev DEPRECATED. Called when `_owner` sends ETH to the Wrapped Token contract.
    /// @param _owner The address that sent the ETH to create tokens.
    /// @return allowed Whether the operation should be allowed or not.
    function proxyPayment(address _owner) public payable override returns (bool allowed) {
        allowed = false;
    }

    /// @dev Notifies the controller about a token transfer allowing the controller to react if desired.
    /// @param _from The origin of the transfer.
    /// @param _to The destination of the transfer.
    /// @param _amount The amount of the transfer.
    /// @return allowed Whether the operation should be allowed or not.
    function onTransfer(address _from, address _to, uint256 _amount) public override returns (bool allowed) {
        if (lockInsolventTransfers) {
            // Never block penalties or rewards.
            uint256 newBalance = pinakion.balanceOf(_from) - _amount;
            if (newBalance < jurors[_from].stakedTokens || newBalance < jurors[_from].lockedTokens) return false;
        }
        allowed = true;
    }

    /// @dev Notifies the controller about an approval allowing the controller to react if desired.
    /// @param _owner The address that calls `approve()`.
    /// @param _spender The spender in the `approve()` call.
    /// @param _amount The amount in the `approve()` call.
    /// @return allowed Whether the operation should be allowed or not.
    function onApprove(address _owner, address _spender, uint256 _amount) public override returns (bool allowed) {
        allowed = true;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Sets the specified juror's stake in a subcourt.
    /// `O(n + p * log_k(j))` where
    /// `n` is the number of subcourts the juror has staked in,
    /// `p` is the depth of the subcourt tree,
    /// `k` is the minimum number of children per node of one of these subcourts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these subcourts simultaneously.
    /// @param _account The address of the juror.
    /// @param _subcourtID The ID of the subcourt.
    /// @param _stake The new stake.
    /// @return succeeded True if the call succeeded, false otherwise.
    function _setStake(address _account, uint96 _subcourtID, uint128 _stake) internal returns (bool succeeded) {
        if (!(_subcourtID < courts.length)) return false;

        if (!(_stake == 0 || courts[_subcourtID].minStake <= _stake)) return false; // The juror's stake cannot be lower than the minimum stake for the subcourt.
        Juror storage juror = jurors[_account];
        bytes32 stakePathID = accountAndSubcourtIDToStakePathID(_account, _subcourtID);
        uint256 currentStake = sortitionSumTrees.stakeOf(bytes32(uint256(_subcourtID)), stakePathID);
        if (!(_stake == 0 || currentStake > 0 || juror.subcourtIDs.length < MAX_STAKE_PATHS)) return false; // Maximum stake paths reached.
        uint256 newTotalStake = juror.stakedTokens - currentStake + _stake; // Can't overflow because _stake is a uint128.
        if (!(_stake == 0 || pinakion.balanceOf(_account) >= newTotalStake)) return false; // The juror's total amount of staked tokens cannot be higher than the juror's balance.

        // Update juror's records.
        juror.stakedTokens = newTotalStake;
        if (_stake == 0) {
            for (uint256 i = 0; i < juror.subcourtIDs.length; i++)
                if (juror.subcourtIDs[i] == _subcourtID) {
                    juror.subcourtIDs[i] = juror.subcourtIDs[juror.subcourtIDs.length - 1];
                    juror.subcourtIDs.pop();
                    break;
                }
        } else if (currentStake == 0) juror.subcourtIDs.push(_subcourtID);

        // Update subcourt parents.
        bool finished = false;
        uint256 currentSubcourtID = _subcourtID;
        while (!finished) {
            sortitionSumTrees.set(bytes32(currentSubcourtID), _stake, stakePathID);
            if (currentSubcourtID == 0) finished = true;
            else currentSubcourtID = courts[currentSubcourtID].parent;
        }
        emit StakeSet(_account, _subcourtID, _stake, newTotalStake);
        return true;
    }

    /// @dev Gets a subcourt ID and the minimum number of jurors required from a specified extra data bytes array.
    /// @param _extraData The extra data bytes array. The first 32 bytes are the subcourt ID and the next 32 bytes are the minimum number of jurors.
    /// @return subcourtID The subcourt ID.
    /// @return minJurors The minimum number of jurors required.
    function extraDataToSubcourtIDAndMinJurors(
        bytes memory _extraData
    ) internal view returns (uint96 subcourtID, uint256 minJurors) {
        if (_extraData.length >= 64) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                subcourtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
            }
            if (subcourtID >= courts.length) subcourtID = 0;
            if (minJurors == 0) minJurors = DEFAULT_NB_OF_JURORS;
        } else {
            subcourtID = 0;
            minJurors = DEFAULT_NB_OF_JURORS;
        }
    }

    /// @dev Packs an account and a subcourt ID into a stake path ID.
    /// @param _account The account to pack.
    /// @param _subcourtID The subcourt ID to pack.
    /// @return stakePathID The stake path ID.
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

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @inheritdoc IArbitratorV2
    function arbitrationCost(bytes memory _extraData) public view override returns (uint256 cost) {
        cost = foreignGateway.arbitrationCost(_extraData);
    }

    /// @inheritdoc IArbitratorV2
    function arbitrationCost(
        bytes calldata /*_extraData*/,
        IERC20 /*_feeToken*/
    ) public pure override returns (uint256 /*cost*/) {
        revert("Not supported");
    }

    /// @dev Gets the current ruling of a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _disputeID) public view returns (uint256 ruling, bool tied, bool /*overridden*/) {
        Dispute storage dispute = disputes[_disputeID];
        if (dispute.voteCounters.length == 0) {
            ruling = disputesRuling[_disputeID];
        } else {
            tied = dispute.voteCounters[dispute.voteCounters.length - 1].tied;
            ruling = tied ? 0 : dispute.voteCounters[dispute.voteCounters.length - 1].winningChoice;
        }
    }

    /// @dev Gets a specified subcourt's non primitive properties.
    /// @param _subcourtID The ID of the subcourt.
    /// @return children The subcourt's child court list.
    /// @return timesPerPeriod The subcourt's time per period.
    function getSubcourt(
        uint96 _subcourtID
    ) external view returns (uint256[] memory children, uint256[4] memory timesPerPeriod) {
        Court storage subcourt = courts[_subcourtID];
        children = subcourt.children;
        timesPerPeriod = subcourt.timesPerPeriod;
    }

    /// @dev Gets a specified vote for a specified appeal in a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @param _appeal The appeal.
    /// @param _voteID The ID of the vote.
    /// @return account The account for vote.
    /// @return commit  The commit for vote.
    /// @return choice  The choice for vote.
    /// @return voted True if the account voted, False otherwise.
    function getVote(
        uint256 _disputeID,
        uint256 _appeal,
        uint256 _voteID
    ) external view returns (address account, bytes32 commit, uint256 choice, bool voted) {
        Vote storage vote = disputes[_disputeID].votes[_appeal][_voteID];
        account = vote.account;
        commit = vote.commit;
        choice = vote.choice;
        voted = vote.voted;
    }

    /// @dev Gets the vote counter for a specified appeal in a specified dispute.
    /// Note: This function is only to be used by the interface and it won't work if the number of choices is too high.
    /// @param _disputeID The ID of the dispute.
    /// @param _appeal The appeal.
    /// @return winningChoice The winning choice.
    /// @return counts The count.
    /// @return tied Whether the vote tied.
    /// `O(n)` where
    /// `n` is the number of choices of the dispute.
    function getVoteCounter(
        uint256 _disputeID,
        uint256 _appeal
    ) external view returns (uint256 winningChoice, uint256[] memory counts, bool tied) {
        Dispute storage dispute = disputes[_disputeID];
        VoteCounter storage voteCounter = dispute.voteCounters[_appeal];
        winningChoice = voteCounter.winningChoice;
        counts = new uint256[](dispute.numberOfChoices + 1);
        for (uint256 i = 0; i <= dispute.numberOfChoices; i++) counts[i] = voteCounter.counts[i];
        tied = voteCounter.tied;
    }

    /// @dev Gets a specified dispute's non primitive properties.
    /// @param _disputeID The ID of the dispute.
    /// @return votesLengths The dispute's vote length.
    /// @return tokensAtStakePerJuror The dispute's required tokens at stake per Juror.
    /// @return totalFeesForJurors The dispute's total fees for Jurors.
    /// @return votesInEachRound The dispute's counter of votes made in each round.
    /// @return repartitionsInEachRound The dispute's counter of vote reward repartitions made in each round.
    /// @return penaltiesInEachRound The dispute's amount of tokens collected from penalties in each round.
    /// `O(a)` where
    /// `a` is the number of appeals of the dispute.
    function getDispute(
        uint256 _disputeID
    )
        external
        view
        returns (
            uint256[] memory votesLengths,
            uint256[] memory tokensAtStakePerJuror,
            uint256[] memory totalFeesForJurors,
            uint256[] memory votesInEachRound,
            uint256[] memory repartitionsInEachRound,
            uint256[] memory penaltiesInEachRound
        )
    {
        Dispute storage dispute = disputes[_disputeID];
        votesLengths = new uint256[](dispute.votes.length);
        for (uint256 i = 0; i < dispute.votes.length; i++) votesLengths[i] = dispute.votes[i].length;
        tokensAtStakePerJuror = dispute.tokensAtStakePerJuror;
        totalFeesForJurors = dispute.totalFeesForJurors;
        votesInEachRound = dispute.votesInEachRound;
        repartitionsInEachRound = dispute.repartitionsInEachRound;
        penaltiesInEachRound = dispute.penaltiesInEachRound;
    }

    /// @dev Gets a specified juror's non primitive properties.
    /// @param _account The address of the juror.
    /// @return subcourtIDs The juror's IDs of subcourts where the juror has stake path.
    function getJuror(address _account) external view returns (uint96[] memory subcourtIDs) {
        Juror storage juror = jurors[_account];
        subcourtIDs = juror.subcourtIDs;
    }

    /// @dev Gets the stake of a specified juror in a specified subcourt.
    /// @param _account The address of the juror.
    /// @param _subcourtID The ID of the subcourt.
    /// @return stake The stake.
    function stakeOf(address _account, uint96 _subcourtID) external view returns (uint256 stake) {
        return
            sortitionSumTrees.stakeOf(
                bytes32(uint256(_subcourtID)),
                accountAndSubcourtIDToStakePathID(_account, _subcourtID)
            );
    }
}

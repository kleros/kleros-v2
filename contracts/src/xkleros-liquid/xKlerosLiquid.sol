// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IArbitrator, IArbitrable} from "../arbitration/IArbitrator.sol";
import {TokenController} from "./TokenController.sol";
import {WrappedPinakion} from "./WrappedPinakion.sol";
import {IRandomAuRa} from "./interfaces/IRandomAuRa.sol";

import {SortitionSumTreeFactory} from "./libraries/SortitionSumTreeFactory.sol";
import "../gateway/interfaces/IForeignGateway.sol";

/**
 *  @title xKlerosLiquid
 *  @dev This contract is an adaption of Mainnet's KlerosLiquid (https://github.com/kleros/kleros/blob/69cfbfb2128c29f1625b3a99a3183540772fda08/contracts/kleros/KlerosLiquid.sol)
 *  for xDai chain. Notice that variables referring to ETH values in this contract, will hold the native token values of the chain on which xKlerosLiquid is deployed.
 *  When this contract gets deployed on xDai chain, ETH variables will hold xDai values.
 */
contract xKlerosLiquid is Initializable, TokenController, IArbitrator {
    /* Enums */

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

    /* Structs */

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
        IArbitrable arbitrated; // The arbitrated arbitrable contract.
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

    /* Events */

    /** @dev Emitted when we pass to a new phase.
     *  @param _phase The new phase.
     */
    event NewPhase(Phase _phase);

    /** @dev Emitted when a dispute passes to a new period.
     *  @param _disputeID The ID of the dispute.
     *  @param _period The new period.
     */
    event NewPeriod(uint256 indexed _disputeID, Period _period);

    /** @dev Emitted when a juror's stake is set.
     *  @param _address The address of the juror.
     *  @param _subcourtID The ID of the subcourt at the end of the stake path.
     *  @param _stake The new stake.
     *  @param _newTotalStake The new total stake.
     */
    event StakeSet(address indexed _address, uint256 _subcourtID, uint128 _stake, uint256 _newTotalStake);

    /** @dev Emitted when a juror is drawn.
     *  @param _address The drawn address.
     *  @param _disputeID The ID of the dispute.
     *  @param _appeal The appeal the draw is for. 0 is for the first round.
     *  @param _voteID The vote ID.
     */
    event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _appeal, uint256 _voteID);

    /** @dev Emitted when a juror wins or loses tokens and ETH from a dispute.
     *  @param _address The juror affected.
     *  @param _disputeID The ID of the dispute.
     *  @param _tokenAmount The amount of tokens won or lost.
     *  @param _ETHAmount The amount of ETH won or lost.
     */
    event TokenAndETHShift(address indexed _address, uint256 indexed _disputeID, int _tokenAmount, int _ETHAmount);

    /* Storage */

    // General Constants
    uint256 public constant MAX_STAKE_PATHS = 4; // The maximum number of stake paths a juror can have.
    uint256 public constant MIN_JURORS = 3; // The global default minimum number of jurors in a dispute.
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
    IERC20 public weth; // WETH token address.

    mapping(uint256 => uint256) public disputeNbRounds; // Number of rounds of the dispute.
    mapping(uint256 => mapping(uint256 => uint256)) public disputeNbVotesInRound; // Number of votes in the round. [disputeID][RoundID]
    mapping(uint256 => mapping(uint256 => mapping(uint256 => Vote))) public disputeVotes; // Votes in the dispute's round. [disputeID][RoundID][VoteID]

    /* Modifiers */

    /** @dev Requires a specific phase.
     *  @param _phase The required phase.
     */
    modifier onlyDuringPhase(Phase _phase) {
        require(phase == _phase);
        _;
    }

    /** @dev Requires a specific period in a dispute.
     *  @param _disputeID The ID of the dispute.
     *  @param _period The required period.
     */
    modifier onlyDuringPeriod(uint256 _disputeID, Period _period) {
        require(disputes[_disputeID].period == _period);
        _;
    }

    /** @dev Requires that the sender is the governor. Note that the governor is expected to not be malicious. */
    modifier onlyByGovernor() {
        require(governor == msg.sender);
        _;
    }

    /* Constructor */

    /** @dev Constructs the KlerosLiquid contract.
     *  @param _governor The governor's address.
     *  @param _pinakion The address of the token contract.
     *  @param _RNGenerator The address of the random number generator contract.
     *  @param _minStakingTime The minimum time that the staking phase should last.
     *  @param _maxDrawingTime The maximum time that the drawing phase should last.
     *  @param _hiddenVotes The `hiddenVotes` property value of the general court.
     *  @param _courtParameters MinStake, alpha, feeForJuror and jurorsForCourtJump respectively.
     *  @param _timesPerPeriod The `timesPerPeriod` property value of the general court.
     *  @param _sortitionSumTreeK The number of children per node of the general court's sortition sum tree.
     *  @param _foreignGateway Foreign gateway on xDai.
     *  @param _weth Weth contract.
     */
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
        IForeignGateway _foreignGateway,
        IERC20 _weth
    ) public initializer {
        // Initialize contract.
        governor = _governor;
        pinakion = _pinakion;
        RNGenerator = _RNGenerator;
        minStakingTime = _minStakingTime;
        maxDrawingTime = _maxDrawingTime;
        lastPhaseChange = block.timestamp;
        lockInsolventTransfers = true;
        nextDelayedSetStake = 1;
        foreignGateway = _foreignGateway;
        weth = _weth;

        // Create the general court.
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

    /* External */

    /** @dev Lets the governor call anything on behalf of the contract.
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
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /** @dev Changes the `pinakion` storage variable.
     *  @param _pinakion The new value for the `pinakion` storage variable.
     */
    function changePinakion(WrappedPinakion _pinakion) external onlyByGovernor {
        pinakion = _pinakion;
    }

    /** @dev Changes the `RNGenerator` storage variable.
     *  @param _RNGenerator The new value for the `RNGenerator` storage variable.
     */
    function changeRNGenerator(IRandomAuRa _RNGenerator) external onlyByGovernor {
        RNGenerator = _RNGenerator;
        if (phase == Phase.generating) {
            RNBlock = RNGenerator.nextCommitPhaseStartBlock() + RNGenerator.collectRoundLength();
        }
    }

    /** @dev Changes the `minStakingTime` storage variable.
     *  @param _minStakingTime The new value for the `minStakingTime` storage variable.
     */
    function changeMinStakingTime(uint256 _minStakingTime) external onlyByGovernor {
        minStakingTime = _minStakingTime;
    }

    /** @dev Changes the `maxDrawingTime` storage variable.
     *  @param _maxDrawingTime The new value for the `maxDrawingTime` storage variable.
     */
    function changeMaxDrawingTime(uint256 _maxDrawingTime) external onlyByGovernor {
        maxDrawingTime = _maxDrawingTime;
    }

    /** @dev Changes the `foreignGateway` storage variable.
     *  @param _foreignGateway The new value for the `foreignGateway` storage variable.
     */
    function changeForeignGateway(IForeignGateway _foreignGateway) external onlyByGovernor {
        foreignGateway = _foreignGateway;
    }

    /** @dev Changes the `weth` storage variable.
     *  @param _weth The new value for the `weth` storage variable.
     */
    function changeWethAddress(IERC20 _weth) external onlyByGovernor {
        weth = _weth;
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
    function changeSubcourtTimesPerPeriod(
        uint96 _subcourtID,
        uint256[4] memory _timesPerPeriod
    ) external onlyByGovernor {
        courts[_subcourtID].timesPerPeriod = _timesPerPeriod;
    }

    /** @dev Passes the phase. TRUSTED */
    function passPhase() external {
        if (phase == Phase.staking) {
            require(
                block.timestamp - lastPhaseChange >= minStakingTime,
                "The minimum staking time has not passed yet."
            );
            require(disputesWithoutJurors > 0, "There are no disputes that need jurors.");
            /** collectRoundLength is added so that the last validator to reveal cannot know
             *  during the staking phase which random seed is going to be used in the drawing phase.
             */
            RNBlock = RNGenerator.nextCommitPhaseStartBlock() + RNGenerator.collectRoundLength();
            phase = Phase.generating;
        } else if (phase == Phase.generating) {
            require(block.number >= RNBlock && RNGenerator.isCommitPhase(), "Random number is not ready yet."); // It's not secure to use the current seed during reveals.
            RN = uint256(keccak256(abi.encodePacked(address(this), RNGenerator.currentSeed()))); // currentSeed() cannot be predicted during staking phase.
            phase = Phase.drawing;
        } else if (phase == Phase.drawing) {
            require(
                disputesWithoutJurors == 0 || block.timestamp - lastPhaseChange >= maxDrawingTime,
                "There are still disputes without jurors and the maximum drawing time has not passed yet."
            );
            phase = Phase.staking;
        }

        lastPhaseChange = block.timestamp;
        emit NewPhase(phase);
    }

    /** @dev Passes the period of a specified dispute.
     *  @param _disputeID The ID of the dispute.
     */
    function passPeriod(uint256 _disputeID) external {
        require(_disputeID < totalDisputes, "Dispute ID does not exist.");
        Dispute storage dispute = disputes[_disputeID];
        uint256 lastRoundID = disputeNbRounds[_disputeID] - 1;
        uint256 nbVotes = disputeNbVotesInRound[_disputeID][lastRoundID];
        if (dispute.period == Period.evidence) {
            require(
                lastRoundID > 0 ||
                    block.timestamp - dispute.lastPeriodChange >=
                    courts[dispute.subcourtID].timesPerPeriod[uint256(dispute.period)],
                "The evidence period time has not passed yet and it is not an appeal."
            );
            require(dispute.drawsInRound == nbVotes, "The dispute has not finished drawing yet.");
            dispute.period = courts[dispute.subcourtID].hiddenVotes ? Period.commit : Period.vote;
        } else if (dispute.period == Period.commit) {
            require(
                block.timestamp - dispute.lastPeriodChange >=
                    courts[dispute.subcourtID].timesPerPeriod[uint256(dispute.period)] ||
                    dispute.commitsInRound == nbVotes,
                "The commit period time has not passed yet and not every juror has committed yet."
            );
            dispute.period = Period.vote;
        } else if (dispute.period == Period.vote) {
            require(
                block.timestamp - dispute.lastPeriodChange >=
                    courts[dispute.subcourtID].timesPerPeriod[uint256(dispute.period)] ||
                    dispute.votesInEachRound[lastRoundID] == nbVotes,
                "The vote period time has not passed yet and not every juror has voted yet."
            );
            dispute.period = Period.appeal;
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

    /** @dev Sets the caller's stake in a subcourt.
     *  @param _subcourtID The ID of the subcourt.
     *  @param _stake The new stake.
     */
    function setStake(uint96 _subcourtID, uint128 _stake) external {
        require(_setStake(msg.sender, _subcourtID, _stake));
    }

    /** @dev Executes the next delayed set stakes.
     *  `O(n)` where `n` is the number of iterations to run.
     *  @param _iterations The number of delayed set stakes to execute.
     */
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

    /** @dev Draws jurors for a dispute. Can be called in parts.
     *  `O(n * k * log_k(j))` where
     *  `n` is the number of iterations to run,
     *  `k` is the number of children per node of the dispute's court's sortition sum tree,
     *  and `j` is the maximum number of jurors that ever staked in it simultaneously.
     *  @param _disputeID The ID of the dispute.
     *  @param _iterations The number of iterations to run.
     */
    function drawJurors(
        uint256 _disputeID,
        uint256 _iterations
    ) external onlyDuringPhase(Phase.drawing) onlyDuringPeriod(_disputeID, Period.evidence) {
        require(_disputeID < totalDisputes, "Dispute ID does not exist.");
        Dispute storage dispute = disputes[_disputeID];
        uint256 endIndex = dispute.drawsInRound + _iterations;
        require(endIndex >= dispute.drawsInRound);

        // Avoid going out of range.
        if (endIndex > disputeNbVotesInRound[_disputeID][disputeNbRounds[_disputeID] - 1])
            endIndex = disputeNbVotesInRound[_disputeID][disputeNbRounds[_disputeID] - 1];
        for (uint256 i = dispute.drawsInRound; i < endIndex; i++) {
            // Draw from sortition tree.
            (address drawnAddress, uint256 subcourtID) = stakePathIDToAccountAndSubcourtID(
                sortitionSumTrees.draw(
                    bytes32(uint256(dispute.subcourtID)),
                    uint256(keccak256(abi.encodePacked(RN, _disputeID, i)))
                )
            );

            // Save the vote.
            disputeVotes[_disputeID][disputeNbRounds[_disputeID] - 1][i].account = drawnAddress;
            jurors[drawnAddress].lockedTokens += dispute.tokensAtStakePerJuror[
                dispute.tokensAtStakePerJuror.length - 1
            ];
            emit Draw(drawnAddress, _disputeID, disputeNbRounds[_disputeID] - 1, i);

            // If dispute is fully drawn.
            if (i == disputeNbVotesInRound[_disputeID][disputeNbRounds[_disputeID] - 1] - 1) disputesWithoutJurors--;
        }
        dispute.drawsInRound = endIndex;
    }

    /** @dev Sets the caller's commit for the specified votes.
     *  `O(n)` where
     *  `n` is the number of votes.
     *  @param _disputeID The ID of the dispute.
     *  @param _voteIDs The IDs of the votes.
     *  @param _commit The commit.
     */
    function castCommit(
        uint256 _disputeID,
        uint256[] memory _voteIDs,
        bytes32 _commit
    ) external onlyDuringPeriod(_disputeID, Period.commit) {
        Dispute storage dispute = disputes[_disputeID];
        require(_commit != bytes32(0));
        uint256 lastRoundID = disputeNbRounds[_disputeID] - 1;
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            Vote storage vote = disputeVotes[_disputeID][lastRoundID][_voteIDs[i]];
            require(vote.account == msg.sender, "The caller has to own the vote.");
            require(vote.commit == bytes32(0), "Already committed this vote.");
            vote.commit = _commit;
        }
        dispute.commitsInRound += _voteIDs.length;
    }

    /** @dev Sets the caller's choices for the specified votes.
     *  `O(n)` where
     *  `n` is the number of votes.
     *  @param _disputeID The ID of the dispute.
     *  @param _voteIDs The IDs of the votes.
     *  @param _choice The choice.
     *  @param _salt The salt for the commit if the votes were hidden.
     */
    function castVote(
        uint256 _disputeID,
        uint256[] memory _voteIDs,
        uint256 _choice,
        uint256 _salt
    ) external onlyDuringPeriod(_disputeID, Period.vote) {
        Dispute storage dispute = disputes[_disputeID];
        require(_voteIDs.length > 0);
        require(
            _choice <= dispute.numberOfChoices,
            "The choice has to be less than or equal to the number of choices for the dispute."
        );
        uint256 lastRoundID = disputeNbRounds[_disputeID] - 1;

        // Save the votes.
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            Vote storage vote = disputeVotes[_disputeID][lastRoundID][_voteIDs[i]];
            require(vote.account == msg.sender, "The caller has to own the vote.");
            require(
                !courts[dispute.subcourtID].hiddenVotes || vote.commit == keccak256(abi.encodePacked(_choice, _salt)),
                "The commit must match the choice in subcourts with hidden votes."
            );
            require(!vote.voted, "Vote already cast.");
            vote.choice = _choice;
            vote.voted = true;
        }
        dispute.votesInEachRound[lastRoundID] += _voteIDs.length;

        // Update winning choice.
        VoteCounter storage voteCounter = dispute.voteCounters[dispute.voteCounters.length - 1];
        voteCounter.counts[_choice] += _voteIDs.length;
        if (_choice == voteCounter.winningChoice) {
            // Voted for the winning choice.
            if (voteCounter.tied) voteCounter.tied = false; // Potentially broke tie.
        } else {
            // Voted for another choice.
            if (voteCounter.counts[_choice] == voteCounter.counts[voteCounter.winningChoice]) {
                // Tie.
                if (!voteCounter.tied) voteCounter.tied = true;
            } else if (voteCounter.counts[_choice] > voteCounter.counts[voteCounter.winningChoice]) {
                // New winner.
                voteCounter.winningChoice = _choice;
                voteCounter.tied = false;
            }
        }
    }

    /** @dev Computes the token and ETH rewards for a specified appeal in a specified dispute.
     *  @param _disputeID The ID of the dispute.
     *  @param _appeal The appeal.
     *  @return tokenReward The token reward.
     *  @return ETHReward The ETH reward.
     */
    function computeTokenAndETHRewards(
        uint256 _disputeID,
        uint256 _appeal
    ) private view returns (uint256 tokenReward, uint256 ETHReward) {
        Dispute storage dispute = disputes[_disputeID];

        // Distribute penalties and arbitration fees.
        if (dispute.voteCounters[dispute.voteCounters.length - 1].tied) {
            // Distribute penalties and fees evenly between active jurors.
            uint256 activeCount = dispute.votesInEachRound[_appeal];
            if (activeCount > 0) {
                tokenReward = dispute.penaltiesInEachRound[_appeal] / activeCount;
                ETHReward = dispute.totalFeesForJurors[_appeal] / activeCount;
            } else {
                tokenReward = 0;
                ETHReward = 0;
            }
        } else {
            // Distribute penalties and fees evenly between coherent jurors.
            uint256 winningChoice = dispute.voteCounters[dispute.voteCounters.length - 1].winningChoice;
            uint256 coherentCount = dispute.voteCounters[_appeal].counts[winningChoice];
            tokenReward = dispute.penaltiesInEachRound[_appeal] / coherentCount;
            ETHReward = dispute.totalFeesForJurors[_appeal] / coherentCount;
        }
    }

    /** @dev Repartitions tokens and ETH for a specified appeal in a specified dispute. Can be called in parts.
     *  `O(i + u * n * (n + p * log_k(j)))` where
     *  `i` is the number of iterations to run,
     *  `u` is the number of jurors that need to be unstaked,
     *  `n` is the maximum number of subcourts one of these jurors has staked in,
     *  `p` is the depth of the subcourt tree,
     *  `k` is the minimum number of children per node of one of these subcourts' sortition sum tree,
     *  and `j` is the maximum number of jurors that ever staked in one of these subcourts simultaneously.
     *  @param _disputeID The ID of the dispute.
     *  @param _appeal The appeal.
     *  @param _iterations The number of iterations to run.
     */
    function execute(
        uint256 _disputeID,
        uint256 _appeal,
        uint256 _iterations
    ) external onlyDuringPeriod(_disputeID, Period.execution) {
        lockInsolventTransfers = false;
        Dispute storage dispute = disputes[_disputeID];
        uint256 end = dispute.repartitionsInEachRound[_appeal] + _iterations;
        require(end >= dispute.repartitionsInEachRound[_appeal]);
        uint256 penaltiesInRoundCache = dispute.penaltiesInEachRound[_appeal]; // For saving gas.
        (uint256 tokenReward, uint256 ETHReward) = (0, 0);

        uint256 nbVotes = disputeNbVotesInRound[_disputeID][_appeal];

        // Avoid going out of range.
        if (
            !dispute.voteCounters[dispute.voteCounters.length - 1].tied &&
            dispute.voteCounters[_appeal].counts[dispute.voteCounters[dispute.voteCounters.length - 1].winningChoice] ==
            0
        ) {
            // We loop over the votes once as there are no rewards because it is not a tie and no one in this round is coherent with the final outcome.
            if (end > nbVotes) end = nbVotes;
        } else {
            // We loop over the votes twice, first to collect penalties, and second to distribute them as rewards along with arbitration fees.
            (tokenReward, ETHReward) = dispute.repartitionsInEachRound[_appeal] >= nbVotes
                ? computeTokenAndETHRewards(_disputeID, _appeal)
                : (0, 0); // Compute rewards if rewarding.
            if (end > nbVotes * 2) end = nbVotes * 2;
        }
        for (uint256 i = dispute.repartitionsInEachRound[_appeal]; i < end; i++) {
            Vote storage vote = disputeVotes[_disputeID][_appeal][i % nbVotes];
            if (
                vote.voted &&
                (vote.choice == dispute.voteCounters[dispute.voteCounters.length - 1].winningChoice ||
                    dispute.voteCounters[dispute.voteCounters.length - 1].tied)
            ) {
                // Juror was active, and voted coherently or it was a tie.
                if (i >= nbVotes) {
                    // Only execute in the second half of the iterations.

                    // Reward.
                    pinakion.transfer(vote.account, tokenReward);
                    // Intentional use to avoid blocking.
                    payable(vote.account).send(ETHReward); // solium-disable-line security/no-send
                    emit TokenAndETHShift(vote.account, _disputeID, int(tokenReward), int(ETHReward));
                    jurors[vote.account].lockedTokens -= dispute.tokensAtStakePerJuror[_appeal];
                }
            } else {
                // Juror was inactive, or voted incoherently and it was not a tie.
                if (i < nbVotes) {
                    // Only execute in the first half of the iterations.

                    // Penalize.
                    uint256 penalty = dispute.tokensAtStakePerJuror[_appeal] > pinakion.balanceOf(vote.account)
                        ? pinakion.balanceOf(vote.account)
                        : dispute.tokensAtStakePerJuror[_appeal];
                    pinakion.transferFrom(vote.account, address(this), penalty);
                    emit TokenAndETHShift(vote.account, _disputeID, -int(penalty), 0);
                    penaltiesInRoundCache += penalty;
                    jurors[vote.account].lockedTokens -= dispute.tokensAtStakePerJuror[_appeal];

                    // Unstake juror if his penalty made balance less than his total stake or if he lost due to inactivity.
                    if (pinakion.balanceOf(vote.account) < jurors[vote.account].stakedTokens || !vote.voted)
                        for (uint256 j = 0; j < jurors[vote.account].subcourtIDs.length; j++)
                            _setStake(vote.account, jurors[vote.account].subcourtIDs[j], 0);
                }
            }
            if (i == nbVotes - 1) {
                // Send fees and tokens to the governor if no one was coherent.
                if (
                    dispute.votesInEachRound[_appeal] == 0 ||
                    (!dispute.voteCounters[dispute.voteCounters.length - 1].tied &&
                        dispute.voteCounters[_appeal].counts[
                            dispute.voteCounters[dispute.voteCounters.length - 1].winningChoice
                        ] ==
                        0)
                ) {
                    // Intentional use to avoid blocking.
                    payable(governor).send(dispute.totalFeesForJurors[_appeal]); // solium-disable-line security/no-send
                    pinakion.transfer(governor, penaltiesInRoundCache);
                } else if (i + 1 < end) {
                    // Compute rewards because we are going into rewarding.
                    dispute.penaltiesInEachRound[_appeal] = penaltiesInRoundCache;
                    (tokenReward, ETHReward) = computeTokenAndETHRewards(_disputeID, _appeal);
                }
            }
        }
        if (dispute.penaltiesInEachRound[_appeal] != penaltiesInRoundCache)
            dispute.penaltiesInEachRound[_appeal] = penaltiesInRoundCache;
        dispute.repartitionsInEachRound[_appeal] = end;
        lockInsolventTransfers = true;
    }

    /** @dev Executes a specified dispute's ruling. UNTRUSTED.
     *  @param _disputeID The ID of the dispute.
     */
    function executeRuling(uint256 _disputeID) external onlyDuringPeriod(_disputeID, Period.execution) {
        Dispute storage dispute = disputes[_disputeID];
        require(!dispute.ruled, "Ruling already executed.");
        dispute.ruled = true;
        uint256 winningChoice = dispute.voteCounters[dispute.voteCounters.length - 1].tied
            ? 0
            : dispute.voteCounters[dispute.voteCounters.length - 1].winningChoice;
        dispute.arbitrated.rule(_disputeID, winningChoice);
    }

    /** @dev Receive the ruling from foreign gateway which technically is an arbitrator of this contract.
     *  @param _disputeID ID of the dispute.
     *  @param _ruling Ruling given by V2 court and relayed by foreign gateway.
     */
    function rule(uint256 _disputeID, uint256 _ruling) external {
        require(_disputeID < totalDisputes, "Dispute ID does not exist.");
        require(msg.sender == address(foreignGateway), "Can only be called by gateway");

        Dispute storage dispute = disputes[_disputeID];
        require(!dispute.ruled, "Ruling already executed.");
        dispute.ruled = true;

        // Send the relayed ruling to the arbitrable while fully bypassing the dispute flow.
        dispute.arbitrated.rule(_disputeID, _ruling);
    }

    /* Public */

    /** @dev Creates a dispute. Must be called by the arbitrable contract.
     *  @param _numberOfChoices Number of choices to choose from in the dispute to be created.
     *  @param _extraData Additional info about the dispute to be created. We use it to pass the ID of the subcourt to create the dispute in (first 32 bytes) and the minimum number of jurors required (next 32 bytes).
     *  @return disputeID The ID of the created dispute.
     */
    function createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData
    ) public payable override returns (uint256 disputeID) {
        require(msg.value == 0, "Fees should be paid in WETH");
        uint256 fee = foreignGateway.arbitrationCost(_extraData);
        // TODO: give possibility to overpay. Use createDisputeERC20 function?
        require(weth.transferFrom(msg.sender, address(this), fee), "Not enough WETH for arbitration");

        (uint96 subcourtID, uint256 minJurors) = extraDataToSubcourtIDAndMinJurors(_extraData);
        disputeID = totalDisputes++;
        Dispute storage dispute = disputes[disputeID];
        dispute.subcourtID = subcourtID;
        dispute.arbitrated = IArbitrable(msg.sender);
        dispute.numberOfChoices = _numberOfChoices;
        dispute.period = Period.evidence;
        dispute.lastPeriodChange = block.timestamp;
        // As many votes that can be afforded by the provided funds.

        uint256 nbVotes = msg.value / courts[dispute.subcourtID].feeForJuror;

        uint256 newLastRoundID = disputeNbRounds[disputeID];
        disputeNbVotesInRound[disputeID][newLastRoundID] = nbVotes;
        disputeNbRounds[disputeID]++;

        VoteCounter storage voteCounter = dispute.voteCounters.push();
        voteCounter.tied = true;
        dispute.tokensAtStakePerJuror.push(
            (courts[dispute.subcourtID].minStake * courts[dispute.subcourtID].alpha) / ALPHA_DIVISOR
        );
        dispute.totalFeesForJurors.push(msg.value);
        dispute.votesInEachRound.push(0);
        dispute.repartitionsInEachRound.push(0);
        dispute.penaltiesInEachRound.push(0);
        disputesWithoutJurors++;

        require(weth.transfer(address(foreignGateway), fee), "Fee transfer to gateway failed");
        foreignGateway.createDisputeERC20(_numberOfChoices, _extraData, fee);

        emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    /** @dev Appeals the ruling of a specified dispute.
     *  @param _disputeID The ID of the dispute.
     *  @param _extraData Additional info about the appeal. Not used by this contract.
     */
    function appeal(
        uint256 _disputeID,
        bytes memory _extraData
    ) public payable onlyDuringPeriod(_disputeID, Period.appeal) {
        Dispute storage dispute = disputes[_disputeID];
        require(msg.sender == address(dispute.arbitrated), "Can only be called by the arbitrable contract.");
        uint256 lastRoundID = disputeNbRounds[_disputeID] - 1;
        uint256 nbVotes = disputeNbVotesInRound[_disputeID][lastRoundID];
        if (nbVotes >= courts[dispute.subcourtID].jurorsForCourtJump)
            // Jump to parent subcourt.
            dispute.subcourtID = courts[dispute.subcourtID].parent;
        dispute.period = Period.evidence;
        dispute.lastPeriodChange = block.timestamp;
        // As many votes that can be afforded by the provided funds.
        uint256 newNbVotes = msg.value / courts[dispute.subcourtID].feeForJuror;

        uint256 newLastRoundID = disputeNbRounds[_disputeID];
        disputeNbVotesInRound[_disputeID][newLastRoundID] = newNbVotes;
        disputeNbRounds[_disputeID]++;

        VoteCounter storage voteCounter = dispute.voteCounters.push();
        voteCounter.tied = true;
        dispute.tokensAtStakePerJuror.push(
            (courts[dispute.subcourtID].minStake * courts[dispute.subcourtID].alpha) / ALPHA_DIVISOR
        );
        dispute.totalFeesForJurors.push(msg.value);
        dispute.drawsInRound = 0;
        dispute.commitsInRound = 0;
        dispute.votesInEachRound.push(0);
        dispute.repartitionsInEachRound.push(0);
        dispute.penaltiesInEachRound.push(0);
        disputesWithoutJurors++;

        emit NewPeriod(_disputeID, Period.evidence);
    }

    /** @dev DEPRECATED. Called when `_owner` sends ETH to the Wrapped Token contract.
     *  @param _owner The address that sent the ETH to create tokens.
     *  @return allowed Whether the operation should be allowed or not.
     */
    function proxyPayment(address _owner) public payable override returns (bool allowed) {
        allowed = false;
    }

    /** @dev Notifies the controller about a token transfer allowing the controller to react if desired.
     *  @param _from The origin of the transfer.
     *  @param _to The destination of the transfer.
     *  @param _amount The amount of the transfer.
     *  @return allowed Whether the operation should be allowed or not.
     */
    function onTransfer(address _from, address _to, uint256 _amount) public override returns (bool allowed) {
        if (lockInsolventTransfers) {
            // Never block penalties or rewards.
            uint256 newBalance = pinakion.balanceOf(_from) - _amount;
            if (newBalance < jurors[_from].stakedTokens || newBalance < jurors[_from].lockedTokens) return false;
        }
        allowed = true;
    }

    /** @dev Notifies the controller about an approval allowing the controller to react if desired.
     *  @param _owner The address that calls `approve()`.
     *  @param _spender The spender in the `approve()` call.
     *  @param _amount The amount in the `approve()` call.
     *  @return allowed Whether the operation should be allowed or not.
     */
    function onApprove(address _owner, address _spender, uint256 _amount) public override returns (bool allowed) {
        allowed = true;
    }

    /* Public Views */

    /** @dev Gets the cost of arbitration in a specified subcourt.
     *  @param _extraData Additional info about the dispute. We use it to pass the ID of the subcourt to create the dispute in (first 32 bytes) and the minimum number of jurors required (next 32 bytes).
     *  @return cost The cost.
     */
    function arbitrationCost(bytes memory _extraData) public view override returns (uint256 cost) {
        (uint96 subcourtID, uint256 minJurors) = extraDataToSubcourtIDAndMinJurors(_extraData);
        cost = courts[subcourtID].feeForJuror * minJurors;
    }

    /** @dev Gets the cost of appealing a specified dispute.
     *  @param _disputeID The ID of the dispute.
     *  @param _extraData Additional info about the appeal. Not used by this contract.
     *  @return cost The cost.
     */
    function appealCost(uint256 _disputeID, bytes memory _extraData) public view returns (uint256 cost) {
        Dispute storage dispute = disputes[_disputeID];
        uint256 lastRoundID = disputeNbRounds[_disputeID] - 1;
        uint256 lastNumberOfJurors = disputeNbVotesInRound[_disputeID][lastRoundID];
        if (lastNumberOfJurors >= courts[dispute.subcourtID].jurorsForCourtJump) {
            // Jump to parent subcourt.
            if (dispute.subcourtID == 0)
                // Already in the general court.
                cost = NON_PAYABLE_AMOUNT; // Get the cost of the parent subcourt.
            else cost = courts[courts[dispute.subcourtID].parent].feeForJuror * ((lastNumberOfJurors * 2) + 1);
        }
        // Stay in current subcourt.
        else cost = courts[dispute.subcourtID].feeForJuror * ((lastNumberOfJurors * 2) + 1);
    }

    /** @dev Gets the start and end of a specified dispute's current appeal period.
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
        ruling = dispute.voteCounters[dispute.voteCounters.length - 1].tied
            ? 0
            : dispute.voteCounters[dispute.voteCounters.length - 1].winningChoice;
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
     *  @return succeeded True if the call succeeded, false otherwise.
     */
    function _setStake(address _account, uint96 _subcourtID, uint128 _stake) internal returns (bool succeeded) {
        if (!(_subcourtID < courts.length)) return false;

        // Delayed action logic.
        if (phase != Phase.staking) {
            delayedSetStakes[++lastDelayedSetStake] = DelayedSetStake({
                account: _account,
                subcourtID: _subcourtID,
                stake: _stake
            });
            return true;
        }

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

    /** @dev Gets a subcourt ID and the minimum number of jurors required from a specified extra data bytes array.
     *  @param _extraData The extra data bytes array. The first 32 bytes are the subcourt ID and the next 32 bytes are the minimum number of jurors.
     *  @return subcourtID The subcourt ID.
     *  @return minJurors The minimum number of jurors required.
     */
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
            if (minJurors == 0) minJurors = MIN_JURORS;
        } else {
            subcourtID = 0;
            minJurors = MIN_JURORS;
        }
    }

    /** @dev Packs an account and a subcourt ID into a stake path ID.
     *  @param _account The account to pack.
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

    /** @dev Unpacks a stake path ID into an account and a subcourt ID.
     *  @param _stakePathID The stake path ID to unpack.
     *  @return account The account.
     *  @return subcourtID The subcourt ID.
     */
    function stakePathIDToAccountAndSubcourtID(
        bytes32 _stakePathID
    ) internal pure returns (address account, uint96 subcourtID) {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(add(ptr, 0x0c), i), byte(i, _stakePathID))
            }
            account := mload(ptr)
            subcourtID := _stakePathID
        }
    }

    /* Interface Views */

    /** @dev Gets a specified subcourt's non primitive properties.
     *  @param _subcourtID The ID of the subcourt.
     *  @return children The subcourt's child court list.
     *  @return timesPerPeriod The subcourt's time per period.
     */
    function getSubcourt(
        uint96 _subcourtID
    ) external view returns (uint256[] memory children, uint256[4] memory timesPerPeriod) {
        Court storage subcourt = courts[_subcourtID];
        children = subcourt.children;
        timesPerPeriod = subcourt.timesPerPeriod;
    }

    /** @dev Gets a specified vote for a specified appeal in a specified dispute.
     *  @param _disputeID The ID of the dispute.
     *  @param _appeal The appeal.
     *  @param _voteID The ID of the vote.
     *  @return account The account for vote.
     *  @return commit  The commit for vote.
     *  @return choice  The choice for vote.
     *  @return voted True if the account voted, False otherwise.
     */
    function getVote(
        uint256 _disputeID,
        uint256 _appeal,
        uint256 _voteID
    ) external view returns (address account, bytes32 commit, uint256 choice, bool voted) {
        Vote storage vote = disputeVotes[_disputeID][_appeal][_voteID];
        account = vote.account;
        commit = vote.commit;
        choice = vote.choice;
        voted = vote.voted;
    }

    /** @dev Gets the vote counter for a specified appeal in a specified dispute.
     *  Note: This function is only to be used by the interface and it won't work if the number of choices is too high.
     *  @param _disputeID The ID of the dispute.
     *  @param _appeal The appeal.
     *  @return winningChoice The winning choice.
     *  @return counts The count.
     *  @return tied Whether the vote tied.
     *  `O(n)` where
     *  `n` is the number of choices of the dispute.
     */
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

    /** @dev Gets a specified dispute's non primitive properties.
     *  @param _disputeID The ID of the dispute.
     *  @return votesLengths The dispute's vote length.
     *  @return tokensAtStakePerJuror The dispute's required tokens at stake per Juror.
     *  @return totalFeesForJurors The dispute's total fees for Jurors.
     *  @return votesInEachRound The dispute's counter of votes made in each round.
     *  @return repartitionsInEachRound The dispute's counter of vote reward repartitions made in each round.
     *  @return penaltiesInEachRound The dispute's amount of tokens collected from penalties in each round.
     *  `O(a)` where
     *  `a` is the number of appeals of the dispute.
     */
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
        votesLengths = new uint256[](disputeNbRounds[_disputeID]);
        for (uint256 i = 0; i < disputeNbRounds[_disputeID]; i++)
            votesLengths[i] = disputeNbVotesInRound[_disputeID][i];
        tokensAtStakePerJuror = dispute.tokensAtStakePerJuror;
        totalFeesForJurors = dispute.totalFeesForJurors;
        votesInEachRound = dispute.votesInEachRound;
        repartitionsInEachRound = dispute.repartitionsInEachRound;
        penaltiesInEachRound = dispute.penaltiesInEachRound;
    }

    /** @dev Gets a specified juror's non primitive properties.
     *  @param _account The address of the juror.
     *  @return subcourtIDs The juror's IDs of subcourts where the juror has stake path.
     */
    function getJuror(address _account) external view returns (uint96[] memory subcourtIDs) {
        Juror storage juror = jurors[_account];
        subcourtIDs = juror.subcourtIDs;
    }

    /** @dev Gets the stake of a specified juror in a specified subcourt.
     *  @param _account The address of the juror.
     *  @param _subcourtID The ID of the subcourt.
     *  @return stake The stake.
     */
    function stakeOf(address _account, uint96 _subcourtID) external view returns (uint256 stake) {
        return
            sortitionSumTrees.stakeOf(
                bytes32(uint256(_subcourtID)),
                accountAndSubcourtIDToStakePathID(_account, _subcourtID)
            );
    }
}

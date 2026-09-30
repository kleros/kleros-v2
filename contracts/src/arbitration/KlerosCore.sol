// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IArbitrableV2} from "./interfaces/IArbitrableV2.sol";
import {IArbitratorV2} from "./interfaces/IArbitratorV2.sol";
import {IDisputeKit} from "./interfaces/IDisputeKit.sol";
import {ISortitionModule} from "./interfaces/ISortitionModule.sol";
import {ICourtEligibility} from "./interfaces/ICourtEligibility.sol";
import {SafeERC20} from "../libraries/SafeERC20.sol";
import {SafeSend} from "../libraries/SafeSend.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/Constants.sol";

/// @title KlerosCore
/// @notice Core arbitrator contract for Kleros v2.
/// @dev This contract trusts the PNK token, the dispute kits and the sortition module contracts.
/// Dispute kits should only be trusted for what relates to disputes assigned to them.
/// They should not be able to affect unrelated disputes, redistribute more PNK than allowed
/// or re-enter state-changing Core functions during callbacks.
contract KlerosCore is IArbitratorV2, Initializable {
    using SafeERC20 for IERC20;
    using SafeSend for address payable;

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
        uint256 minStake; // Minimum PNKs needed to stake in the court.
        uint256 alpha; // Max basis point of PNKs that are lost when incoherent.
        uint256 feeForJuror; // Arbitration fee paid per juror.
        mapping(uint256 disputeKitId => bool) supportedDisputeKits; // True if DK with this ID is supported by the court. Note that each new court must support classic dispute kit.
        ICourtEligibility eligibility; // The eligibility predicate for the court.
        AdditionalCourtParams[] additionalCourtParamsChanges; // Stores the additional court parameters (hiddenVotes, jurorsForCourtJump, timesPerPeriod) over time.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct AdditionalCourtParams {
        bool hiddenVotes; // Whether to use commit and reveal or not.
        uint256 jurorsForCourtJump; // The appeal after the one that reaches this number of jurors will go to the parent court if any.
        uint256[4] timesPerPeriod; // The time allotted to each dispute period in the form `timesPerPeriod[period]`.
    }

    struct Dispute {
        uint96 courtID; // The ID of the court the dispute is in.
        IArbitrableV2 arbitrated; // The arbitrable contract.
        Period period; // The current period of the dispute.
        bool ruled; // True if the ruling has been executed in the arbitrable, false otherwise.
        uint256 lastPeriodChange; // The last time the period was changed.
        Round[] rounds; // Rounds of the dispute.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct Round {
        uint256 disputeKitID; // Index of the dispute kit in the array.
        uint256 pnkAtStakePerJuror; // The amount of PNKs at stake for each juror in this round.
        uint256 totalFeesForJurors; // The total juror fees paid in this round.
        uint256 nbVotes; // The total number of votes the dispute can possibly have in the current round.
        uint256 repartitions; // A counter of reward repartitions made in this round.
        uint256 pnkPenalties; // The amount of PNKs collected from penalties in this round.
        address[] drawnJurors; // Addresses of the jurors that were drawn in this round.
        uint256 sumFeeRewardPaid; // Total sum of arbitration fees paid to coherent jurors as a reward in this round.
        uint256 sumPnkRewardPaid; // Total sum of PNK paid to coherent jurors as a reward in this round.
        uint256 drawIterations; // The number of iterations passed drawing the jurors for this round.
        uint256 courtParamsIndex; // Index of relevant additional court parameters.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 private constant NON_PAYABLE_AMOUNT = (2 ** 256 - 2) / 2; // An amount higher than the supply of ETH.

    address payable public owner; // The owner of the contract. Note that the owner is trusted to set correct governance parameters and to not re-enter.
    IERC20 public pnkToken; // The Pinakion token contract.
    ISortitionModule public sortitionModule; // Sortition module for drawing.
    Court[] public courts; // The courts.
    IDisputeKit[] public disputeKits; // Array of dispute kits.
    Dispute[] public disputes; // The disputes.
    address public wNative; // The wrapped native token for safeSend().

    mapping(address => uint256) public balances; // Pnk balances of the jurors.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when period is passed.
    /// @param _disputeID ID of the related dispute.
    /// @param _period The new period.
    event NewPeriod(uint256 indexed _disputeID, Period _period);

    /// @notice Emitted when appeal period starts.
    /// @param _disputeID ID of the related dispute.
    /// @param _arbitrable The arbitrable contract.
    event AppealPossible(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);

    /// @notice Emitted when the dispute is successfully appealed.
    /// @param _disputeID ID of the related dispute.
    /// @param _arbitrable The arbitrable contract.
    event AppealDecision(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);

    /// @notice Emitted when an address is successfully drawn.
    /// @param _address The drawn address.
    /// @param _disputeID ID of the related dispute.
    /// @param _roundID ID of the related round.
    /// @param _voteID ID of the vote given to the drawn juror.
    event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _roundID, uint256 _voteID);

    /// @notice Emitted when a new court is created.
    /// @param _courtID ID of the new court.
    /// @param _parent ID of the parent court.
    /// @param _hiddenVotes Whether the court has hidden votes or not.
    /// @param _minStake The `minStake` property value of the court.
    /// @param _alpha The `alpha` property value of the court.
    /// @param _feeForJuror The `feeForJuror` property value of the court.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the court.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the court.
    /// @param _supportedDisputeKits Indexes of dispute kits that this court will support.
    /// @param _eligibility The eligibility predicate for the court.
    event CourtCreated(
        uint96 indexed _courtID,
        uint96 indexed _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] _timesPerPeriod,
        uint256[] _supportedDisputeKits,
        ICourtEligibility _eligibility
    );

    /// @notice Emitted when court's parameters are changed.
    /// @param _courtID ID of the court.
    /// @param _hiddenVotes Whether the court has hidden votes or not.
    /// @param _minStake The `minStake` property value of the court.
    /// @param _alpha The `alpha` property value of the court.
    /// @param _feeForJuror The `feeForJuror` property value of the court.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the court.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the court.
    /// @param _eligibility The eligibility predicate for the court.
    event CourtModified(
        uint96 indexed _courtID,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] _timesPerPeriod,
        ICourtEligibility _eligibility
    );

    /// @notice Emitted when a dispute kit is created.
    /// @param _disputeKitID ID of the new dispute kit.
    /// @param _disputeKitAddress Address of the new dispute kit.
    event DisputeKitCreated(uint256 indexed _disputeKitID, IDisputeKit indexed _disputeKitAddress);

    /// @notice Emitted when a dispute kit is enabled/disabled in a court.
    /// @param _courtID ID of the related court.
    /// @param _disputeKitID ID of the dispute kit.
    /// @param _enable Whether the dispute kit has been enabled or disabled.
    event DisputeKitEnabled(uint96 indexed _courtID, uint256 indexed _disputeKitID, bool indexed _enable);

    /// @notice Emitted when a dispute jumps to a new court.
    /// @param _disputeID ID of the dispute.
    /// @param _roundID ID of the round.
    /// @param _fromCourtID ID of the previous court.
    /// @param _toCourtID ID of the new court.
    event CourtJump(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint96 indexed _fromCourtID,
        uint96 _toCourtID
    );

    /// @notice Emitted when a dispute jumps to a new dispute kit.
    /// @param _disputeID ID of the dispute.
    /// @param _roundID ID of the round.
    /// @param _fromDisputeKitID ID of the previous dispute kit.
    /// @param _toDisputeKitID ID of the new dispute kit.
    event DisputeKitJump(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint256 indexed _fromDisputeKitID,
        uint256 _toDisputeKitID
    );

    /// @notice Emitted when juror's balance shifts after penalties/rewards has been processed.
    /// @param _account Juror's address.
    /// @param _disputeID ID of the dispute.
    /// @param _roundID ID of the round.
    /// @param _amountPnk Amount of PNK shifted. Positive value for rewards, negative for penalties.
    /// @param _amountFee Amount of fee shifted. Positive value for rewards, negative for penalties.
    event JurorRewardPenalty(
        address indexed _account,
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        int256 _amountPnk,
        int256 _amountFee
    );

    /// @notice Emitted when leftover reward sent to owner.
    /// @param _disputeID ID of the dispute.
    /// @param _roundID ID of the round.
    /// @param _amountPnk Amount of PNK sent.
    /// @param _amountFee Amount of fee sent.
    event LeftoverRewardSent(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint256 _amountPnk,
        uint256 _amountFee
    );

    /// @notice Emitted when PNK is deposited by the juror.
    /// @param _account Juror's address.
    /// @param _amount Amount of deposited PNK.
    event TokensDeposited(address indexed _account, uint256 _amount);

    /// @notice Emitted when PNK is withdrawn by the juror.
    /// @param _account Juror's address.
    /// @param _amount Amount of withdrawn PNK.
    event TokensWithdrawn(address indexed _account, uint256 _amount);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer (constructor equivalent for upgradable contracts).
    /// @param _owner The owner's address.
    /// @param _pnkToken The address of the token contract.
    /// @param _disputeKit The address of the default dispute kit.
    /// @param _finalDisputeKit The address of the final dispute kit.
    /// @param _hiddenVotes The `hiddenVotes` property value of the general court.
    /// @param _courtParameters Numeric parameters of General court (minStake, alpha, feeForJuror and jurorsForCourtJump respectively).
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the general court.
    /// @param _finalCourtTimesPerPeriod The `timesPerPeriod` property value of the final court.
    /// @param _sortitionModuleAddress The sortition module responsible for sortition of the jurors.
    /// @param _wNative The wrapped native token address, typically wETH.
    function initialize(
        address payable _owner,
        IERC20 _pnkToken,
        IDisputeKit _disputeKit,
        IDisputeKit _finalDisputeKit,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        uint256[4] memory _finalCourtTimesPerPeriod,
        ISortitionModule _sortitionModuleAddress,
        address _wNative
    ) external initializer {
        owner = _owner;
        pnkToken = _pnkToken;
        sortitionModule = _sortitionModuleAddress;
        wNative = _wNative;

        // FINAL_DISPUTE_KIT.
        disputeKits.push(_finalDisputeKit);

        emit DisputeKitCreated(FINAL_DISPUTE_KIT, _finalDisputeKit);

        // DISPUTE_KIT_CLASSIC
        disputeKits.push(_disputeKit);

        emit DisputeKitCreated(DISPUTE_KIT_CLASSIC, _disputeKit);

        // FINAL_COURT
        Court storage finalCourt = courts.push();
        finalCourt.parent = FINAL_COURT;
        finalCourt.minStake = type(uint256).max;
        finalCourt.alpha = 0;
        finalCourt.feeForJuror = 0;

        finalCourt.additionalCourtParamsChanges.push(
            AdditionalCourtParams({
                hiddenVotes: false,
                jurorsForCourtJump: 0,
                timesPerPeriod: _finalCourtTimesPerPeriod
            })
        );

        uint256[] memory supportedDisputeKits = new uint256[](1);
        supportedDisputeKits[0] = FINAL_DISPUTE_KIT;
        emit CourtCreated(
            FINAL_COURT,
            FINAL_COURT,
            false,
            type(uint256).max,
            0,
            0,
            0,
            _finalCourtTimesPerPeriod,
            supportedDisputeKits,
            NULL_ELIGIBILITY_REQUIREMENT
        );

        courts[FINAL_COURT].supportedDisputeKits[FINAL_DISPUTE_KIT] = true;
        emit DisputeKitEnabled(FINAL_COURT, FINAL_DISPUTE_KIT, true);

        // GENERAL_COURT
        Court storage court = courts.push();
        court.parent = FINAL_COURT;
        court.minStake = _courtParameters[0];
        court.alpha = _courtParameters[1];
        court.feeForJuror = _courtParameters[2];

        court.additionalCourtParamsChanges.push(
            AdditionalCourtParams({
                hiddenVotes: _hiddenVotes,
                jurorsForCourtJump: _courtParameters[3],
                timesPerPeriod: _timesPerPeriod
            })
        );

        sortitionModule.createTree(GENERAL_COURT);

        supportedDisputeKits = new uint256[](1);
        supportedDisputeKits[0] = DISPUTE_KIT_CLASSIC;
        emit CourtCreated(
            GENERAL_COURT,
            court.parent,
            _hiddenVotes,
            _courtParameters[0],
            _courtParameters[1],
            _courtParameters[2],
            _courtParameters[3],
            _timesPerPeriod,
            supportedDisputeKits,
            NULL_ELIGIBILITY_REQUIREMENT
        );
        courts[GENERAL_COURT].supportedDisputeKits[DISPUTE_KIT_CLASSIC] = true;
        emit DisputeKitEnabled(GENERAL_COURT, DISPUTE_KIT_CLASSIC, true);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Allows the owner to call anything on behalf of the contract.
    /// @param _destination The destination of the call.
    /// @param _amount The value sent with the call.
    /// @param _data The data sent with the call.
    function executeOwnerProposal(address _destination, uint256 _amount, bytes calldata _data) external onlyOwner {
        (bool success, ) = _destination.call{value: _amount}(_data);
        require(success, UnsuccessfulCall());
    }

    /// @notice Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address payable _owner) external onlyOwner {
        owner = _owner;
    }

    /// @notice Changes the `pnkToken` storage variable.
    /// @param _pnkToken The new value for the `pnkToken` storage variable.
    function changePnkToken(IERC20 _pnkToken) external onlyOwner {
        pnkToken = _pnkToken;
    }

    /// @notice Changes the `_sortitionModule` storage variable.
    /// Note that the new module should be initialized for all courts.
    /// @param _sortitionModule The new value for the `sortitionModule` storage variable.
    function changeSortitionModule(ISortitionModule _sortitionModule) external onlyOwner {
        sortitionModule = _sortitionModule;
    }

    /// @notice Add a new supported dispute kit, without enabling it.
    /// Use `enableDisputeKits()` to enable the dispute kit for a specific court.
    /// @param _disputeKitAddress The address of the dispute kit contract.
    function addNewDisputeKit(IDisputeKit _disputeKitAddress) external onlyOwner {
        uint256 disputeKitID = disputeKits.length;
        disputeKits.push(_disputeKitAddress);
        emit DisputeKitCreated(disputeKitID, _disputeKitAddress);
    }

    /// @notice Creates a court under a specified parent court.
    /// @dev We trust the governance to provide proper inputs.
    /// @dev Child courts should have a minStake greater than or equal to their parent's, and eligibility requirements
    /// equal to or stricter than their parent's. Otherwise, staking in the child can bypass the parent's
    /// requirements through implicit parent court staking.
    /// @param _parent The `parent` property value of the court.
    /// @param _hiddenVotes The `hiddenVotes` property value of the court.
    /// @param _minStake The `minStake` property value of the court.
    /// @param _alpha The `alpha` property value of the court.
    /// @param _feeForJuror The `feeForJuror` property value of the court.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the court.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the court.
    /// @param _supportedDisputeKits Indexes of dispute kits that this court will support.
    /// @param _eligibility The eligibility predicate for the court.
    function createCourt(
        uint96 _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod,
        uint256[] memory _supportedDisputeKits,
        ICourtEligibility _eligibility
    ) external onlyOwner {
        uint96 courtID = uint96(courts.length);
        Court storage court = courts.push();

        for (uint256 i = 0; i < _supportedDisputeKits.length; i++) {
            uint256 disputeKitID = _supportedDisputeKits[i];
            require(disputeKitID != FINAL_DISPUTE_KIT && disputeKitID < disputeKits.length, WrongDisputeKitIndex());
            court.supportedDisputeKits[disputeKitID] = true;
            emit DisputeKitEnabled(courtID, disputeKitID, true);
        }
        // Check that Classic DK support was added.
        require(court.supportedDisputeKits[DISPUTE_KIT_CLASSIC], MustSupportDisputeKitClassic());

        court.parent = _parent;
        court.minStake = _minStake;
        court.alpha = _alpha;
        court.feeForJuror = _feeForJuror;
        court.eligibility = _eligibility;

        court.additionalCourtParamsChanges.push(
            AdditionalCourtParams({
                hiddenVotes: _hiddenVotes,
                jurorsForCourtJump: _jurorsForCourtJump,
                timesPerPeriod: _timesPerPeriod
            })
        );

        sortitionModule.createTree(courtID);

        emit CourtCreated(
            courtID,
            _parent,
            _hiddenVotes,
            _minStake,
            _alpha,
            _feeForJuror,
            _jurorsForCourtJump,
            _timesPerPeriod,
            _supportedDisputeKits,
            _eligibility
        );
    }

    /// @notice Changes the parameters of the court.
    /// @dev We trust the governance to provide proper inputs.
    /// @dev Child courts should have a minStake greater than or equal to their parent's, and eligibility requirements
    /// equal to or stricter than their parent's. Otherwise, staking in the child can bypass the parent's
    /// requirements through implicit parent court staking.
    /// @param _courtID ID of the court.
    /// @param _hiddenVotes The `hiddenVotes` property value of the court.
    /// @param _minStake The `minStake` property value of the court.
    /// @param _alpha The `alpha` property value of the court.
    /// @param _feeForJuror The `feeForJuror` property value of the court.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the court.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the court.
    /// @param _eligibility The eligibility predicate for the court.
    function changeCourtParameters(
        uint96 _courtID,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod,
        ICourtEligibility _eligibility
    ) external onlyOwner {
        Court storage court = courts[_courtID];

        court.minStake = _minStake;
        court.alpha = _alpha;
        court.feeForJuror = _feeForJuror;
        court.eligibility = _eligibility;

        court.additionalCourtParamsChanges.push(
            AdditionalCourtParams({
                hiddenVotes: _hiddenVotes,
                jurorsForCourtJump: _jurorsForCourtJump,
                timesPerPeriod: _timesPerPeriod
            })
        );

        emit CourtModified(
            _courtID,
            _hiddenVotes,
            _minStake,
            _alpha,
            _feeForJuror,
            _jurorsForCourtJump,
            _timesPerPeriod,
            _eligibility
        );
    }

    /// @notice Adds/removes court's support for specified dispute kits.
    /// @param _courtID The ID of the court.
    /// @param _disputeKitIDs The IDs of dispute kits which support should be added/removed.
    /// @param _enable Whether add or remove the dispute kits from the court.
    function enableDisputeKits(uint96 _courtID, uint256[] memory _disputeKitIDs, bool _enable) external onlyOwner {
        for (uint256 i = 0; i < _disputeKitIDs.length; i++) {
            require(
                _disputeKitIDs[i] != FINAL_DISPUTE_KIT && _disputeKitIDs[i] < disputeKits.length,
                WrongDisputeKitIndex()
            );
            if (_enable) {
                courts[_courtID].supportedDisputeKits[_disputeKitIDs[i]] = true;
                emit DisputeKitEnabled(_courtID, _disputeKitIDs[i], true);
            } else {
                // Classic dispute kit must be supported by all courts.
                require(_disputeKitIDs[i] != DISPUTE_KIT_CLASSIC, CannotDisableClassicDK());
                courts[_courtID].supportedDisputeKits[_disputeKitIDs[i]] = false;
                emit DisputeKitEnabled(_courtID, _disputeKitIDs[i], false);
            }
        }
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Sets the caller's stake in a court.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    function setStake(uint96 _courtID, uint256 _newStake) external {
        require(_courtID != FINAL_COURT && _courtID < courts.length, StakingNotPossibleInThisCourt()); // Staking directly into the final court is not allowed.
        require(sortitionModule.setStake(msg.sender, _courtID, _newStake, false), StakingFailed());
    }

    /// @notice Unstakes a juror from a court if they are no longer eligible for it.
    /// @param _juror The juror to unstake.
    /// @param _courtID The court to unstake the juror from.
    function forceUnstake(address _juror, uint96 _courtID) external {
        ICourtEligibility eligibility = courts[_courtID].eligibility;

        require(
            eligibility != NULL_ELIGIBILITY_REQUIREMENT && !eligibility.isEligible(_juror, _courtID),
            JurorStillEligible()
        );

        require(sortitionModule.setStake(_juror, _courtID, 0, true), StakingFailed());
    }

    /// @notice Deposits PNK tokens into the contract for later staking.
    /// @param _amount The amount to deposit.
    function depositTokens(uint256 _amount) external {
        balances[msg.sender] += _amount;
        require(pnkToken.safeTransferFrom(msg.sender, address(this), _amount), TransferFailed());

        emit TokensDeposited(msg.sender, _amount);
    }

    /// @notice Withdraws PNK tokens from the contract.
    /// @param _amount The amount to withdraw.
    function withdrawTokens(uint256 _amount) external {
        uint256 currentBalance = balances[msg.sender];

        require(_amount <= currentBalance, AmountExceedsBalance());

        uint256 newBalance = currentBalance - _amount;
        (uint256 stakedPnk, uint256 lockedPnk) = sortitionModule.getJurorBalance(msg.sender);
        require(newBalance >= stakedPnk && newBalance >= lockedPnk, CannotWithdrawActiveTokens());

        balances[msg.sender] = newBalance;
        require(pnkToken.safeTransfer(msg.sender, _amount), TransferFailed());

        emit TokensWithdrawn(msg.sender, _amount);
    }

    /// @notice Create a dispute and pay for the fees.
    /// @dev Must be called by the arbitrable contract and pay at least `arbitrationCost(_extraData)`.
    /// @param _numberOfChoices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return disputeID The identifier of the dispute created.
    function createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData
    ) external payable returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), ArbitrationFeesNotEnough());

        // If `_extraData` contains an incorrect value then this value will be switched to default.
        (uint96 courtID, , uint256 disputeKitID) = _extraDataToCourtIDMinJurorsDisputeKit(_extraData);

        disputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.courtID = courtID;
        dispute.arbitrated = IArbitrableV2(msg.sender);
        dispute.lastPeriodChange = block.timestamp;

        IDisputeKit disputeKit = disputeKits[disputeKitID];
        Court storage court = courts[courtID];
        Round storage round = dispute.rounds.push();

        round.nbVotes = msg.value / court.feeForJuror;
        round.disputeKitID = disputeKitID;
        round.pnkAtStakePerJuror = (court.minStake * court.alpha) / ONE_BASIS_POINT;
        round.totalFeesForJurors = msg.value;
        round.courtParamsIndex = court.additionalCourtParamsChanges.length - 1;

        sortitionModule.registerDisputeForDrawing(disputeID);

        disputeKit.createDispute(disputeID, 0, _numberOfChoices);
        emit DisputeCreation(disputeID, IArbitrableV2(msg.sender));
    }

    /// @notice Passes the period of a specified dispute. TRUSTED.
    /// @param _disputeID The ID of the dispute.
    function passPeriod(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        uint256 currentRound = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[currentRound];
        AdditionalCourtParams storage courtParams = courts[dispute.courtID].additionalCourtParamsChanges[
            round.courtParamsIndex
        ];
        if (dispute.period == Period.evidence) {
            require(
                currentRound != 0 ||
                    block.timestamp - dispute.lastPeriodChange >= courtParams.timesPerPeriod[uint256(dispute.period)],
                EvidencePeriodNotPassedAndNotAppeal()
            );
            require(round.drawnJurors.length == round.nbVotes, DisputeStillDrawing());
            dispute.period = courtParams.hiddenVotes ? Period.commit : Period.vote;
        } else if (dispute.period == Period.commit) {
            require(
                block.timestamp - dispute.lastPeriodChange >= courtParams.timesPerPeriod[uint256(dispute.period)] ||
                    disputeKits[round.disputeKitID].areCommitsAllCast(_disputeID),
                CommitPeriodNotPassed()
            );
            dispute.period = Period.vote;
        } else if (dispute.period == Period.vote) {
            require(
                block.timestamp - dispute.lastPeriodChange >= courtParams.timesPerPeriod[uint256(dispute.period)] ||
                    disputeKits[round.disputeKitID].areVotesAllCast(_disputeID),
                VotePeriodNotPassed()
            );
            dispute.period = Period.appeal;
            emit AppealPossible(_disputeID, dispute.arbitrated);
        } else if (dispute.period == Period.appeal) {
            require(
                block.timestamp - dispute.lastPeriodChange >= courtParams.timesPerPeriod[uint256(dispute.period)] ||
                    disputeKits[round.disputeKitID].isAppealTimeFinished(_disputeID),
                AppealPeriodNotPassed()
            );
            dispute.period = Period.execution;
            // Note that relying on currentRuling here allows dispute kits to prevent passing period until the ruling is ready (e.g. CentralizedKit).
            (uint256 winningChoice, , ) = currentRuling(_disputeID);
            emit Ruling(dispute.arbitrated, _disputeID, winningChoice);
        } else if (dispute.period == Period.execution) {
            revert DisputePeriodIsFinal();
        }

        dispute.lastPeriodChange = block.timestamp;
        emit NewPeriod(_disputeID, dispute.period);
    }

    /// @notice Draws jurors for the dispute. Can be called in parts. TRUSTED.
    /// @dev `O(n)` where `n = min(_iterations, remainingJurorsToDraw)`.
    /// @dev Dispute kits are trusted not to re-enter state-changing Core functions from their draw callback.
    /// @param _disputeID The ID of the dispute.
    /// @param _iterations The number of iterations to run.
    /// @return The total number of jurors drawn in the round.
    function draw(uint256 _disputeID, uint256 _iterations) external returns (uint256) {
        Dispute storage dispute = disputes[_disputeID];
        uint256 currentRound = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[currentRound];
        require(dispute.period == Period.evidence, NotEvidencePeriod());

        IDisputeKit disputeKit = disputeKits[round.disputeKitID];

        uint256 startIndex = round.drawIterations; // for gas: less storage reads
        uint256 i;
        while (i < _iterations && round.drawnJurors.length < round.nbVotes) {
            (address drawnAddress, uint96 fromSubcourtID) = disputeKit.draw(
                _disputeID,
                startIndex + i++,
                round.nbVotes
            );
            if (drawnAddress == address(0)) {
                continue;
            }
            // Perform a sanity check that the juror was in fact staked in the court he was drawn for.
            uint256 stakedInCourt = sortitionModule.stakeOf(drawnAddress, fromSubcourtID);
            if (stakedInCourt == 0) {
                continue;
            }
            sortitionModule.lockStake(drawnAddress, round.pnkAtStakePerJuror);
            emit Draw(drawnAddress, _disputeID, currentRound, round.drawnJurors.length);
            round.drawnJurors.push(drawnAddress);
            if (round.drawnJurors.length == round.nbVotes) {
                sortitionModule.completeDisputeDrawing();
            }
        }
        round.drawIterations += i;
        return round.drawnJurors.length;
    }

    /// @notice Appeals the ruling of a specified dispute. TRUSTED.
    /// @dev Access restricted to the Dispute Kit for this `_disputeID`.
    /// @param _disputeID The ID of the dispute.
    /// @param _numberOfChoices Number of choices for the dispute. Can be required during court jump.
    function appeal(uint256 _disputeID, uint256 _numberOfChoices) external payable {
        require(msg.value >= appealCost(_disputeID), AppealFeesNotEnough());

        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.appeal, DisputeNotAppealable());

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        require(msg.sender == address(disputeKits[round.disputeKitID]), DisputeKitOnly());

        (uint96 newCourtID, uint256 newDisputeKitID, ) = _getCompatibleNextRoundSettings(dispute, round, _disputeID);

        // Note that the extra round must be created before calling disputeKit.createDispute() and after next round settings have been obtained.
        uint256 extraRoundID = dispute.rounds.length;
        Round storage extraRound = dispute.rounds.push();

        if (newCourtID != dispute.courtID) {
            emit CourtJump(_disputeID, extraRoundID, dispute.courtID, newCourtID);
        }

        dispute.courtID = newCourtID;
        dispute.period = Period.evidence;
        dispute.lastPeriodChange = block.timestamp;

        Court storage court = courts[newCourtID];
        extraRound.pnkAtStakePerJuror = (court.minStake * court.alpha) / ONE_BASIS_POINT;
        extraRound.disputeKitID = newDisputeKitID;
        extraRound.courtParamsIndex = court.additionalCourtParamsChanges.length - 1;

        if (newCourtID == FINAL_COURT) {
            // Set nbVotes to 0 since FC has no drawing.
            extraRound.nbVotes = 0;
            // Final round's appeal fees will be handled by Final Kit.
            // Note that since Final Kit is a proxy contract safeSend()'s native transfer will run out of gas, so we use call() instead.
            // Also note that we trust Final Kit to not re-enter.
            (bool success, ) = address(disputeKits[newDisputeKitID]).call{value: msg.value}("");
            require(success, TransferFailed());
        } else {
            extraRound.totalFeesForJurors = msg.value;
            extraRound.nbVotes = msg.value / court.feeForJuror; // As many votes that can be afforded by the provided funds.
            // Only increase `disputesWithoutJurors` if nbVotes is non-zero.
            sortitionModule.registerDisputeForDrawing(_disputeID);
        }

        // Dispute kit was changed, so create a dispute in the new DK contract.
        if (extraRound.disputeKitID != round.disputeKitID) {
            emit DisputeKitJump(_disputeID, extraRoundID, round.disputeKitID, extraRound.disputeKitID);
            disputeKits[extraRound.disputeKitID].createDispute(_disputeID, extraRoundID, _numberOfChoices);
        }

        emit AppealDecision(_disputeID, dispute.arbitrated);
        emit NewPeriod(_disputeID, Period.evidence);
    }

    /// @notice Distribute the PNKs at stake and the dispute fees for the specific round of the dispute. Can be called in parts. TRUSTED.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The appeal round.
    /// @param _iterations The number of iterations to run.
    function execute(uint256 _disputeID, uint256 _round, uint256 _iterations) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, NotExecutionPeriod());
        Round storage round = dispute.rounds[_round];
        IDisputeKit disputeKit = disputeKits[round.disputeKitID];

        uint256 start = round.repartitions;
        uint256 end = round.repartitions + _iterations;
        uint256 numberOfVotesInRound = round.drawnJurors.length;
        uint256 pnkPenaltiesInRound = round.pnkPenalties; // Keep in memory to save gas.

        if (end > numberOfVotesInRound * 2) end = numberOfVotesInRound * 2;
        round.repartitions = end;

        for (uint256 i = start; i < end; i++) {
            address account;
            if (i < numberOfVotesInRound) {
                // Penalties.
                account = round.drawnJurors[i];
                // Unlock all the PNKs for this draw.
                sortitionModule.unlockStake(account, round.pnkAtStakePerJuror);

                uint256 pnkPenalty = disputeKit.getPenalty(_disputeID, _round, i, round.pnkAtStakePerJuror);

                // Sanity check to protect against penalty miscalculation.
                if (pnkPenalty > round.pnkAtStakePerJuror) {
                    pnkPenalty = round.pnkAtStakePerJuror;
                }

                if (pnkPenalty > balances[account]) {
                    pnkPenalty = balances[account];
                }

                balances[account] -= pnkPenalty;

                if (pnkPenalty != 0) {
                    pnkPenaltiesInRound += pnkPenalty;
                    emit JurorRewardPenalty(account, _disputeID, _round, -int256(pnkPenalty), 0);
                }

                (uint256 stakedPnk, ) = sortitionModule.getJurorBalance(account);
                if (balances[account] < stakedPnk || !disputeKit.isVoteActive(_disputeID, _round, i)) {
                    sortitionModule.forcedUnstakeAllCourts(account);
                }
            } else {
                // Rewards.
                uint256 repartition = i - numberOfVotesInRound;
                account = round.drawnJurors[repartition];
                (uint256 feeReward, uint256 pnkReward) = disputeKit.getRewards(
                    _disputeID,
                    _round,
                    repartition,
                    round.totalFeesForJurors,
                    pnkPenaltiesInRound
                );

                // Sanity check to protect against reward's miscalculation.
                if (round.sumPnkRewardPaid + pnkReward > pnkPenaltiesInRound) {
                    pnkReward = pnkPenaltiesInRound - round.sumPnkRewardPaid;
                }
                round.sumPnkRewardPaid += pnkReward;

                if (round.sumFeeRewardPaid + feeReward > round.totalFeesForJurors) {
                    feeReward = round.totalFeesForJurors - round.sumFeeRewardPaid;
                }
                round.sumFeeRewardPaid += feeReward;

                if (feeReward != 0) {
                    payable(account).safeSend(feeReward, wNative);
                }
                if (pnkReward != 0) {
                    pnkToken.safeTransfer(account, pnkReward);
                }
                if (pnkReward != 0 || feeReward != 0) {
                    emit JurorRewardPenalty(account, _disputeID, _round, int256(pnkReward), int256(feeReward));
                }

                if (i == numberOfVotesInRound * 2 - 1) {
                    uint256 leftoverPnkReward = pnkPenaltiesInRound - round.sumPnkRewardPaid;
                    uint256 leftoverFeeReward = round.totalFeesForJurors - round.sumFeeRewardPaid;
                    if (leftoverPnkReward != 0 || leftoverFeeReward != 0) {
                        if (leftoverPnkReward != 0) {
                            pnkToken.safeTransfer(owner, leftoverPnkReward);
                        }
                        if (leftoverFeeReward != 0) {
                            owner.safeSend(leftoverFeeReward, wNative);
                        }
                        emit LeftoverRewardSent(_disputeID, _round, leftoverPnkReward, leftoverFeeReward);
                    }
                }
            }
        }

        if (round.pnkPenalties != pnkPenaltiesInRound) {
            round.pnkPenalties = pnkPenaltiesInRound;
        }
    }

    /// @notice Executes a specified dispute's ruling. UNTRUSTED.
    /// @param _disputeID The ID of the dispute.
    function executeRuling(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        require(dispute.period == Period.execution, NotExecutionPeriod());
        require(!dispute.ruled, RulingAlreadyExecuted());

        (uint256 winningChoice, , ) = currentRuling(_disputeID);
        dispute.ruled = true;
        emit RulingExecuted(dispute.arbitrated, _disputeID, winningChoice);
        dispute.arbitrated.rule(_disputeID, winningChoice);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Compute the cost of arbitration denominated in the native currency, typically ETH.
    /// @dev It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return cost The arbitration cost in ETH.
    function arbitrationCost(bytes memory _extraData) public view returns (uint256 cost) {
        // If `_extraData` contains an incorrect value then this value will be switched to default.
        (uint96 courtID, uint256 minJurors, ) = _extraDataToCourtIDMinJurorsDisputeKit(_extraData);
        cost = courts[courtID].feeForJuror * minJurors;
    }

    /// @notice Gets the cost of appealing a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return The appeal cost.
    function appealCost(uint256 _disputeID) public view returns (uint256) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        Court storage court = courts[dispute.courtID];

        if (dispute.courtID == FINAL_COURT) {
            return NON_PAYABLE_AMOUNT; // Can't jump from the final court.
        }
        (uint96 newCourtID, , uint256 nbVotesAfterAppeal) = _getCompatibleNextRoundSettings(dispute, round, _disputeID);

        if (newCourtID == FINAL_COURT) {
            // Final court has 0 feeForJuror and 0 nbVotes so use parameters of the previous court.
            return court.feeForJuror * ((round.nbVotes * 2) + 1);
        }

        return courts[newCourtID].feeForJuror * nbVotesAfterAppeal;
    }

    /// @notice Gets the start and the end of a specified dispute's current appeal period.
    /// @param _disputeID The ID of the dispute.
    /// @return start The start of the appeal period. Returns 0 if not in appeal period.
    /// @return end The end of the appeal period. Returns 0 if not in appeal period.
    function appealPeriod(uint256 _disputeID) external view returns (uint256 start, uint256 end) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        AdditionalCourtParams storage courtParams = courts[dispute.courtID].additionalCourtParamsChanges[
            round.courtParamsIndex
        ];
        if (dispute.period == Period.appeal) {
            start = dispute.lastPeriodChange;
            end = dispute.lastPeriodChange + courtParams.timesPerPeriod[uint256(Period.appeal)];
        } else {
            start = 0;
            end = 0;
        }
    }

    /// @notice Gets the current ruling of a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _disputeID) public view returns (uint256 ruling, bool tied, bool overridden) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        IDisputeKit disputeKit = disputeKits[round.disputeKitID];
        (ruling, tied, overridden) = disputeKit.currentRuling(_disputeID);
    }

    /// @notice Gets the round info for a specified dispute and round.
    /// @dev This function must not be called from a non-view function because it returns a dynamic array which might be very large, theoretically exceeding the block gas limit.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The round to get the info for.
    /// @return round The round info.
    function getRoundInfo(uint256 _disputeID, uint256 _round) external view returns (Round memory) {
        return disputes[_disputeID].rounds[_round];
    }

    /// @notice Gets additional court parameters (hiddenVotes, jurorsForCourtJump, timesPerPeriod).
    /// @param _courtID The ID of the court.
    /// @param _index Index in the array of additional court parameters.
    /// @return The additional court parameters.
    function getAdditionalCourtParams(
        uint96 _courtID,
        uint256 _index
    ) external view returns (AdditionalCourtParams memory) {
        return courts[_courtID].additionalCourtParamsChanges[_index];
    }

    /// @notice Gets the court parameters index used for a specific round of a dispute.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The round to get the info for.
    /// @return courtParamsIndex Index of court parameters.
    function getCourtParametersIndex(uint256 _disputeID, uint256 _round) external view returns (uint256) {
        return disputes[_disputeID].rounds[_round].courtParamsIndex;
    }

    /// @notice Gets the total fees for juror for a specified dispute and round.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The round to get the info for.
    /// @return totalFeesForJurors The total juror fees paid in this round.
    function getTotalFeesForJurors(uint256 _disputeID, uint256 _round) external view returns (uint256) {
        return disputes[_disputeID].rounds[_round].totalFeesForJurors;
    }

    /// @notice Gets the PNK at stake per juror for a specified dispute and round.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The round to get the info for.
    /// @return pnkAtStakePerJuror The PNK at stake per juror.
    function getPnkAtStakePerJuror(uint256 _disputeID, uint256 _round) external view returns (uint256) {
        return disputes[_disputeID].rounds[_round].pnkAtStakePerJuror;
    }

    /// @notice Gets the number of rounds for a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return The number of rounds.
    function getNumberOfRounds(uint256 _disputeID) external view returns (uint256) {
        return disputes[_disputeID].rounds.length;
    }

    /// @notice Checks if a given dispute kit is supported by a given court.
    /// @param _courtID The ID of the court to check the support for.
    /// @param _disputeKitID The ID of the dispute kit to check the support for.
    /// @return Whether the dispute kit is supported or not.
    function isSupported(uint96 _courtID, uint256 _disputeKitID) external view returns (bool) {
        return courts[_courtID].supportedDisputeKits[_disputeKitID];
    }

    /// @notice Gets the timesPerPeriod array for a given court.
    /// @param _courtID The ID of the court to get the times from.
    /// @return timesPerPeriod The timesPerPeriod array for the given court.
    function getTimesPerPeriod(uint96 _courtID) external view returns (uint256[4] memory timesPerPeriod) {
        AdditionalCourtParams storage courtParams = courts[_courtID].additionalCourtParamsChanges[
            courts[_courtID].additionalCourtParamsChanges.length - 1
        ];
        timesPerPeriod = courtParams.timesPerPeriod;
    }

    // ************************************* //
    // *   Public Views for Dispute Kits   * //
    // ************************************* //

    /// @notice Gets the number of votes permitted for the specified dispute in the specified round.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The ID of the round.
    /// @return The number of votes.
    function getNumberOfVotes(uint256 _disputeID, uint256 _round) external view returns (uint256) {
        return disputes[_disputeID].rounds[_round].nbVotes;
    }

    /// @notice Gets dispute kit ID of the specified round.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The ID of the round.
    /// @return The ID of the dispute kit.
    function getDisputeKitID(uint256 _disputeID, uint256 _round) external view returns (uint256) {
        return disputes[_disputeID].rounds[_round].disputeKitID;
    }

    /// @notice Returns the length of disputeKits array.
    /// @return disputeKits length.
    function getDisputeKitsLength() external view returns (uint256) {
        return disputeKits.length;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @notice Get the next round settings for a given dispute.
    /// On valid inputs returns the next-round settings provided by the dispute kit unchanged.
    /// @dev Enforces a compatibility check between the next round's court and dispute kit.
    /// @dev If Core rejects a court or DisputeKit ID provided by the current DisputeKit, it falls back to a valid route,
    /// which can create a discrepancy with the DisputeKit's expected jump.
    /// Any resulting issue is localized to that misconfigured DisputeKit and the dispute assigned to it.
    /// @param _dispute Dispute data.
    /// @param _round Round ID.
    /// @param _disputeID Dispute ID.
    /// @return newCourtID Court ID after jump.
    /// @return newDisputeKitID Dispute kit ID after jump.
    /// @return newRoundNbVotes The number of votes in the new round.
    function _getCompatibleNextRoundSettings(
        Dispute storage _dispute,
        Round storage _round,
        uint256 _disputeID
    ) internal view returns (uint96 newCourtID, uint256 newDisputeKitID, uint256 newRoundNbVotes) {
        uint256 disputeKitID = _round.disputeKitID;
        (newCourtID, newDisputeKitID, newRoundNbVotes) = disputeKits[disputeKitID].getNextRoundSettings(_disputeID);

        // Only Classic is allowed to jump to Final court.
        if (
            newCourtID >= courts.length ||
            (newCourtID == FINAL_COURT && (disputeKitID != DISPUTE_KIT_CLASSIC || newDisputeKitID != FINAL_DISPUTE_KIT))
        ) {
            newCourtID = _dispute.courtID;
        }

        bool disputeKitUnsupported = newDisputeKitID >= disputeKits.length ||
            !courts[newCourtID].supportedDisputeKits[newDisputeKitID];

        // Always fallback to Classic dispute kit since current dispute kit can be potentially misconfigured.
        if (disputeKitUnsupported) {
            newDisputeKitID = DISPUTE_KIT_CLASSIC;
        }

        // Note that final court is created with 0 votes but this value is irrelevant for it, thus we don't make an exception.
        if (newRoundNbVotes == 0 || disputeKitUnsupported) {
            newRoundNbVotes = (_round.nbVotes * 2) + 1;
        }
    }

    /// @notice Gets a court ID, the minimum number of jurors and an ID of a dispute kit from a specified extra data bytes array.
    /// @dev If `_extraData` contains an incorrect value then this value will be switched to default.
    /// @param _extraData The extra data bytes array. The first 32 bytes are the court ID, the next are the minimum number of jurors and the last are the dispute kit ID.
    /// @return courtID The court ID.
    /// @return minJurors The minimum number of jurors required.
    /// @return disputeKitID The ID of the dispute kit.
    function _extraDataToCourtIDMinJurorsDisputeKit(
        bytes memory _extraData
    ) internal view returns (uint96 courtID, uint256 minJurors, uint256 disputeKitID) {
        // Note that if the _extraData doesn't contain at least 64 bytes, default values are used.
        // Also note that we check 64 length instead of 96 to ensure backward compatibility with V1 arbitrables.
        if (_extraData.length >= 64) {
            assembly {
                // solium-disable-line security/no-inline-assembly
                courtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
            }

            // Only decode disputeKitID for new dapps (96 bytes).
            if (_extraData.length >= 96) {
                assembly {
                    disputeKitID := mload(add(_extraData, 0x60))
                }
            } else {
                // Backward compatibility for old dapps.
                disputeKitID = DISPUTE_KIT_CLASSIC;
            }

            if (courtID == FINAL_COURT || courtID >= courts.length) {
                courtID = GENERAL_COURT;
            }
            if (minJurors == 0) {
                minJurors = DEFAULT_NB_OF_JURORS;
            }
            if (
                disputeKitID == FINAL_DISPUTE_KIT ||
                disputeKitID >= disputeKits.length ||
                !courts[courtID].supportedDisputeKits[disputeKitID]
            ) {
                disputeKitID = DISPUTE_KIT_CLASSIC;
            }
        } else {
            courtID = GENERAL_COURT;
            minJurors = DEFAULT_NB_OF_JURORS;
            disputeKitID = DISPUTE_KIT_CLASSIC;
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //
    error OwnerOnly();
    error DisputeKitOnly();
    error UnsuccessfulCall();
    error WrongDisputeKitIndex();
    error CannotDisableClassicDK();
    error JurorStillEligible();
    error StakingNotPossibleInThisCourt();
    error ArbitrationFeesNotEnough();
    error MustSupportDisputeKitClassic();
    error EvidencePeriodNotPassedAndNotAppeal();
    error DisputeStillDrawing();
    error CommitPeriodNotPassed();
    error VotePeriodNotPassed();
    error AppealPeriodNotPassed();
    error NotEvidencePeriod();
    error AppealFeesNotEnough();
    error DisputeNotAppealable();
    error NotExecutionPeriod();
    error RulingAlreadyExecuted();
    error DisputePeriodIsFinal();
    error TransferFailed();
    error StakingFailed();
    error AmountExceedsBalance();
    error CannotWithdrawActiveTokens();
}

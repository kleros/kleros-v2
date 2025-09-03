// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IArbitrableV2, IArbitratorV2} from "./interfaces/IArbitratorV2.sol";
import {IDisputeKit} from "./interfaces/IDisputeKit.sol";
import {ISortitionModule} from "./interfaces/ISortitionModule.sol";
import {Initializable} from "../proxy/Initializable.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import {SafeERC20, IERC20} from "../libraries/SafeERC20.sol";
import {SafeSend} from "../libraries/SafeSend.sol";
import "../libraries/Constants.sol";

/// @title KlerosCoreBase
/// Core arbitrator contract for Kleros v2.
/// Note that this contract trusts the PNK token, the dispute kit and the sortition module contracts.
abstract contract KlerosCoreBase is IArbitratorV2, Initializable, UUPSProxiable {
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
        bool hiddenVotes; // Whether to use commit and reveal or not.
        uint256[] children; // List of child courts.
        uint256 minStake; // Minimum PNKs needed to stake in the court.
        uint256 alpha; // Basis point of PNKs that are lost when incoherent.
        uint256 feeForJuror; // Arbitration fee paid per juror.
        uint256 jurorsForCourtJump; // The appeal after the one that reaches this number of jurors will go to the parent court if any.
        uint256[4] timesPerPeriod; // The time allotted to each dispute period in the form `timesPerPeriod[period]`.
        mapping(uint256 disputeKitId => bool) supportedDisputeKits; // True if DK with this ID is supported by the court. Note that each court must support classic dispute kit.
        bool disabled; // True if the court is disabled. Unused for now, will be implemented later.
    }

    struct Dispute {
        uint96 courtID; // The ID of the court the dispute is in.
        IArbitrableV2 arbitrated; // The arbitrable contract.
        Period period; // The current period of the dispute.
        bool ruled; // True if the ruling has been executed, false otherwise.
        uint256 lastPeriodChange; // The last time the period was changed.
        Round[] rounds;
    }

    struct Round {
        uint256 disputeKitID; // Index of the dispute kit in the array.
        uint256 pnkAtStakePerJuror; // The amount of PNKs at stake for each juror in this round.
        uint256 totalFeesForJurors; // The total juror fees paid in this round.
        uint256 nbVotes; // The total number of votes the dispute can possibly have in the current round. Former votes[_round].length.
        uint256 repartitions; // A counter of reward repartitions made in this round.
        uint256 pnkPenalties; // The amount of PNKs collected from penalties in this round.
        address[] drawnJurors; // Addresses of the jurors that were drawn in this round.
        uint96[] drawnJurorFromCourtIDs; // The courtIDs where the juror was drawn from, possibly their stake in a subcourt.
        uint256 sumFeeRewardPaid; // Total sum of arbitration fees paid to coherent jurors as a reward in this round.
        uint256 sumPnkRewardPaid; // Total sum of PNK paid to coherent jurors as a reward in this round.
        IERC20 feeToken; // The token used for paying fees in this round.
        uint256 drawIterations; // The number of iterations passed drawing the jurors for this round.
    }

    // Workaround "stack too deep" errors
    struct ExecuteParams {
        uint256 disputeID; // The ID of the dispute to execute.
        uint256 round; // The round to execute.
        uint256 coherentCount; // The number of coherent votes in the round.
        uint256 numberOfVotesInRound; // The number of votes in the round.
        uint256 feePerJurorInRound; // The fee per juror in the round.
        uint256 pnkAtStakePerJurorInRound; // The amount of PNKs at stake for each juror in the round.
        uint256 pnkPenaltiesInRound; // The amount of PNKs collected from penalties in the round.
        uint256 repartition; // The index of the repartition to execute.
    }

    struct CurrencyRate {
        bool feePaymentAccepted;
        uint64 rateInEth;
        uint8 rateDecimals;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 private constant NON_PAYABLE_AMOUNT = (2 ** 256 - 2) / 2; // An amount higher than the supply of ETH.

    address public owner; // The owner of the contract.
    address public guardian; // The guardian able to pause asset withdrawals.
    IERC20 public pinakion; // The Pinakion token contract.
    address public jurorProsecutionModule; // The module for juror's prosecution.
    ISortitionModule public sortitionModule; // Sortition module for drawing.
    Court[] public courts; // The courts.
    IDisputeKit[] public disputeKits; // Array of dispute kits.
    Dispute[] public disputes; // The disputes.
    mapping(IERC20 => CurrencyRate) public currencyRates; // The price of each token in ETH.
    bool public paused; // Whether asset withdrawals are paused.
    address public wNative; // The wrapped native token for safeSend().

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event NewPeriod(uint256 indexed _disputeID, Period _period);
    event AppealPossible(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);
    event AppealDecision(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);
    event Draw(address indexed _address, uint256 indexed _disputeID, uint256 _roundID, uint256 _voteID);
    event CourtCreated(
        uint96 indexed _courtID,
        uint96 indexed _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] _timesPerPeriod,
        uint256[] _supportedDisputeKits
    );
    event CourtModified(
        uint96 indexed _courtID,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] _timesPerPeriod
    );
    event DisputeKitCreated(uint256 indexed _disputeKitID, IDisputeKit indexed _disputeKitAddress);
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
        int256 _pnkAmount,
        int256 _feeAmount,
        IERC20 _feeToken
    );
    event LeftoverRewardSent(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint256 _pnkAmount,
        uint256 _feeAmount,
        IERC20 _feeToken
    );
    event Paused();
    event Unpaused();

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    modifier onlyByGuardianOrOwner() {
        if (guardian != msg.sender && owner != msg.sender) revert GuardianOrOwnerOnly();
        _;
    }

    modifier whenPaused() {
        if (!paused) revert WhenPausedOnly();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert WhenNotPausedOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    function __KlerosCoreBase_initialize(
        address _owner,
        address _guardian,
        IERC20 _pinakion,
        address _jurorProsecutionModule,
        IDisputeKit _disputeKit,
        bool _hiddenVotes,
        uint256[4] memory _courtParameters,
        uint256[4] memory _timesPerPeriod,
        bytes memory _sortitionExtraData,
        ISortitionModule _sortitionModuleAddress,
        address _wNative
    ) internal onlyInitializing {
        owner = _owner;
        guardian = _guardian;
        pinakion = _pinakion;
        jurorProsecutionModule = _jurorProsecutionModule;
        sortitionModule = _sortitionModuleAddress;
        wNative = _wNative;

        // NULL_DISPUTE_KIT: an empty element at index 0 to indicate when a dispute kit is not supported.
        disputeKits.push();

        // DISPUTE_KIT_CLASSIC
        disputeKits.push(_disputeKit);

        emit DisputeKitCreated(DISPUTE_KIT_CLASSIC, _disputeKit);

        // FORKING_COURT
        // TODO: Fill the properties for the Forking court, emit CourtCreated.
        courts.push();
        sortitionModule.createTree(FORKING_COURT, _sortitionExtraData);

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

        sortitionModule.createTree(GENERAL_COURT, _sortitionExtraData);

        uint256[] memory supportedDisputeKits = new uint256[](1);
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
            supportedDisputeKits
        );
        _enableDisputeKit(GENERAL_COURT, DISPUTE_KIT_CLASSIC, true);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Pause staking and reward execution. Can only be done by guardian or owner.
    function pause() external onlyByGuardianOrOwner whenNotPaused {
        paused = true;
        emit Paused();
    }

    /// @dev Unpause staking and reward execution. Can only be done by owner.
    function unpause() external onlyByOwner whenPaused {
        paused = false;
        emit Unpaused();
    }

    /// @dev Allows the owner to call anything on behalf of the contract.
    /// @param _destination The destination of the call.
    /// @param _amount The value sent with the call.
    /// @param _data The data sent with the call.
    function executeOwnerProposal(address _destination, uint256 _amount, bytes memory _data) external onlyByOwner {
        (bool success, ) = _destination.call{value: _amount}(_data);
        if (!success) revert UnsuccessfulCall();
    }

    /// @dev Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address payable _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @dev Changes the `guardian` storage variable.
    /// @param _guardian The new value for the `guardian` storage variable.
    function changeGuardian(address _guardian) external onlyByOwner {
        guardian = _guardian;
    }

    /// @dev Changes the `pinakion` storage variable.
    /// @param _pinakion The new value for the `pinakion` storage variable.
    function changePinakion(IERC20 _pinakion) external onlyByOwner {
        pinakion = _pinakion;
    }

    /// @dev Changes the `jurorProsecutionModule` storage variable.
    /// @param _jurorProsecutionModule The new value for the `jurorProsecutionModule` storage variable.
    function changeJurorProsecutionModule(address _jurorProsecutionModule) external onlyByOwner {
        jurorProsecutionModule = _jurorProsecutionModule;
    }

    /// @dev Changes the `_sortitionModule` storage variable.
    /// Note that the new module should be initialized for all courts.
    /// @param _sortitionModule The new value for the `sortitionModule` storage variable.
    function changeSortitionModule(ISortitionModule _sortitionModule) external onlyByOwner {
        sortitionModule = _sortitionModule;
    }

    /// @dev Add a new supported dispute kit module to the court.
    /// @param _disputeKitAddress The address of the dispute kit contract.
    function addNewDisputeKit(IDisputeKit _disputeKitAddress) external onlyByOwner {
        uint256 disputeKitID = disputeKits.length;
        disputeKits.push(_disputeKitAddress);
        emit DisputeKitCreated(disputeKitID, _disputeKitAddress);
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
    ) external onlyByOwner {
        if (courts[_parent].minStake > _minStake) revert MinStakeLowerThanParentCourt();
        if (_supportedDisputeKits.length == 0) revert UnsupportedDisputeKit();
        if (_parent == FORKING_COURT) revert InvalidForkingCourtAsParent();

        uint96 courtID = uint96(courts.length);
        Court storage court = courts.push();

        for (uint256 i = 0; i < _supportedDisputeKits.length; i++) {
            if (_supportedDisputeKits[i] == 0 || _supportedDisputeKits[i] >= disputeKits.length) {
                revert WrongDisputeKitIndex();
            }
            _enableDisputeKit(uint96(courtID), _supportedDisputeKits[i], true);
        }
        // Check that Classic DK support was added.
        if (!court.supportedDisputeKits[DISPUTE_KIT_CLASSIC]) revert MustSupportDisputeKitClassic();

        court.parent = _parent;
        court.children = new uint256[](0);
        court.hiddenVotes = _hiddenVotes;
        court.minStake = _minStake;
        court.alpha = _alpha;
        court.feeForJuror = _feeForJuror;
        court.jurorsForCourtJump = _jurorsForCourtJump;
        court.timesPerPeriod = _timesPerPeriod;

        sortitionModule.createTree(courtID, _sortitionExtraData);

        // Update the parent.
        courts[_parent].children.push(courtID);
        emit CourtCreated(
            uint96(courtID),
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

    function changeCourtParameters(
        uint96 _courtID,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod
    ) external onlyByOwner {
        Court storage court = courts[_courtID];
        if (_courtID != GENERAL_COURT && courts[court.parent].minStake > _minStake) {
            revert MinStakeLowerThanParentCourt();
        }
        for (uint256 i = 0; i < court.children.length; i++) {
            if (courts[court.children[i]].minStake < _minStake) {
                revert MinStakeLowerThanParentCourt();
            }
        }
        court.minStake = _minStake;
        court.hiddenVotes = _hiddenVotes;
        court.alpha = _alpha;
        court.feeForJuror = _feeForJuror;
        court.jurorsForCourtJump = _jurorsForCourtJump;
        court.timesPerPeriod = _timesPerPeriod;
        emit CourtModified(
            _courtID,
            _hiddenVotes,
            _minStake,
            _alpha,
            _feeForJuror,
            _jurorsForCourtJump,
            _timesPerPeriod
        );
    }

    /// @dev Adds/removes court's support for specified dispute kits.
    /// @param _courtID The ID of the court.
    /// @param _disputeKitIDs The IDs of dispute kits which support should be added/removed.
    /// @param _enable Whether add or remove the dispute kits from the court.
    function enableDisputeKits(uint96 _courtID, uint256[] memory _disputeKitIDs, bool _enable) external onlyByOwner {
        for (uint256 i = 0; i < _disputeKitIDs.length; i++) {
            if (_enable) {
                if (_disputeKitIDs[i] == 0 || _disputeKitIDs[i] >= disputeKits.length) {
                    revert WrongDisputeKitIndex();
                }
                _enableDisputeKit(_courtID, _disputeKitIDs[i], true);
            } else {
                // Classic dispute kit must be supported by all courts.
                if (_disputeKitIDs[i] == DISPUTE_KIT_CLASSIC) {
                    revert CannotDisableClassicDK();
                }
                _enableDisputeKit(_courtID, _disputeKitIDs[i], false);
            }
        }
    }

    /// @dev Changes the supported fee tokens.
    /// @param _feeToken The fee token.
    /// @param _accepted Whether the token is supported or not as a method of fee payment.
    function changeAcceptedFeeTokens(IERC20 _feeToken, bool _accepted) external onlyByOwner {
        currencyRates[_feeToken].feePaymentAccepted = _accepted;
        emit AcceptedFeeToken(_feeToken, _accepted);
    }

    /// @dev Changes the currency rate of a fee token.
    /// @param _feeToken The fee token.
    /// @param _rateInEth The new rate of the fee token in ETH.
    /// @param _rateDecimals The new decimals of the fee token rate.
    function changeCurrencyRates(IERC20 _feeToken, uint64 _rateInEth, uint8 _rateDecimals) external onlyByOwner {
        currencyRates[_feeToken].rateInEth = _rateInEth;
        currencyRates[_feeToken].rateDecimals = _rateDecimals;
        emit NewCurrencyRate(_feeToken, _rateInEth, _rateDecimals);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Sets the caller's stake in a court.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// Note that the existing delayed stake will be nullified as non-relevant.
    function setStake(uint96 _courtID, uint256 _newStake) external virtual whenNotPaused {
        _setStake(msg.sender, _courtID, _newStake, false, OnError.Revert);
    }

    /// @dev Sets the stake of a specified account in a court without delaying stake changes, typically to apply a delayed stake or unstake inactive jurors.
    /// @param _account The account whose stake is being set.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    function setStakeBySortitionModule(address _account, uint96 _courtID, uint256 _newStake) external {
        if (msg.sender != address(sortitionModule)) revert SortitionModuleOnly();
        _setStake(_account, _courtID, _newStake, true, OnError.Return);
    }

    /// @dev Transfers PNK to the juror by SortitionModule.
    /// @param _account The account of the juror whose PNK to transfer.
    /// @param _amount The amount to transfer.
    function transferBySortitionModule(address _account, uint256 _amount) external {
        if (msg.sender != address(sortitionModule)) revert SortitionModuleOnly();
        // Note eligibility is checked in SortitionModule.
        pinakion.safeTransfer(_account, _amount);
    }

    /// @inheritdoc IArbitratorV2
    function createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData
    ) external payable override returns (uint256 disputeID) {
        if (msg.value < arbitrationCost(_extraData)) revert ArbitrationFeesNotEnough();

        return _createDispute(_numberOfChoices, _extraData, NATIVE_CURRENCY, msg.value);
    }

    /// @inheritdoc IArbitratorV2
    function createDispute(
        uint256 _numberOfChoices,
        bytes calldata _extraData,
        IERC20 _feeToken,
        uint256 _feeAmount
    ) external override returns (uint256 disputeID) {
        if (!currencyRates[_feeToken].feePaymentAccepted) revert TokenNotAccepted();
        if (_feeAmount < arbitrationCost(_extraData, _feeToken)) revert ArbitrationFeesNotEnough();

        if (!_feeToken.safeTransferFrom(msg.sender, address(this), _feeAmount)) revert TransferFailed();
        return _createDispute(_numberOfChoices, _extraData, _feeToken, _feeAmount);
    }

    function _createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData,
        IERC20 _feeToken,
        uint256 _feeAmount
    ) internal virtual returns (uint256 disputeID) {
        (uint96 courtID, , uint256 disputeKitID) = _extraDataToCourtIDMinJurorsDisputeKit(_extraData);
        if (!courts[courtID].supportedDisputeKits[disputeKitID]) revert DisputeKitNotSupportedByCourt();

        disputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.courtID = courtID;
        dispute.arbitrated = IArbitrableV2(msg.sender);
        dispute.lastPeriodChange = block.timestamp;

        IDisputeKit disputeKit = disputeKits[disputeKitID];
        Court storage court = courts[courtID];
        Round storage round = dispute.rounds.push();

        // Obtain the feeForJuror in the same currency as the _feeAmount
        uint256 feeForJuror = (_feeToken == NATIVE_CURRENCY)
            ? court.feeForJuror
            : convertEthToTokenAmount(_feeToken, court.feeForJuror);
        round.nbVotes = _feeAmount / feeForJuror;
        round.disputeKitID = disputeKitID;
        round.pnkAtStakePerJuror = _calculatePnkAtStake(court.minStake, court.alpha);
        round.totalFeesForJurors = _feeAmount;
        round.feeToken = IERC20(_feeToken);

        sortitionModule.createDisputeHook(disputeID, 0); // Default round ID.

        disputeKit.createDispute(disputeID, _numberOfChoices, _extraData, round.nbVotes);
        emit DisputeCreation(disputeID, IArbitrableV2(msg.sender));
    }

    /// @dev Passes the period of a specified dispute.
    /// @param _disputeID The ID of the dispute.
    function passPeriod(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        Court storage court = courts[dispute.courtID];

        uint256 currentRound = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[currentRound];
        if (dispute.period == Period.evidence) {
            if (
                currentRound == 0 &&
                block.timestamp - dispute.lastPeriodChange < court.timesPerPeriod[uint256(dispute.period)]
            ) {
                revert EvidenceNotPassedAndNotAppeal();
            }
            if (round.drawnJurors.length != round.nbVotes) revert DisputeStillDrawing();
            dispute.period = court.hiddenVotes ? Period.commit : Period.vote;
        } else if (dispute.period == Period.commit) {
            // Note that we do not want to pass to Voting period if all the commits are cast because it breaks the Shutter auto-reveal currently.
            if (block.timestamp - dispute.lastPeriodChange < court.timesPerPeriod[uint256(dispute.period)]) {
                revert CommitPeriodNotPassed();
            }
            dispute.period = Period.vote;
        } else if (dispute.period == Period.vote) {
            if (
                block.timestamp - dispute.lastPeriodChange < court.timesPerPeriod[uint256(dispute.period)] &&
                !disputeKits[round.disputeKitID].areVotesAllCast(_disputeID)
            ) {
                revert VotePeriodNotPassed();
            }
            dispute.period = Period.appeal;
            emit AppealPossible(_disputeID, dispute.arbitrated);
        } else if (dispute.period == Period.appeal) {
            if (
                block.timestamp - dispute.lastPeriodChange < court.timesPerPeriod[uint256(dispute.period)] &&
                !disputeKits[round.disputeKitID].isAppealFunded(_disputeID)
            ) {
                revert AppealPeriodNotPassed();
            }
            dispute.period = Period.execution;
        } else if (dispute.period == Period.execution) {
            revert DisputePeriodIsFinal();
        }

        dispute.lastPeriodChange = block.timestamp;
        emit NewPeriod(_disputeID, dispute.period);
    }

    /// @dev Draws jurors for the dispute. Can be called in parts.
    /// @param _disputeID The ID of the dispute.
    /// @param _iterations The number of iterations to run.
    /// @return nbDrawnJurors The total number of jurors drawn in the round.
    function draw(uint256 _disputeID, uint256 _iterations) external returns (uint256 nbDrawnJurors) {
        Dispute storage dispute = disputes[_disputeID];
        uint256 currentRound = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[currentRound];
        if (dispute.period != Period.evidence) revert NotEvidencePeriod();

        IDisputeKit disputeKit = disputeKits[round.disputeKitID];

        uint256 startIndex = round.drawIterations; // for gas: less storage reads
        uint256 i;
        while (i < _iterations && round.drawnJurors.length < round.nbVotes) {
            (address drawnAddress, uint96 fromSubcourtID) = disputeKit.draw(_disputeID, startIndex + i++);
            if (drawnAddress == address(0)) {
                continue;
            }
            sortitionModule.lockStake(drawnAddress, round.pnkAtStakePerJuror);
            emit Draw(drawnAddress, _disputeID, currentRound, round.drawnJurors.length);
            round.drawnJurors.push(drawnAddress);
            round.drawnJurorFromCourtIDs.push(fromSubcourtID != 0 ? fromSubcourtID : dispute.courtID);
            if (round.drawnJurors.length == round.nbVotes) {
                sortitionModule.postDrawHook(_disputeID, currentRound);
            }
        }
        round.drawIterations += i;
        return round.drawnJurors.length;
    }

    /// @dev Appeals the ruling of a specified dispute.
    /// Note: Access restricted to the Dispute Kit for this `disputeID`.
    /// @param _disputeID The ID of the dispute.
    /// @param _numberOfChoices Number of choices for the dispute. Can be required during court jump.
    /// @param _extraData Extradata for the dispute. Can be required during court jump.
    function appeal(uint256 _disputeID, uint256 _numberOfChoices, bytes memory _extraData) external payable {
        if (msg.value < appealCost(_disputeID)) revert AppealFeesNotEnough();

        Dispute storage dispute = disputes[_disputeID];
        if (dispute.period != Period.appeal) revert DisputeNotAppealable();

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        if (msg.sender != address(disputeKits[round.disputeKitID])) revert DisputeKitOnly();

        // Warning: the extra round must be created before calling disputeKit.createDispute()
        Round storage extraRound = dispute.rounds.push();

        (uint96 newCourtID, uint256 newDisputeKitID, bool courtJump, ) = _getCourtAndDisputeKitJumps(
            dispute,
            round,
            courts[dispute.courtID],
            _disputeID
        );
        if (courtJump) {
            emit CourtJump(_disputeID, dispute.rounds.length - 1, dispute.courtID, newCourtID);
        }

        dispute.courtID = newCourtID;
        dispute.period = Period.evidence;
        dispute.lastPeriodChange = block.timestamp;

        Court storage court = courts[newCourtID];
        extraRound.nbVotes = msg.value / court.feeForJuror; // As many votes that can be afforded by the provided funds.
        extraRound.pnkAtStakePerJuror = _calculatePnkAtStake(court.minStake, court.alpha);
        extraRound.totalFeesForJurors = msg.value;
        extraRound.disputeKitID = newDisputeKitID;

        sortitionModule.createDisputeHook(_disputeID, dispute.rounds.length - 1);

        // Dispute kit was changed, so create a dispute in the new DK contract.
        if (extraRound.disputeKitID != round.disputeKitID) {
            emit DisputeKitJump(_disputeID, dispute.rounds.length - 1, round.disputeKitID, extraRound.disputeKitID);
            disputeKits[extraRound.disputeKitID].createDispute(
                _disputeID,
                _numberOfChoices,
                _extraData,
                extraRound.nbVotes
            );
        }

        emit AppealDecision(_disputeID, dispute.arbitrated);
        emit NewPeriod(_disputeID, Period.evidence);
    }

    /// @dev Distribute the PNKs at stake and the dispute fees for the specific round of the dispute. Can be called in parts.
    /// Note: Reward distributions are forbidden during pause.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The appeal round.
    /// @param _iterations The number of iterations to run.
    function execute(uint256 _disputeID, uint256 _round, uint256 _iterations) external whenNotPaused {
        Round storage round;
        {
            Dispute storage dispute = disputes[_disputeID];
            if (dispute.period != Period.execution) revert NotExecutionPeriod();

            round = dispute.rounds[_round];
        } // stack too deep workaround

        uint256 start = round.repartitions;
        uint256 end = round.repartitions + _iterations;

        uint256 pnkPenaltiesInRound = round.pnkPenalties; // Keep in memory to save gas.
        uint256 numberOfVotesInRound = round.drawnJurors.length;
        uint256 feePerJurorInRound = round.totalFeesForJurors / numberOfVotesInRound;
        uint256 pnkAtStakePerJurorInRound = round.pnkAtStakePerJuror;
        uint256 coherentCount;
        {
            IDisputeKit disputeKit = disputeKits[round.disputeKitID];
            coherentCount = disputeKit.getCoherentCount(_disputeID, _round); // Total number of jurors that are eligible to a reward in this round.
        } // stack too deep workaround

        if (coherentCount == 0) {
            // We loop over the votes once as there are no rewards because it is not a tie and no one in this round is coherent with the final outcome.
            if (end > numberOfVotesInRound) end = numberOfVotesInRound;
        } else {
            // We loop over the votes twice, first to collect the PNK penalties, and second to distribute them as rewards along with arbitration fees.
            if (end > numberOfVotesInRound * 2) end = numberOfVotesInRound * 2;
        }
        round.repartitions = end;

        for (uint256 i = start; i < end; i++) {
            if (i < numberOfVotesInRound) {
                pnkPenaltiesInRound = _executePenalties(
                    ExecuteParams({
                        disputeID: _disputeID,
                        round: _round,
                        coherentCount: coherentCount,
                        numberOfVotesInRound: numberOfVotesInRound,
                        feePerJurorInRound: feePerJurorInRound,
                        pnkAtStakePerJurorInRound: pnkAtStakePerJurorInRound,
                        pnkPenaltiesInRound: pnkPenaltiesInRound,
                        repartition: i
                    })
                );
            } else {
                _executeRewards(
                    ExecuteParams({
                        disputeID: _disputeID,
                        round: _round,
                        coherentCount: coherentCount,
                        numberOfVotesInRound: numberOfVotesInRound,
                        feePerJurorInRound: feePerJurorInRound,
                        pnkAtStakePerJurorInRound: pnkAtStakePerJurorInRound,
                        pnkPenaltiesInRound: pnkPenaltiesInRound,
                        repartition: i
                    })
                );
            }
        }
        if (round.pnkPenalties != pnkPenaltiesInRound) {
            round.pnkPenalties = pnkPenaltiesInRound; // Reentrancy risk: breaks Check-Effect-Interact
        }
    }

    /// @dev Distribute the PNKs at stake and the dispute fees for the specific round of the dispute, penalties only.
    /// @param _params The parameters for the execution, see `ExecuteParams`.
    /// @return pnkPenaltiesInRoundCache The updated penalties in round cache.
    function _executePenalties(ExecuteParams memory _params) internal returns (uint256) {
        Dispute storage dispute = disputes[_params.disputeID];
        Round storage round = dispute.rounds[_params.round];
        IDisputeKit disputeKit = disputeKits[round.disputeKitID];

        // [0, 1] value that determines how coherent the juror was in this round, in basis points.
        uint256 coherence = disputeKit.getDegreeOfCoherencePenalty(
            _params.disputeID,
            _params.round,
            _params.repartition,
            _params.feePerJurorInRound,
            _params.pnkAtStakePerJurorInRound
        );

        // Guard against degree exceeding 1, though it should be ensured by the dispute kit.
        if (coherence > ONE_BASIS_POINT) {
            coherence = ONE_BASIS_POINT;
        }

        // Fully coherent jurors won't be penalized.
        uint256 penalty = (round.pnkAtStakePerJuror * (ONE_BASIS_POINT - coherence)) / ONE_BASIS_POINT;

        // Unlock the PNKs affected by the penalty
        address account = round.drawnJurors[_params.repartition];
        sortitionModule.unlockStake(account, penalty);

        // Apply the penalty to the staked PNKs.
        uint96 penalizedInCourtID = round.drawnJurorFromCourtIDs[_params.repartition];
        (uint256 pnkBalance, uint256 newCourtStake, uint256 availablePenalty) = sortitionModule.setStakePenalty(
            account,
            penalizedInCourtID,
            penalty
        );
        _params.pnkPenaltiesInRound += availablePenalty;
        emit TokenAndETHShift(
            account,
            _params.disputeID,
            _params.round,
            coherence,
            -int256(availablePenalty),
            0,
            round.feeToken
        );

        if (pnkBalance == 0 || !disputeKit.isVoteActive(_params.disputeID, _params.round, _params.repartition)) {
            // The juror is inactive or their balance is can't cover penalties anymore, unstake them from all courts.
            sortitionModule.forcedUnstakeAllCourts(account);
        } else if (newCourtStake < courts[penalizedInCourtID].minStake) {
            // The juror's balance fell below the court minStake, unstake them from the court.
            sortitionModule.forcedUnstake(account, penalizedInCourtID);
        }

        if (_params.repartition == _params.numberOfVotesInRound - 1 && _params.coherentCount == 0) {
            // No one was coherent, send the rewards to the owner.
            _transferFeeToken(round.feeToken, payable(owner), round.totalFeesForJurors);
            pinakion.safeTransfer(owner, _params.pnkPenaltiesInRound);
            emit LeftoverRewardSent(
                _params.disputeID,
                _params.round,
                _params.pnkPenaltiesInRound,
                round.totalFeesForJurors,
                round.feeToken
            );
        }
        return _params.pnkPenaltiesInRound;
    }

    /// @dev Distribute the PNKs at stake and the dispute fees for the specific round of the dispute, rewards only.
    /// @param _params The parameters for the execution, see `ExecuteParams`.
    function _executeRewards(ExecuteParams memory _params) internal {
        Dispute storage dispute = disputes[_params.disputeID];
        Round storage round = dispute.rounds[_params.round];
        IDisputeKit disputeKit = disputeKits[round.disputeKitID];

        // [0, 1] value that determines how coherent the juror was in this round, in basis points.
        (uint256 pnkCoherence, uint256 feeCoherence) = disputeKit.getDegreeOfCoherenceReward(
            _params.disputeID,
            _params.round,
            _params.repartition % _params.numberOfVotesInRound,
            _params.feePerJurorInRound,
            _params.pnkAtStakePerJurorInRound
        );

        // Guard against degree exceeding 1, though it should be ensured by the dispute kit.
        if (pnkCoherence > ONE_BASIS_POINT) {
            pnkCoherence = ONE_BASIS_POINT;
        }
        if (feeCoherence > ONE_BASIS_POINT) {
            feeCoherence = ONE_BASIS_POINT;
        }

        address account = round.drawnJurors[_params.repartition % _params.numberOfVotesInRound];
        uint256 pnkLocked = _applyCoherence(round.pnkAtStakePerJuror, pnkCoherence);

        // Release the rest of the PNKs of the juror for this round.
        sortitionModule.unlockStake(account, pnkLocked);

        // Compute the rewards
        uint256 pnkReward = _applyCoherence(_params.pnkPenaltiesInRound / _params.coherentCount, pnkCoherence);
        round.sumPnkRewardPaid += pnkReward;
        uint256 feeReward = _applyCoherence(round.totalFeesForJurors / _params.coherentCount, feeCoherence);
        round.sumFeeRewardPaid += feeReward;

        // Transfer the fee reward
        _transferFeeToken(round.feeToken, payable(account), feeReward);

        // Stake the PNK reward if possible, by-passes delayed stakes and other checks usually done by validateStake()
        if (!sortitionModule.setStakeReward(account, dispute.courtID, pnkReward)) {
            pinakion.safeTransfer(account, pnkReward);
        }

        emit TokenAndETHShift(
            account,
            _params.disputeID,
            _params.round,
            pnkCoherence,
            int256(pnkReward),
            int256(feeReward),
            round.feeToken
        );

        // Transfer any residual rewards to the owner. It may happen due to partial coherence of the jurors.
        if (_params.repartition == _params.numberOfVotesInRound * 2 - 1) {
            uint256 leftoverPnkReward = _params.pnkPenaltiesInRound - round.sumPnkRewardPaid;
            uint256 leftoverFeeReward = round.totalFeesForJurors - round.sumFeeRewardPaid;
            if (leftoverPnkReward != 0 || leftoverFeeReward != 0) {
                if (leftoverPnkReward != 0) {
                    pinakion.safeTransfer(owner, leftoverPnkReward);
                }
                if (leftoverFeeReward != 0) {
                    _transferFeeToken(round.feeToken, payable(owner), leftoverFeeReward);
                }
                emit LeftoverRewardSent(
                    _params.disputeID,
                    _params.round,
                    leftoverPnkReward,
                    leftoverFeeReward,
                    round.feeToken
                );
            }
        }
    }

    /// @dev Executes a specified dispute's ruling.
    /// @param _disputeID The ID of the dispute.
    function executeRuling(uint256 _disputeID) external {
        Dispute storage dispute = disputes[_disputeID];
        if (dispute.period != Period.execution) revert NotExecutionPeriod();
        if (dispute.ruled) revert RulingAlreadyExecuted();

        (uint256 winningChoice, , ) = currentRuling(_disputeID);
        dispute.ruled = true;
        emit Ruling(dispute.arbitrated, _disputeID, winningChoice);
        dispute.arbitrated.rule(_disputeID, winningChoice);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Compute the cost of arbitration denominated in ETH.
    ///      It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return cost The arbitration cost in ETH.
    function arbitrationCost(bytes memory _extraData) public view override returns (uint256 cost) {
        (uint96 courtID, uint256 minJurors, ) = _extraDataToCourtIDMinJurorsDisputeKit(_extraData);
        cost = courts[courtID].feeForJuror * minJurors;
    }

    /// @dev Compute the cost of arbitration denominated in `_feeToken`.
    ///      It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @param _feeToken The ERC20 token used to pay fees.
    /// @return cost The arbitration cost in `_feeToken`.
    function arbitrationCost(bytes calldata _extraData, IERC20 _feeToken) public view override returns (uint256 cost) {
        cost = convertEthToTokenAmount(_feeToken, arbitrationCost(_extraData));
    }

    /// @dev Gets the cost of appealing a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return cost The appeal cost.
    function appealCost(uint256 _disputeID) public view returns (uint256 cost) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        Court storage court = courts[dispute.courtID];

        (, uint256 newDisputeKitID, bool courtJump, ) = _getCourtAndDisputeKitJumps(dispute, round, court, _disputeID);

        uint256 nbVotesAfterAppeal = disputeKits[newDisputeKitID].getNbVotesAfterAppeal(
            disputeKits[round.disputeKitID],
            round.nbVotes
        );

        if (courtJump) {
            // Jump to parent court.
            if (dispute.courtID == GENERAL_COURT) {
                // TODO: Handle the forking when appealed in General court.
                cost = NON_PAYABLE_AMOUNT; // Get the cost of the parent court.
            } else {
                cost = courts[court.parent].feeForJuror * nbVotesAfterAppeal;
            }
        } else {
            // Stay in current court.
            cost = court.feeForJuror * nbVotesAfterAppeal;
        }
    }

    /// @dev Gets the start and the end of a specified dispute's current appeal period.
    /// @param _disputeID The ID of the dispute.
    /// @return start The start of the appeal period.
    /// @return end The end of the appeal period.
    function appealPeriod(uint256 _disputeID) external view returns (uint256 start, uint256 end) {
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
        IDisputeKit disputeKit = disputeKits[round.disputeKitID];
        (ruling, tied, overridden) = disputeKit.currentRuling(_disputeID);
    }

    /// @dev Gets the round info for a specified dispute and round.
    /// @dev This function must not be called from a non-view function because it returns a dynamic array which might be very large, theoretically exceeding the block gas limit.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The round to get the info for.
    /// @return round The round info.
    function getRoundInfo(uint256 _disputeID, uint256 _round) external view returns (Round memory) {
        return disputes[_disputeID].rounds[_round];
    }

    /// @dev Gets the PNK at stake per juror for a specified dispute and round.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The round to get the info for.
    /// @return pnkAtStakePerJuror The PNK at stake per juror.
    function getPnkAtStakePerJuror(uint256 _disputeID, uint256 _round) external view returns (uint256) {
        return disputes[_disputeID].rounds[_round].pnkAtStakePerJuror;
    }

    /// @dev Gets the number of rounds for a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return The number of rounds.
    function getNumberOfRounds(uint256 _disputeID) external view returns (uint256) {
        return disputes[_disputeID].rounds.length;
    }

    /// @dev Checks if a given dispute kit is supported by a given court.
    /// @param _courtID The ID of the court to check the support for.
    /// @param _disputeKitID The ID of the dispute kit to check the support for.
    /// @return Whether the dispute kit is supported or not.
    function isSupported(uint96 _courtID, uint256 _disputeKitID) external view returns (bool) {
        return courts[_courtID].supportedDisputeKits[_disputeKitID];
    }

    /// @dev Gets the timesPerPeriod array for a given court.
    /// @param _courtID The ID of the court to get the times from.
    /// @return timesPerPeriod The timesPerPeriod array for the given court.
    function getTimesPerPeriod(uint96 _courtID) external view returns (uint256[4] memory timesPerPeriod) {
        timesPerPeriod = courts[_courtID].timesPerPeriod;
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

        if (!_isCourtJumping(round, court, _disputeID)) {
            return false;
        }

        // Jump if the parent court doesn't support the current DK.
        return !courts[court.parent].supportedDisputeKits[round.disputeKitID];
    }

    function getDisputeKitsLength() external view returns (uint256) {
        return disputeKits.length;
    }

    function convertEthToTokenAmount(IERC20 _toToken, uint256 _amountInEth) public view returns (uint256) {
        return (_amountInEth * 10 ** currencyRates[_toToken].rateDecimals) / currencyRates[_toToken].rateInEth;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Returns true if the round is jumping to a parent court.
    /// @param _round The round to check.
    /// @param _court The court to check.
    /// @return Whether the round is jumping to a parent court or not.
    function _isCourtJumping(
        Round storage _round,
        Court storage _court,
        uint256 _disputeID
    ) internal view returns (bool) {
        return
            disputeKits[_round.disputeKitID].earlyCourtJump(_disputeID) || _round.nbVotes >= _court.jurorsForCourtJump;
    }

    function _getCourtAndDisputeKitJumps(
        Dispute storage _dispute,
        Round storage _round,
        Court storage _court,
        uint256 _disputeID
    ) internal view returns (uint96 newCourtID, uint256 newDisputeKitID, bool courtJump, bool disputeKitJump) {
        newCourtID = _dispute.courtID;
        newDisputeKitID = _round.disputeKitID;

        if (!_isCourtJumping(_round, _court, _disputeID)) return (newCourtID, newDisputeKitID, false, false);

        // Jump to parent court.
        newCourtID = courts[newCourtID].parent;
        courtJump = true;

        if (!courts[newCourtID].supportedDisputeKits[newDisputeKitID]) {
            // The current Dispute Kit is not compatible with the new court, jump to another Dispute Kit.
            newDisputeKitID = disputeKits[_round.disputeKitID].getJumpDisputeKitID();
            if (newDisputeKitID == NULL_DISPUTE_KIT || !courts[newCourtID].supportedDisputeKits[newDisputeKitID]) {
                // The new Dispute Kit is not defined or still not compatible, fall back to `DisputeKitClassic` which is always supported.
                newDisputeKitID = DISPUTE_KIT_CLASSIC;
            }
            disputeKitJump = true;
        }
    }

    /// @dev Internal function to transfer fee tokens (ETH or ERC20)
    /// @param _feeToken The token to transfer (NATIVE_CURRENCY for ETH).
    /// @param _recipient The recipient address.
    /// @param _amount The amount to transfer.
    function _transferFeeToken(IERC20 _feeToken, address payable _recipient, uint256 _amount) internal {
        if (_feeToken == NATIVE_CURRENCY) {
            _recipient.safeSend(_amount, wNative);
        } else {
            _feeToken.safeTransfer(_recipient, _amount);
        }
    }

    /// @dev Applies degree of coherence to an amount
    /// @param _amount The base amount to apply coherence to.
    /// @param _coherence The degree of coherence in basis points.
    /// @return The amount after applying the degree of coherence.
    function _applyCoherence(uint256 _amount, uint256 _coherence) internal pure returns (uint256) {
        return (_amount * _coherence) / ONE_BASIS_POINT;
    }

    /// @dev Calculates PNK at stake per juror based on court parameters
    /// @param _minStake The minimum stake for the court.
    /// @param _alpha The alpha parameter for the court in basis points.
    /// @return The amount of PNK at stake per juror.
    function _calculatePnkAtStake(uint256 _minStake, uint256 _alpha) internal pure returns (uint256) {
        return (_minStake * _alpha) / ONE_BASIS_POINT;
    }

    /// @dev Toggles the dispute kit support for a given court.
    /// @param _courtID The ID of the court to toggle the support for.
    /// @param _disputeKitID The ID of the dispute kit to toggle the support for.
    /// @param _enable Whether to enable or disable the support. Note that classic dispute kit should always be enabled.
    function _enableDisputeKit(uint96 _courtID, uint256 _disputeKitID, bool _enable) internal {
        courts[_courtID].supportedDisputeKits[_disputeKitID] = _enable;
        emit DisputeKitEnabled(_courtID, _disputeKitID, _enable);
    }

    /// @dev If called only once then set _onError to Revert, otherwise set it to Return
    /// @param _account The account to set the stake for.
    /// @param _courtID The ID of the court to set the stake for.
    /// @param _newStake The new stake.
    /// @param _noDelay True if the stake change should not be delayed.
    /// @param _onError Whether to revert or return false on error.
    /// @return Whether the stake was successfully set or not.
    function _setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _noDelay,
        OnError _onError
    ) internal returns (bool) {
        if (_courtID == FORKING_COURT || _courtID >= courts.length) {
            _stakingFailed(_onError, StakingResult.CannotStakeInThisCourt); // Staking directly into the forking court is not allowed.
            return false;
        }
        if (_newStake != 0 && _newStake < courts[_courtID].minStake) {
            _stakingFailed(_onError, StakingResult.CannotStakeLessThanMinStake); // Staking less than the minimum stake is not allowed.
            return false;
        }
        (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) = sortitionModule.validateStake(
            _account,
            _courtID,
            _newStake,
            _noDelay
        );
        if (stakingResult != StakingResult.Successful && stakingResult != StakingResult.Delayed) {
            _stakingFailed(_onError, stakingResult);
            return false;
        } else if (stakingResult == StakingResult.Delayed) {
            return true;
        }
        if (pnkDeposit > 0) {
            if (!pinakion.safeTransferFrom(_account, address(this), pnkDeposit)) {
                _stakingFailed(_onError, StakingResult.StakingTransferFailed);
                return false;
            }
        }
        if (pnkWithdrawal > 0) {
            if (!pinakion.safeTransfer(_account, pnkWithdrawal)) {
                _stakingFailed(_onError, StakingResult.UnstakingTransferFailed);
                return false;
            }
        }
        sortitionModule.setStake(_account, _courtID, pnkDeposit, pnkWithdrawal, _newStake);

        return true;
    }

    /// @dev It may revert depending on the _onError parameter.
    function _stakingFailed(OnError _onError, StakingResult _result) internal pure virtual {
        if (_onError == OnError.Return) return;
        if (_result == StakingResult.StakingTransferFailed) revert StakingTransferFailed();
        if (_result == StakingResult.UnstakingTransferFailed) revert UnstakingTransferFailed();
        if (_result == StakingResult.CannotStakeInMoreCourts) revert StakingInTooManyCourts();
        if (_result == StakingResult.CannotStakeInThisCourt) revert StakingNotPossibleInThisCourt();
        if (_result == StakingResult.CannotStakeLessThanMinStake) revert StakingLessThanCourtMinStake();
        if (_result == StakingResult.CannotStakeZeroWhenNoStake) revert StakingZeroWhenNoStake();
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
            if (disputeKitID == NULL_DISPUTE_KIT || disputeKitID >= disputeKits.length) {
                disputeKitID = DISPUTE_KIT_CLASSIC; // 0 index is not used.
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
    error GuardianOrOwnerOnly();
    error DisputeKitOnly();
    error SortitionModuleOnly();
    error UnsuccessfulCall();
    error InvalidDisputKitParent();
    error MinStakeLowerThanParentCourt();
    error UnsupportedDisputeKit();
    error InvalidForkingCourtAsParent();
    error WrongDisputeKitIndex();
    error CannotDisableClassicDK();
    error StakingInTooManyCourts();
    error StakingNotPossibleInThisCourt();
    error StakingLessThanCourtMinStake();
    error StakingTransferFailed();
    error UnstakingTransferFailed();
    error ArbitrationFeesNotEnough();
    error DisputeKitNotSupportedByCourt();
    error MustSupportDisputeKitClassic();
    error TokenNotAccepted();
    error EvidenceNotPassedAndNotAppeal();
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
    error WhenNotPausedOnly();
    error WhenPausedOnly();
    error StakingZeroWhenNoStake();
}

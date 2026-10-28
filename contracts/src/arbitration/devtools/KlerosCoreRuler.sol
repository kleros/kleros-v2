// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IArbitrableV2} from "../interfaces/IArbitrableV2.sol";
import {IArbitratorV2} from "../interfaces/IArbitratorV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../libraries/Constants.sol";

/// @title KlerosCoreRuler
/// Core arbitrator contract for development and testing purposes.
contract KlerosCoreRuler is IArbitratorV2, Initializable {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    enum RulingMode {
        uninitialized,
        manual, // executeRuling() is called manually.
        automaticRandom, // The ruling is given randomly automatically.
        automaticPreset // The ruling is given automatically with a preset value.
    }

    enum Period {
        evidence, // Evidence can be submitted. This is also when drawing has to take place.
        commit, // Jurors commit a hashed vote. This is skipped for courts without hidden votes.
        vote, // Jurors reveal/cast their vote depending on whether the court has hidden votes or not.
        appeal, // The dispute can be appealed.
        execution // Tokens are redistributed and the ruling is executed.
    }

    struct RulerSettings {
        RulingMode rulingMode; // The ruling mode of the arbitrator.
        uint256 presetRuling; // The ruling to give in case of automatic ruling mode.
        bool presetTied; // Whether the ruling is tied or not.
        bool presetOverridden; // Whether the ruling is overridden or not.
    }

    struct Court {
        uint96 parent; // The parent court.
        bool hiddenVotes; // Whether to use commit and reveal or not.
        uint256 minStake; // Minimum PNKs needed to stake in the court.
        uint256 alpha; // Basis point of PNKs that are lost when incoherent.
        uint256 feeForJuror; // Arbitration fee paid per juror.
        uint256 jurorsForCourtJump; // The appeal after the one that reaches this number of jurors will go to the parent court if any.
        uint256[4] timesPerPeriod; // The time allotted to each dispute period in the form `timesPerPeriod[period]`.
        bool disabled; // True if the court is disabled. Unused for now, will be implemented later.
    }

    struct Dispute {
        uint96 courtID; // The ID of the court the dispute is in.
        IArbitrableV2 arbitrated; // The arbitrable contract.
        Period period; // The current period of the dispute.
        bool ruled; // True if the ruling has been executed, false otherwise.
        Round[] rounds;
    }

    struct Round {
        uint256 totalFeesForJurors; // The total juror fees paid in this round.
        uint256 sumFeeRewardPaid; // Total sum of arbitration fees paid to coherent jurors as a reward in this round.
    }

    struct RulingResult {
        uint256 ruling;
        bool tied;
        bool overridden;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 private constant NON_PAYABLE_AMOUNT = (2 ** 256 - 2) / 2; // An amount higher than the supply of ETH.

    address public owner; // The owner of the contract.
    IERC20 public pnkToken; // The Pinakion token contract.
    Court[] public courts; // The courts.
    Dispute[] public disputes; // The disputes.
    mapping(IArbitrableV2 arbitrable => address ruler) public rulers; // The ruler of each arbitrable contract.
    mapping(IArbitrableV2 arbitrable => RulerSettings) public settings; // The settings of each arbitrable contract.
    mapping(uint256 disputeID => RulingResult) public rulingResults; // The ruling results of each dispute.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event NewPeriod(uint256 indexed _disputeID, Period _period);
    event AppealPossible(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);
    event AppealDecision(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);
    event CourtCreated(
        uint256 indexed _courtID,
        uint96 indexed _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] _timesPerPeriod
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
    event CourtJump(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint96 indexed _fromCourtID,
        uint96 _toCourtID
    );
    event JurorRewardPenalty(
        address indexed _account,
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint256 _degreeOfCoherencyPnk,
        uint256 _degreeOfCoherencyFee,
        int256 _amountPnk,
        int256 _amountFee
    );
    event LeftoverRewardSent(
        uint256 indexed _disputeID,
        uint256 indexed _roundID,
        uint256 _amountPnk,
        uint256 _amountFee
    );
    event AutoRuled(
        IArbitrableV2 indexed _arbitrable,
        RulingMode indexed mode,
        uint256 indexed _disputeID,
        uint256 _ruling,
        bool tied,
        bool overridden
    );
    event RulerSettingsChanged(IArbitrableV2 indexed _arbitrable, RulerSettings _settings);
    event RulerChanged(IArbitrableV2 indexed _arbitrable, address indexed _oldRuler, address indexed _newRuler);

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

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _owner The owner's address.
    /// @param _pnkToken The address of the token contract.
    /// @param _courtParameters Numeric parameters of General court (minStake, alpha, feeForJuror and jurorsForCourtJump respectively).
    function initialize(address _owner, IERC20 _pnkToken, uint256[4] memory _courtParameters) external initializer {
        owner = _owner;
        pnkToken = _pnkToken;

        // FINAL_COURT
        // TODO: Fill the properties for the final court, emit CourtCreated.
        courts.push();

        // GENERAL_COURT
        Court storage court = courts.push();
        court.parent = FINAL_COURT;
        court.hiddenVotes = false;
        court.minStake = _courtParameters[0];
        court.alpha = _courtParameters[1];
        court.feeForJuror = _courtParameters[2];
        court.jurorsForCourtJump = _courtParameters[3];
        court.timesPerPeriod = [0, 0, 0, 0];

        emit CourtCreated(
            1,
            court.parent,
            court.hiddenVotes,
            _courtParameters[0],
            _courtParameters[1],
            _courtParameters[2],
            _courtParameters[3],
            court.timesPerPeriod
        );
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Allows the owner to call anything on behalf of the contract.
    /// @param _destination The destination of the call.
    /// @param _amount The value sent with the call.
    /// @param _data The data sent with the call.
    function executeOwnerProposal(address _destination, uint256 _amount, bytes memory _data) external onlyOwner {
        (bool success, ) = _destination.call{value: _amount}(_data);
        require(success, UnsuccessfulCall());
    }

    /// @dev Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address payable _owner) external onlyOwner {
        owner = _owner;
    }

    /// @dev Changes the `pnkToken` storage variable.
    /// @param _pnkToken The new value for the `pnkToken` storage variable.
    function changePnkToken(IERC20 _pnkToken) external onlyOwner {
        pnkToken = _pnkToken;
    }

    /// @dev Creates a court under a specified parent court.
    /// @param _parent The `parent` property value of the court.
    /// @param _hiddenVotes The `hiddenVotes` property value of the court.
    /// @param _minStake The `minStake` property value of the court.
    /// @param _alpha The `alpha` property value of the court.
    /// @param _feeForJuror The `feeForJuror` property value of the court.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the court.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the court.
    function createCourt(
        uint96 _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod
    ) external onlyOwner {
        uint256 courtID = courts.length;
        Court storage court = courts.push();

        court.parent = _parent;
        court.hiddenVotes = _hiddenVotes;
        court.minStake = _minStake;
        court.alpha = _alpha;
        court.feeForJuror = _feeForJuror;
        court.jurorsForCourtJump = _jurorsForCourtJump;
        court.timesPerPeriod = _timesPerPeriod;

        emit CourtCreated(
            courtID,
            _parent,
            _hiddenVotes,
            _minStake,
            _alpha,
            _feeForJuror,
            _jurorsForCourtJump,
            _timesPerPeriod
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
    ) external onlyOwner {
        Court storage court = courts[_courtID];
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

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function changeRulingModeToManual(IArbitrableV2 _arbitrable) external {
        if (rulers[_arbitrable] == address(0)) rulers[_arbitrable] = msg.sender;
        require(rulers[_arbitrable] == msg.sender, RulerOnly());

        delete settings[_arbitrable];
        RulerSettings storage arbitratedSettings = settings[_arbitrable];
        arbitratedSettings.rulingMode = RulingMode.manual;
        emit RulerSettingsChanged(_arbitrable, arbitratedSettings);
    }

    function changeRulingModeToAutomaticRandom(IArbitrableV2 _arbitrable) external {
        if (rulers[_arbitrable] == address(0)) rulers[_arbitrable] = msg.sender;
        require(rulers[_arbitrable] == msg.sender, RulerOnly());

        delete settings[_arbitrable];
        RulerSettings storage arbitratedSettings = settings[_arbitrable];
        arbitratedSettings.rulingMode = RulingMode.automaticRandom;
        emit RulerSettingsChanged(_arbitrable, arbitratedSettings);
    }

    function changeRulingModeToAutomaticPreset(
        IArbitrableV2 _arbitrable,
        uint256 _presetRuling,
        bool _presetTied,
        bool _presetOverridden
    ) external {
        if (rulers[_arbitrable] == address(0)) rulers[_arbitrable] = msg.sender;
        require(rulers[_arbitrable] == msg.sender, RulerOnly());

        delete settings[_arbitrable];
        RulerSettings storage arbitratedSettings = settings[_arbitrable];
        arbitratedSettings.rulingMode = RulingMode.automaticPreset;
        arbitratedSettings.presetRuling = _presetRuling;
        arbitratedSettings.presetTied = _presetTied;
        arbitratedSettings.presetOverridden = _presetOverridden;
        emit RulerSettingsChanged(_arbitrable, arbitratedSettings);
    }

    function changeRuler(IArbitrableV2 _arbitrable, address _newRuler) external {
        require(rulers[_arbitrable] == msg.sender, RulerOnly());
        rulers[_arbitrable] = _newRuler;
        emit RulerChanged(_arbitrable, msg.sender, _newRuler);
    }

    /// @notice Create a dispute and pay for the fees in the native currency, typically ETH.
    /// @dev Must be called by the arbitrable contract and pay at least `arbitrationCost(_extraData)` in ETH.
    /// @param _numberOfChoices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return disputeID The identifier of the dispute created.
    function createDispute(
        uint256 _numberOfChoices,
        bytes memory _extraData
    ) external payable returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), ArbitrationFeesNotEnough());

        (uint96 courtID, , ) = _unpackExtraData(_extraData);
        disputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.courtID = courtID;
        dispute.arbitrated = IArbitrableV2(msg.sender);

        Round storage round = dispute.rounds.push();
        round.totalFeesForJurors = msg.value;

        _autoRule(disputeID, _numberOfChoices);

        emit DisputeCreation(disputeID, IArbitrableV2(msg.sender));
    }

    function _autoRule(uint256 _disputeID, uint256 _numberOfChoices) internal {
        Dispute storage dispute = disputes[_disputeID];
        uint256 roundID = dispute.rounds.length - 1;
        RulerSettings storage arbitratedSettings = settings[dispute.arbitrated];
        require(arbitratedSettings.rulingMode != RulingMode.uninitialized, RulingModeNotSet());
        if (arbitratedSettings.rulingMode == RulingMode.manual) {
            // NOP
        } else if (arbitratedSettings.rulingMode == RulingMode.automaticPreset) {
            emit AutoRuled(
                dispute.arbitrated,
                RulingMode.automaticPreset,
                _disputeID,
                arbitratedSettings.presetRuling,
                arbitratedSettings.presetTied,
                arbitratedSettings.presetOverridden
            );
            this.executeRuling(
                _disputeID,
                arbitratedSettings.presetRuling,
                arbitratedSettings.presetTied,
                arbitratedSettings.presetOverridden
            );
            this.execute(_disputeID, roundID);
        } else if (arbitratedSettings.rulingMode == RulingMode.automaticRandom) {
            uint256 pseudoRandomNumber = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1)))) %
                _numberOfChoices; // Not secure but it's just a dev tool for testing, sue me
            bool tied = pseudoRandomNumber & 4 == 0;
            bool overridden = pseudoRandomNumber & 2 == 0;
            emit AutoRuled(
                dispute.arbitrated,
                RulingMode.automaticRandom,
                _disputeID,
                pseudoRandomNumber,
                tied,
                overridden
            );
            this.executeRuling(_disputeID, pseudoRandomNumber, tied, overridden);
            this.execute(_disputeID, roundID);
        }
    }

    /// @dev Appeals the ruling of a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @param _jump Whether to jump to the parent court or not.
    function appeal(
        uint256 _disputeID,
        uint256 _numberOfChoices,
        bytes memory /*_extraData*/,
        bool _jump
    ) external payable {
        require(msg.value >= appealCost(_disputeID, _jump), AppealFeesNotEnough());

        Dispute storage dispute = disputes[_disputeID];
        require(rulers[dispute.arbitrated] == msg.sender, RulerOnly());
        require(dispute.period == Period.appeal, DisputeNotAppealable());

        uint96 newCourtID = dispute.courtID;

        if (_jump) {
            // Jump to parent court.
            newCourtID = courts[newCourtID].parent;
            if (newCourtID != dispute.courtID) {
                emit CourtJump(_disputeID, dispute.rounds.length - 1, dispute.courtID, newCourtID);
            }
        }

        dispute.courtID = newCourtID;
        dispute.period = Period.evidence;

        Round storage extraRound = dispute.rounds.push();
        extraRound.totalFeesForJurors = msg.value;

        emit AppealDecision(_disputeID, dispute.arbitrated);
        emit NewPeriod(_disputeID, Period.evidence);

        _autoRule(_disputeID, _numberOfChoices);
    }

    /// @dev Distribute the PNKs at stake and the dispute fees for the specific round of the dispute. Can be called in parts.
    /// @param _disputeID The ID of the dispute.
    /// @param _round The appeal round.
    function execute(uint256 _disputeID, uint256 _round) external {
        Dispute storage dispute = disputes[_disputeID];
        address account = rulers[dispute.arbitrated];
        require(account != address(0), NoRulerSet());

        // Transfer the fees back to the ruler
        Round storage round = dispute.rounds[_round];
        uint256 feeReward = round.totalFeesForJurors;
        round.sumFeeRewardPaid += feeReward;
        payable(account).send(feeReward);

        emit JurorRewardPenalty(
            account,
            _disputeID,
            _round,
            ONE_BASIS_POINT,
            ONE_BASIS_POINT,
            int256(0),
            int256(feeReward)
        );
    }

    /// @dev Executes a specified dispute's ruling.
    /// @param _disputeID The ID of the dispute.
    function executeRuling(uint256 _disputeID, uint256 _ruling, bool tied, bool overridden) external {
        Dispute storage dispute = disputes[_disputeID];
        require(!dispute.ruled, RulingAlreadyExecuted());
        require(msg.sender == rulers[dispute.arbitrated] || msg.sender == address(this), RulerOnly());

        rulingResults[_disputeID] = RulingResult(_ruling, tied, overridden);
        dispute.ruled = true;
        dispute.arbitrated.rule(_disputeID, _ruling);

        emit Ruling(dispute.arbitrated, _disputeID, _ruling);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Compute the cost of arbitration.
    ///      It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return cost The arbitration cost in ETH.
    function arbitrationCost(bytes memory _extraData) public view returns (uint256 cost) {
        (uint96 courtID, uint256 minJurors, ) = _unpackExtraData(_extraData);
        cost = courts[courtID].feeForJuror * minJurors;
    }

    /// @dev Gets the cost of appealing a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @param _jump Whether to jump to the parent court or not.
    /// @return cost The appeal cost.
    function appealCost(uint256 _disputeID, bool _jump) public view returns (uint256 cost) {
        Dispute storage dispute = disputes[_disputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        Court storage court = courts[dispute.courtID];
        uint256 nbVotes = round.totalFeesForJurors / court.feeForJuror;
        if (_jump) {
            // Jump to parent court.
            if (dispute.courtID == GENERAL_COURT) {
                // TODO: Handle the final court appeal when appealed in General court.
                cost = NON_PAYABLE_AMOUNT; // Get the cost of the parent court.
            } else {
                cost = courts[court.parent].feeForJuror * ((nbVotes * 2) + 1);
            }
        } else {
            // Stay in current court.
            cost = court.feeForJuror * ((nbVotes * 2) + 1);
        }
    }

    /// @dev Gets the current ruling of a specified dispute.
    /// @param _disputeID The ID of the dispute.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _disputeID) public view returns (uint256 ruling, bool tied, bool overridden) {
        RulingResult storage rulingResult = rulingResults[_disputeID];
        return (rulingResult.ruling, rulingResult.tied, rulingResult.overridden);
    }

    function getRoundInfo(uint256 _disputeID, uint256 _round) external view returns (Round memory) {
        return disputes[_disputeID].rounds[_round];
    }

    function getNumberOfRounds(uint256 _disputeID) external view returns (uint256) {
        return disputes[_disputeID].rounds.length;
    }

    function getTimesPerPeriod(uint96 _courtID) external view returns (uint256[4] memory timesPerPeriod) {
        timesPerPeriod = courts[_courtID].timesPerPeriod;
    }

    function getNextDisputeID() external view returns (uint256) {
        return disputes.length;
    }

    // ************************************* //
    // *   Public Views for Dispute Kits   * //
    // ************************************* //

    /// @dev Gets the number of votes permitted for the specified dispute in the latest round.
    /// @param _disputeID The ID of the dispute.
    function getNumberOfVotes(uint256 _disputeID) external view returns (uint256) {
        Dispute storage dispute = disputes[_disputeID];
        Court storage court = courts[dispute.courtID];
        return dispute.rounds[dispute.rounds.length - 1].totalFeesForJurors / court.feeForJuror;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Gets a court ID, the minimum number of jurors and an ID of a dispute kit from a specified extra data bytes array.
    /// Note that if extradata contains an incorrect value then this value will be switched to default.
    /// @param _extraData The extra data bytes array. The first 32 bytes are the court ID, the next are the minimum number of jurors and the last are the dispute kit ID.
    /// @return courtID The court ID.
    /// @return minJurors The minimum number of jurors required.
    /// @return disputeKitID The ID of the dispute kit.
    function _unpackExtraData(
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
            if (courtID == FINAL_COURT || courtID >= courts.length) {
                courtID = GENERAL_COURT;
            }
            if (minJurors == 0) {
                minJurors = DEFAULT_NB_OF_JURORS;
            }
            if (disputeKitID == FINAL_DISPUTE_KIT) {
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
    error RulerOnly();
    error NoRulerSet();
    error RulingModeNotSet();
    error UnsuccessfulCall();
    error ArbitrationFeesNotEnough();
    error TokenNotAccepted();
    error AppealFeesNotEnough();
    error DisputeNotAppealable();
    error RulingAlreadyExecuted();
}

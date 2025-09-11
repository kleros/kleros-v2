// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {Initializable} from "../proxy/Initializable.sol";
import {UUPSProxiable} from "../proxy/UUPSProxiable.sol";
import "../libraries/Constants.sol";

// ************************************* //
// *         Enums / Structs           * //
// ************************************* //

struct Court {
    uint96 parent; // The parent court.
    bool hiddenVotes; // Whether to use commit and reveal or not.
    uint256[] children; // List of child courts.
    uint256 minStake; // Minimum PNKs needed to stake in the court.
    uint256 alpha; // Basis point of PNKs that are lost when incoherent.
    uint256 feeForJuror; // Arbitration fee paid per juror.
    uint256 jurorsForCourtJump; // The appeal after the one that reaches this number of jurors will go to the parent court if any.
    uint256[4] timesPerPeriod; // The time allotted to each dispute period in the form `timesPerPeriod[period]`.
    uint256[10] __gap; // Reserved slots for future upgrades.
}

contract CourtRegistry is Initializable, UUPSProxiable {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The owner of the contract.
    address public core; // The core contract.
    Court[] public courts; // The courts.
    mapping(uint96 courtID => mapping(uint256 disputeKitId => bool)) supportedDisputeKits; // True if DK with this ID is supported by the court. Note that each court must support classic dispute kit.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

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
    event DisputeKitEnabled(uint96 indexed _courtID, uint256 indexed _disputeKitID, bool indexed _enable);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    modifier onlyByCore() {
        if (address(core) != msg.sender) revert KlerosCoreOnly();
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
    /// @param _core The core contract.
    function initialize(address _owner, address _core) external initializer {
        owner = _owner;
        core = _core;

        // FORKING_COURT
        // TODO: Fill the properties for the Forking court, emit CourtCreated.
        courts.push();
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Creates a court under a specified parent court.
    /// @param _parent The `parent` property value of the court.
    /// @param _hiddenVotes The `hiddenVotes` property value of the court.
    /// @param _minStake The `minStake` property value of the court.
    /// @param _alpha The `alpha` property value of the court.
    /// @param _feeForJuror The `feeForJuror` property value of the court.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the court.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the court.
    /// @param _supportedDisputeKits Indexes of dispute kits that this court will support.
    function createCourt(
        uint96 _parent,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod,
        uint256[] memory _supportedDisputeKits
    ) external onlyByCore returns (uint96 courtID) {
        if (courts[_parent].minStake > _minStake) revert MinStakeLowerThanParentCourt();
        if (_supportedDisputeKits.length == 0) revert UnsupportedDisputeKit();
        if (_parent == FORKING_COURT) revert InvalidForkingCourtAsParent();

        courtID = uint96(courts.length);
        Court storage court = courts.push();

        // Check that Classic DK support was added.
        if (!supportedDisputeKits[courtID][DISPUTE_KIT_CLASSIC]) revert MustSupportDisputeKitClassic();

        court.parent = _parent;
        court.children = new uint256[](0);
        court.hiddenVotes = _hiddenVotes;
        court.minStake = _minStake;
        court.alpha = _alpha;
        court.feeForJuror = _feeForJuror;
        court.jurorsForCourtJump = _jurorsForCourtJump;
        court.timesPerPeriod = _timesPerPeriod;

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

    /// @notice Changes the parameters of the court.
    /// @param _courtID ID of the court.
    /// @param _hiddenVotes The `hiddenVotes` property value of the court.
    /// @param _minStake The `minStake` property value of the court.
    /// @param _alpha The `alpha` property value of the court.
    /// @param _feeForJuror The `feeForJuror` property value of the court.
    /// @param _jurorsForCourtJump The `jurorsForCourtJump` property value of the court.
    /// @param _timesPerPeriod The `timesPerPeriod` property value of the court.
    function changeCourtParameters(
        uint96 _courtID,
        bool _hiddenVotes,
        uint256 _minStake,
        uint256 _alpha,
        uint256 _feeForJuror,
        uint256 _jurorsForCourtJump,
        uint256[4] memory _timesPerPeriod
    ) external onlyByCore {
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

    /// @notice Toggles the dispute kit support for a given court.
    /// @param _courtID The ID of the court to toggle the support for.
    /// @param _disputeKitID The ID of the dispute kit to toggle the support for.
    /// @param _enable Whether to enable or disable the support. Note that classic dispute kit should always be enabled.
    function enableDisputeKit(uint96 _courtID, uint256 _disputeKitID, bool _enable) external onlyByCore {
        supportedDisputeKits[_courtID][_disputeKitID] = _enable;
        emit DisputeKitEnabled(_courtID, _disputeKitID, _enable);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @dev Gets a court by its ID.
    /// @param _courtID The ID of the court to get.
    /// @return The court.
    function get(uint96 _courtID) external view returns (Court memory) {
        return courts[_courtID];
    }

    /// @dev Gets the children of a given court.
    /// @param _courtID The ID of the court to get the children from.
    /// @return children The children of the given court.
    function getChildren(uint96 _courtID) external view returns (uint256[] memory) {
        return courts[_courtID].children;
    }

    /// @notice Gets the timesPerPeriod array for a given court.
    /// @param _courtID The ID of the court to get the times from.
    /// @return timesPerPeriod The timesPerPeriod array for the given court.
    function getTimesPerPeriod(uint96 _courtID) external view returns (uint256[4] memory) {
        return courts[_courtID].timesPerPeriod;
    }

    /// @notice Checks if a given dispute kit is supported by a given court.
    /// @param _courtID The ID of the court to check the support for.
    /// @param _disputeKitID The ID of the dispute kit to check the support for.
    /// @return Whether the dispute kit is supported or not.
    function isSupported(uint96 _courtID, uint256 _disputeKitID) external view returns (bool) {
        return supportedDisputeKits[_courtID][_disputeKitID];
    }

    /// @dev Gets the number of courts.
    /// @return The number of courts.
    function getNumberOfCourts() external view returns (uint256) {
        return courts.length;
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error KlerosCoreOnly();
    error MinStakeLowerThanParentCourt();
    error UnsupportedDisputeKit();
    error InvalidForkingCourtAsParent();
    error MustSupportDisputeKitClassic();
}

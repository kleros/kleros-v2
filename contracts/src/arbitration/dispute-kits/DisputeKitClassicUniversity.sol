// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassicBase} from "./DisputeKitClassicBase.sol";
import {KlerosCore} from "../KlerosCore.sol";

/// @title DisputeKitClassicUniversity
/// @notice Dispute kit for educational use where an instructor explicitly selects jurors.
/// Replaces the random sortition draw with a preset juror queue managed by the instructor.
contract DisputeKitClassicUniversity is DisputeKitClassicBase {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public instructor;
    mapping(uint256 coreDisputeID => address[]) private _jurorQueue;
    mapping(uint256 coreDisputeID => uint256) private _jurorQueueCursor;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @param _coreDisputeID The dispute the juror list was set for.
    /// @param _jurors The juror addresses in draw order.
    event JurorsSet(uint256 indexed _coreDisputeID, address[] _jurors);

    /// @param _coreDisputeID The dispute whose juror list was cleared.
    event JurorsCleared(uint256 indexed _coreDisputeID);

    /// @param _instructor The new instructor address.
    event InstructorChanged(address indexed _instructor);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByInstructor() {
        if (msg.sender != instructor) revert InstructorOnly();
        _;
    }

    modifier onlyByOwnerOrInstructor() {
        if (msg.sender != owner && msg.sender != instructor) revert OwnerOrInstructorOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer.
    /// @param _owner The owner's address.
    /// @param _core The KlerosCore arbitrator.
    /// @param _wNative The wrapped native token address, typically wETH.
    function initialize(address _owner, KlerosCore _core, address _wNative) external initializer {
        __DisputeKitClassicBase_initialize(_owner, _core, _wNative);
        instructor = _owner;
        singleDrawPerJuror = true;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    /// @notice Changes the instructor address.
    /// @param _instructor The new instructor.
    function changeInstructor(address _instructor) external onlyByOwnerOrInstructor {
        instructor = _instructor;
        emit InstructorChanged(_instructor);
    }

    // ************************************* //
    // *    Instructor Juror Management    * //
    // ************************************* //

    /// @notice Sets the ordered juror list for a dispute. Replaces any previous list.
    /// @dev Should be called before `KlerosCore.draw()` is invoked for the dispute.
    /// @param _coreDisputeID The ID of the dispute in KlerosCore.
    /// @param _jurors Ordered array of juror addresses to be drawn.
    function setJurors(uint256 _coreDisputeID, address[] calldata _jurors) external onlyByInstructor {
        _jurorQueue[_coreDisputeID] = _jurors;
        _jurorQueueCursor[_coreDisputeID] = 0;
        emit JurorsSet(_coreDisputeID, _jurors);
    }

    /// @notice Clears the juror list for a dispute.
    /// @param _coreDisputeID The ID of the dispute in KlerosCore.
    function clearJurors(uint256 _coreDisputeID) external onlyByInstructor {
        delete _jurorQueue[_coreDisputeID];
        _jurorQueueCursor[_coreDisputeID] = 0;
        emit JurorsCleared(_coreDisputeID);
    }

    /// @notice Returns the current juror queue for a dispute.
    /// @param _coreDisputeID The ID of the dispute in KlerosCore.
    /// @return The array of juror addresses.
    function getJurors(uint256 _coreDisputeID) external view returns (address[] memory) {
        return _jurorQueue[_coreDisputeID];
    }

    /// @notice Returns how many jurors have already been consumed from the queue.
    /// @param _coreDisputeID The ID of the dispute in KlerosCore.
    /// @return The current cursor position.
    function getJurorQueueCursor(uint256 _coreDisputeID) external view returns (uint256) {
        return _jurorQueueCursor[_coreDisputeID];
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Draws the next juror from the instructor's preset list.
    /// @dev Overrides the base implementation to skip `sortitionModule.draw()`.
    /// `KlerosCore.draw()` still calls `sortitionModule.lockStake()` and
    /// `sortitionModule.postDrawHook()` on the returned address, so the
    /// drawn juror should have staked PNK in the court for the economic
    /// mechanism to work properly.
    /// @param _coreDisputeID The ID of the dispute in KlerosCore.
    /// @param - Nonce (unused, required by interface).
    /// @param _roundNbVotes Total votes in the round (for post-draw checks).
    /// @return drawnAddress The address of the drawn juror, or address(0) if none available.
    /// @return fromSubcourtID Always 0; KlerosCore falls back to dispute.courtID.
    function draw(
        uint256 _coreDisputeID,
        uint256 /* _nonce */,
        uint256 _roundNbVotes
    ) public override onlyByCore isActive(_coreDisputeID) returns (address drawnAddress, uint96 fromSubcourtID) {
        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];

        uint256 cursor = _jurorQueueCursor[_coreDisputeID];
        address[] storage queue = _jurorQueue[_coreDisputeID];
        if (cursor >= queue.length) {
            return (address(0), 0);
        }
        drawnAddress = queue[cursor];
        _jurorQueueCursor[_coreDisputeID] = cursor + 1;

        if (drawnAddress == address(0)) {
            return (address(0), 0);
        }

        if (_postDrawCheck(round, _coreDisputeID, drawnAddress, _roundNbVotes)) {
            Vote storage vote = round.votes.push();
            vote.account = drawnAddress;
            round.alreadyDrawn[drawnAddress] = true;
        } else {
            drawnAddress = address(0);
        }
        // fromSubcourtID stays 0 => KlerosCore falls back to dispute.courtID
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error InstructorOnly();
    error OwnerOrInstructorOnly();
}

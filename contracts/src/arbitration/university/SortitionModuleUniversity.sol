// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {KlerosCoreUniversity} from "./KlerosCoreUniversity.sol";
import {ISortitionModuleUniversity} from "./ISortitionModuleUniversity.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {UUPSProxiable} from "../../proxy/UUPSProxiable.sol";
import {Initializable} from "../../proxy/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../libraries/Constants.sol";

/// @title SortitionModuleUniversity
/// @notice An adapted version of the SortitionModule contract for educational purposes.
contract SortitionModuleUniversity is ISortitionModuleUniversity, UUPSProxiable, Initializable {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Juror {
        mapping(uint96 => uint256) stakesByCourtID; // The stakes of the juror in particular courts.
        uint96[] courtIDs; // The IDs of courts where the juror's stake path ends. A stake path is a path from the general court to a court the juror directly staked in using `_setStake`.
        uint256 stakedPnk; // The juror's total amount of tokens staked in subcourts. Reflects actual pnk balance.
        uint256 lockedPnk; // The juror's total amount of tokens locked in disputes. Can reflect actual pnk balance when stakedPnk are fully withdrawn.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public owner; // The owner of the contract.
    KlerosCoreUniversity public core; // The core arbitrator contract.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.
    mapping(address account => Juror) public jurors; // The jurors.
    address private transientJuror; // The juror address used between calls within the same transaction.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when a juror stakes in a court.
    /// @param _address The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _amount The amount of tokens staked in the court.
    /// @param _amountAllCourts The amount of tokens staked in all courts.
    event StakeSet(address indexed _address, uint256 _courtID, uint256 _amount, uint256 _amountAllCourts);

    /// @notice Emitted when a juror's stake is locked.
    /// @param _address The address of the juror.
    /// @param _relativeAmount The amount of tokens locked.
    /// @param _unlock Whether the stake is locked or unlocked.
    event StakeLocked(address indexed _address, uint256 _relativeAmount, bool _unlock);

    /// @notice Emitted when leftover PNK is available.
    /// @param _account The account of the juror.
    /// @param _amount The amount of PNK available.
    event LeftoverPNK(address indexed _account, uint256 _amount);

    /// @notice Emitted when leftover PNK is withdrawn.
    /// @param _account The account of the juror withdrawing PNK.
    /// @param _amount The amount of PNK withdrawn.
    event LeftoverPNKWithdrawn(address indexed _account, uint256 _amount);

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

    /// @notice Initializer (constructor equivalent for upgradable contracts).
    /// @param _core The KlerosCore.
    function initialize(address _owner, KlerosCoreUniversity _core) external initializer {
        owner = _owner;
        core = _core;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the owner can perform upgrades (`onlyByOwner`)
     */
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc ISortitionModule
    function passPhase() external override onlyByCore {
        // NOP
    }

    /// @inheritdoc ISortitionModule
    function executeDelayedStakes(uint256 _iterations) external override onlyByCore {
        // NOP
    }

    /// @inheritdoc ISortitionModuleUniversity
    function setTransientJuror(address _juror) external override onlyByCore {
        transientJuror = _juror;
    }

    /// @inheritdoc ISortitionModule
    function createTree(uint96 _courtID, bytes memory _extraData) external {
        // NOP
    }

    /// @inheritdoc ISortitionModule
    function createDisputeHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors++;
    }

    /// @inheritdoc ISortitionModule
    function postDrawHook(uint256 /*_disputeID*/, uint256 /*_roundID*/) external override onlyByCore {
        disputesWithoutJurors--;
    }

    /// @inheritdoc ISortitionModule
    function validateStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool /*_noDelay*/
    )
        external
        view
        override
        onlyByCore
        returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult)
    {
        Juror storage juror = jurors[_account];
        uint256 currentStake = _stakeOf(_account, _courtID);

        uint256 nbCourts = juror.courtIDs.length;
        if (currentStake == 0 && nbCourts >= MAX_STAKE_PATHS) {
            return (0, 0, StakingResult.CannotStakeInMoreCourts); // Prevent staking beyond MAX_STAKE_PATHS but unstaking is always allowed.
        }

        if (currentStake == 0 && _newStake == 0) {
            return (0, 0, StakingResult.CannotStakeZeroWhenNoStake); // Forbid staking 0 amount when current stake is 0 to avoid flaky behaviour.
        }

        if (_newStake >= currentStake) {
            pnkDeposit = _newStake - currentStake;
        } else {
            pnkWithdrawal = currentStake - _newStake;
            // Ensure locked tokens remain in the contract. They can only be released during Execution.
            uint256 possibleWithdrawal = juror.stakedPnk > juror.lockedPnk ? juror.stakedPnk - juror.lockedPnk : 0;
            if (pnkWithdrawal > possibleWithdrawal) {
                pnkWithdrawal = possibleWithdrawal;
            }
        }
        return (pnkDeposit, pnkWithdrawal, StakingResult.Successful);
    }

    /// @inheritdoc ISortitionModule
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _pnkDeposit,
        uint256 _pnkWithdrawal,
        uint256 _newStake
    ) external override onlyByCore {
        _setStake(_account, _courtID, _pnkDeposit, _pnkWithdrawal, _newStake);
    }

    function setStakePenalty(
        address _account,
        uint96 _courtID,
        uint256 _penalty
    ) external override onlyByCore returns (uint256 pnkBalance, uint256 newCourtStake, uint256 availablePenalty) {
        Juror storage juror = jurors[_account];
        availablePenalty = _penalty;
        newCourtStake = _stakeOf(_account, _courtID);
        if (juror.stakedPnk < _penalty) {
            availablePenalty = juror.stakedPnk;
        }

        if (availablePenalty == 0) return (juror.stakedPnk, newCourtStake, 0); // No penalty to apply.

        uint256 currentStake = _stakeOf(_account, _courtID);
        uint256 newStake = 0;
        if (currentStake >= availablePenalty) {
            newStake = currentStake - availablePenalty;
        }
        _setStake(_account, _courtID, 0, availablePenalty, newStake);
        pnkBalance = juror.stakedPnk; // updated by _setStake()
        newCourtStake = _stakeOf(_account, _courtID); // updated by _setStake()
    }

    /// @inheritdoc ISortitionModule
    function setStakeReward(
        address _account,
        uint96 _courtID,
        uint256 _reward
    ) external override onlyByCore returns (bool success) {
        if (_reward == 0) return true; // No reward to add.

        uint256 currentStake = _stakeOf(_account, _courtID);
        if (currentStake == 0) return false; // Juror has been unstaked, don't increase their stake.

        uint256 newStake = currentStake + _reward;
        _setStake(_account, _courtID, _reward, 0, newStake);
        return true;
    }

    function _setStake(
        address _account,
        uint96 _courtID,
        uint256 _pnkDeposit,
        uint256 _pnkWithdrawal,
        uint256 _newStake
    ) internal {
        Juror storage juror = jurors[_account];
        uint256 currentStake = _stakeOf(_account, _courtID);
        if (_pnkDeposit > 0) {
            if (currentStake == 0) {
                juror.courtIDs.push(_courtID);
            }
            // Increase juror's balance by deposited amount.
            juror.stakedPnk += _pnkDeposit;
        } else {
            juror.stakedPnk -= _pnkWithdrawal;
            if (_newStake == 0) {
                // Cleanup
                for (uint256 i = juror.courtIDs.length; i > 0; i--) {
                    if (juror.courtIDs[i - 1] == _courtID) {
                        juror.courtIDs[i - 1] = juror.courtIDs[juror.courtIDs.length - 1];
                        juror.courtIDs.pop();
                        break;
                    }
                }
            }
        }

        bool finished = false;
        uint96 currentCourtID = _courtID;
        while (!finished) {
            // Tokens are also implicitly staked in parent courts through sortition module to increase the chance of being drawn.
            juror.stakesByCourtID[currentCourtID] += _newStake;
            juror.stakesByCourtID[currentCourtID] -= currentStake;
            if (currentCourtID == GENERAL_COURT) {
                finished = true;
            } else {
                (currentCourtID, , , , , ) = core.courts(currentCourtID);
            }
        }
        emit StakeSet(_account, _courtID, _newStake, juror.stakedPnk);
    }

    function lockStake(address _account, uint256 _relativeAmount) external override onlyByCore {
        jurors[_account].lockedPnk += _relativeAmount;
        emit StakeLocked(_account, _relativeAmount, false);
    }

    function unlockStake(address _account, uint256 _relativeAmount) external override onlyByCore {
        jurors[_account].lockedPnk -= _relativeAmount;
        emit StakeLocked(_account, _relativeAmount, true);
    }

    /// @inheritdoc ISortitionModule
    function forcedUnstakeAllCourts(address _account) external override onlyByCore {
        uint96[] memory courtIDs = getJurorCourtIDs(_account);
        for (uint256 j = courtIDs.length; j > 0; j--) {
            core.setStakeBySortitionModule(_account, courtIDs[j - 1], 0);
        }
    }

    /// @inheritdoc ISortitionModule
    function forcedUnstake(address _account, uint96 _courtID) external override onlyByCore {
        core.setStakeBySortitionModule(_account, _courtID, 0);
    }

    /// @inheritdoc ISortitionModule
    function withdrawLeftoverPNK(address _account) external override {
        // Can withdraw the leftover PNK if fully unstaked, has no tokens locked and has positive balance.
        // This withdrawal can't be triggered by calling setStake() in KlerosCore because current stake is technically 0, thus it is done via separate function.
        uint256 amount = getJurorLeftoverPNK(_account);
        if (amount == 0) revert NotEligibleForWithdrawal();
        jurors[_account].stakedPnk = 0;
        core.transferBySortitionModule(_account, amount);
        emit LeftoverPNKWithdrawn(_account, amount);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @inheritdoc ISortitionModule
    function draw(
        uint96 _courtID,
        uint256,
        uint256
    ) public view override returns (address drawnAddress, uint96 fromSubcourtID) {
        drawnAddress = transientJuror;
        fromSubcourtID = _courtID;
    }

    /// @inheritdoc ISortitionModule
    function getJurorBalance(
        address _juror,
        uint96 _courtID
    )
        external
        view
        override
        returns (uint256 totalStakedPnk, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts)
    {
        Juror storage juror = jurors[_juror];
        totalStakedPnk = juror.stakedPnk;
        totalLocked = juror.lockedPnk;
        nbCourts = juror.courtIDs.length;
        for (uint256 i = 0; i < nbCourts; i++) {
            if (juror.courtIDs[i] == _courtID) {
                stakedInCourt = juror.stakesByCourtID[_courtID];
                break;
            }
        }
    }

    /// @inheritdoc ISortitionModule
    function getJurorCourtIDs(address _juror) public view override returns (uint96[] memory) {
        return jurors[_juror].courtIDs;
    }

    /// @inheritdoc ISortitionModule
    function isJurorStaked(address _juror) external view override returns (bool) {
        return jurors[_juror].stakedPnk > 0;
    }

    /// @inheritdoc ISortitionModule
    function getJurorLeftoverPNK(address _juror) public view override returns (uint256) {
        Juror storage juror = jurors[_juror];
        if (juror.courtIDs.length == 0 && juror.lockedPnk == 0) {
            return juror.stakedPnk;
        } else {
            return 0;
        }
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @notice Gets the stake of a juror in a court.
    ///
    /// @dev Warning: `O(n)` complexity where `n` is the number of courts the juror has staked in
    /// but acceptable for this educational implementation.
    ///
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return stakedInCourt The amount of tokens staked by the juror in the court.
    function _stakeOf(address _juror, uint96 _courtID) internal view returns (uint256 stakedInCourt) {
        Juror storage juror = jurors[_juror];
        for (uint256 i = 0; i < juror.courtIDs.length; i++) {
            if (juror.courtIDs[i] == _courtID) {
                stakedInCourt = juror.stakesByCourtID[_courtID];
                break;
            }
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error KlerosCoreOnly();
    error NotEligibleForWithdrawal();
}
